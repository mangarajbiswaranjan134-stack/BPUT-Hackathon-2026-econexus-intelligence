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

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05, delayChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 140, damping: 16 } }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-wrap justify-between items-end border-b border-slate-800/80 pb-4 gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-400 tracking-tight flex items-center">
            <span className="relative flex h-3 w-3 mr-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.8)]"></span>
            </span>
            Executive Command Center
          </h1>
          <p className="text-slate-400 mt-1.5 text-sm flex items-center">
            <span className="text-cyan-400 font-semibold mr-1.5">{data.facility?.name || 'Engineering College Campus'}</span> &bull; {data.facility?.location || 'Bhubaneswar'} &bull; <span className="ml-1 text-slate-500">{format(new Date(), 'PPpp')}</span>
          </p>
        </div>
        
        <div className="flex items-center gap-2.5 flex-wrap">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="flex items-center space-x-1.5 text-xs font-mono bg-yellow-500/10 text-yellow-400 px-3.5 py-1.5 rounded-full border border-yellow-500/30 shadow-[0_0_15px_rgba(234,179,8,0.15)]"
          >
            <Sun size={14} className="text-yellow-400 animate-spin" style={{ animationDuration: '10s' }} />
            <span className="font-semibold">ROOFTOP SOLAR: 42.5 kW</span>
          </motion.div>

          {data.simulation_active && (
            <motion.span 
              animate={{ opacity: [0.8, 1, 0.8] }} 
              transition={{ repeat: Infinity, duration: 2 }}
              className="px-3 py-1.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-semibold flex items-center shadow-[0_0_15px_rgba(16,185,129,0.2)]"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 mr-2 animate-ping" />
              LIVE TELEMETRY
            </motion.span>
          )}
          <motion.span 
            whileHover={{ scale: 1.05 }}
            className="px-3.5 py-1.5 bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-cyan-300 border border-cyan-500/30 rounded-full flex items-center text-xs font-semibold shadow-[0_0_15px_rgba(6,182,212,0.15)]"
          >
            <Brain size={14} className="mr-1.5 text-cyan-400 animate-pulse" /> GEMINI AI ACTIVE
          </motion.span>
        </div>
      </motion.div>

      {/* Key Questions Row */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
        <QuestionCard
          title="WHAT IS HAPPENING?"
          icon={<Activity size={16} />}
          answer={`Facility operating with ${data.active_anomalies} active anomalies. Energy load at ${kpiMap['energy']?.value || 0} kW.`}
          color="text-emerald-400"
          glowClass="border-emerald-500/30 hover:border-emerald-500/60 hover:shadow-emerald-500/10"
        />
        <QuestionCard
          title="BIGGEST RISK?"
          icon={<ShieldAlert size={16} />}
          answer={anomalies.length > 0 ? `${anomalies[0].metric.toUpperCase()} anomaly: ${anomalies[0].possible_cause}` : 'No critical risks detected.'}
          color="text-red-400"
          glowClass="border-red-500/30 hover:border-red-500/60 hover:shadow-red-500/10"
        />
        <QuestionCard
          title="WHY IS IT HAPPENING?"
          icon={<Info size={16} />}
          answer={anomalies.length > 0 ? anomalies[0].possible_cause : 'All sensor streams within expected baselines.'}
          color="text-blue-400"
          glowClass="border-blue-500/30 hover:border-blue-500/60 hover:shadow-blue-500/10"
        />
        <QuestionCard
          title="WHAT WILL HAPPEN NEXT?"
          icon={<TrendingUp size={16} />}
          answer={`${data.predicted_risks} risk(s) predicted in next 24h. Energy load trending ${(kpiMap['energy']?.trend || 0) > 0 ? 'upward' : 'stable'}.`}
          color="text-purple-400"
          glowClass="border-purple-500/30 hover:border-purple-500/60 hover:shadow-purple-500/10"
        />
        <QuestionCard
          title="WHAT SHOULD WE DO?"
          icon={<Target size={16} />}
          answer={actions.length > 0 ? actions[0].what : 'Continue monitoring telemetry. No urgent intervention required.'}
          color="text-amber-400"
          glowClass="border-amber-500/30 hover:border-amber-500/60 hover:shadow-amber-500/10"
        />
        <QuestionCard
          title="EXPECTED IMPACT?"
          icon={<BarChart3 size={16} />}
          answer={actions.length > 0 ? actions[0].expected_impact : 'Maintaining overall campus operational efficiency.'}
          color="text-cyan-400"
          glowClass="border-cyan-500/30 hover:border-cyan-500/60 hover:shadow-cyan-500/10"
        />
      </motion.div>

      {/* KPI Row */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-3.5">
        <motion.div 
          whileHover={{ y: -5, scale: 1.02 }}
          className="glass-card p-4 flex flex-col items-center justify-center glow-emerald border border-emerald-500/40 relative overflow-hidden"
        >
          <div className="absolute inset-0 shimmer-sweep opacity-30 pointer-events-none" />
          <span className="text-xs text-slate-400 mb-1 font-semibold uppercase tracking-wider">Sustainability</span>
          <GaugeChart value={data.sustainability_score} max={100} size="sm" />
          <span className="text-xl font-black text-emerald-400 mt-1 font-mono tracking-tight">{data.sustainability_score.toFixed(1)}</span>
        </motion.div>
        {data.kpis.filter(k => k.id !== 'sustainability').map((kpi) => (
          <KPICard key={kpi.id} kpi={kpi} />
        ))}
      </motion.div>

      {/* Domain Filters & Main Content */}
      <motion.div variants={itemVariants} className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-lg font-bold text-slate-100 flex items-center">
          <span className="w-2 h-2 rounded-full bg-blue-500 mr-2 animate-pulse" />
          Real-Time Domain Telemetry
        </h2>
        <div className="flex space-x-1.5 bg-slate-900/90 p-1.5 rounded-xl border border-slate-800 text-xs backdrop-blur-md">
          {['all', 'energy', 'water', 'waste', 'air_quality'].map(d => {
            const isActive = domainFilter === d;
            return (
              <button
                key={d}
                onClick={() => setDomainFilter(d)}
                className={`relative px-3.5 py-1.5 rounded-lg transition-colors font-semibold capitalize z-10 ${
                  isActive ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeDomainFilterPill"
                    className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow-[0_0_15px_rgba(59,130,246,0.5)] -z-10"
                    transition={{ type: "spring", stiffness: 350, damping: 25 }}
                  />
                )}
                {d.replace('_', ' ')}
              </button>
            );
          })}
        </div>
      </motion.div>


      {/* Charts Row */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-card p-6 border border-slate-800/80 hover:border-yellow-500/30 transition-colors">
          <h3 className="text-base font-bold text-white mb-4 flex items-center">
            <Zap size={18} className="mr-2 text-yellow-400 animate-pulse" /> Energy Load & Solar Offset (24h)
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

        <div className="glass-card p-6 overflow-y-auto max-h-[340px] border border-slate-800/80 hover:border-amber-500/30 transition-colors">
          <h3 className="text-base font-bold text-white mb-4 flex items-center justify-between">
            <span className="flex items-center">
              <AlertTriangle size={18} className="mr-2 text-amber-400" /> Active Facility Anomalies
            </span>
            <span className="text-xs font-mono bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/30">
              {filteredAnomalies.length} LIVE
            </span>
          </h3>
          <div className="space-y-2">
            {filteredAnomalies.slice(0, 6).map((anom) => (
              <motion.div 
                key={anom.id} 
                whileHover={{ x: 4, scale: 1.01 }}
                className="flex justify-between items-center p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 hover:border-amber-500/40 hover:shadow-lg hover:shadow-amber-500/5 transition cursor-pointer"
              >
                <div className="min-w-0 flex-1 mr-2">
                  <p className="text-sm font-semibold text-slate-200 truncate capitalize">{anom.metric} &bull; {anom.location}</p>
                  <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{anom.possible_cause}</p>
                </div>
                <StatusBadge status={anom.severity} />
              </motion.div>
            ))}
            {filteredAnomalies.length === 0 && (
              <p className="text-slate-500 text-sm py-8 text-center">No active anomalies in selected domain</p>
            )}
          </div>
        </div>

        <div className="glass-card p-6 border border-slate-800/80 hover:border-emerald-500/30 transition-colors">
          <h3 className="text-base font-bold text-white mb-4 flex items-center">
            <BarChart3 size={18} className="mr-2 text-emerald-400" /> Sustainability Composite
          </h3>
          <div className="flex flex-col items-center">
            <GaugeChart value={data.sustainability_score} max={100} size="md" label="Overall Score" />
            <div className="w-full mt-4 space-y-2.5">
              {[
                { label: 'Energy', value: kpiMap['energy']?.value || 0, max: 1000, icon: <Zap size={14} />, color: 'bg-yellow-500' },
                { label: 'Water', value: kpiMap['water']?.value || 0, max: 2000, icon: <Droplets size={14} />, color: 'bg-blue-500' },
                { label: 'Waste Risk', value: kpiMap['waste']?.value || 0, max: 10, icon: <Trash2 size={14} />, color: 'bg-amber-500' },
                { label: 'AQI', value: kpiMap['aqi']?.value || 0, max: 300, icon: <Wind size={14} />, color: 'bg-emerald-500' },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-2 text-xs font-medium group">
                  <span className="text-slate-400 w-24 flex items-center gap-1 group-hover:text-slate-200 transition-colors">{item.icon} {item.label}</span>
                  <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, (item.value / item.max) * 100)}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className={`h-full ${item.color} rounded-full`} 
                    />
                  </div>
                  <span className="text-slate-200 w-12 text-right font-mono font-semibold">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Map + AI Row */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-4 border border-slate-800/80 hover:border-cyan-500/30 transition-colors" style={{ height: '420px' }}>
          <h3 className="text-base font-bold text-white mb-2 flex items-center px-2">
            Campus GIS Hotspot & Telemetry Map
          </h3>
          <div className="h-[360px] rounded-xl overflow-hidden border border-slate-800">
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

        <div className="glass-card p-6 overflow-y-auto border border-slate-800/80 hover:border-purple-500/30 transition-colors" style={{ height: '420px' }}>
          <h3 className="text-base font-bold text-white mb-4 flex items-center">
            <Brain size={18} className="mr-2 text-cyan-400 animate-pulse" /> Gemini AI Executive Summary
          </h3>
          <motion.div 
            whileHover={{ scale: 1.01 }}
            className="bg-slate-950/80 rounded-2xl p-4 border border-cyan-500/30 glow-blue mb-4 relative overflow-hidden"
          >
            <div className="absolute inset-0 shimmer-sweep opacity-20 pointer-events-none" />
            <p className="text-slate-200 text-sm leading-relaxed relative z-10">{data.top_insight}</p>
            <div className="mt-3 text-xs text-cyan-400 flex items-center font-semibold relative z-10">
              <Brain size={13} className="mr-1.5" /> AI Decision-Support Insight &bull; Google Gemini 1.5 Flash
            </div>
          </motion.div>

          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mt-6 mb-3 flex items-center">
            <Target size={14} className="mr-1.5 text-amber-400" /> High-Priority Operational Actions
          </h4>
          <div className="space-y-2">
            {actions.slice(0, 4).map((action) => (
              <motion.div 
                key={action.id} 
                whileHover={{ x: 4, scale: 1.01 }}
                className="flex justify-between items-center bg-slate-950/50 p-3 rounded-xl border border-slate-800/80 hover:border-indigo-500/40 hover:shadow-lg hover:shadow-indigo-500/5 transition-all cursor-pointer"
              >
                <div className="min-w-0 flex-1 mr-2">
                  <p className="text-sm font-semibold text-white truncate">{action.what}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{action.where} &bull; <span className="text-emerald-400 font-medium">{action.expected_impact}</span></p>
                </div>
                <ChevronRight size={14} className="text-slate-500 flex-shrink-0" />
              </motion.div>
            ))}
            {actions.length === 0 && (
              <p className="text-slate-500 text-sm py-4 text-center">No active actions generated yet.</p>
            )}
          </div>
        </div>
      </motion.div>
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
    className={`glass-card p-4 flex flex-col justify-between border ${glowClass || 'border-slate-800/80'} group relative overflow-hidden cursor-pointer`}
    whileHover={{ scale: 1.03, y: -4, transition: { duration: 0.2 } }}
    transition={{ duration: 0.2 }}
  >
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
    <div className={`flex items-center gap-1.5 text-[10px] font-bold tracking-wider uppercase mb-2 ${color}`}>
      <span className="p-1 rounded-md bg-slate-800/60 group-hover:scale-110 transition-transform">{icon}</span>
      <span>{title}</span>
    </div>
    <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed group-hover:text-white transition-colors">{answer}</p>
  </motion.div>
);

export default Dashboard;

