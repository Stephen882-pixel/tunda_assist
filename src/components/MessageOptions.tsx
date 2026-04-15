import React from 'react';
import { MessageOption } from '../lib/types';

interface MessageOptionsProps {
  options: MessageOption[];
  onSelectOption: (option: MessageOption) => void;
  disabled?: boolean;
}

export const MessageOptions: React.FC<MessageOptionsProps> = ({
  options,
  onSelectOption,
  disabled = false,
}) => {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      {options.map((option, idx) => (
        <button
          key={option.id}
          onClick={() => !disabled && onSelectOption(option)}
          disabled={disabled}
          className={
            'w-full flex items-center gap-3 px-4 py-2.5 text-left ' +
            'hover:bg-emerald-50 transition-colors ' +
            'disabled:opacity-40 disabled:cursor-not-allowed ' +
            (idx < options.length - 1 ? 'border-b border-gray-50' : '')
          }
        >
          <span className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
            {idx + 1}
          </span>
          <span className="text-sm text-gray-700 font-medium">{option.label}</span>
        </button>
      ))}
    </div>
  );
};
