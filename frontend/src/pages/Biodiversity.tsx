import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TreePine, Trees, Leaf, Sparkles, Activity, ShieldCheck, 
  MapPin, AlertTriangle, ArrowUpRight, Volume2, VolumeX, CheckCircle, Search
} from 'lucide-react';
import { api } from '../api/client';
import { BiodiversityData, TreeData } from '../types';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import AnimatedCounter from '../components/common/AnimatedCounter';
import AreaChartWidget from '../components/charts/AreaChartWidget';
import StatusBadge from '../components/common/StatusBadge';
import { voiceService } from '../utils/voiceService';

export default function Biodiversity() {
  const [data, setData] = useState<BiodiversityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedHealth, setSelectedHealth] = useState<string>('all');
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    api.getBiodiversity().then((res) => {
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
      const summary = `Biodiversity and ecological health briefing. Campus green cover stands at ${data.green_cover_pct} percent with ${data.tree_count} GPS tagged trees sequestering ${data.carbon_sequestered_tons} tons of carbon. Habitat disturbance score is exceptionally low at ${data.habitat_disturbance_score} out of 100. Botanical bio-corridors show positive bird nesting activity.`;
      voiceService.speak(summary, () => setIsSpeaking(true), () => setIsSpeaking(false));
    }
  };

  if (loading || !data) return <LoadingSkeleton lines={10} />;

  const filteredTrees = data.trees.filter((t: TreeData) => {
    const matchesSearch = t.species.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.common_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.tag_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesHealth = selectedHealth === 'all' || t.health === selectedHealth;
    return matchesSearch && matchesHealth;
  });

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
            <span className="p-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-xl">
              <Trees size={22} />
            </span>
            <h1 className="text-3xl font-black text-white tracking-tight flex items-center">
              Biodiversity & Ecological Intelligence
            </h1>
          </div>
          <p className="text-slate-400 text-xs sm:text-sm">
            EIA Compliance Module &bull; Flora-Fauna Census, Habitat Disturbance & Carbon Sequestration
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
                <span>🎙️ Play Ecological AI Briefing</span>
              </>
            )}
          </motion.button>
          
          <span className="px-3 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-semibold flex items-center">
            <ShieldCheck size={14} className="mr-1.5" /> MOEFCC / EIA COMPLIANT
          </span>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="glass-card p-4 border border-red-950/40 relative overflow-hidden group hover:border-red-500/40 transition">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[11px] font-bold uppercase text-slate-400">Green Cover Index</span>
            <Leaf size={16} className="text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">
            <AnimatedCounter value={data.green_cover_pct} decimals={1} />%
          </div>
          <span className="text-[11px] text-emerald-400 mt-1 flex items-center">
            <ArrowUpRight size={13} className="mr-0.5" /> +3.5% vs baseline
          </span>
        </div>

        <div className="glass-card p-4 border border-red-950/40 relative overflow-hidden group hover:border-red-500/40 transition">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[11px] font-bold uppercase text-slate-400">Tree Census Count</span>
            <TreePine size={16} className="text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">
            <AnimatedCounter value={data.tree_count} />
          </div>
          <span className="text-[11px] text-slate-400 mt-1">100% Geo-tagged</span>
        </div>

        <div className="glass-card p-4 border border-red-950/40 relative overflow-hidden group hover:border-red-500/40 transition">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[11px] font-bold uppercase text-slate-400">Carbon Sequestered</span>
            <Sparkles size={16} className="text-yellow-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">
            <AnimatedCounter value={data.carbon_sequestered_tons} decimals={1} /> <span className="text-xs font-sans text-slate-400">Tons</span>
          </div>
          <span className="text-[11px] text-emerald-400 mt-1">Biomass sink</span>
        </div>

        <div className="glass-card p-4 border border-red-950/40 relative overflow-hidden group hover:border-red-500/40 transition">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[11px] font-bold uppercase text-slate-400">Diversity Index</span>
            <Activity size={16} className="text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">
            <AnimatedCounter value={data.species_diversity_index} decimals={2} />
          </div>
          <span className="text-[11px] text-slate-400 mt-1">Shannon-Wiener H'</span>
        </div>

        <div className="glass-card p-4 border border-red-950/40 relative overflow-hidden group hover:border-red-500/40 transition">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[11px] font-bold uppercase text-slate-400">Disturbance Score</span>
            <AlertTriangle size={16} className="text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono">
            <AnimatedCounter value={data.habitat_disturbance_score} decimals={1} />
          </div>
          <span className="text-[11px] text-slate-400 mt-1">Scale 0-100 (Low Risk)</span>
        </div>

        <div className="glass-card p-4 border border-red-950/40 relative overflow-hidden group hover:border-red-500/40 transition">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[11px] font-bold uppercase text-slate-400">Canopy Growth</span>
            <ArrowUpRight size={16} className="text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">
            +<AnimatedCounter value={data.canopy_growth_rate} decimals={1} />%
          </div>
          <span className="text-[11px] text-slate-400 mt-1">Annual expansion</span>
        </div>
      </div>

      {/* Main Grid: Chart + Bio Corridors */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Chart */}
        <div className="glass-card p-6 border border-red-950/40 lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base font-bold text-white flex items-center">
              <Leaf size={18} className="mr-2 text-emerald-400" /> Green Cover % & Habitat Disturbance Index (6-Month Trend)
            </h3>
            <span className="text-xs bg-slate-900 border border-slate-800 text-slate-400 px-3 py-1 rounded-lg">
              Satellite Multispectral (NDVI)
            </span>
          </div>
          <AreaChartWidget
            data={data.history.map(d => ({ name: d.timestamp, value: d.green_cover, disturbance: d.disturbance }))}
            dataKey="value"
            color="#10b981"
            height={240}
          />
        </div>

        {/* Habitat Disturbance Monitoring */}
        <div className="glass-card p-6 border border-red-950/40">
          <h3 className="text-base font-bold text-white mb-4 flex items-center">
            <ShieldCheck size={18} className="mr-2 text-red-500" /> Habitat Disturbance Zones
          </h3>
          <div className="space-y-3">
            {data.zones.map((zone, idx) => (
              <div key={idx} className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80 hover:border-red-500/40 transition">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-sm font-bold text-white">{zone.name}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                    zone.disturbance_level === 'low' 
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}>
                    {zone.disturbance_level} disturbance
                  </span>
                </div>
                <div className="text-xs text-slate-400 mb-2">
                  <span className="text-emerald-400 font-semibold">{zone.green_pct}% Green Cover</span> &bull; {zone.fauna_count} Active Fauna Species
                </div>
                <div className="flex flex-wrap gap-1">
                  {zone.flora_species.map((sp, i) => (
                    <span key={i} className="text-[10px] bg-slate-900 text-slate-300 px-2 py-0.5 rounded border border-slate-800 font-mono">
                      {sp}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* GPS Tree Census Table */}
      <div className="glass-card p-6 border border-red-950/40">
        <div className="flex flex-wrap justify-between items-center mb-5 gap-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center">
              <TreePine size={18} className="mr-2 text-emerald-400" /> Geo-Tagged Tree Census & Carbon Registry
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Every campus tree cataloged with GPS coordinates, species classification and annual sequestration</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search species, tag..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-slate-950/90 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
              />
            </div>

            {/* Health Filter */}
            <select
              value={selectedHealth}
              onChange={(e) => setSelectedHealth(e.target.value)}
              className="bg-slate-950/90 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-red-500"
            >
              <option value="all">All Health Conditions</option>
              <option value="excellent">Excellent</option>
              <option value="good">Good</option>
              <option value="fair">Fair</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="pb-3 font-semibold">Tree Tag ID</th>
                <th className="pb-3 font-semibold">Botanical / Common Name</th>
                <th className="pb-3 font-semibold">Age (Yrs)</th>
                <th className="pb-3 font-semibold">Height</th>
                <th className="pb-3 font-semibold">Carbon Absorb</th>
                <th className="pb-3 font-semibold">Health Status</th>
                <th className="pb-3 font-semibold">GIS Coordinates</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredTrees.map((tree) => (
                <tr key={tree.id} className="hover:bg-slate-900/40 transition">
                  <td className="py-3 font-mono font-bold text-red-400">{tree.tag_id}</td>
                  <td className="py-3">
                    <span className="font-semibold text-white">{tree.common_name}</span>
                    <span className="block text-[11px] text-slate-400 italic">{tree.species}</span>
                  </td>
                  <td className="py-3 text-slate-300">{tree.age_years} yrs</td>
                  <td className="py-3 text-slate-300">{tree.height_m} m</td>
                  <td className="py-3 font-mono text-emerald-400 font-semibold">{tree.carbon_seq_kg} kg/yr</td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      tree.health === 'excellent' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                      tree.health === 'good' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                      'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}>
                      {tree.health}
                    </span>
                  </td>
                  <td className="py-3 font-mono text-slate-400 flex items-center">
                    <MapPin size={12} className="mr-1 text-red-400" /> {tree.lat.toFixed(4)}, {tree.lng.toFixed(4)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
