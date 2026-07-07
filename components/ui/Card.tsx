interface CardProps {
  children: React.ReactNode;
  className?: string;
  interactive?: boolean;
  hoverable?: boolean;
}

export function Card({ children, className = '', interactive = false, hoverable = false }: CardProps) {
  return (
    <div className={`bg-surface border border-border-subtle rounded-lg shadow-card p-4 transition-all duration-200 ease-out ${interactive ? 'card-interactive cursor-pointer' : ''} ${hoverable ? 'hover:-translate-y-0.5 hover:shadow-md hover:border-border-default' : ''} ${className}`}>
      {children}
    </div>
  );
}
