import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { api } from '../api/client';
import { EnergyData, ForecastResult, CopilotResponse } from '../types';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import KPICard from '../components/common/KPICard';
import AreaChartWidget from '../components/charts/AreaChartWidget';
import BarChartWidget from '../components/charts/BarChartWidget';
import LineChartWidget from '../components/charts/LineChartWidget';
import InsightPanel from '../components/common/InsightPanel';
import { AlertTriangle } from 'lucide-react';

const Energy: React.FC = () => {
  const [data, setData] = useState<EnergyData | null>(null);
  const [insight, setInsight] = useState<CopilotResponse | null>(null);
  const [forecast, setForecast] = useState<ForecastResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [horizon, setHorizon] = useState('24h');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [energyData, forecastData, insightData] = await Promise.all([
        api.getEnergy(),
        api.getEnergyForecast(horizon),
        api.getEnergyInsight() as unknown as Promise<CopilotResponse>
      ]);
      setData(energyData);
      setForecast(forecastData);
      setInsight(insightData);
      setError(null);
    } catch (err) {
      setError('Failed to fetch energy data');
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
          <h1 className="text-3xl font-bold text-white">Energy Intelligence</h1>
          <p className="text-slate-400 mt-1">
            Current Power: {data.current_kw} kW &bull; Daily: {data.daily_kwh} kWh &bull; Est. Cost: ₹{data.cost_estimate}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <KPICard title="Current (kW)" value={data.current_kw} trend={data.trend_pct} status={data.current_kw > data.baseline_kw * 1.15 ? 'warning' : 'good'} />
        <KPICard title="Daily (kWh)" value={data.daily_kwh} trend={0} />
        <KPICard title="Peak Demand (kW)" value={data.peak_kw} trend={0} />
        <KPICard title="Baseline (kW)" value={data.baseline_kw} trend={0} />
        <KPICard title="Trend (%)" value={data.trend_pct} trend={data.trend_pct} />
        <KPICard title="Cost Est (₹)" value={data.cost_estimate} trend={0} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-card p-6 lg:col-span-2">
          <h3 className="text-lg font-medium text-white mb-4">Energy Consumption Trend</h3>
          <div className="h-72">
             <AreaChartWidget
               data={data.history.map(d => ({ name: d.timestamp.slice(11, 16), value: d.value }))}
               dataKey="value"
               color="#3b82f6"
             />
          </div>
        </div>
        <div className="glass-card p-6 lg:col-span-1">
          <h3 className="text-lg font-medium text-white mb-4">Building Comparison</h3>
          <div className="h-72">
             <BarChartWidget
               data={(data.by_building || []).map(b => ({ name: b.building, value: b.value }))}
               dataKey="value"
             />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         <div className="glass-card p-6 lg:col-span-2">
           <div className="flex justify-between items-center mb-4">
             <h3 className="text-lg font-medium text-white">Energy Forecast</h3>
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
                name="Forecast (kW)"
              />
           </div>
         </div>
         <div className="glass-card p-6 lg:col-span-1 overflow-auto h-96">
            <h3 className="text-lg font-medium text-white mb-4">Anomalies</h3>
            <div className="space-y-3">
               {data.anomalies?.map((anom: any, idx: number) => (
                  <div key={idx} className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
                     <p className="text-sm font-medium text-slate-200">{anom.possible_cause || anom.metric}</p>
                     <span className={`inline-block mt-2 px-2 py-1 text-xs rounded-full ${anom.severity === 'critical' ? 'bg-red-500/20 text-red-400' : 'bg-orange-500/20 text-orange-400'}`}>
                       {anom.severity || 'high'}
                     </span>
                  </div>
               ))}
               {(!data.anomalies || data.anomalies.length === 0) && <p className="text-slate-400 text-sm">No active anomalies.</p>}
            </div>
         </div>
      </div>

      <div className="glass-card p-6">
        <h3 className="text-lg font-medium text-white mb-4">AI Energy Insight</h3>
        {insight ? <InsightPanel insight={insight} /> : <LoadingSkeleton />}
      </div>
    </motion.div>
  );
};

export default Energy;
