import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  changePercent?: number;
  changePeriodLabel?: string;
  icon?: LucideIcon;
  subtext?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  changePercent,
  changePeriodLabel = 'vs last period',
  icon: Icon,
  subtext,
}) => {
  const isPositive = (changePercent ?? 0) >= 0;

  return (
    <div className="ledger-card p-5 rounded flex flex-col justify-between hover:border-[var(--color-text-muted)] transition-colors">
      <div className="flex items-center justify-between mb-2">
        <span className="section-label">{title}</span>
        {Icon && (
          <div className="p-1.5 rounded bg-[var(--color-paper-subtle)] text-[var(--color-text-muted)] border border-[var(--color-rule-subtle)]">
            <Icon className="w-4 h-4 stroke-[1.75]" />
          </div>
        )}
      </div>

      <div className="my-1">
        <span className="font-serif-heading text-2xl md:text-3xl font-bold text-[var(--color-text-ink)] tracking-tight font-mono-num">
          {value}
        </span>
      </div>

      <div className="flex items-center justify-between mt-2 pt-2 border-t border-[var(--color-rule-subtle)] text-xs">
        {changePercent !== undefined ? (
          <div className="flex items-center gap-1.5 font-mono-num">
            <span
              className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[11px] font-bold ${
                isPositive
                  ? 'text-[var(--color-ledger-green)] bg-[var(--color-ledger-green-bg)]'
                  : 'text-[var(--color-stamp-red)] bg-[var(--color-stamp-red-bg)]'
              }`}
            >
              {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {isPositive ? '+' : ''}
              {changePercent.toFixed(1)}%
            </span>
            <span className="text-[var(--color-text-muted)] text-[11px]">
              {changePeriodLabel}
            </span>
          </div>
        ) : subtext ? (
          <span className="text-[var(--color-text-muted)] text-[11px] italic">
            {subtext}
          </span>
        ) : null}
      </div>
    </div>
  );
};
