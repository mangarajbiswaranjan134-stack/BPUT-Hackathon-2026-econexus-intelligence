import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import { motion } from 'framer-motion';

interface BarChartWidgetProps {
  data: any[];
  dataKey?: string;
  name?: string;
  color?: string;
  height?: number;
  title?: string;
  horizontal?: boolean;
}

export default function BarChartWidget({
  data,
  dataKey = 'value',
  color = '#3b82f6',
  height = 300,
  title,
  horizontal = false
}: BarChartWidgetProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full flex flex-col"
    >
      {title && <h3 className="text-sm font-medium text-slate-400 mb-4">{title}</h3>}
      <div style={{ height }} className="w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={data} 
            layout={horizontal ? 'vertical' : 'horizontal'}
            margin={{ top: 5, right: 10, left: horizontal ? 20 : -20, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={!horizontal} vertical={horizontal} />
            <XAxis 
              type={horizontal ? 'number' : 'category'} 
              dataKey={horizontal ? undefined : 'name'} 
              stroke="#64748b" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false}
            />
            <YAxis 
              type={horizontal ? 'category' : 'number'} 
              dataKey={horizontal ? 'name' : undefined}
              stroke="#64748b" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false}
              width={horizontal ? 80 : 40}
            />
            <Tooltip 
              cursor={{ fill: '#334155', opacity: 0.4 }}
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '0.5rem', color: '#f1f5f9' }}
            />
            <Bar dataKey={dataKey} radius={horizontal ? [0, 4, 4, 0] : [4, 4, 0, 0]} animationDuration={1000}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color || color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
