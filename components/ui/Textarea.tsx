interface TextareaProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

export function Textarea({ label, value, onChange, placeholder = '', required = false, className = '' }: TextareaProps) {
  return (
    <div className={className}>
      <label className="block text-sm font-semibold text-ink mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-rule rounded-lg bg-bg resize-none focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
        rows={3}
      />
    </div>
  );
}
