import type { ReactNode, ButtonHTMLAttributes } from 'react';

type ButtonVariant = 'primary' | 'danger' | 'secondary';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  children: ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-emerald-600 hover:bg-emerald-700 text-white',
  danger: 'bg-red-600 hover:bg-red-700 text-white',
  secondary: 'bg-gray-700 hover:bg-gray-600 text-gray-200',
};

export function Button({
  variant = 'secondary',
  className = '',
  disabled,
  children,
  ...props
}: ButtonProps): ReactNode {
  return (
    <button
      className={`px-4 py-2 rounded-lg font-medium transition-colors
                  disabled:opacity-50 disabled:cursor-not-allowed
                  ${variantClasses[variant]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
