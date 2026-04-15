import React, { useState, useRef, useEffect } from 'react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  disabled = false,
  placeholder = 'Ask a question...',
}) => {
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !disabled) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex-shrink-0 p-4 bg-white border-t border-gray-100"
    >
      {/* Input field */}
      <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-2.5 mb-3 border border-gray-100 focus-within:border-emerald-300 focus-within:ring-2 focus-within:ring-emerald-100 transition-all">
        <svg
          className="w-4 h-4 text-gray-400 flex-shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
          />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className={
            'flex-1 bg-transparent outline-none text-sm text-gray-800 placeholder-gray-400 ' +
            (disabled ? 'opacity-50 cursor-not-allowed' : '')
          }
        />
      </div>

      {/* Full-width Send button */}
      <button
        type="submit"
        disabled={disabled || !input.trim()}
        className={
          'w-full py-2.5 rounded-xl font-semibold text-sm text-white transition-all duration-200 ' +
          'bg-gradient-to-r from-emerald-500 to-green-600 ' +
          'hover:from-emerald-600 hover:to-green-700 hover:shadow-md ' +
          'active:scale-[0.98] ' +
          'disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none'
        }
      >
        <div className="flex items-center justify-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
            />
          </svg>
          Send
        </div>
      </button>
    </form>
  );
};
