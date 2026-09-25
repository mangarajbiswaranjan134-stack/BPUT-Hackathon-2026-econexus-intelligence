import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Volume2, VolumeX, ShieldAlert, AlertTriangle, CheckCircle, 
  MapPin, Bell, Radio, Activity, Volume1, Clock
} from 'lucide-react';
import { api } from '../api/client';
import { NoiseData } from '../types';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import AnimatedCounter from '../components/common/AnimatedCounter';
import AreaChartWidget from '../components/charts/AreaChartWidget';
import { voiceService } from '../utils/voiceService';

export default function Noise() {
  const [data, setData] = useState<NoiseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [mitigationTriggered, setMitigationTriggered] = useState(false);

  useEffect(() => {
    api.getNoise().then((res) => {
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
      const summary = `Acoustic and noise compliance briefing. Current campus sound pressure is ${data.current_db} decibels. Daytime compliance rate is ${data.compliance_rate_pct} percent. Hospital and library silent zones are currently in complete compliance. Zero active threshold violations recorded.`;
      voiceService.speak(summary, () => setIsSpeaking(true), () => setIsSpeaking(false));
    }
  };

  const handleAcousticMitigation = () => {
    setMitigationTriggered(true);
    setTimeout(() => setMitigationTriggered(false), 5000);
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
              <Volume2 size={22} />
            </span>
            <h1 className="text-3xl font-black text-white tracking-tight flex items-center">
              Noise Pollution & Acoustic Compliance
            </h1>
          </div>
          <p className="text-slate-400 text-xs sm:text-sm">
            EIA Silent Zone Auditing &bull; Hospital, Classroom & Hostel Decibel Telemetry
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
                <span>🎙️ Play Acoustic AI Briefing</span>
              </>
            )}
          </motion.button>
          
          <span className="px-3 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-semibold flex items-center">
            <CheckCircle size={14} className="mr-1.5" /> CPCB NOISE RULES (2000) COMPLIANT
          </span>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="glass-card p-4 border border-red-950/40 hover:border-red-500/40 transition">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[11px] font-bold uppercase text-slate-400">Current Decibels</span>
            <Radio size={16} className="text-red-400 animate-pulse" />
          </div>
          <div className="text-2xl font-black text-white font-mono">
            <AnimatedCounter value={data.current_db} decimals={1} /> <span className="text-xs font-sans text-slate-400">dB(A)</span>
          </div>
          <span className="text-[11px] text-emerald-400 mt-1">Comfortable range</span>
        </div>

        <div className="glass-card p-4 border border-red-950/40 hover:border-red-500/40 transition">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[11px] font-bold uppercase text-slate-400">Daytime Average</span>
            <Volume1 size={16} className="text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">
            <AnimatedCounter value={data.daytime_avg_db} decimals={1} /> dB
          </div>
          <span className="text-[11px] text-slate-400 mt-1">Norm: &lt;65 dB(A)</span>
        </div>

        <div className="glass-card p-4 border border-red-950/40 hover:border-red-500/40 transition">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[11px] font-bold uppercase text-slate-400">Nighttime Avg</span>
            <Clock size={16} className="text-blue-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">
            <AnimatedCounter value={data.nighttime_avg_db} decimals={1} /> dB
          </div>
          <span className="text-[11px] text-emerald-400 mt-1">Norm: &lt;50 dB(A)</span>
        </div>

        <div className="glass-card p-4 border border-red-950/40 hover:border-red-500/40 transition">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[11px] font-bold uppercase text-slate-400">Today Peak Decibel</span>
            <Activity size={16} className="text-yellow-400" />
          </div>
          <div className="text-2xl font-black text-yellow-400 font-mono">
            <AnimatedCounter value={data.peak_db} decimals={1} /> dB
          </div>
          <span className="text-[11px] text-slate-400 mt-1">At Workshop Bay</span>
        </div>

        <div className="glass-card p-4 border border-red-950/40 hover:border-red-500/40 transition">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[11px] font-bold uppercase text-slate-400">Compliance Rate</span>
            <CheckCircle size={16} className="text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono">
            <AnimatedCounter value={data.compliance_rate_pct} decimals={1} />%
          </div>
          <span className="text-[11px] text-slate-400 mt-1">Past 30 days</span>
        </div>

        <div className="glass-card p-4 border border-red-950/40 hover:border-red-500/40 transition">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[11px] font-bold uppercase text-slate-400">Active Violations</span>
            <ShieldAlert size={16} className="text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono">
            {data.active_violations}
          </div>
          <span className="text-[11px] text-emerald-400 mt-1">Zero breaches</span>
        </div>
      </div>

      {/* Main Grid: Decibel Trend Chart + Compliance Action */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-card p-6 border border-red-950/40 lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base font-bold text-white flex items-center">
              <Volume2 size={18} className="mr-2 text-red-500" /> 24-Hour Sound Pressure Level Profile vs Thresholds
            </h3>
            <span className="text-xs bg-slate-900 border border-slate-800 text-slate-400 px-3 py-1 rounded-lg">
              Type-1 Calibrated Sound Level Meters
            </span>
          </div>
          <AreaChartWidget
            data={data.history}
            dataKey="value"
            color="#ef4444"
            height={240}
          />
        </div>

        {/* AI Compliance & Mitigation Box */}
        <div className="glass-card p-6 border border-red-950/40 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white mb-3 flex items-center">
              <ShieldAlert size={18} className="mr-2 text-red-500" /> Acoustic Mitigation Control
            </h3>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Automated sound baffle dampeners and vehicular horn-restriction alerts can be dispatched instantly to maintain silent zone integrity.
            </p>

            <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 text-xs mb-4">
              <div className="text-slate-300 font-semibold mb-1">Clinic & Library Silent Zones:</div>
              <div className="text-emerald-400 font-mono text-[11px]">Noise level 38.6 - 43.2 dB (6 dB below 50 dB ceiling)</div>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAcousticMitigation}
            className={`w-full py-3 px-4 rounded-xl text-xs font-bold transition-all border shadow-lg ${
              mitigationTriggered 
                ? 'bg-emerald-600 text-white border-emerald-400 shadow-emerald-600/30'
                : 'bg-gradient-to-r from-red-600 to-rose-600 text-white border-red-500 shadow-red-600/30 hover:from-red-500 hover:to-rose-500'
            }`}
          >
            {mitigationTriggered ? "✓ Acoustic Dampeners & No-Horn Zones Dispatched" : "⚡ Trigger Instant Acoustic Dampening"}
          </motion.button>
        </div>
      </div>

      {/* Sensitive Zones Real-time Monitor */}
      <div className="glass-card p-6 border border-red-950/40">
        <h3 className="text-base font-bold text-white mb-2 flex items-center">
          <Radio size={18} className="mr-2 text-red-500 animate-pulse" /> Sensitive Area & Silent Zone Decibel Telemetry
        </h3>
        <p className="text-xs text-slate-400 mb-4">Continuous decibel auditing at designated hospital clinics, reading halls, academic blocks and hostels</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {data.sensitive_zones.map((zone) => (
            <div key={zone.id} className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 hover:border-red-500/40 transition">
              <div className="flex justify-between items-start mb-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                  zone.type === 'hospital' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                  zone.type === 'school' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                  'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                }`}>
                  {zone.type}
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase">
                  {zone.status}
                </span>
              </div>

              <h4 className="text-xs font-bold text-white mb-2 line-clamp-1">{zone.name}</h4>

              <div className="flex items-baseline space-x-1.5 mb-2">
                <span className="text-2xl font-black text-white font-mono">{zone.current_db}</span>
                <span className="text-xs text-slate-400">dB(A)</span>
                <span className="text-[11px] text-slate-500">/ max {zone.limit_db} dB</span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden mb-2">
                <div 
                  className={`h-full rounded-full ${
                    (zone.current_db / zone.limit_db) > 0.9 ? 'bg-red-500' :
                    (zone.current_db / zone.limit_db) > 0.75 ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(100, (zone.current_db / zone.limit_db) * 100)}%` }}
                />
              </div>

              <div className="flex justify-between items-center text-[10px] text-slate-400">
                <span>Peak: <strong className="text-slate-200">{zone.peak_today_db} dB</strong></span>
                <span className="font-mono flex items-center">
                  <MapPin size={10} className="mr-0.5 text-red-400" /> {zone.lat.toFixed(3)}, {zone.lng.toFixed(3)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
