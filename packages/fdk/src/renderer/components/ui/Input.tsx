import type { ReactNode, InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export function Input({ label, id, className = '', ...props }: InputProps): ReactNode {
  const inputId = id || label.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="space-y-1">
      <label htmlFor={inputId} className="block text-sm font-medium text-gray-400">
        {label}
      </label>
      <input
        id={inputId}
        className={`w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg
                    text-white placeholder-gray-500
                    focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent
                    disabled:opacity-50 disabled:cursor-not-allowed
                    ${className}`}
        {...props}
      />
    </div>
  );
}
