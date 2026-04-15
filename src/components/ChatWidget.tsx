import React, { useState, useCallback } from 'react';
import { Message, MessageOption, CommissionPeriod, ChatState } from '../lib/types';
import { generateId } from '../lib/utils';
import { responseFormatter } from '../lib/response-formatter';
import { apiClient } from '../lib/api-client';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';

/**
 * Helper – creates a bot Message object.
 */
function botMsg(content: string, options: MessageOption[] = []): Message {
  return {
    id: generateId(),
    role: 'assistant',
    content,
    timestamp: new Date(),
    options,
  };
}

export const ChatWidget: React.FC = () => {
  const [chatState, setChatState] = useState<ChatState>({
    messages: [],
    conversationPhase: 'greeting',
  });
  const [isLoading, setIsLoading] = useState(false);

  // ── Greeting on mount ──
  React.useEffect(() => {
    const { message, options } = responseFormatter.formatGreeting();
    setChatState((prev) => ({
      ...prev,
      messages: [botMsg(message, options)],
      conversationPhase: 'greeting',
    }));
  }, []);

  // ── Helper: append messages to state ──
  const appendMessages = useCallback(
    (msgs: Message[], patch: Partial<ChatState> = {}) => {
      setChatState((prev) => ({
        ...prev,
        messages: [...prev.messages, ...msgs],
        ...patch,
      }));
    },
    [],
  );

  // ──────────────────────────────────────────────
  // Main handler – processes every user action
  // ──────────────────────────────────────────────
  const handleSendMessage = useCallback(
    async (userInput: string) => {
      const userMessage: Message = {
        id: generateId(),
        role: 'user',
        content: userInput,
        timestamp: new Date(),
      };

      // Append user message immediately
      setChatState((prev) => ({
        ...prev,
        messages: [...prev.messages, userMessage],
      }));

      setIsLoading(true);

      try {
        const phase = chatState.conversationPhase;
        const input = userInput.toLowerCase().trim();

        // ─── GREETING / DONE: main menu selection ───
        if (phase === 'greeting' || phase === 'done') {
          if (input === 'commissions' || input.includes('commission') || input.includes('check')) {
            // Step 2 → ask for period
            const { message, options } = responseFormatter.formatPeriodSelection();
            appendMessages([botMsg(message, options)], {
              conversationPhase: 'awaiting_period',
              currentIntent: 'commission_summary',
            });
            return;
          }

          if (input === 'leads' || input.includes('lead') || input.includes('customer')) {
            // Lead flow → ask for identifier
            const { message, options } = responseFormatter.formatLeadIdPrompt();
            appendMessages([botMsg(message, options)], {
              conversationPhase: 'awaiting_lead_id',
              currentIntent: 'lead_status',
            });
            return;
          }

          if (input === 'calculate' || input.includes('calculate')) {
            // Treat "Calculate" same as commission check for now
            const { message, options } = responseFormatter.formatPeriodSelection();
            appendMessages([botMsg(message, options)], {
              conversationPhase: 'awaiting_period',
              currentIntent: 'commission_summary',
            });
            return;
          }

          // Unrecognised → show menu again
          const { message, options } = responseFormatter.formatUnknown();
          appendMessages([botMsg(message, options)], {
            conversationPhase: 'greeting',
          });
          return;
        }

        // ─── AWAITING PERIOD: user picks a period ───
        if (phase === 'awaiting_period') {
          const periodMap: Record<string, CommissionPeriod> = {
            '14_days': '14_days',
            '30_days': '30_days',
            '60_days': '60_days',
            '90_days': '90_days',
            custom: 'custom',
            // allow plain numbers too
            '14': '14_days',
            '30': '30_days',
            '60': '60_days',
            '90': '90_days',
          };

          const period = periodMap[input] || '14_days';

          // Step 4–6: fetch data & show summary
          const data = await apiClient.getCommissionData(period);
          const { message: summaryMsg } = responseFormatter.formatCommissionSummary(data);

          // After summary ask "Would you like a breakdown?"
          const { message: breakdownQ, options: breakdownOpts } =
            responseFormatter.formatBreakdownPrompt();

          appendMessages(
            [botMsg(summaryMsg), botMsg(breakdownQ, breakdownOpts)],
            {
              conversationPhase: 'showing_summary',
              selectedPeriod: period,
              lastCommissionData: data,
            },
          );
          return;
        }

        // ─── SHOWING SUMMARY: user answers breakdown Yes/No ───
        if (phase === 'showing_summary') {
          if (input === 'breakdown_yes' || input === 'yes' || input === '1') {
            // Step 8: show breakdown
            const data = chatState.lastCommissionData!;
            const { message: breakdownMsg } =
              responseFormatter.formatCommissionBreakdown(data);

            // Step 10: Was this helpful?
            const { message: feedbackQ, options: feedbackOpts } =
              responseFormatter.formatFeedbackPrompt();

            appendMessages(
              [botMsg(breakdownMsg), botMsg(feedbackQ, feedbackOpts)],
              { conversationPhase: 'feedback' },
            );
            return;
          }

          // Step 9: No breakdown → go to feedback
          const { message: feedbackQ, options: feedbackOpts } =
            responseFormatter.formatFeedbackPrompt();

          appendMessages([botMsg(feedbackQ, feedbackOpts)], {
            conversationPhase: 'feedback',
          });
          return;
        }

        // ─── FEEDBACK: Was this helpful? ───
        if (phase === 'feedback') {
          const positive = input === 'helpful_yes' || input === 'yes' || input === '1';
          const { message, options } = responseFormatter.formatFeedbackThanks(positive);
          appendMessages([botMsg(message, options)], {
            conversationPhase: 'greeting',
            lastCommissionData: undefined,
            selectedPeriod: undefined,
          });
          return;
        }

        // ─── AWAITING LEAD ID ───
        if (phase === 'awaiting_lead_id') {
          const lead = await apiClient.getLeadStatus(input);
          const { message: leadMsg } = responseFormatter.formatLeadStatus(lead);

          // Then ask feedback
          const { message: feedbackQ, options: feedbackOpts } =
            responseFormatter.formatFeedbackPrompt();

          appendMessages(
            [botMsg(leadMsg), botMsg(feedbackQ, feedbackOpts)],
            { conversationPhase: 'feedback' },
          );
          return;
        }

        // ─── Fallback ───
        const { message, options } = responseFormatter.formatUnknown();
        appendMessages([botMsg(message, options)], {
          conversationPhase: 'greeting',
        });
      } catch (error) {
        console.error('Error processing message:', error);
        appendMessages([
          botMsg('Sorry, I encountered an error. Please try again.'),
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [chatState.conversationPhase, chatState.lastCommissionData, appendMessages],
  );

  const handleSelectOption = useCallback(
    (_message: Message, option: MessageOption) => {
      handleSendMessage(option.value);
    },
    [handleSendMessage],
  );

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary-dark text-white p-4 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center font-bold text-lg text-primary-dark">
            T
          </div>
          <div>
            <h1 className="text-xl font-bold">Tunda Assist</h1>
            <p className="text-sm opacity-90">AI Assistant Active</p>
          </div>
        </div>
      </div>

      {/* Message List */}
      <MessageList
        messages={chatState.messages}
        onSelectOption={handleSelectOption}
        isLoading={isLoading}
      />

      {/* Chat Input */}
      <ChatInput
        onSendMessage={handleSendMessage}
        disabled={isLoading}
        placeholder="Ask a question..."
      />
    </div>
  );
};
