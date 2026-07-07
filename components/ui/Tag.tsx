interface TagProps {
  children: React.ReactNode;
  color?: string;
  bgColor?: string;
  size?: 'sm' | 'md';
  variant?: 'solid' | 'outline' | 'soft' | 'secondary';
  className?: string;
}

export function Tag({ children, color, bgColor, size = 'md', variant = 'solid', className = '' }: TagProps) {
  const sizeClasses = size === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-xs';

  if (variant === 'secondary') {
    return (
      <span className={`inline-block rounded-full font-medium ${sizeClasses} bg-bg2 text-muted ${className}`}>
        {children}
      </span>
    );
  }

  const variantClasses = variant === 'outline'
    ? 'border border-current bg-transparent rounded-full'
    : variant === 'soft'
    ? 'rounded-full'
    : 'rounded-full';

  const style = color || bgColor
    ? { color: color || 'inherit', backgroundColor: bgColor || 'transparent' }
    : undefined;

  if (variant === 'soft' && color && !bgColor) {
    return (
      <span
        className={`inline-block font-semibold ${sizeClasses} ${variantClasses} ${className}`}
        style={{ color, backgroundColor: `${color}1A` }}
      >
        {children}
      </span>
    );
  }

  return (
    <span
      className={`inline-block font-semibold ${sizeClasses} ${variantClasses} ${className}`}
      style={style}
    >
      {children}
    </span>
  );
}
