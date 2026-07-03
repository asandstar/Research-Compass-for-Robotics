interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`bg-white border border-rule rounded-lg p-4 ${className}`}>
      {children}
    </div>
  );
}
