import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import clsx from 'clsx';
import { KPI } from '../../types';
import AnimatedCounter from './AnimatedCounter';
import SparklineChart from '../charts/SparklineChart';

interface KPICardProps {
  kpi?: KPI;
  title?: string;
  value?: number | string;
  unit?: string;
  trend?: number;
  status?: 'good' | 'warning' | 'critical' | string;
  sparkline?: number[];
  description?: string;
}

export default function KPICard(props: KPICardProps) {
  const kpi: KPI = props.kpi || {
    id: props.title || 'kpi',
    label: props.title || '',
    value: typeof props.value === 'number' ? props.value : parseFloat(String(props.value || 0)) || 0,
    unit: props.unit || '',
    trend: props.trend || 0,
    status: (props.status as 'good' | 'warning' | 'critical') || 'good',
    sparkline: props.sparkline || [1, 2, 3, 4, 5],
    description: props.description || ''
  };

  const displayVal = typeof props.value === 'string' && isNaN(Number(props.value)) ? props.value : kpi.value;
  const isPositive = kpi.trend > 0;
  const isNegative = kpi.trend < 0;

  const trendColor = clsx(
    kpi.status === 'good' && 'text-emerald-400',
    kpi.status === 'warning' && 'text-amber-400',
    kpi.status === 'critical' && 'text-red-400'
  );

  return (
    <motion.div 
      variants={{
        hidden: { opacity: 0, y: 25, scale: 0.96 },
        show: { 
          opacity: 1, 
          y: 0, 
          scale: 1,
          transition: { type: "spring", stiffness: 150, damping: 18 }
        }
      }}
      whileHover={{ y: -5, scale: 1.02, transition: { duration: 0.2 } }}
      className="kpi-card flex flex-col justify-between group relative overflow-hidden cursor-pointer"
    >
      {/* Subtle hover specular sheen */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

      <div className="flex justify-between items-start mb-2 relative z-10">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 group-hover:text-slate-200 transition-colors">{kpi.label}</h3>
        <div className="relative flex items-center justify-center">
          <div className={clsx("w-2.5 h-2.5 rounded-full relative z-10", 
            kpi.status === 'good' ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]' :
            kpi.status === 'warning' ? 'bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.8)]' :
            'bg-red-400 shadow-[0_0_10px_rgba(248,113,113,0.8)]'
          )} />
          <div className={clsx("absolute w-2.5 h-2.5 rounded-full animate-radar-ping", 
            kpi.status === 'good' ? 'bg-emerald-400' :
            kpi.status === 'warning' ? 'bg-amber-400' :
            'bg-red-400'
          )} />
        </div>
      </div>
      
      <div className="flex items-baseline mb-4 relative z-10">
        <span className="text-3xl font-extrabold text-slate-100 font-mono tracking-tight group-hover:text-cyan-300 transition-colors">
          {typeof displayVal === 'number' ? <AnimatedCounter value={displayVal} /> : displayVal}
        </span>
        {kpi.unit && <span className="ml-1.5 text-xs font-medium text-slate-400">{kpi.unit}</span>}

      </div>
      
      <div className="flex items-center justify-between mt-auto">
        <div className={clsx("flex items-center text-xs font-semibold px-2 py-1 rounded bg-slate-900/50", trendColor)}>
          {isPositive ? <ArrowUpRight size={14} className="mr-1" /> :
           isNegative ? <ArrowDownRight size={14} className="mr-1" /> :
           <Minus size={14} className="mr-1" />}
          <span>{Math.abs(kpi.trend)}%</span>
        </div>
        
        {kpi.sparkline && kpi.sparkline.length > 0 && (
          <div className="w-24 h-8">
            <SparklineChart 
              data={kpi.sparkline} 
              color={
                kpi.status === 'good' ? '#34d399' :
                kpi.status === 'warning' ? '#fbbf24' :
                '#f87171'
              } 
            />
          </div>
        )}
      </div>
    </motion.div>
  );
}
