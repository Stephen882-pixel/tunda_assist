import React, { useEffect, useRef } from 'react';
import { Message } from '../lib/types';
import { formatDate, cn } from '../lib/utils';
import { MessageOptions } from './MessageOptions';

interface MessageListProps {
  messages: Message[];
  onSelectOption: (message: Message, option: any) => void;
  isLoading?: boolean;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  onSelectOption,
  isLoading = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto p-4 space-y-4 bg-background"
    >
      {messages.length === 0 ? (
        <div className="h-full flex items-center justify-center text-center">
          <div>
            <div className="text-4xl mb-4">👋</div>
            <p className="text-gray-500">Start a conversation with Tunda Assist</p>
          </div>
        </div>
      ) : (
        messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              'flex gap-3',
              message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
            )}
          >
            {/* Avatar */}
            <div
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                message.role === 'user'
                  ? 'bg-gray-300'
                  : 'bg-primary text-white'
              )}
            >
              {message.role === 'user' ? 'U' : 'T'}
            </div>

            {/* Message Content */}
            <div
              className={cn(
                'flex-1',
                message.role === 'user' ? 'items-end' : 'items-start',
                'flex flex-col'
              )}
            >
              <div
                className={cn(
                  'px-4 py-2 rounded-lg max-w-xs break-words',
                  message.role === 'user'
                    ? 'bg-primary text-white'
                    : 'bg-white text-foreground border border-border'
                )}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              </div>

              <span className="text-xs text-gray-400 mt-1">
                {formatDate(message.timestamp)}
              </span>

              {/* Options */}
              {message.options && message.options.length > 0 && (
                <div className="w-full max-w-xs mt-2">
                  <MessageOptions
                    options={message.options}
                    onSelectOption={(option) => onSelectOption(message, option)}
                  />
                </div>
              )}
            </div>
          </div>
        ))
      )}

      {/* Loading indicator */}
      {isLoading && (
        <div className="flex gap-3">
          <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0">
            T
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      )}
    </div>
  );
};
