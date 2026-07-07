'use client';

import { useState, useCallback } from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'hero' | 'ghost' | 'focus';
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit';
}

interface Ripple {
  id: number;
  x: number;
  y: number;
}

export function Button({ children, onClick, variant = 'primary', disabled = false, className = '', type = 'button' }: ButtonProps) {
  const [ripples, setRipples] = useState<Ripple[]>([]);

  const baseStyles = 'px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 ease-out inline-flex items-center justify-center gap-1.5 relative overflow-hidden hover:scale-[1.02] active:scale-[0.98] ';

  const variantStyles: Record<NonNullable<ButtonProps['variant']>, string> = {
    primary: 'bg-accent text-white hover:bg-accent-hover disabled:bg-gray-300 disabled:cursor-not-allowed',
    secondary: 'bg-bg2 text-ink border border-rule hover:bg-rule disabled:bg-gray-100 disabled:cursor-not-allowed',
    danger: 'bg-red-500 text-white hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed',
    hero: 'bg-accent text-white hover:bg-accent-hover disabled:bg-gray-300 disabled:cursor-not-allowed py-3 px-6 text-base font-bold rounded-xl shadow-card',
    ghost: 'bg-transparent text-muted hover:bg-bg2 hover:text-ink disabled:opacity-40 disabled:cursor-not-allowed',
    focus: 'bg-accent text-white hover:bg-accent-hover ring-2 ring-accent/30 ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed',
  };

  const handleClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(e);
    if (disabled) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();
    
    setRipples(prev => [...prev, { id, x, y }]);
    
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== id));
    }, 600);
  }, [onClick, disabled]);

  return (
    <button
      type={type}
      onClick={handleClick}
      disabled={disabled}
      className={`${baseStyles}${variantStyles[variant]} ${className}`}
    >
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="absolute rounded-full bg-white/30 animate-ripple"
          style={{
            left: ripple.x,
            top: ripple.y,
            transform: 'translate(-50%, -50%)',
          }}
        />
      ))}
      {children}
    </button>
  );
}
