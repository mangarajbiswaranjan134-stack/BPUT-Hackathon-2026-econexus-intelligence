import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { api } from '../api/client';
import { TrafficData, CopilotResponse } from '../types';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import KPICard from '../components/common/KPICard';
import AreaChartWidget from '../components/charts/AreaChartWidget';
import FacilityMap from '../components/maps/FacilityMap';
import InsightPanel from '../components/common/InsightPanel';
import { AlertTriangle } from 'lucide-react';

const Traffic: React.FC = () => {
  const [data, setData] = useState<TrafficData | null>(null);
  const [insight, setInsight] = useState<CopilotResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeLayers, setActiveLayers] = useState<string[]>(['traffic', 'parking']);

  const fetchData = async () => {
    try {
      const [trafficData, insightData] = await Promise.all([
        api.getTraffic(),
        api.getTrafficInsight() as unknown as Promise<CopilotResponse>
      ]);
      setData(trafficData);
      setInsight(insightData);
      setError(null);
    } catch (err) {
      setError('Failed to fetch traffic data');
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

  const toggleLayer = (layer: string) => {
    setActiveLayers(prev => prev.includes(layer) ? prev.filter(l => l !== layer) : [...prev, layer]);
  };

  const markers = (data.hotspots || []).filter(m => activeLayers.includes(m.type));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="border-b border-slate-700/50 pb-4">
        <h1 className="text-3xl font-bold text-white">Traffic & Parking Intelligence</h1>
        <p className="text-slate-400 mt-1">
          Real-time Vehicular Flow &bull; Peak Hour: {data.peak_hour} &bull; Overall Parking: {data.parking_pct}% Occupied
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard title="Current Vehicles" value={data.current_vehicles} trend={0} />
        <KPICard title="Peak Hour" value={data.peak_hour} trend={0} />
        <KPICard title="Congestion Level" value={data.congestion_level.toUpperCase()} trend={0} status={data.congestion_level === 'high' ? 'warning' : 'good'} />
        <KPICard title="Parking Occupancy" value={`${data.parking_pct}%`} trend={0} />
      </div>

      <div className="glass-card p-6">
        <div className="flex flex-wrap gap-2 mb-4">
          {['traffic', 'parking', 'air_quality', 'waste', 'safety'].map(layer => (
            <button
              key={layer}
              onClick={() => toggleLayer(layer)}
              className={`px-3 py-1 text-sm rounded-full border transition-colors capitalize ${
                activeLayers.includes(layer) 
                  ? 'bg-blue-500/20 border-blue-500 text-blue-400' 
                  : 'bg-slate-800 border-slate-600 text-slate-400 hover:bg-slate-700'
              }`}
            >
              {layer.replace('_', ' ')}
            </button>
          ))}
        </div>
        <div className="h-96 rounded-lg overflow-hidden relative">
           <FacilityMap markers={markers.map(m => ({
             lat: m.lat,
             lng: m.lng,
             type: m.type,
             label: m.location,
             severity: m.severity,
             value: m.location
           }))} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h3 className="text-lg font-medium text-white mb-4">Parking Zones Status</h3>
          <div className="space-y-4">
            {data.parking_zones?.map((zone, idx) => (
               <div key={idx} className="flex flex-col">
                  <div className="flex justify-between text-sm mb-1">
                     <span className="text-slate-300">{zone.name}</span>
                     <span className="text-white">{zone.pct}% ({zone.occupied}/{zone.total})</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                     <div
                       className={`h-2 rounded-full ${zone.pct > 90 ? 'bg-red-500' : zone.pct > 75 ? 'bg-orange-500' : 'bg-emerald-500'}`}
                       style={{ width: `${zone.pct}%` }}
                     />
                  </div>
               </div>
            ))}
          </div>
        </div>
        <div className="glass-card p-6">
          <h3 className="text-lg font-medium text-white mb-4">Traffic Volume History</h3>
          <div className="h-64">
             <AreaChartWidget
               data={(data.history || []).map(h => ({ name: h.timestamp.slice(11, 16), value: h.value }))}
               dataKey="value"
               color="#8b5cf6"
             />
          </div>
        </div>
      </div>

      <div className="glass-card p-6">
        <h3 className="text-lg font-medium text-white mb-4">AI Traffic Insight</h3>
        {insight ? <InsightPanel insight={insight} /> : <LoadingSkeleton />}
      </div>
    </motion.div>
  );
};

export default Traffic;
