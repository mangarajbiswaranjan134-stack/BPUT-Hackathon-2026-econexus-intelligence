import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { api } from '../api/client';
import { AirQualityData, CopilotResponse } from '../types';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import MetricCard from '../components/common/MetricCard';
import AreaChartWidget from '../components/charts/AreaChartWidget';
import FacilityMap from '../components/maps/FacilityMap';
import InsightPanel from '../components/common/InsightPanel';
import { AlertTriangle, Info } from 'lucide-react';

const AirQuality: React.FC = () => {
  const [data, setData] = useState<AirQualityData | null>(null);
  const [insight, setInsight] = useState<CopilotResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [aqData, insightData] = await Promise.all([
        api.getAirQuality(),
        api.getAirQualityInsight() as unknown as Promise<CopilotResponse>
      ]);
      setData(aqData);
      setInsight(insightData);
      setError(null);
    } catch (err) {
      setError('Failed to fetch air quality data');
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

  const getAQIColor = (aqi: number) => {
    if (aqi <= 50) return 'text-emerald-400';
    if (aqi <= 100) return 'text-yellow-400';
    if (aqi <= 150) return 'text-orange-400';
    if (aqi <= 200) return 'text-red-400';
    return 'text-purple-400';
  };
  const aqiColor = getAQIColor(data.aqi);

  const markers = (data.hotspots || []).map((h, i) => ({
    id: `aq-${i}`,
    lat: h.lat,
    lng: h.lng,
    type: 'air_quality',
    label: h.location,
    value: `AQI: ${h.aqi}`
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="border-b border-slate-700/50 pb-4">
        <h1 className="text-3xl font-bold text-white">Air Quality Monitoring</h1>
        <p className="text-slate-400 mt-1">Real-time Environmental Telemetry &bull; AQI: {data.aqi} ({data.category})</p>
      </div>

      <div className="bg-blue-500/10 border border-blue-500/20 text-blue-300 p-3 rounded-lg flex items-start text-sm">
        <Info size={18} className="mr-2 mt-0.5 flex-shrink-0" />
        <p>Data shown is for decision-support and demonstration purposes. For official air quality measurements, refer to CPCB/SPCB monitoring stations.</p>
      </div>

      <div className="glass-card p-8 flex flex-col items-center justify-center mb-6">
         <h2 className="text-xl text-slate-300 mb-2">Overall AQI Index</h2>
         <div className={`text-6xl font-bold font-mono ${aqiColor} mb-2`}>{data.aqi}</div>
         <div className={`px-4 py-1 rounded-full text-sm font-medium ${data.category === 'Good' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
           {data.category}
         </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <MetricCard title="PM2.5" value={data.pm25} unit="µg/m³" status={data.pm25 > 35 ? 'warning' : 'good'} />
        <MetricCard title="PM10" value={data.pm10} unit="µg/m³" />
        <MetricCard title="CO₂" value={data.co2} unit="ppm" />
        <MetricCard title="Temperature" value={data.temperature} unit="°C" />
        <MetricCard title="Humidity" value={data.humidity} unit="%" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h3 className="text-lg font-medium text-white mb-4">AQI 24h History</h3>
          <div className="h-72">
             <AreaChartWidget
               data={(data.history || []).map(h => ({ name: h.timestamp, value: h.value }))}
               dataKey="value"
               color="#10b981"
             />
          </div>
        </div>
        <div className="glass-card p-2 flex flex-col">
          <h3 className="text-lg font-medium text-white p-4 pb-2">AQI Hotspot Map</h3>
          <div className="flex-1 relative rounded-lg overflow-hidden h-72">
             <FacilityMap markers={markers} />
          </div>
        </div>
      </div>

      <div className="glass-card p-6">
        <h3 className="text-lg font-medium text-white mb-4">AI Air Quality Insight</h3>
        {insight ? <InsightPanel insight={insight} /> : <LoadingSkeleton />}
      </div>
    </motion.div>
  );
};

export default AirQuality;
