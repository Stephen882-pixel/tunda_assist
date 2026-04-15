import React, { useState, useCallback } from 'react';
import { Message, MessageOption, Intent, ChatState } from '../lib/types';
import { generateId } from '../lib/utils';
import { intentDetector } from '../lib/intent-detector';
import { responseFormatter } from '../lib/response-formatter';
import { apiClient } from '../lib/api-client';
import { mockCommissionData, mockLeads } from '../lib/mock-data';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';

export const ChatWidget: React.FC = () => {
  const [chatState, setChatState] = useState<ChatState>({
    messages: [],
    conversationPhase: 'greeting',
  });
  const [isLoading, setIsLoading] = useState(false);

  // Initialize with greeting
  React.useEffect(() => {
    const greeting: Message = {
      id: generateId(),
      role: 'assistant',
      content: 'Hi there! I\'m Tunda Assist, your AI commission assistant. What would you like to check?',
      timestamp: new Date(),
      options: [
        {
          id: 'check_commissions',
          label: 'Check my commissions',
          value: 'commissions',
        },
        {
          id: 'check_leads',
          label: 'Check customer or Leads',
          value: 'leads',
        },
        {
          id: 'calculate',
          label: 'Calculate Commissions',
          value: 'calculate',
        },
      ],
    };
    setChatState(prev => ({
      ...prev,
      messages: [greeting],
    }));
  }, []);

  const handleSendMessage = useCallback(
    async (userInput: string) => {
      // Add user message
      const userMessage: Message = {
        id: generateId(),
        role: 'user',
        content: userInput,
        timestamp: new Date(),
      };

      setChatState(prev => ({
        ...prev,
        messages: [...prev.messages, userMessage],
      }));

      setIsLoading(true);

      try {
        // Detect intent
        const detectionResult = intentDetector.detect(userInput);

        let botResponse: Message;

        switch (detectionResult.intent) {
          case 'commission_summary': {
            const period = detectionResult.parameters.period || '14_days';
            const data = await apiClient.getCommissionData(period as any);
            const { message, options } = responseFormatter.formatCommissionSummary(data);
            botResponse = {
              id: generateId(),
              role: 'assistant',
              content: message,
              timestamp: new Date(),
              options,
              metadata: { intent: 'commission_summary', period: period as any },
            };
            break;
          }

          case 'commission_breakdown': {
            const period = detectionResult.parameters.period || '14_days';
            const data = await apiClient.getCommissionData(period as any);
            const { message, options } = responseFormatter.formatCommissionBreakdown(data, data.details);
            botResponse = {
              id: generateId(),
              role: 'assistant',
              content: message,
              timestamp: new Date(),
              options,
              metadata: { intent: 'commission_breakdown', period: period as any },
            };
            break;
          }

          case 'lead_status': {
            const leadId = detectionResult.parameters.leadId || 'john';
            const lead = await apiClient.getLeadStatus(leadId);
            const { message, options } = responseFormatter.formatLeadStatus(lead);
            botResponse = {
              id: generateId(),
              role: 'assistant',
              content: message,
              timestamp: new Date(),
              options,
              metadata: { intent: 'lead_status', leadId },
            };
            break;
          }

          case 'custom_question': {
            const customInput = detectionResult.parameters.customInput || userInput;
            const { message, options } = responseFormatter.formatCustomQuestion(customInput);
            botResponse = {
              id: generateId(),
              role: 'assistant',
              content: message,
              timestamp: new Date(),
              options,
              metadata: { intent: 'custom_question' },
            };
            break;
          }

          default: {
            const { message, options } = responseFormatter.formatUnknown();
            botResponse = {
              id: generateId(),
              role: 'assistant',
              content: message,
              timestamp: new Date(),
              options,
              metadata: { intent: 'unknown' },
            };
          }
        }

        setChatState(prev => ({
          ...prev,
          messages: [...prev.messages, botResponse],
          currentIntent: detectionResult.intent,
          conversationPhase: 'showing_results',
        }));
      } catch (error) {
        console.error('Error processing message:', error);
        const errorMessage: Message = {
          id: generateId(),
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
          timestamp: new Date(),
        };
        setChatState(prev => ({
          ...prev,
          messages: [...prev.messages, errorMessage],
        }));
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const handleSelectOption = useCallback(
    (_message: Message, option: MessageOption) => {
      handleSendMessage(option.value);
    },
    [handleSendMessage]
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
