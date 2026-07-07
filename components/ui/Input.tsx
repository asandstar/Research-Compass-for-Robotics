interface InputProps {
  type?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  className?: string;
  onKeyPress?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  autoFocus?: boolean;
}

export function Input({
  type = 'text',
  value,
  onChange,
  placeholder,
  className = '',
  onKeyPress,
  disabled = false,
  autoFocus = false,
}: InputProps) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      onKeyPress={onKeyPress}
      disabled={disabled}
      autoFocus={autoFocus}
      className={`px-3 py-2 border border-border-default rounded-lg text-sm bg-surface transition-fast transition-colors focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 placeholder:text-muted/60 disabled:bg-bg2 disabled:cursor-not-allowed ${className}`}
    />
  );
}
