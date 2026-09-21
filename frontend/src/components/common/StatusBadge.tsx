import React from 'react';
import clsx from 'clsx';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function StatusBadge({ status, size = 'sm', className }: StatusBadgeProps) {
  const normStatus = status.toLowerCase();
  
  let colorClass = 'text-slate-400 bg-slate-400/10 border-slate-400/20';
  let dotClass = 'bg-slate-400';

  if (['good', 'connected', 'completed', 'resolved'].includes(normStatus)) {
    colorClass = 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
    dotClass = 'bg-emerald-400';
  } else if (['warning', 'moderate', 'acknowledged', 'in_progress', 'medium'].includes(normStatus)) {
    colorClass = 'text-amber-400 bg-amber-400/10 border-amber-400/20';
    dotClass = 'bg-amber-400';
  } else if (['critical', 'error', 'new', 'high'].includes(normStatus)) {
    colorClass = 'text-red-400 bg-red-400/10 border-red-400/20';
    dotClass = 'bg-red-400';
  } else if (['fallback'].includes(normStatus)) {
    colorClass = 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
    dotClass = 'bg-yellow-400';
  } else if (['low', 'not_configured', 'idle'].includes(normStatus)) {
    colorClass = 'text-slate-400 bg-slate-400/10 border-slate-400/20';
    dotClass = 'bg-slate-400';
  }

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1 text-sm'
  };

  const dotSizes = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-2 h-2'
  };

  return (
    <span className={clsx(
      "inline-flex items-center font-medium rounded-full border",
      colorClass,
      sizeClasses[size],
      className
    )}>
      <span className={clsx("rounded-full mr-1.5", dotClass, dotSizes[size])} />
      <span className="capitalize">{status.replace('_', ' ')}</span>
    </span>
  );
}
