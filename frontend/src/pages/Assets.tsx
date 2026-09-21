import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { api } from '../api/client';
import { AssetData, CopilotResponse } from '../types';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import KPICard from '../components/common/KPICard';
import BarChartWidget from '../components/charts/BarChartWidget';
import InsightPanel from '../components/common/InsightPanel';
import StatusBadge from '../components/common/StatusBadge';
import { AlertTriangle } from 'lucide-react';

const Assets: React.FC = () => {
  const [data, setData] = useState<AssetData | null>(null);
  const [insight, setInsight] = useState<CopilotResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [assetData, insightData] = await Promise.all([
        api.getAssets(),
        api.getAssetInsight() as unknown as Promise<CopilotResponse>
      ]);
      setData(assetData);
      setInsight(insightData);
      setError(null);
    } catch (err) {
      setError('Failed to fetch asset data');
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
        <h1 className="text-3xl font-bold text-white">Asset Intelligence</h1>
        <p className="text-slate-400 mt-1">
          Infrastructure Equipment Monitoring &bull; Total Assets: {data.total_assets} &bull; Utilization: {data.utilization_pct}%
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <KPICard title="Total Assets" value={data.total_assets} trend={0} />
        <KPICard title="Active" value={data.active} trend={0} status="good" />
        <KPICard title="Maintenance" value={data.maintenance} trend={0} status={data.maintenance > 2 ? 'warning' : 'good'} />
        <KPICard title="Idle" value={data.idle} trend={0} status={data.idle > 3 ? 'warning' : 'good'} />
        <KPICard title="Avg Utilization" value={`${data.utilization_pct}%`} trend={0} />
      </div>

      <div className="glass-card p-6 overflow-x-auto">
        <h3 className="text-lg font-medium text-white mb-4">Equipment & Asset Inventory</h3>
        <table className="w-full text-left text-sm">
          <thead className="text-slate-400 border-b border-slate-700">
            <tr>
              <th className="pb-3 px-2 font-medium">Asset ID</th>
              <th className="pb-3 px-2 font-medium">Name</th>
              <th className="pb-3 px-2 font-medium">Category</th>
              <th className="pb-3 px-2 font-medium">Building</th>
              <th className="pb-3 px-2 font-medium">Status</th>
              <th className="pb-3 px-2 font-medium">Utilization</th>
              <th className="pb-3 px-2 font-medium">Next Maintenance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {data.assets?.map((asset, idx) => {
              const utilPct = Math.round((asset.utilization > 1 ? asset.utilization : asset.utilization * 100));
              return (
                <tr key={idx} className="hover:bg-slate-800/30">
                  <td className="py-3 px-2 text-slate-400 font-mono text-xs">{asset.id}</td>
                  <td className="py-3 px-2 text-white font-medium">{asset.name}</td>
                  <td className="py-3 px-2 text-slate-300">{asset.type}</td>
                  <td className="py-3 px-2 text-slate-300">{asset.building}</td>
                  <td className="py-3 px-2"><StatusBadge status={asset.status === 'active' ? 'good' : asset.status === 'idle' ? 'warning' : 'critical'} /></td>
                  <td className="py-3 px-2">
                    <div className="flex items-center w-full max-w-[120px]">
                      <div className="w-full bg-slate-700 rounded-full h-1.5 mr-2">
                         <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${utilPct}%` }} />
                      </div>
                      <span className="text-xs text-slate-400 font-mono">{utilPct}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-2 text-slate-400 text-xs">{asset.next_maintenance}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h3 className="text-lg font-medium text-white mb-4">Utilization by Category</h3>
          <div className="h-64">
             <BarChartWidget
               data={(data.by_category || []).map(c => ({ name: c.category, value: c.utilization }))}
               dataKey="value"
               color="#3b82f6"
             />
          </div>
        </div>
        <div className="glass-card p-6 h-80 overflow-y-auto">
          <h3 className="text-lg font-medium text-white mb-4">Underutilized Assets & Alerts</h3>
          <div className="space-y-3">
             {data.anomalies?.map((alert: any, idx: number) => (
                <div key={idx} className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/50 flex justify-between items-center">
                   <div>
                     <p className="text-sm font-medium text-slate-200">{alert.asset || alert.name || 'Asset'}</p>
                     <p className="text-xs text-slate-400 mt-1">{alert.issue || 'Underutilized unit'}</p>
                   </div>
                   <span className="px-2 py-1 text-xs rounded-full bg-yellow-500/20 text-yellow-400">Review</span>
                </div>
             ))}
             {(!data.anomalies || data.anomalies.length === 0) && (
               <p className="text-slate-400 text-sm">No asset utilization alerts.</p>
             )}
          </div>
        </div>
      </div>

      <div className="glass-card p-6">
        <h3 className="text-lg font-medium text-white mb-4">AI Asset Insight</h3>
        {insight ? <InsightPanel insight={insight} /> : <LoadingSkeleton />}
      </div>
    </motion.div>
  );
};

export default Assets;
