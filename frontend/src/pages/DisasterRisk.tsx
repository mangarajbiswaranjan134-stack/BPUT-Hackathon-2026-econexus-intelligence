import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldAlert, Waves, Flame, Activity, Siren, CheckCircle, 
  MapPin, AlertOctagon, PhoneCall, Volume2, VolumeX, ShieldCheck
} from 'lucide-react';
import { api } from '../api/client';
import { DisasterRiskData } from '../types';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import AnimatedCounter from '../components/common/AnimatedCounter';
import { voiceService } from '../utils/voiceService';

export default function DisasterRisk() {
  const [data, setData] = useState<DisasterRiskData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [emergencySirenTest, setEmergencySirenTest] = useState(false);

  useEffect(() => {
    api.getDisasterRisk().then((res) => {
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
      const summary = `Disaster preparedness and climate risk briefing. Overall campus disaster vulnerability is low with composite risk score of ${data.composite_risk_score} out of 100. Flood and waterlogging risk is minimal. Emergency sirens and evacuation routes are ${data.emergency_readiness_pct} percent operational and drilled. Heatwave index category is currently ${data.heatwave_category}.`;
      voiceService.speak(summary, () => setIsSpeaking(true), () => setIsSpeaking(false));
    }
  };

  const handleSirenTest = () => {
    setEmergencySirenTest(true);
    setTimeout(() => setEmergencySirenTest(false), 5000);
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
            <span className="p-2 bg-red-500/10 text-red-400 border border-red-500/30 rounded-xl">
              <ShieldAlert size={22} />
            </span>
            <h1 className="text-3xl font-black text-white tracking-tight flex items-center">
              Disaster Resilience & Emergency Command
            </h1>
          </div>
          <p className="text-slate-400 text-xs sm:text-sm">
            EIA Disaster Risk &bull; Flood Inundation, Heatwave Alerts, Seismic Code & Emergency SOPs
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
                <span>🎙️ Play Disaster Risk AI Briefing</span>
              </>
            )}
          </motion.button>
          
          <span className="px-3 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-semibold flex items-center">
            <ShieldCheck size={14} className="mr-1.5" /> NDMA DISASTER CODE COMPLIANT
          </span>
        </div>
      </div>

      {/* Active Disaster Alert Banner */}
      {data.active_disaster_alerts.map((al) => (
        <motion.div
          key={al.id}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 bg-gradient-to-r from-red-950/60 via-slate-900 to-red-950/40 border border-red-500/50 rounded-2xl flex flex-wrap justify-between items-center gap-3 shadow-[0_0_25px_rgba(239,68,68,0.2)]"
        >
          <div className="flex items-center space-x-3">
            <span className="p-2.5 bg-red-600 text-white rounded-xl animate-pulse">
              <AlertOctagon size={22} />
            </span>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30 uppercase">
                  {al.severity} Alert
                </span>
                <span className="text-sm font-extrabold text-white">{al.title}</span>
              </div>
              <p className="text-xs text-slate-300 mt-1">{al.instruction}</p>
            </div>
          </div>

          <span className="text-xs font-mono text-slate-400">{al.timestamp}</span>
        </motion.div>
      ))}

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="glass-card p-4 border border-red-950/40 hover:border-red-500/40 transition">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[11px] font-bold uppercase text-slate-400">Composite Risk</span>
            <ShieldAlert size={16} className="text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono">
            <AnimatedCounter value={data.composite_risk_score} decimals={1} />/100
          </div>
          <span className="text-[11px] text-emerald-400 mt-1">Low vulnerability</span>
        </div>

        <div className="glass-card p-4 border border-red-950/40 hover:border-red-500/40 transition">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[11px] font-bold uppercase text-slate-400">Flood Inundation</span>
            <Waves size={16} className="text-blue-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono uppercase">
            {data.flood_risk_level}
          </div>
          <span className="text-[11px] text-blue-400 mt-1">Storm drains clear</span>
        </div>

        <div className="glass-card p-4 border border-red-950/40 hover:border-red-500/40 transition">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[11px] font-bold uppercase text-slate-400">Heatwave (WBGT)</span>
            <Flame size={16} className="text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">
            <AnimatedCounter value={data.heatwave_wbgt_c} decimals={1} />°C
          </div>
          <span className="text-[11px] text-amber-400 mt-1">{data.heatwave_category} Index</span>
        </div>

        <div className="glass-card p-4 border border-red-950/40 hover:border-red-500/40 transition">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[11px] font-bold uppercase text-slate-400">Seismic Rating</span>
            <Activity size={16} className="text-emerald-400" />
          </div>
          <div className="text-lg font-black text-emerald-400 font-mono mt-1">
            {data.seismic_resilience_rating}
          </div>
          <span className="text-[11px] text-slate-400 mt-1">BIS 1893:2016 Compliant</span>
        </div>

        <div className="glass-card p-4 border border-red-950/40 hover:border-red-500/40 transition">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[11px] font-bold uppercase text-slate-400">Emergency Sirens</span>
            <Siren size={16} className="text-red-400 animate-pulse" />
          </div>
          <div className="text-2xl font-black text-white font-mono">
            {data.sirens_operational}/{data.total_sirens}
          </div>
          <span className="text-[11px] text-emerald-400 mt-1">100% Operational</span>
        </div>

        <div className="glass-card p-4 border border-red-950/40 hover:border-red-500/40 transition">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[11px] font-bold uppercase text-slate-400">Evacuation Routes</span>
            <CheckCircle size={16} className="text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono">
            <AnimatedCounter value={data.evacuation_routes_clear_pct} decimals={1} />%
          </div>
          <span className="text-[11px] text-slate-400 mt-1">Clear of obstacles</span>
        </div>
      </div>

      {/* Main Grid: Emergency Siren Trigger + Waterlogging Hotspots */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Rapid Siren Trigger & Preparedness Score */}
        <div className="glass-card p-6 border border-red-950/40 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white mb-2 flex items-center">
              <Siren size={18} className="mr-2 text-red-500 animate-pulse" /> Emergency Rapid Action Console
            </h3>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Instant acoustic siren test & campus emergency broadcast deployment to smart display boards and security radio channels.
            </p>

            <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-xs space-y-2 mb-4">
              <div className="flex justify-between">
                <span className="text-slate-400">Evacuation Routes Status:</span>
                <span className="text-emerald-400 font-semibold">100% Unobstructed</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Clinic Trauma Beds:</span>
                <span className="text-white font-mono">82% Available</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Backup Generator Reserve:</span>
                <span className="text-emerald-400 font-mono">72 Hours Diesel</span>
              </div>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSirenTest}
            className={`w-full py-3 px-4 rounded-xl text-xs font-bold transition-all border shadow-lg ${
              emergencySirenTest
                ? 'bg-red-600 text-white border-red-400 shadow-[0_0_20px_rgba(239,68,68,0.7)] animate-pulse'
                : 'bg-gradient-to-r from-red-600 to-rose-600 text-white border-red-500 shadow-red-600/30 hover:from-red-500 hover:to-rose-500'
            }`}
          >
            {emergencySirenTest ? "🚨 Emergency Siren Test Active (Pinging 8 Hubs)..." : "🔊 Test Campus Emergency Sirens (Diagnostic)"}
          </motion.button>
        </div>

        {/* Waterlogging Hotspots & Storm Drainage Capacity */}
        <div className="glass-card p-6 border border-red-950/40 lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center">
                <Waves size={18} className="mr-2 text-blue-400" /> Storm Waterlogging & Inundation Hotspot Sensors
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Ultrasonic water depth probes installed at campus culverts and low-elevation collection basins</p>
            </div>
            <span className="text-xs bg-slate-900 border border-slate-800 text-slate-400 px-3 py-1 rounded-lg">
              IoT Ultrasonic Telemetry
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.waterlogging_hotspots.map((spot) => (
              <div key={spot.id} className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 hover:border-blue-500/40 transition">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-white text-sm">{spot.zone}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase">
                    {spot.risk} risk
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80 text-xs mb-2">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Water Depth</span>
                    <span className="font-mono font-bold text-cyan-400">{spot.water_depth_cm} cm</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Drain Blockage</span>
                    <span className="font-mono font-bold text-emerald-400">{spot.drain_blockage_pct}%</span>
                  </div>
                </div>

                <div className="flex justify-between items-center text-[10px] text-slate-400">
                  <span>Drainage flow rate: <strong>Optimal</strong></span>
                  <span className="font-mono flex items-center text-[10px]">
                    <MapPin size={10} className="mr-0.5 text-red-400" /> {spot.lat.toFixed(4)}, {spot.lng.toFixed(4)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Emergency Preparedness SOPs & Drill Protocols */}
      <div className="glass-card p-6 border border-red-950/40">
        <h3 className="text-base font-bold text-white mb-2 flex items-center">
          <PhoneCall size={18} className="mr-2 text-red-500" /> Institutional Disaster Standard Operating Procedures (SOPs)
        </h3>
        <p className="text-xs text-slate-400 mb-4">Mandatory disaster risk protocols, last drill execution log, and Rapid Action Force dispatch hotlines</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {data.emergency_protocols.map((proto, idx) => (
            <div key={idx} className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 hover:border-red-500/40 transition">
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase">
                  {proto.status}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Drilled: {proto.last_drill}</span>
              </div>

              <h4 className="text-sm font-bold text-white mb-2 line-clamp-1">{proto.protocol}</h4>
              <p className="text-xs text-slate-400 mb-3">{proto.responsible_team}</p>

              <div className="p-2 bg-slate-900 rounded-lg border border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400 flex items-center">
                  <PhoneCall size={12} className="mr-1.5 text-red-400" /> Hotline:
                </span>
                <span className="font-mono font-bold text-white">{proto.contact}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
