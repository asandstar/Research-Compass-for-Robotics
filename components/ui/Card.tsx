interface CardProps {
  children: React.ReactNode;
  className?: string;
  interactive?: boolean;
}

export function Card({ children, className = '', interactive = false }: CardProps) {
  return (
    <div className={`bg-surface border border-border-subtle rounded-lg shadow-card p-4 ${interactive ? 'card-interactive cursor-pointer' : ''} ${className}`}>
      {children}
    </div>
  );
}
