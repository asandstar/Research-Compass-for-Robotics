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
      className={`px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white transition-colors focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${className}`}
    />
  );
}
