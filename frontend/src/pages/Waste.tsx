import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { api } from '../api/client';
import { WasteData, CopilotResponse } from '../types';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import KPICard from '../components/common/KPICard';
import AreaChartWidget from '../components/charts/AreaChartWidget';
import BarChartWidget from '../components/charts/BarChartWidget';
import InsightPanel from '../components/common/InsightPanel';
import { AlertTriangle } from 'lucide-react';

const Waste: React.FC = () => {
  const [data, setData] = useState<WasteData | null>(null);
  const [insight, setInsight] = useState<CopilotResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [wasteData, insightData] = await Promise.all([
        api.getWaste(),
        api.getWasteInsight() as unknown as Promise<CopilotResponse>
      ]);
      setData(wasteData);
      setInsight(insightData);
      setError(null);
    } catch (err) {
      setError('Failed to fetch waste data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading && !data) return <LoadingSkeleton lines={8} />;

  if (error && !data) return (
    <div className="flex flex-col items-center justify-center h-full text-red-400">
      <AlertTriangle size={48} className="mb-4" />
      <p>{error}</p>
      <button onClick={fetchData} className="mt-4 px-4 py-2 bg-slate-800 rounded hover:bg-slate-700">Retry</button>
    </div>
  );

  if (!data) return null;

  const criticalBins = data.bins?.filter(b => b.fill_pct > 75) || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="border-b border-slate-700/50 pb-4">
        <h1 className="text-3xl font-bold text-white">Waste Intelligence</h1>
        <p className="text-slate-400 mt-1">
          Smart Waste Bin Monitoring &bull; Total Bins: {data.total_bins} &bull; Overflow Risk: {data.overflow_risk} bins
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard title="Total Bins" value={data.total_bins} trend={0} />
        <KPICard title="Overflow Risk (Bins)" value={data.overflow_risk} trend={0} status={data.overflow_risk > 3 ? 'warning' : 'good'} />
        <KPICard title="Collection Eff. (%)" value={data.collection_efficiency} trend={0} />
        <KPICard title="Daily Gen (kg)" value={data.daily_generation_kg} trend={0} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         <div className="glass-card p-6 lg:col-span-2">
            <h3 className="text-lg font-medium text-white mb-4">Bin Fill Levels (Highest Capacity Bins)</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
               {data.bins?.slice(0, 6).map((bin, idx) => (
                  <div key={idx} className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50">
                     <div className="flex justify-between items-start mb-2">
                       <p className="text-sm font-medium text-white truncate">{bin.location}</p>
                       <span className="text-[10px] text-slate-400 uppercase bg-slate-700/50 px-1.5 py-0.5 rounded">{bin.type}</span>
                     </div>
                     <div className="w-full bg-slate-700 rounded-full h-2.5 mb-1">
                        <div
                          className={`h-2.5 rounded-full ${bin.fill_pct > 80 ? 'bg-red-500' : bin.fill_pct > 50 ? 'bg-orange-500' : 'bg-emerald-500'}`}
                          style={{ width: `${bin.fill_pct}%` }}
                        />
                     </div>
                     <p className="text-xs text-right text-slate-400 font-mono">{bin.fill_pct}% Full</p>
                  </div>
               ))}
            </div>
         </div>
         <div className="glass-card p-6 lg:col-span-1 h-80 overflow-auto">
            <h3 className="text-lg font-medium text-white mb-4">Overflow Predictions (&gt;75% Full)</h3>
            <div className="space-y-3">
               {criticalBins.map((bin, idx) => (
                  <div key={idx} className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/50 text-sm text-slate-300">
                     <span className="font-medium text-white">{bin.id} ({bin.location})</span> is currently at <span className="text-orange-400 font-medium">{bin.fill_pct}%</span>.
                  </div>
               ))}
               {criticalBins.length === 0 && <p className="text-slate-400 text-sm">No imminent bin overflows predicted.</p>}
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h3 className="text-lg font-medium text-white mb-4">Waste Breakdown by Type</h3>
          <div className="h-64">
             <BarChartWidget
               data={(data.by_type || []).map(t => ({ name: t.type, value: t.value }))}
               dataKey="value"
               color="#f59e0b"
             />
          </div>
        </div>
        <div className="glass-card p-6">
          <h3 className="text-lg font-medium text-white mb-4">Collection Trends</h3>
          <div className="h-64">
             <AreaChartWidget
               data={(data.history || []).map(h => ({ name: h.timestamp, value: h.value }))}
               dataKey="value"
               color="#f59e0b"
             />
          </div>
        </div>
      </div>

      <div className="glass-card p-6">
        <h3 className="text-lg font-medium text-white mb-4">AI Waste Insight</h3>
        {insight ? <InsightPanel insight={insight} /> : <LoadingSkeleton />}
      </div>
    </motion.div>
  );
};

export default Waste;
