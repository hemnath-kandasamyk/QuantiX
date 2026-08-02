import React from 'react';

export type StampVariant = 'green' | 'amber' | 'red' | 'neutral';

interface StatusStampProps {
  label: string;
  variant?: StampVariant;
  animate?: boolean;
  className?: string;
  icon?: React.ReactNode;
}

export const StatusStamp: React.FC<StatusStampProps> = ({
  label,
  variant = 'green',
  animate = true,
  className = '',
  icon,
}) => {
  const variantClass =
    variant === 'green'
      ? 'stamp-green'
      : variant === 'amber'
      ? 'stamp-amber'
      : variant === 'red'
      ? 'stamp-red'
      : 'text-[var(--color-text-muted)] bg-[var(--color-paper-subtle)] border-[var(--color-rule)]';

  return (
    <span
      className={`stamp ${variantClass} ${animate ? 'stamp-down' : ''} ${className}`}
    >
      {icon}
      <span>{label}</span>
    </span>
  );
};
