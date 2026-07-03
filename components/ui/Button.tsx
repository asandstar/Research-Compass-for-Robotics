interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit';
}

export function Button({ children, onClick, variant = 'primary', disabled = false, className = '', type = 'button' }: ButtonProps) {
  const baseStyles = 'px-4 py-2 rounded-lg font-semibold text-sm transition-colors duration-200 ';
  
  const variantStyles = {
    primary: 'bg-accent text-white hover:bg-[#0f766e] disabled:bg-gray-300 disabled:cursor-not-allowed',
    secondary: 'bg-bg2 text-ink border border-rule hover:bg-[#e7e5e4] disabled:bg-gray-100 disabled:cursor-not-allowed',
    danger: 'bg-red-500 text-white hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed',
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
