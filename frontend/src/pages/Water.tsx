import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { api } from '../api/client';
import { WaterData, ForecastResult, CopilotResponse } from '../types';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import KPICard from '../components/common/KPICard';
import AreaChartWidget from '../components/charts/AreaChartWidget';
import BarChartWidget from '../components/charts/BarChartWidget';
import LineChartWidget from '../components/charts/LineChartWidget';
import InsightPanel from '../components/common/InsightPanel';
import { AlertTriangle } from 'lucide-react';

const Water: React.FC = () => {
  const [data, setData] = useState<WaterData | null>(null);
  const [insight, setInsight] = useState<CopilotResponse | null>(null);
  const [forecast, setForecast] = useState<ForecastResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [horizon, setHorizon] = useState('24h');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [waterData, forecastData, insightData] = await Promise.all([
        api.getWater(),
        api.getWaterForecast(horizon),
        api.getWaterInsight() as unknown as Promise<CopilotResponse>
      ]);
      setData(waterData);
      setForecast(forecastData);
      setInsight(insightData);
      setError(null);
    } catch (err) {
      setError('Failed to fetch water data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [horizon]);

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
      <div className="flex justify-between items-end border-b border-slate-700/50 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Water Intelligence</h1>
          <p className="text-slate-400 mt-1">
            Current Flow: {data.current_lph} LPH &bull; Daily Volume: {data.daily_liters} L &bull; Overnight Baseline: {data.overnight_baseline} LPH
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <KPICard title="Current (LPH)" value={data.current_lph} trend={data.trend_pct} status={data.current_lph > data.baseline_lph * 1.2 ? 'warning' : 'good'} />
        <KPICard title="Daily (Liters)" value={data.daily_liters} trend={0} />
        <KPICard title="Baseline (LPH)" value={data.baseline_lph} trend={0} />
        <KPICard title="Overnight (LPH)" value={data.overnight_baseline} trend={0} />
        <KPICard title="Trend (%)" value={data.trend_pct} trend={data.trend_pct} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-card p-6 lg:col-span-2">
          <h3 className="text-lg font-medium text-white mb-4">Consumption Trend</h3>
          <div className="h-72">
             <AreaChartWidget
               data={data.history.map(d => ({ name: d.timestamp.slice(11, 16), value: d.value }))}
               dataKey="value"
               color="#10b981"
             />
          </div>
        </div>
        <div className="glass-card p-6 lg:col-span-1">
          <h3 className="text-lg font-medium text-white mb-4">Zone Comparison</h3>
          <div className="h-72">
             <BarChartWidget
               data={(data.by_zone || []).map(z => ({ name: z.zone, value: z.value }))}
               dataKey="value"
               color="#10b981"
             />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         <div className="glass-card p-6 lg:col-span-2">
           <div className="flex justify-between items-center mb-4">
             <h3 className="text-lg font-medium text-white">Water Forecast</h3>
             <select 
               value={horizon} 
               onChange={(e) => setHorizon(e.target.value)}
               className="bg-slate-800 border border-slate-700 text-white rounded p-1 text-sm"
             >
               <option value="24h">Next 24 Hours</option>
               <option value="7d">Next 7 Days</option>
               <option value="30d">Next 30 Days</option>
             </select>
           </div>
           <div className="h-72">
              <LineChartWidget
                data={forecast?.forecast.map(p => ({ timestamp: p.timestamp, value: p.value })) || []}
                dataKey="value"
                name="Forecast (LPH)"
                color="#10b981"
              />
           </div>
         </div>
         <div className="glass-card p-6 lg:col-span-1 overflow-auto h-96">
            <h3 className="text-lg font-medium text-white mb-4">Leak / Anomaly Detection</h3>
            <div className="space-y-3">
               {data.anomalies?.map((anom: any, idx: number) => (
                  <div key={idx} className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
                     <p className="text-sm font-medium text-slate-200">{anom.possible_cause || 'Elevated flow'}</p>
                     <p className="text-xs text-slate-400 mt-1">{anom.location || 'Hostel zone'}</p>
                     <span className={`inline-block mt-2 px-2 py-1 text-xs rounded-full ${anom.severity === 'critical' ? 'bg-red-500/20 text-red-400' : 'bg-orange-500/20 text-orange-400'}`}>
                       {anom.severity || 'high'}
                     </span>
                  </div>
               ))}
               {(!data.anomalies || data.anomalies.length === 0) && (
                 <p className="text-slate-400 text-sm">No active leaks detected. Overnight flow within baseline.</p>
               )}
            </div>
         </div>
      </div>

      <div className="glass-card p-6">
        <h3 className="text-lg font-medium text-white mb-4">AI Water Insight</h3>
        {insight ? <InsightPanel insight={insight} /> : <LoadingSkeleton />}
      </div>
    </motion.div>
  );
};

export default Water;
