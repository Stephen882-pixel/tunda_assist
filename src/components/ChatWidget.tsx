import React, { useState, useCallback } from 'react';
import { Message, MessageOption, CommissionPeriod, ChatState, BreakdownData } from '../lib/types';
import { generateId } from '../lib/utils';
import { responseFormatter } from '../lib/response-formatter';
import { apiClient } from '../lib/api-client';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';

/**
 * Helper – creates a bot Message object.
 */
function botMsg(
  content: string,
  options: MessageOption[] = [],
  breakdownData?: BreakdownData,
): Message {
  return {
    id: generateId(),
    role: 'assistant',
    content,
    timestamp: new Date(),
    messageType: breakdownData ? 'breakdown' : options.length > 0 ? 'options' : 'text',
    options,
    breakdownData,
  };
}

export const ChatWidget: React.FC = () => {
  const [chatState, setChatState] = useState<ChatState>({
    messages: [],
    conversationPhase: 'greeting',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

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
        messageType: 'text',
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
            const { message, options } = responseFormatter.formatPeriodSelection();
            appendMessages([botMsg(message, options)], {
              conversationPhase: 'awaiting_period',
              currentIntent: 'commission_summary',
            });
            return;
          }

          if (input === 'leads' || input.includes('lead') || input.includes('customer')) {
            const { message, options } = responseFormatter.formatLeadIdPrompt();
            appendMessages([botMsg(message, options)], {
              conversationPhase: 'awaiting_lead_id',
              currentIntent: 'lead_status',
            });
            return;
          }

          if (input === 'calculate' || input.includes('calculate')) {
            const { message, options } = responseFormatter.formatPeriodSelection();
            appendMessages([botMsg(message, options)], {
              conversationPhase: 'awaiting_period',
              currentIntent: 'commission_summary',
            });
            return;
          }

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
            '14': '14_days',
            '30': '30_days',
            '60': '60_days',
            '90': '90_days',
          };

          const period = periodMap[input] || '14_days';

          const data = await apiClient.getCommissionData(period);
          const { message: summaryMsg } = responseFormatter.formatCommissionSummary(data);

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
            const data = chatState.lastCommissionData!;
            const { message: breakdownMsg, breakdownData } =
              responseFormatter.formatCommissionBreakdown(data);

            const { message: feedbackQ, options: feedbackOpts } =
              responseFormatter.formatFeedbackPrompt();

            appendMessages(
              [botMsg(breakdownMsg, [], breakdownData), botMsg(feedbackQ, feedbackOpts)],
              { conversationPhase: 'feedback' },
            );
            return;
          }

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
    <>
      {/* ── Floating Chat Widget ── */}
      <div
        className={`
          fixed z-50 flex flex-col bg-white rounded-2xl shadow-2xl
          transition-all duration-300 ease-in-out overflow-hidden
          ${isExpanded
            ? 'inset-0 rounded-none'
            : 'bottom-6 right-6 w-[400px] h-[640px] max-h-[85vh]'
          }
          ${isOpen
            ? 'opacity-100 scale-100 pointer-events-auto translate-y-0'
            : 'opacity-0 scale-95 pointer-events-none translate-y-4'
          }
        `}
      >
        {/* ── Header ── */}
        <div className="chat-header-gradient text-white px-5 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight">Tunda Assist</h1>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></span>
                <p className="text-xs text-green-100">AI Assistant Active</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {/* Expand / Collapse */}
            <button
              onClick={() => setIsExpanded((e) => !e)}
              className="p-2 rounded-lg hover:bg-white/15 transition-colors"
              title={isExpanded ? 'Collapse' : 'Expand'}
            >
              {isExpanded ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25"
                  />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"
                  />
                </svg>
              )}
            </button>
            {/* Close */}
            <button
              onClick={() => { setIsOpen(false); setIsExpanded(false); }}
              className="p-2 rounded-lg hover:bg-white/15 transition-colors"
              title="Close"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* ── Message List ── */}
        <MessageList
          messages={chatState.messages}
          onSelectOption={handleSelectOption}
          isLoading={isLoading}
        />

        {/* ── Chat Input ── */}
        <ChatInput
          onSendMessage={handleSendMessage}
          disabled={isLoading}
          placeholder="Ask a question..."
        />
      </div>

      {/* ── Floating Toggle Button ── */}
      <button
        onClick={() => setIsOpen((o) => !o)}
        className={`
          fixed bottom-6 right-6 z-40 w-16 h-16 rounded-full
          chat-header-gradient text-white shadow-lg
          flex items-center justify-center
          hover:shadow-xl hover:scale-105
          active:scale-95
          transition-all duration-200
          ${isOpen ? 'opacity-0 pointer-events-none scale-0' : 'opacity-100 scale-100'}
        `}
        title="Open Tunda Assist"
      >
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
          />
        </svg>
      </button>
    </>
  );
};
