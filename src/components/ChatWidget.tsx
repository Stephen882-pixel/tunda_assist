import React, { useState, useCallback } from 'react';
import { Message, MessageOption, CommissionPeriod, ChatState, BreakdownData } from '../lib/types';
import { generateId } from '../lib/utils';
import { responseFormatter } from '../lib/response-formatter';
import { apiClient } from '../lib/api-client';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import { WelcomeScreen } from './WelcomeScreen';

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
  /** Tracks whether user has left the welcome screen */
  const [showWelcome, setShowWelcome] = useState(true);

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
      // Leave welcome screen on first interaction
      if (showWelcome) setShowWelcome(false);

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
    [chatState.conversationPhase, chatState.lastCommissionData, appendMessages, showWelcome],
  );

  /** When user picks a welcome-screen quick button */
  const handleWelcomeSelect = useCallback(
    (option: MessageOption) => {
      handleSendMessage(option.label); // sends label as user text, e.g. "Check my commissions"
    },
    [handleSendMessage],
  );

  const handleSelectOption = useCallback(
    (_message: Message, option: MessageOption) => {
      handleSendMessage(option.value);
    },
    [handleSendMessage],
  );

  // Greeting options for welcome screen
  const greetingOptions = chatState.messages[0]?.options || [];

  return (
    <>
      {/* ── Floating Chat Widget ── */}
      <div
        style={{
          position: 'fixed',
          zIndex: 50,
          display: 'flex',
          flexDirection: 'column',
          borderRadius: isExpanded ? 0 : '24px',
          overflow: 'hidden',
          boxShadow: '0 24px 60px rgba(0,0,0,0.45)',
          background: '#f5f7f5',
          transition: 'all 0.3s ease',
          ...(isExpanded
            ? { inset: 0 }
            : { bottom: '24px', right: '24px', width: '340px', height: '600px', maxHeight: '85vh' }
          ),
          ...(isOpen
            ? { opacity: 1, transform: 'scale(1) translateY(0)', pointerEvents: 'auto' as const }
            : { opacity: 0, transform: 'scale(0.95) translateY(16px)', pointerEvents: 'none' as const }
          ),
        }}
      >
        {/* ── Header ── */}
        <div
          className="chat-header-gradient"
          style={{
            padding: '18px 18px 18px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            flexShrink: 0,
          }}
        >
          {/* Logo */}
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              background: 'linear-gradient(145deg, #f5c842 0%, #e8a800 40%, #2e9e6e 60%, #1a7a50 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              overflow: 'hidden',
            }}
          >
            <svg width="26" height="26" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
              <circle cx="16" cy="16" r="14" fill="#f5c842" />
              <path d="M8 16 Q16 6 24 16 Q16 26 8 16Z" fill="#2e9e6e" />
            </svg>
          </div>

          {/* Info */}
          <div style={{ flex: 1 }}>
            <div
              style={{
                color: '#fff',
                fontSize: '16px',
                fontWeight: 700,
                lineHeight: 1.2,
                letterSpacing: '-0.2px',
              }}
            >
              Tunda Assist
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '2px' }}>
              <div
                style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  background: '#6de8a0',
                  boxShadow: '0 0 6px #6de8a0',
                }}
              />
              <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '12px', fontWeight: 500 }}>
                AI Assistant Active
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {/* Expand */}
            <button
              onClick={() => setIsExpanded((e) => !e)}
              title={isExpanded ? 'Collapse' : 'Expand'}
              style={{
                width: '28px',
                height: '28px',
                border: 'none',
                background: 'rgba(255,255,255,0.15)',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.25)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 3 21 3 21 9" />
                <polyline points="9 21 3 21 3 15" />
                <line x1="21" y1="3" x2="14" y2="10" />
                <line x1="3" y1="21" x2="10" y2="14" />
              </svg>
            </button>
            {/* Close */}
            <button
              onClick={() => { setIsOpen(false); setIsExpanded(false); }}
              title="Close"
              style={{
                width: '28px',
                height: '28px',
                border: 'none',
                background: 'rgba(255,255,255,0.15)',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.25)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* ── Body: Welcome or Chat ── */}
        {showWelcome ? (
          <WelcomeScreen
            options={greetingOptions}
            onSelectOption={handleWelcomeSelect}
          />
        ) : (
          <MessageList
            messages={chatState.messages}
            onSelectOption={handleSelectOption}
            isLoading={isLoading}
          />
        )}

        {/* ── Footer / Input ── */}
        <ChatInput
          onSendMessage={(msg) => {
            if (showWelcome) setShowWelcome(false);
            handleSendMessage(msg);
          }}
          disabled={isLoading}
          placeholder="Ask a question..."
        />
      </div>

      {/* ── Floating Toggle Button ── */}
      <button
        onClick={() => setIsOpen((o) => !o)}
        className="chat-send-gradient"
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 40,
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          border: 'none',
          color: '#fff',
          boxShadow: '0 4px 14px rgba(46,158,110,0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.2s',
          opacity: isOpen ? 0 : 1,
          transform: isOpen ? 'scale(0)' : 'scale(1)',
          pointerEvents: isOpen ? 'none' : 'auto',
        }}
        title="Open Tunda Assist"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </button>
    </>
  );
};
