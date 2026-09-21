import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface GaugeChartProps {
  value: number;
  max?: number;
  label?: string;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function GaugeChart({ 
  value, 
  max = 100, 
  label, 
  color, 
  size = 'md' 
}: GaugeChartProps) {
  const [offset, setOffset] = useState(0);
  
  const sizes = {
    sm: { r: 30, stroke: 6, text: 'text-xl', label: 'text-[10px]' },
    md: { r: 60, stroke: 10, text: 'text-4xl', label: 'text-xs' },
    lg: { r: 90, stroke: 14, text: 'text-6xl', label: 'text-sm' }
  };
  
  const dim = sizes[size];
  const circumference = 2 * Math.PI * dim.r;
  const targetOffset = circumference - (value / max) * circumference;

  let gaugeColor = color;
  if (!gaugeColor) {
    if (value >= 80) gaugeColor = '#34d399'; // emerald-400
    else if (value >= 50) gaugeColor = '#fbbf24'; // amber-400
    else gaugeColor = '#f87171'; // red-400
  }

  useEffect(() => {
    // Animate stroke dashoffset
    setTimeout(() => setOffset(targetOffset), 100);
  }, [targetOffset]);

  const svgSize = (dim.r + dim.stroke) * 2;

  return (
    <div className="flex flex-col items-center justify-center relative">
      <svg width={svgSize} height={svgSize} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={svgSize / 2}
          cy={svgSize / 2}
          r={dim.r}
          stroke="#334155" // slate-700
          strokeWidth={dim.stroke}
          fill="transparent"
        />
        {/* Progress circle */}
        <motion.circle
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          cx={svgSize / 2}
          cy={svgSize / 2}
          r={dim.r}
          stroke={gaugeColor}
          strokeWidth={dim.stroke}
          fill="transparent"
          strokeDasharray={circumference}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`font-bold text-white font-mono ${dim.text}`}>
          {Math.round(value)}
        </span>
        {label && <span className={`text-slate-400 mt-1 ${dim.label}`}>{label}</span>}
      </div>
    </div>
  );
}
