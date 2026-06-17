import React from 'react';

interface ProgressBarProps {
  current: number; // 1-based index
  total: number;
}

export default function ProgressBar({ current, total }: ProgressBarProps) {
  const percentage = Math.max(0, Math.min(100, (current / total) * 100));

  return (
    <div className="w-full mb-6">
      <div className="flex justify-between items-end mb-2">
        <span className="text-[10px] font-bold text-brand-primary tracking-widest uppercase">Question {current} of {total}</span>
        {/* Optional: Add round info or hide if not needed */}
        <span className="text-[10px] font-medium text-brand-neutral">World Cup</span>
      </div>
      <div className="h-2 w-full bg-brand-surface-container-highest rounded-full overflow-hidden">
        <div 
          className="h-full bg-brand-primary rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
