import React from 'react';
import { LucideIcon, FolderOpen } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  stampText?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = FolderOpen,
  title,
  description,
  actionLabel,
  onAction,
  stampText = 'EMPTY',
}) => {
  return (
    <div className="ledger-card p-8 md:p-12 text-center rounded flex flex-col items-center justify-center my-4 border-dashed border-2 border-[var(--color-rule)]">
      <div className="relative mb-4">
        <div className="w-16 h-16 rounded-full bg-[var(--color-paper-subtle)] border border-[var(--color-rule)] flex items-center justify-center text-[var(--color-text-muted)]">
          <Icon className="w-8 h-8 stroke-[1.5]" />
        </div>
        <span className="stamp stamp-amber stamp-down absolute -bottom-2 -right-4 shadow-sm">
          {stampText}
        </span>
      </div>

      <h3 className="font-serif-heading text-lg text-[var(--color-text-ink)] mb-1">
        {title}
      </h3>
      <p className="text-xs text-[var(--color-text-muted)] max-w-sm mb-6 leading-relaxed">
        {description}
      </p>

      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-4 py-2 bg-[var(--color-ink)] text-[var(--color-paper)] text-xs font-mono-num font-semibold uppercase tracking-wider rounded hover:opacity-90 active:scale-[0.98] transition-all flex items-center gap-2 shadow-sm"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
