import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { motion } from 'framer-motion';

interface AreaChartWidgetProps {
  data: any[];
  dataKey?: string;
  name?: string;
  color?: string;
  height?: number;
  showGrid?: boolean;
  showTooltip?: boolean;
  title?: string;
  gradient?: boolean;
}

export default function AreaChartWidget({
  data,
  dataKey = 'value',
  color = '#3b82f6', // blue-500
  height = 300,
  showGrid = true,
  showTooltip = true,
  title,
  gradient = true
}: AreaChartWidgetProps) {
  const gradientId = `gradient-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full flex flex-col"
    >
      {title && <h3 className="text-sm font-medium text-slate-400 mb-4">{title}</h3>}
      <div style={{ height: height }} className="w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
            {gradient && (
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
            )}
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />}
            <XAxis 
              dataKey="name" 
              stroke="#64748b" 
              fontSize={12} 
              tickLine={false}
              axisLine={false}
              minTickGap={20}
            />
            <YAxis 
              stroke="#64748b" 
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}`}
            />
            {showTooltip && (
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '0.5rem', color: '#f1f5f9' }}
                itemStyle={{ color: '#f1f5f9' }}
              />
            )}
            <Area 
              type="monotone" 
              dataKey={dataKey} 
              stroke={color} 
              strokeWidth={2}
              fillOpacity={1} 
              fill={gradient ? `url(#${gradientId})` : color}
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
