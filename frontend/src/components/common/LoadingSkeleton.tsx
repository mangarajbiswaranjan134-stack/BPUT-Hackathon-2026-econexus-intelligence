import React from 'react';
import clsx from 'clsx';

interface LoadingSkeletonProps {
  lines?: number;
  className?: string;
  type?: 'text' | 'card' | 'chart';
}

export default function LoadingSkeleton({ lines = 1, className, type = 'card' }: LoadingSkeletonProps) {
  if (type === 'card') {
    return (
      <div className={clsx("glass-card p-4 animate-pulse flex flex-col space-y-4", className)}>
        <div className="h-4 bg-slate-700/50 rounded w-1/3"></div>
        <div className="h-8 bg-slate-700/50 rounded w-1/2"></div>
        <div className="h-20 bg-slate-700/30 rounded w-full mt-auto"></div>
      </div>
    );
  }
  
  if (type === 'chart') {
    return (
      <div className={clsx("animate-pulse flex flex-col space-y-4", className)}>
        <div className="h-6 bg-slate-700/50 rounded w-1/4"></div>
        <div className="h-full bg-slate-700/20 rounded w-full flex items-end px-4 space-x-2 pb-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex-1 bg-slate-700/40 rounded-t" style={{ height: `${Math.max(20, Math.random() * 80)}%` }}></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={clsx("animate-pulse space-y-3", className)}>
      {[...Array(lines)].map((_, i) => (
        <div 
          key={i} 
          className="h-4 bg-slate-700/50 rounded"
          style={{ width: i === lines - 1 && lines > 1 ? '60%' : '100%' }}
        />
      ))}
    </div>
  );
}
