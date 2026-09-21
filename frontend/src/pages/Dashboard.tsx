import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { api } from '../api/client';
import { format } from 'date-fns';
import { useAppStore } from '../stores/appStore';
import type { DashboardSummary, Anomaly, Action } from '../types';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import KPICard from '../components/common/KPICard';
import AreaChartWidget from '../components/charts/AreaChartWidget';
import GaugeChart from '../components/charts/GaugeChart';
import FacilityMap from '../components/maps/FacilityMap';
import StatusBadge from '../components/common/StatusBadge';
import {
  AlertTriangle, TrendingUp, Info, Activity,
  ShieldAlert, Brain, ChevronRight, Zap, Droplets, Trash2,
  Wind, BarChart3, Target, Sun
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [actions, setActions] = useState<Action[]>([]);
  const [energyHistory, setEnergyHistory] = useState<Array<{timestamp: string; value: number}>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [domainFilter, setDomainFilter] = useState<string>('all');
  const simulationActive = useAppStore(s => s.simulationActive);

  const fetchData = async () => {
    try {
      const [summary, anomalyList, actionList] = await Promise.all([
        api.getDashboardSummary(),
        api.getAnomalies().catch(() => []),
        api.getActions().catch(() => []),
      ]);
      setData(summary);
      setAnomalies(anomalyList);
      setActions(actionList);

      try {
        const energy = await api.getEnergy();
        setEnergyHistory(energy.history || []);
      } catch { /* ignore */ }

      setError(null);
    } catch (err) {
      setError('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, simulationActive ? 5000 : 15000);
    return () => clearInterval(interval);
  }, [simulationActive]);

  if (loading && !data) return <LoadingSkeleton lines={12} />;

  if (error && !data) return (
    <div className="flex flex-col items-center justify-center h-full text-red-400">
      <AlertTriangle size={48} className="mb-4" />
      <p className="text-lg">{error}</p>
      <button onClick={fetchData} className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
        Retry
      </button>
    </div>
  );

  if (!data) return null;

  const kpiMap = Object.fromEntries(data.kpis.map(k => [k.id, k]));
  const filteredAnomalies = domainFilter === 'all' 
    ? anomalies 
    : anomalies.filter(a => a.metric.toLowerCase() === domainFilter);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-wrap justify-between items-end border-b border-slate-800/80 pb-4 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center">
            Executive Command Center
          </h1>
          <p className="text-slate-400 mt-1 text-sm flex items-center">
            <span className="text-blue-400 font-semibold mr-1">{data.facility?.name || 'Engineering College Campus'}</span> &bull; {data.facility?.location || 'Bhubaneswar'} &bull; {format(new Date(), 'PPpp')}
          </p>
        </div>
        
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center space-x-1 text-xs font-mono bg-yellow-500/10 text-yellow-400 px-3 py-1 rounded-full border border-yellow-500/30">
            <Sun size={13} className="text-yellow-400 animate-spin" style={{ animationDuration: '10s' }} />
            <span>ROOFTOP SOLAR: 42.5 kW</span>
          </div>

          {data.simulation_active && (
            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-semibold animate-pulse">
              🟢 LIVE TELEMETRY
            </span>
          )}
          <span className="px-3 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-full flex items-center text-xs font-semibold">
            <Brain size={13} className="mr-1.5" /> GEMINI AI ACTIVE
          </span>
        </div>
      </div>

      {/* Key Questions Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        <QuestionCard
          title="WHAT IS HAPPENING?"
          icon={<Activity size={16} />}
          answer={`Facility operating with ${data.active_anomalies} active anomalies. Energy load at ${kpiMap['energy']?.value || 0} kW.`}
          color="text-emerald-400"
          glowClass="border-emerald-500/30"
        />
        <QuestionCard
          title="BIGGEST RISK?"
          icon={<ShieldAlert size={16} />}
          answer={anomalies.length > 0 ? `${anomalies[0].metric.toUpperCase()} anomaly: ${anomalies[0].possible_cause}` : 'No critical risks detected.'}
          color="text-red-400"
          glowClass="border-red-500/30"
        />
        <QuestionCard
          title="WHY IS IT HAPPENING?"
          icon={<Info size={16} />}
          answer={anomalies.length > 0 ? anomalies[0].possible_cause : 'All sensor streams within expected baselines.'}
          color="text-blue-400"
          glowClass="border-blue-500/30"
        />
        <QuestionCard
          title="WHAT WILL HAPPEN NEXT?"
          icon={<TrendingUp size={16} />}
          answer={`${data.predicted_risks} risk(s) predicted in next 24h. Energy load trending ${(kpiMap['energy']?.trend || 0) > 0 ? 'upward' : 'stable'}.`}
          color="text-purple-400"
          glowClass="border-purple-500/30"
        />
        <QuestionCard
          title="WHAT SHOULD WE DO?"
          icon={<Target size={16} />}
          answer={actions.length > 0 ? actions[0].what : 'Continue monitoring telemetry. No urgent intervention required.'}
          color="text-amber-400"
          glowClass="border-amber-500/30"
        />
        <QuestionCard
          title="EXPECTED IMPACT?"
          icon={<BarChart3 size={16} />}
          answer={actions.length > 0 ? actions[0].expected_impact : 'Maintaining overall campus operational efficiency.'}
          color="text-cyan-400"
          glowClass="border-cyan-500/30"
        />
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-3">
        <div className="glass-card p-4 flex flex-col items-center justify-center glow-emerald">
          <span className="text-xs text-slate-400 mb-1 font-medium">Sustainability</span>
          <GaugeChart value={data.sustainability_score} max={100} size="sm" />
          <span className="text-lg font-bold text-emerald-400 mt-1 font-mono">{data.sustainability_score.toFixed(1)}</span>
        </div>
        {data.kpis.filter(k => k.id !== 'sustainability').map((kpi) => (
          <KPICard key={kpi.id} kpi={kpi} />
        ))}
      </div>

      {/* Domain Filters & Main Content */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-200">Real-Time Domain Telemetry</h2>
        <div className="flex space-x-1.5 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
          {['all', 'energy', 'water', 'waste', 'air_quality'].map(d => (
            <button
              key={d}
              onClick={() => setDomainFilter(d)}
              className={`px-3 py-1 rounded-md transition font-medium capitalize ${
                domainFilter === d 
                  ? 'bg-blue-600 text-white font-semibold' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {d.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Zap size={18} className="mr-2 text-yellow-400" /> Energy Load & Solar Offset (24h)
          </h3>
          <AreaChartWidget
            data={energyHistory.slice(-24).map(d => ({
              name: d.timestamp.slice(11, 16),
              value: d.value
            }))}
            dataKey="value"
            color="#eab308"
            height={220}
          />
        </div>

        <div className="glass-card p-6 overflow-y-auto max-h-[340px]">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <AlertTriangle size={18} className="mr-2 text-amber-400" /> Active Facility Anomalies
          </h3>
          <div className="space-y-2">
            {filteredAnomalies.slice(0, 6).map((anom) => (
              <div key={anom.id} className="flex justify-between items-center p-3 bg-slate-950/60 rounded-lg border border-slate-800/80">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-200 truncate capitalize">{anom.metric} &bull; {anom.location}</p>
                  <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{anom.possible_cause}</p>
                </div>
                <StatusBadge status={anom.severity} />
              </div>
            ))}
            {filteredAnomalies.length === 0 && (
              <p className="text-slate-500 text-sm py-4 text-center">No active anomalies in selected domain</p>
            )}
          </div>
        </div>

        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Sustainability Composite Breakdown</h3>
          <div className="flex flex-col items-center">
            <GaugeChart value={data.sustainability_score} max={100} size="md" label="Overall Score" />
            <div className="w-full mt-4 space-y-2.5">
              {[
                { label: 'Energy', value: kpiMap['energy']?.value || 0, max: 1000, icon: <Zap size={14} />, color: 'bg-yellow-500' },
                { label: 'Water', value: kpiMap['water']?.value || 0, max: 2000, icon: <Droplets size={14} />, color: 'bg-blue-500' },
                { label: 'Waste Risk', value: kpiMap['waste']?.value || 0, max: 10, icon: <Trash2 size={14} />, color: 'bg-amber-500' },
                { label: 'AQI', value: kpiMap['aqi']?.value || 0, max: 300, icon: <Wind size={14} />, color: 'bg-emerald-500' },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-2 text-xs font-medium">
                  <span className="text-slate-400 w-24 flex items-center gap-1">{item.icon} {item.label}</span>
                  <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full ${item.color} rounded-full transition-all duration-500`}
                         style={{ width: `${Math.min(100, (item.value / item.max) * 100)}%` }} />
                  </div>
                  <span className="text-slate-200 w-12 text-right font-mono font-semibold">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Map + AI Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-4" style={{ height: '420px' }}>
          <h3 className="text-lg font-semibold text-white mb-2 flex items-center px-2">
            Campus GIS Hotspot & Telemetry Map
          </h3>
          <div className="h-[360px] rounded-lg overflow-hidden">
            <FacilityMap
              center={data.facility ? [data.facility.latitude, data.facility.longitude] : undefined}
              markers={anomalies.slice(0, 5).map(a => ({
                lat: data.facility?.latitude + (Math.random() - 0.5) * 0.006 || 20.296,
                lng: data.facility?.longitude + (Math.random() - 0.5) * 0.006 || 85.824,
                type: a.metric,
                label: `${a.metric.toUpperCase()}: ${a.building}`,
                severity: a.severity,
                value: `${a.observed} (expected ${a.expected})`
              }))}
            />
          </div>
        </div>

        <div className="glass-card p-6 overflow-y-auto" style={{ height: '420px' }}>
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Brain size={18} className="mr-2 text-blue-400" /> Gemini AI Executive Summary
          </h3>
          <div className="bg-slate-950/80 rounded-xl p-4 border border-blue-500/30 glow-blue mb-4">
            <p className="text-slate-200 text-sm leading-relaxed">{data.top_insight}</p>
            <div className="mt-3 text-xs text-blue-400 flex items-center font-semibold">
              <Brain size={12} className="mr-1" /> AI Decision-Support Insight
            </div>
          </div>

          <h4 className="text-sm font-semibold text-slate-300 mt-6 mb-3 flex items-center">
            <Target size={14} className="mr-1.5 text-amber-400" /> High-Priority Operational Actions
          </h4>
          <div className="space-y-2">
            {actions.slice(0, 4).map((action) => (
              <div key={action.id} className="flex justify-between items-center bg-slate-950/40 p-3 rounded-lg border border-slate-800/80 hover:border-slate-700 transition-colors cursor-pointer">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-white truncate">{action.what}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{action.where} &bull; <span className="text-emerald-400">{action.expected_impact}</span></p>
                </div>
                <ChevronRight size={14} className="text-slate-500 flex-shrink-0 ml-2" />
              </div>
            ))}
            {actions.length === 0 && (
              <p className="text-slate-500 text-sm py-2">No active actions generated yet.</p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const QuestionCard: React.FC<{
  title: string;
  icon: React.ReactNode;
  answer: string;
  color: string;
  glowClass?: string;
}> = ({ title, icon, answer, color, glowClass }) => (
  <motion.div
    className={`glass-card p-4 flex flex-col justify-between border ${glowClass || 'border-slate-800/80'}`}
    whileHover={{ scale: 1.02, translateY: -2 }}
    transition={{ duration: 0.2 }}
  >
    <div className={`flex items-center gap-1.5 text-[10px] font-bold tracking-wider uppercase mb-2 ${color}`}>
      {icon} <span>{title}</span>
    </div>
    <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">{answer}</p>
  </motion.div>
);

export default Dashboard;
