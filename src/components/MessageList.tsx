import React, { useEffect, useRef } from 'react';
import { Message, BreakdownData } from '../lib/types';
import { formatDate, cn } from '../lib/utils';
import { MessageOptions } from './MessageOptions';

interface MessageListProps {
  messages: Message[];
  onSelectOption: (message: Message, option: any) => void;
  isLoading?: boolean;
}

/* ── Breakdown Card ── */
const BreakdownCard: React.FC<{ data: BreakdownData }> = ({ data }) => (
  <div className="w-full max-w-[300px] mt-1">
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Card header */}
      <div className="px-4 py-3 bg-gradient-to-r from-emerald-50 to-green-50 border-b border-gray-100">
        <p className="text-sm font-semibold text-gray-800">
          📊 Breakdown – {data.periodLabel}
        </p>
      </div>

      {data.sections.map((section, sIdx) => (
        <div key={sIdx}>
          {/* Section title */}
          <div className="px-4 pt-3 pb-1.5 flex items-center gap-2">
            <span className="text-base">{section.icon}</span>
            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
              {section.title}
            </span>
          </div>

          {/* Items */}
          <div className="px-4 pb-3">
            {section.items.map((item, iIdx) => (
              <div
                key={iIdx}
                className={cn(
                  'flex items-center justify-between py-2',
                  iIdx < section.items.length - 1 && 'border-b border-gray-50',
                )}
              >
                <span className="text-sm text-gray-700">{item.label}</span>
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                  Ksh {item.amount.toLocaleString()}
                </span>
              </div>
            ))}
          </div>

          {/* Divider between sections */}
          {sIdx < data.sections.length - 1 && (
            <div className="border-t border-gray-100" />
          )}
        </div>
      ))}
    </div>
  </div>
);

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  onSelectOption,
  isLoading = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages, isLoading]);

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto px-4 py-5 space-y-4 bg-gray-50"
    >
      {messages.length === 0 ? (
        <div className="h-full flex items-center justify-center text-center">
          <div>
            <div className="text-5xl mb-4">💬</div>
            <p className="text-gray-400 text-sm">Start a conversation with Tunda Assist</p>
          </div>
        </div>
      ) : (
        messages.map((message, idx) => {
          const isUser = message.role === 'user';
          return (
            <div
              key={message.id}
              className={cn(
                'flex gap-2 message-enter',
                isUser ? 'justify-end' : 'justify-start',
              )}
              style={{ animationDelay: `${idx * 0.04}s` }}
            >
              {/* Bot avatar */}
              {!isUser && (
                <div className="w-8 h-8 rounded-full chat-header-gradient text-white flex items-center justify-center flex-shrink-0 text-xs font-bold shadow-sm mt-auto">
                  TA
                </div>
              )}

              <div
                className={cn(
                  'flex flex-col max-w-[80%]',
                  isUser ? 'items-end' : 'items-start',
                )}
              >
                {/* ── Message Bubble ── */}
                <div
                  className={cn(
                    'px-4 py-2.5 text-sm leading-relaxed break-words',
                    isUser
                      ? 'bg-gradient-to-br from-emerald-500 to-green-600 text-white rounded-2xl rounded-br-md shadow-sm'
                      : 'bg-white text-gray-800 rounded-2xl rounded-bl-md shadow-[0_1px_4px_rgba(0,0,0,0.08)]',
                  )}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>

                {/* ── Breakdown Card (rendered below the bubble) ── */}
                {message.breakdownData && (
                  <BreakdownCard data={message.breakdownData} />
                )}

                {/* ── Options ── */}
                {message.options && message.options.length > 0 && (
                  <div className="w-full max-w-[300px] mt-2">
                    <MessageOptions
                      options={message.options}
                      onSelectOption={(option) => onSelectOption(message, option)}
                    />
                  </div>
                )}

                {/* Timestamp */}
                <span className="text-[10px] text-gray-400 mt-1 px-1">
                  {formatDate(message.timestamp)}
                </span>
              </div>

              {/* User avatar */}
              {isUser && (
                <div className="w-8 h-8 rounded-full bg-gray-300 text-gray-600 flex items-center justify-center flex-shrink-0 text-xs font-bold mt-auto">
                  U
                </div>
              )}
            </div>
          );
        })
      )}

      {/* Loading indicator */}
      {isLoading && (
        <div className="flex gap-2 justify-start message-enter">
          <div className="w-8 h-8 rounded-full chat-header-gradient text-white flex items-center justify-center flex-shrink-0 text-xs font-bold shadow-sm">
            TA
          </div>
          <div className="bg-white px-5 py-3 rounded-2xl rounded-bl-md shadow-[0_1px_4px_rgba(0,0,0,0.08)]">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.15s]"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.3s]"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
