import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, HeartPulse, MessageSquarePlus, Smile, Meh, Frown, 
  Landmark, ShieldCheck, CheckCircle2, AlertCircle, Clock, Volume2, VolumeX, Send
} from 'lucide-react';
import { api } from '../api/client';
import { CommunitySocialData, GrievanceTicket } from '../types';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import AnimatedCounter from '../components/common/AnimatedCounter';
import AreaChartWidget from '../components/charts/AreaChartWidget';
import { voiceService } from '../utils/voiceService';

export default function Community() {
  const [data, setData] = useState<CommunitySocialData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // New Grievance Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'Air Quality' | 'Noise' | 'Water' | 'Waste' | 'Safety' | 'General'>('Noise');
  const [location, setLocation] = useState('');
  const [submittedBy, setSubmittedBy] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successNotice, setSuccessNotice] = useState(false);

  useEffect(() => {
    api.getCommunitySocial().then((res) => {
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
      const summary = `Community and social impact intelligence briefing. Community satisfaction index is high at ${data.community_satisfaction_index} percent with ${data.sentiment_positive_pct} percent positive sentiment. Drinking water safety stands at ${data.health_indicators.drinking_water_safety_pct} percent. Heritage sites and buffer conservation zones are one hundred percent protected. Average grievance resolution turnaround is ${data.avg_resolution_hours} hours.`;
      voiceService.speak(summary, () => setIsSpeaking(true), () => setIsSpeaking(false));
    }
  };

  const handleGrievanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    const newTicket = await api.submitGrievance({
      title,
      category,
      location: location || 'Campus Main Grounds',
      submitted_by: submittedBy || 'Campus Resident',
      sentiment: 'neutral',
      ai_priority: 'medium'
    });

    if (data) {
      setData({
        ...data,
        open_grievances: data.open_grievances + 1,
        grievances: [newTicket, ...data.grievances]
      });
    }

    setTitle('');
    setLocation('');
    setSubmittedBy('');
    setIsSubmitting(false);
    setSuccessNotice(true);
    setTimeout(() => setSuccessNotice(false), 4000);
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
              <Users size={22} />
            </span>
            <h1 className="text-3xl font-black text-white tracking-tight flex items-center">
              Social & Community Impact Intelligence
            </h1>
          </div>
          <p className="text-slate-400 text-xs sm:text-sm">
            EIA Social Dimension &bull; Sentiment AI, Public Health Indicators & Grievance Redressal
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
                <span>🎙️ Play Community AI Briefing</span>
              </>
            )}
          </motion.button>
          
          <span className="px-3 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-semibold flex items-center">
            <ShieldCheck size={14} className="mr-1.5" /> GRI 413 COMMUNITY ENGAGEMENT COMPLIANT
          </span>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="glass-card p-4 border border-red-950/40 hover:border-red-500/40 transition">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[11px] font-bold uppercase text-slate-400">Satisfaction Index</span>
            <Smile size={16} className="text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">
            <AnimatedCounter value={data.community_satisfaction_index} decimals={1} />%
          </div>
          <span className="text-[11px] text-emerald-400 mt-1">High Approval</span>
        </div>

        <div className="glass-card p-4 border border-red-950/40 hover:border-red-500/40 transition">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[11px] font-bold uppercase text-slate-400">Positive Sentiment</span>
            <Smile size={16} className="text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono">
            <AnimatedCounter value={data.sentiment_positive_pct} decimals={1} />%
          </div>
          <span className="text-[11px] text-slate-400 mt-1">AI NLP Survey</span>
        </div>

        <div className="glass-card p-4 border border-red-950/40 hover:border-red-500/40 transition">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[11px] font-bold uppercase text-slate-400">Drinking Water Safety</span>
            <HeartPulse size={16} className="text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-cyan-400 font-mono">
            <AnimatedCounter value={data.health_indicators.drinking_water_safety_pct} decimals={1} />%
          </div>
          <span className="text-[11px] text-slate-400 mt-1">TDS & Bio-safety safe</span>
        </div>

        <div className="glass-card p-4 border border-red-950/40 hover:border-red-500/40 transition">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[11px] font-bold uppercase text-slate-400">Walkability Score</span>
            <Users size={16} className="text-blue-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">
            <AnimatedCounter value={data.health_indicators.campus_walkability_score} decimals={1} />/100
          </div>
          <span className="text-[11px] text-emerald-400 mt-1">Pedestrian friendly</span>
        </div>

        <div className="glass-card p-4 border border-red-950/40 hover:border-red-500/40 transition">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[11px] font-bold uppercase text-slate-400">Open Grievances</span>
            <AlertCircle size={16} className="text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400 font-mono">
            {data.open_grievances}
          </div>
          <span className="text-[11px] text-slate-400 mt-1">Active redressal</span>
        </div>

        <div className="glass-card p-4 border border-red-950/40 hover:border-red-500/40 transition">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[11px] font-bold uppercase text-slate-400">Resolution SLA</span>
            <Clock size={16} className="text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono">
            {data.avg_resolution_hours} hrs
          </div>
          <span className="text-[11px] text-slate-400 mt-1">Avg turnaround</span>
        </div>
      </div>

      {/* Main Grid: Sentiment Trend + Cultural Heritage Protection */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-card p-6 border border-red-950/40 lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base font-bold text-white flex items-center">
              <Smile size={18} className="mr-2 text-emerald-400" /> Community Sentiment Index (5-Month Longitudinal AI Tracking)
            </h3>
            <span className="text-xs bg-slate-900 border border-slate-800 text-slate-400 px-3 py-1 rounded-lg">
              NLP Analysis on Feedback & Grievances
            </span>
          </div>
          <AreaChartWidget
            data={data.sentiment_history.map(d => ({ name: d.timestamp, value: d.positive }))}
            dataKey="value"
            color="#10b981"
            height={240}
          />
        </div>

        {/* Cultural Heritage Protection Status */}
        <div className="glass-card p-6 border border-red-950/40 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white mb-3 flex items-center">
              <Landmark size={18} className="mr-2 text-amber-400" /> Cultural Heritage & Sites
            </h3>
            <p className="text-xs text-slate-400 mb-3 leading-relaxed">
              Protected ecological and historic monuments within facility premises monitored for structural integrity & buffer clearances.
            </p>

            <div className="space-y-3">
              {data.heritage_and_cultural.map((site, i) => (
                <div key={i} className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 text-xs">
                  <div className="font-bold text-white mb-1 flex justify-between items-center">
                    <span>{site.name}</span>
                    <span className="text-emerald-400 font-mono font-bold">{site.integrity_pct}%</span>
                  </div>
                  <div className="text-slate-400 text-[11px] flex justify-between items-center">
                    <span>{site.type} &bull; <strong className="text-amber-400">{site.conservation_status}</strong></span>
                    <span className="text-emerald-400 text-[10px]">Buffer Cleared</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-[11px] text-slate-300">
            <span className="text-emerald-400 font-bold">100% Heritage Integrity:</span> Zero encroachment or acoustic disturbance on historic grounds.
          </div>
        </div>
      </div>

      {/* Community Grievance Redressal Integration */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ticket Submission Form */}
        <div className="glass-card p-6 border border-red-950/40">
          <h3 className="text-base font-bold text-white mb-2 flex items-center">
            <MessageSquarePlus size={18} className="mr-2 text-red-500" /> Lodge Community Grievance
          </h3>
          <p className="text-xs text-slate-400 mb-4">Real-time redressal portal connected to facility maintenance dispatch & AI sentiment scoring</p>

          {successNotice && (
            <div className="p-3 mb-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-center">
              <CheckCircle2 size={16} className="mr-2 text-emerald-400" />
              Grievance registered! AI automated dispatch generated.
            </div>
          )}

          <form onSubmit={handleGrievanceSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Issue Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full bg-slate-950/90 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
              >
                <option value="Noise">Noise & Acoustic Disturbance</option>
                <option value="Air Quality">Air Quality & Dust</option>
                <option value="Water">Water Leakage / Shortage</option>
                <option value="Waste">Waste Overflow / Littering</option>
                <option value="Safety">Safety & Lighting</option>
                <option value="General">General Campus Living</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Issue Description</label>
              <textarea
                required
                rows={3}
                placeholder="E.g. Generator noise audible near block B during evening hours..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-950/90 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-red-500 placeholder-slate-500 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Specific Location</label>
                <input
                  type="text"
                  placeholder="e.g. Block A Quadrangle"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-slate-950/90 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500 placeholder-slate-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Your Name / Role</label>
                <input
                  type="text"
                  placeholder="e.g. Hostel Warden / Student"
                  value={submittedBy}
                  onChange={(e) => setSubmittedBy(e.target.value)}
                  className="w-full bg-slate-950/90 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500 placeholder-slate-500"
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isSubmitting || !title.trim()}
              className="w-full py-2.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white rounded-xl text-xs font-bold transition-all shadow-[0_0_15px_rgba(239,68,68,0.3)] flex items-center justify-center disabled:opacity-50"
            >
              <Send size={14} className="mr-1.5" /> Submit Grievance for AI Dispatch
            </motion.button>
          </form>
        </div>

        {/* Active Grievances List */}
        <div className="glass-card p-6 border border-red-950/40 lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center">
                <Users size={18} className="mr-2 text-red-500" /> Active Grievances & AI Resolution Engine
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Tickets analyzed by NLP sentiment models and auto-routed to facility operators</p>
            </div>
            <span className="text-xs bg-slate-900 border border-slate-800 text-slate-400 px-3 py-1 rounded-lg">
              {data.grievances.length} Registered Cases
            </span>
          </div>

          <div className="space-y-3">
            {data.grievances.map((grv) => (
              <div key={grv.id} className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 hover:border-red-500/40 transition">
                <div className="flex flex-wrap justify-between items-center gap-2 mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-red-400">{grv.id}</span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300">{grv.category}</span>
                    <span className="text-xs text-slate-400">&bull; {grv.location}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      grv.sentiment === 'positive' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                      grv.sentiment === 'neutral' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                      'bg-red-500/20 text-red-300 border border-red-500/30'
                    }`}>
                      {grv.sentiment} sentiment
                    </span>

                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      grv.status === 'resolved' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                      grv.status === 'in_progress' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                      'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}>
                      {grv.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                <p className="text-sm font-semibold text-white mb-2">{grv.title}</p>

                <div className="p-2.5 bg-slate-900/80 rounded-lg border border-slate-800 text-xs text-slate-300">
                  <span className="text-emerald-400 font-bold">🤖 AI Corrective Dispatch:</span> {grv.ai_solution_summary}
                </div>

                <div className="mt-2 flex justify-between items-center text-[10px] text-slate-500">
                  <span>Reported by: <strong className="text-slate-400">{grv.submitted_by}</strong></span>
                  <span>{grv.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
