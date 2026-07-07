interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'hero' | 'ghost' | 'focus';
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit';
}

export function Button({ children, onClick, variant = 'primary', disabled = false, className = '', type = 'button' }: ButtonProps) {
  const baseStyles = 'px-4 py-2 rounded-lg font-semibold text-sm transition-fast transition-colors inline-flex items-center justify-center gap-1.5 ';

  const variantStyles: Record<NonNullable<ButtonProps['variant']>, string> = {
    primary: 'bg-accent text-white hover:bg-accent-hover disabled:bg-gray-300 disabled:cursor-not-allowed',
    secondary: 'bg-bg2 text-ink border border-rule hover:bg-rule disabled:bg-gray-100 disabled:cursor-not-allowed',
    danger: 'bg-red-500 text-white hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed',
    hero: 'bg-accent text-white hover:bg-accent-hover disabled:bg-gray-300 disabled:cursor-not-allowed py-3 px-6 text-base font-bold rounded-xl shadow-card',
    ghost: 'bg-transparent text-muted hover:bg-bg2 hover:text-ink disabled:opacity-40 disabled:cursor-not-allowed',
    focus: 'bg-accent text-white hover:bg-accent-hover ring-2 ring-accent/30 ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles}${variantStyles[variant]} ${className}`}
    >
      {children}
    </button>
  );
}
