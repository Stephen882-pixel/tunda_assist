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
    <div className="flex flex-col gap-2 mt-2">
      {options.map((option) => (
        <button
          key={option.id}
          onClick={() => !disabled && onSelectOption(option)}
          disabled={disabled}
          className="w-full px-4 py-2 text-left bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};
