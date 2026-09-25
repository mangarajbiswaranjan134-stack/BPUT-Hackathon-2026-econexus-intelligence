import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Sprout, Mountain, Droplet, ShieldCheck, AlertCircle, 
  MapPin, CheckCircle2, TrendingUp, Compass, Volume2, VolumeX, Layers
} from 'lucide-react';
import { api } from '../api/client';
import { SoilLandData } from '../types';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import AnimatedCounter from '../components/common/AnimatedCounter';
import AreaChartWidget from '../components/charts/AreaChartWidget';
import BarChartWidget from '../components/charts/BarChartWidget';
import { voiceService } from '../utils/voiceService';

export default function SoilLand() {
  const [data, setData] = useState<SoilLandData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    api.getSoilLand().then((res) => {
      setData(res);
      setLoading(false);
    });
  }, []);

  const handleVoiceBriefing = () => {
    if (!data) return;
    if (isSpeaking) {
      voiceService.stopSpeaking();
      setIsSpeaking(false);
    } else {
      const summary = `Land use and soil health intelligence briefing. Campus soil health index is high at ${data.soil_health_index} out of 100 with optimal neutral pH of ${data.avg_ph}. Heavy metal contamination risk is minimal across all monitoring quadrants. Permeable surface area stands at ${data.permeable_surface_pct} percent, ensuring rainwater aquifer recharge.`;
      voiceService.speak(summary, () => setIsSpeaking(true), () => setIsSpeaking(false));
    }
  };

  if (loading || !data) return <LoadingSkeleton lines={10} />;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-wrap justify-between items-end border-b border-red-950/40 pb-4 gap-4">
        <div>
          <div className="flex items-center space-x-2.5 mb-1">
            <span className="p-2 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-xl">
              <Mountain size={22} />
            </span>
            <h1 className="text-3xl font-black text-white tracking-tight flex items-center">
              Land Use & Soil Health Intelligence
            </h1>
          </div>
          <p className="text-slate-400 text-xs sm:text-sm">
            EIA Soil Contamination Sensors, Heavy Metal Profiling & Land Degradation Mapping
          </p>
        </div>

        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleVoiceBriefing}
            className={`px-4 py-2 rounded-full flex items-center text-xs font-bold border transition-all ${
              isSpeaking
                ? 'bg-red-500/25 text-white border-red-400 shadow-[0_0_20px_rgba(239,68,68,0.5)] animate-pulse'
                : 'bg-gradient-to-r from-red-600/20 via-rose-600/20 to-red-500/20 text-white border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.25)] hover:border-red-400 hover:bg-red-600/30'
            }`}
          >
            {isSpeaking ? (
              <>
                <VolumeX size={15} className="mr-2 text-red-300" />
                <span>Stop Voice Briefing</span>
              </>
            ) : (
              <>
                <Volume2 size={15} className="mr-2 text-red-400 animate-bounce" />
                <span>🎙️ Play Soil & Land AI Briefing</span>
              </>
            )}
          </motion.button>
          
          <span className="px-3 py-1.5 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-full text-xs font-semibold flex items-center">
            <ShieldCheck size={14} className="mr-1.5" /> CPCB SOIL QUALITY COMPLIANT
          </span>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="glass-card p-4 border border-red-950/40 hover:border-red-500/40 transition">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[11px] font-bold uppercase text-slate-400">Soil Health Score</span>
            <Sprout size={16} className="text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">
            <AnimatedCounter value={data.soil_health_index} decimals={1} />/100
          </div>
          <span className="text-[11px] text-emerald-400 mt-1">Prime Fertility</span>
        </div>

        <div className="glass-card p-4 border border-red-950/40 hover:border-red-500/40 transition">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[11px] font-bold uppercase text-slate-400">Average pH Level</span>
            <Compass size={16} className="text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">
            <AnimatedCounter value={data.avg_ph} decimals={1} />
          </div>
          <span className="text-[11px] text-emerald-400 mt-1">Neutral (Optimal 6.5-7.5)</span>
        </div>

        <div className="glass-card p-4 border border-red-950/40 hover:border-red-500/40 transition">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[11px] font-bold uppercase text-slate-400">Heavy Metal Risk</span>
            <AlertCircle size={16} className="text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono uppercase">
            {data.heavy_metal_risk}
          </div>
          <span className="text-[11px] text-slate-400 mt-1">Lead & Cadmium Safe</span>
        </div>

        <div className="glass-card p-4 border border-red-950/40 hover:border-red-500/40 transition">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[11px] font-bold uppercase text-slate-400">Soil Moisture</span>
            <Droplet size={16} className="text-blue-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">
            <AnimatedCounter value={data.moisture_pct} decimals={1} />%
          </div>
          <span className="text-[11px] text-blue-400 mt-1">Adequate hydration</span>
        </div>

        <div className="glass-card p-4 border border-red-950/40 hover:border-red-500/40 transition">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[11px] font-bold uppercase text-slate-400">Permeable Surface</span>
            <Layers size={16} className="text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">
            <AnimatedCounter value={data.permeable_surface_pct} decimals={1} />%
          </div>
          <span className="text-[11px] text-emerald-400 mt-1">Rainwater recharge</span>
        </div>

        <div className="glass-card p-4 border border-red-950/40 hover:border-red-500/40 transition">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[11px] font-bold uppercase text-slate-400">NPK Rating</span>
            <CheckCircle2 size={16} className="text-emerald-400" />
          </div>
          <div className="text-lg font-black text-emerald-400 font-mono mt-1">
            {data.npk_rating}
          </div>
          <span className="text-[11px] text-slate-400 mt-1">Nitrogen-Phos-Potassium</span>
        </div>
      </div>

      {/* Main Grid: Soil Trend Chart & Land Use Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-card p-6 border border-red-950/40 lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base font-bold text-white flex items-center">
              <TrendingUp size={18} className="mr-2 text-amber-400" /> Soil Quality Index & Moisture Trends (Monthly)
            </h3>
            <span className="text-xs bg-slate-900 border border-slate-800 text-slate-400 px-3 py-1 rounded-lg">
              IoT Soil Probe Telemetry
            </span>
          </div>
          <AreaChartWidget
            data={data.history.map(d => ({ name: d.timestamp, value: d.health, moisture: d.moisture }))}
            dataKey="value"
            color="#f59e0b"
            height={240}
          />
        </div>

        {/* Land Use Classification */}
        <div className="glass-card p-6 border border-red-950/40 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white mb-4 flex items-center">
              <Layers size={18} className="mr-2 text-emerald-400" /> Land Use Distribution
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-300">Green & Natural Canopy</span>
                  <span className="text-emerald-400 font-mono">{data.green_zone_pct}%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${data.green_zone_pct}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-300">Built-Up / Constructed Footprint</span>
                  <span className="text-red-400 font-mono">{data.construction_area_pct}%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden">
                  <div className="h-full bg-red-500 rounded-full" style={{ width: `${data.construction_area_pct}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-300">Permeable Pavers & Buffer Lands</span>
                  <span className="text-cyan-400 font-mono">{(100 - data.green_zone_pct - data.construction_area_pct).toFixed(1)}%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${100 - data.green_zone_pct - data.construction_area_pct}%` }} />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-xs text-slate-300">
            <span className="text-amber-400 font-bold">EIA Land Compliance:</span> Net green canopy ratio exceeds MoEFCC norms for institutional campuses (&gt;33%).
          </div>
        </div>
      </div>

      {/* Soil Sampling Points & Heavy Metal Test Results */}
      <div className="glass-card p-6 border border-red-950/40">
        <h3 className="text-base font-bold text-white mb-2 flex items-center">
          <Sprout size={18} className="mr-2 text-amber-400" /> Active Soil Sampling Sensors & Chemical Profile
        </h3>
        <p className="text-xs text-slate-400 mb-4">Real-time geochemical telemetry testing for heavy metal leaching, pH variations, and organic carbon</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {data.sampling_points.map((sp) => (
            <div key={sp.id} className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 hover:border-amber-500/40 transition">
              <div className="flex justify-between items-start mb-2">
                <span className="font-mono text-xs text-red-400 font-bold">{sp.id}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                  sp.status === 'healthy' 
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}>
                  {sp.status}
                </span>
              </div>
              <h4 className="text-sm font-semibold text-white mb-2 line-clamp-1">{sp.location}</h4>
              
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 mb-3 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
                <div>
                  <span className="text-slate-500 block text-[10px]">pH Level</span>
                  <span className="font-mono font-bold text-white">{sp.ph}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Lead (Pb)</span>
                  <span className="font-mono font-bold text-white">{sp.lead_ppm} ppm</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Cadmium (Cd)</span>
                  <span className="font-mono font-bold text-white">{sp.cadmium_ppm} ppm</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Moisture</span>
                  <span className="font-mono font-bold text-cyan-400">{sp.moisture}%</span>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 flex items-center justify-between">
                <span>Nitrogen: <strong className="text-emerald-400">{sp.nitrogen_level}</strong></span>
                <span className="font-mono flex items-center text-[10px]">
                  <MapPin size={11} className="mr-0.5 text-red-400" /> {sp.lat.toFixed(4)}, {sp.lng.toFixed(4)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
