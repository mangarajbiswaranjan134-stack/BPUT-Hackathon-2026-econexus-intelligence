import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import clsx from 'clsx';
import AnimatedCounter from './AnimatedCounter';
import StatusBadge from './StatusBadge';

interface MetricCardProps {
  title: string;
  value: number | string;
  unit?: string;
  icon?: React.ElementType;
  trend?: number;
  status?: string;
  onClick?: () => void;
  children?: React.ReactNode;
  className?: string;
}

export default function MetricCard({ 
  title, value, unit, icon: Icon, trend, status, onClick, children, className 
}: MetricCardProps) {
  const isNumber = typeof value === 'number';
  
  return (
    <motion.div 
      whileHover={onClick ? { scale: 1.02 } : {}}
      onClick={onClick}
      className={clsx(
        "glass-card p-5 relative overflow-hidden",
        onClick && "cursor-pointer hover:border-slate-600/50 transition-colors",
        className
      )}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-2 text-slate-400">
          {Icon && <Icon size={18} />}
          <h3 className="text-sm font-medium">{title}</h3>
        </div>
        {status && <StatusBadge status={status} />}
      </div>
      
      <div className="flex items-end mb-4">
        <span className="text-4xl font-bold text-white tracking-tight">
          {isNumber ? <AnimatedCounter value={value as number} decimals={value % 1 !== 0 ? 1 : 0} /> : value}
        </span>
        {unit && <span className="ml-2 text-sm font-medium text-slate-500 mb-1">{unit}</span>}
      </div>
      
      {trend !== undefined && (
        <div className="flex items-center text-sm font-medium">
          {trend > 0 ? (
            <span className="text-emerald-400 flex items-center bg-emerald-400/10 px-2 py-0.5 rounded">
              <ArrowUpRight size={16} className="mr-1" /> +{trend}%
            </span>
          ) : trend < 0 ? (
            <span className="text-amber-400 flex items-center bg-amber-400/10 px-2 py-0.5 rounded">
              <ArrowDownRight size={16} className="mr-1" /> {trend}%
            </span>
          ) : (
            <span className="text-slate-400 flex items-center bg-slate-400/10 px-2 py-0.5 rounded">
              <Minus size={16} className="mr-1" /> {trend}%
            </span>
          )}
          <span className="ml-2 text-xs text-slate-500 font-normal">vs last period</span>
        </div>
      )}
      
      {children && <div className="mt-4 pt-4 border-t border-slate-700/50">{children}</div>}
    </motion.div>
  );
}
