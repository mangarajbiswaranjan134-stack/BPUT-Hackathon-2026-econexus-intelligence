import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { api } from '../api/client';
import { SafetyData, CopilotResponse } from '../types';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import KPICard from '../components/common/KPICard';
import BarChartWidget from '../components/charts/BarChartWidget';
import InsightPanel from '../components/common/InsightPanel';
import { AlertTriangle, ShieldCheck } from 'lucide-react';

const Safety: React.FC = () => {
  const [data, setData] = useState<SafetyData | null>(null);
  const [insight, setInsight] = useState<CopilotResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [safetyData, insightData] = await Promise.all([
        api.getSafety(),
        api.getSafetyInsight() as unknown as Promise<CopilotResponse>
      ]);
      setData(safetyData);
      setInsight(insightData);
      setError(null);
    } catch (err) {
      setError('Failed to fetch safety data');
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="border-b border-slate-700/50 pb-4">
        <h1 className="text-3xl font-bold text-white">Safety Intelligence</h1>
        <p className="text-slate-400 mt-1">
          Operational Safety Analytics &bull; Risk Level: {data.risk_level.toUpperCase()} &bull; Open Cases: {data.open_incidents}
        </p>
      </div>

      <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-300 p-3 rounded-lg flex items-start text-sm">
        <ShieldCheck size={18} className="mr-2 mt-0.5 flex-shrink-0" />
        <p>Facility operational safety analytics for decision-support and demonstration purposes.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard title="Total Incidents (90d)" value={data.total_incidents} trend={data.trend_pct} />
        <KPICard title="Open Cases" value={data.open_incidents} trend={0} status={data.open_incidents > 2 ? 'warning' : 'good'} />
        <KPICard title="Risk Level" value={data.risk_level.toUpperCase()} trend={0} status={data.risk_level === 'high' ? 'warning' : 'good'} />
        <KPICard title="Trend (%)" value={data.trend_pct} trend={data.trend_pct} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-card p-6 lg:col-span-1">
          <h3 className="text-lg font-medium text-white mb-4">Monthly Incident Trend</h3>
          <div className="h-64">
             <BarChartWidget
               data={(data.monthly_trend || []).map(m => ({ name: m.month, value: m.count }))}
               dataKey="value"
               color="#ef4444"
             />
          </div>
        </div>
        <div className="glass-card p-6 lg:col-span-1">
          <h3 className="text-lg font-medium text-white mb-4">By Incident Category</h3>
          <div className="h-64">
             <BarChartWidget
               data={(data.by_category || []).map(c => ({ name: c.category.replace('_', ' '), value: c.count }))}
               dataKey="value"
               color="#f59e0b"
             />
          </div>
        </div>
        <div className="glass-card p-6 lg:col-span-1">
          <h3 className="text-lg font-medium text-white mb-4">By Location</h3>
          <div className="h-64">
             <BarChartWidget
               data={(data.by_location || []).map(l => ({ name: l.location, value: l.count }))}
               dataKey="value"
               color="#3b82f6"
             />
          </div>
        </div>
      </div>

      <div className="glass-card p-6 overflow-x-auto">
        <h3 className="text-lg font-medium text-white mb-4">Recorded Incidents Log</h3>
        <table className="w-full text-left text-sm">
          <thead className="text-slate-400 border-b border-slate-700">
            <tr>
              <th className="pb-3 px-2 font-medium">Incident ID</th>
              <th className="pb-3 px-2 font-medium">Timestamp</th>
              <th className="pb-3 px-2 font-medium">Type</th>
              <th className="pb-3 px-2 font-medium">Location</th>
              <th className="pb-3 px-2 font-medium">Severity</th>
              <th className="pb-3 px-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {data.incidents?.map((inc, idx) => (
              <tr key={idx} className="hover:bg-slate-800/30">
                <td className="py-3 px-2 text-slate-300 font-mono text-xs">{inc.id}</td>
                <td className="py-3 px-2 text-slate-400 text-xs">{inc.timestamp.slice(0, 10)}</td>
                <td className="py-3 px-2 text-slate-200 capitalize">{inc.type.replace('_', ' ')}</td>
                <td className="py-3 px-2 text-slate-300">{inc.location}</td>
                <td className="py-3 px-2">
                  <span className={`px-2 py-0.5 text-xs rounded-full capitalize ${inc.severity === 'high' ? 'bg-red-500/20 text-red-400' : inc.severity === 'medium' ? 'bg-orange-500/20 text-orange-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                    {inc.severity}
                  </span>
                </td>
                <td className="py-3 px-2">
                  <span className={`text-xs capitalize font-medium ${inc.status === 'open' ? 'text-red-400' : 'text-emerald-400'}`}>{inc.status}</span>
                </td>
              </tr>
            ))}
            {(!data.incidents || data.incidents.length === 0) && (
              <tr><td colSpan={6} className="py-4 text-center text-slate-400">No recorded incidents.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="glass-card p-6">
        <h3 className="text-lg font-medium text-white mb-4">AI Safety Insight</h3>
        {insight ? <InsightPanel insight={insight} /> : <LoadingSkeleton />}
      </div>
    </motion.div>
  );
};

export default Safety;
