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
      variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
      className="kpi-card flex flex-col justify-between"
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-sm font-medium text-slate-400">{kpi.label}</h3>
        <div className={clsx("w-2 h-2 rounded-full mt-1.5", 
          kpi.status === 'good' ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]' :
          kpi.status === 'warning' ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]' :
          'bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.5)]'
        )} />
      </div>
      
      <div className="flex items-baseline mb-4">
        <span className="text-3xl font-bold text-slate-100 font-mono tracking-tight">
          {typeof displayVal === 'number' ? <AnimatedCounter value={displayVal} /> : displayVal}
        </span>
        {kpi.unit && <span className="ml-1 text-sm font-medium text-slate-500">{kpi.unit}</span>}
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
