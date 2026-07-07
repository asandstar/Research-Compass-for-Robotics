'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  className?: string;
  size?: 'sm' | 'md';
  maxHeight?: string;
  placeholder?: string;
  width?: string;
}

export function Select({ value, onChange, options, className = '', size = 'md', maxHeight = '320px', placeholder, width }: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(o => o.value === value);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && listRef.current) {
      const selectedEl = listRef.current.querySelector('[data-selected="true"]');
      if (selectedEl) {
        selectedEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [isOpen]);

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
  };

  const paddingY = size === 'sm' ? 'py-1.5' : 'py-2';
  const paddingX = size === 'sm' ? 'px-3' : 'px-3';
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm';

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{ width }}
        className={`flex items-center justify-between gap-2 ${paddingX} ${paddingY} ${textSize} border border-border-default rounded-lg bg-surface hover:border-border-strong focus:outline-none focus:ring-1 focus:ring-accent/30 focus:border-accent transition-fast transition-colors ${width ? '' : 'w-full'}`}
      >
        <span className="text-ink truncate">{selectedOption?.label || placeholder || '请选择'}</span>
        <ChevronDown className={`w-4 h-4 text-muted flex-shrink-0 transition-fast transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-surface border border-border-subtle rounded-lg shadow-elevated z-50 overflow-hidden">
          <div
            ref={listRef}
            className="overflow-y-auto py-1"
            style={{ maxHeight }}
          >
            {options.map(option => {
              const isSelected = option.value === value;
              return (
                <button
                  key={option.value}
                  type="button"
                  data-selected={isSelected}
                  onClick={() => handleSelect(option.value)}
                  className={`w-full text-left px-3 py-2 ${textSize} flex items-center justify-between gap-2 hover:bg-accent/[0.06] transition-fast transition-colors ${
                    isSelected ? 'bg-accent/10 text-accent font-medium' : 'text-ink'
                  }`}
                >
                  <span className="truncate">{option.label}</span>
                  {isSelected && <Check className="w-4 h-4 flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
