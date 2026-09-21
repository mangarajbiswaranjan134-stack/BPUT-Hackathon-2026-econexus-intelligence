import React from 'react';
import { ResponsiveContainer, AreaChart, Area } from 'recharts';

interface SparklineChartProps {
  data: number[];
  color?: string;
}

export default function SparklineChart({ data, color = '#3b82f6' }: SparklineChartProps) {
  const chartData = data.map((val, i) => ({ value: val, index: i }));
  const gradientId = `sparkline-grad-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.4} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area 
          type="monotone" 
          dataKey="value" 
          stroke={color} 
          strokeWidth={1.5}
          fill={`url(#${gradientId})`} 
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
