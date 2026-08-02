import React from 'react';

export const SkeletonStatCard: React.FC = () => {
  return (
    <div className="ledger-card p-5 rounded">
      <div className="flex justify-between items-start mb-3">
        <div className="h-3 w-24 shimmer rounded"></div>
        <div className="h-4 w-12 shimmer rounded"></div>
      </div>
      <div className="h-7 w-32 shimmer rounded mb-2"></div>
      <div className="h-3 w-20 shimmer rounded"></div>
    </div>
  );
};

export const SkeletonTableRow: React.FC<{ cols?: number }> = ({ cols = 5 }) => {
  return (
    <tr className="border-b border-[var(--color-rule-subtle)]">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="py-3 px-4">
          <div className="h-4 shimmer rounded w-full max-w-[120px]"></div>
        </td>
      ))}
    </tr>
  );
};

export const SkeletonTable: React.FC<{ rows?: number; cols?: number }> = ({ rows = 5, cols = 5 }) => {
  return (
    <div className="ledger-card rounded overflow-hidden">
      <table className="w-full text-left">
        <thead className="bg-[var(--color-paper-subtle)] border-b border-[var(--color-rule)]">
          <tr>
            {Array.from({ length: cols }).map((_, i) => (
              <th key={i} className="py-3 px-4">
                <div className="h-3 w-16 shimmer rounded"></div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <SkeletonTableRow key={i} cols={cols} />
          ))}
        </tbody>
      </table>
    </div>
  );
};
