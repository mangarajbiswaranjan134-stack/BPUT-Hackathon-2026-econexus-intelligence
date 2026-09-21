import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { motion } from 'framer-motion';

interface LineChartWidgetProps {
  data: any[];
  lines?: Array<{ dataKey: string; color: string; name: string; strokeDasharray?: string }>;
  dataKey?: string;
  name?: string;
  color?: string;
  height?: number;
  title?: string;
  showConfidence?: boolean;
}

export default function LineChartWidget({
  data,
  lines,
  dataKey,
  name,
  color = '#3b82f6',
  height = 300,
  title,
  showConfidence = false
}: LineChartWidgetProps) {
  const chartLines = lines || [{ dataKey: dataKey || 'value', color, name: name || 'Value' }];
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full flex flex-col"
    >
      {title && <h3 className="text-sm font-medium text-slate-400 mb-4">{title}</h3>}
      <div style={{ height }} className="w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis 
              dataKey="timestamp" 
              stroke="#64748b" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false}
              tickFormatter={(val) => {
                const d = new Date(val);
                return d.getHours() === 0 ? d.toLocaleDateString(undefined, {month:'short', day:'numeric'}) : d.toLocaleTimeString(undefined, {hour:'2-digit', minute:'2-digit'});
              }}
            />
            <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '0.5rem', color: '#f1f5f9' }}
              labelFormatter={(label) => new Date(label).toLocaleString()}
            />
            <Legend wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }} />
            
            {chartLines.map((line, i) => (
              <Line 
                key={i}
                type="monotone"
                dataKey={line.dataKey}
                name={line.name}
                stroke={line.color}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0 }}
                strokeDasharray={line.strokeDasharray}
                animationDuration={1500}
              />
            ))}
            
            {showConfidence && (
               <Line type="monotone" dataKey="upper" stroke="transparent" dot={false} activeDot={false} legendType="none" tooltipType="none" />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
