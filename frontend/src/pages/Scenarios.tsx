import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { api } from '../api/client';
import { ScenarioInput, ScenarioResult } from '../types';
import AnimatedCounter from '../components/common/AnimatedCounter';
import { 
  AlertTriangle, Activity, ArrowRight, TrendingDown, TrendingUp, 
  Minus, Sun, Car, Wind, Trees, Sparkles, RefreshCw, Zap
} from 'lucide-react';

export default function Scenarios() {
  const [inputs, setInputs] = useState<ScenarioInput>({
    hvac_change: 0,
    water_change: 0,
    waste_collection_change: 0,
    traffic_change: 0,
    operating_hours_change: 0,
    occupancy_change: 0
  });

  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [result, setResult] = useState<ScenarioResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInputs(prev => ({ ...prev, [name]: parseInt(value) }));
    setActivePreset(null);
  };

  const resetInputs = () => {
    setInputs({
      hvac_change: 0,
      water_change: 0,
      waste_collection_change: 0,
      traffic_change: 0,
      operating_hours_change: 0,
      occupancy_change: 0
    });
    setActivePreset(null);
    setResult(null);
  };

  const runSimulationWithValues = async (customInputs: ScenarioInput, label?: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.simulateScenario(customInputs);
      if (label) res.label = label;
      setResult(res);
    } catch {
      setError('Simulation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSimulate = () => {
    runSimulationWithValues(inputs, 'Custom Digital Twin Run');
  };

  // Preset What-If Scenarios requested by user
  const applyPreset = (presetKey: string) => {
    setActivePreset(presetKey);
    let newInputs: ScenarioInput = { ...inputs };
    let label = '';

    if (presetKey === 'solar_expansion') {
      newInputs = { hvac_change: -8, water_change: 0, waste_collection_change: 0, traffic_change: 0, operating_hours_change: 0, occupancy_change: 0 };
      label = "Scenario: +20% Rooftop Solar PV Expansion";
    } else if (presetKey === 'traffic_reroute') {
      newInputs = { hvac_change: 0, water_change: 0, waste_collection_change: 15, traffic_change: -28, operating_hours_change: 0, occupancy_change: 0 };
      label = "Scenario: Main Gate Traffic Rerouting & Peak Decoupling";
    } else if (presetKey === 'precooling') {
      newInputs = { hvac_change: -22, water_change: 0, waste_collection_change: 0, traffic_change: 0, operating_hours_change: 0, occupancy_change: 0 };
      label = "Scenario: Building Pre-Cooling Before Grid Peak (11:00 AM)";
    } else if (presetKey === 'afforestation') {
      newInputs = { hvac_change: -12, water_change: -8, waste_collection_change: 20, traffic_change: -15, operating_hours_change: 0, occupancy_change: 0 };
      label = "Scenario: +25% Green Canopy & Afforestation Belt";
    }

    setInputs(newInputs);
    runSimulationWithValues(newInputs, label);
  };

  const getDirectionIcon = (change: number) => {
     if (change < 0) return <TrendingDown size={15} className="text-emerald-400 ml-1" />;
     if (change > 0) return <TrendingUp size={15} className="text-red-400 ml-1" />;
     return <Minus size={15} className="text-slate-400 ml-1" />;
  };

  const getDirectionColor = (change: number, invert = false) => {
     if (change === 0) return 'text-slate-400';
     const isGood = invert ? change > 0 : change < 0;
     return isGood ? 'text-emerald-400' : 'text-red-400';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="border-b border-red-950/40 pb-4">
        <h1 className="text-3xl font-black text-white flex items-center">
          <Activity className="mr-3 text-red-500 animate-pulse" size={32} /> Scenario Simulator (Digital Twin Lab)
        </h1>
        <p className="text-slate-400 mt-1 text-xs sm:text-sm">
          Model "What-If" operational decisions before real-world execution. Answers EIA compliance and impact projections in seconds.
        </p>
      </div>

      {/* Quick What-If Buttons (Judges Showcase) */}
      <div className="glass-card p-4 border border-red-950/40">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center">
          <Sparkles size={14} className="mr-1.5 text-yellow-400" /> One-Click "What-If" Executive Inquiries:
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => applyPreset('solar_expansion')}
            className={`p-3 rounded-xl border text-left transition-all ${
              activePreset === 'solar_expansion'
                ? 'bg-red-500/20 text-white border-red-400 shadow-[0_0_15px_rgba(239,68,68,0.4)]'
                : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:border-red-500/40 hover:text-white'
            }`}
          >
            <div className="flex items-center text-xs font-bold text-yellow-400 mb-1">
              <Sun size={15} className="mr-1.5" /> +20% Solar Panels
            </div>
            <div className="text-[11px] text-slate-400">Agar solar panels 20% badhayein toh CO₂ savings kitna hoga?</div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => applyPreset('traffic_reroute')}
            className={`p-3 rounded-xl border text-left transition-all ${
              activePreset === 'traffic_reroute'
                ? 'bg-red-500/20 text-white border-red-400 shadow-[0_0_15px_rgba(239,68,68,0.4)]'
                : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:border-red-500/40 hover:text-white'
            }`}
          >
            <div className="flex items-center text-xs font-bold text-cyan-400 mb-1">
              <Car size={15} className="mr-1.5" /> Traffic Rerouting
            </div>
            <div className="text-[11px] text-slate-400">Agar traffic reroute karenge toh AQI kitna improve hoga?</div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => applyPreset('precooling')}
            className={`p-3 rounded-xl border text-left transition-all ${
              activePreset === 'precooling'
                ? 'bg-red-500/20 text-white border-red-400 shadow-[0_0_15px_rgba(239,68,68,0.4)]'
                : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:border-red-500/40 hover:text-white'
            }`}
          >
            <div className="flex items-center text-xs font-bold text-blue-400 mb-1">
              <Zap size={15} className="mr-1.5" /> Pre-Cooling HVAC
            </div>
            <div className="text-[11px] text-slate-400">Pre-cool building before peak hours to avoid grid tariff spikes</div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => applyPreset('afforestation')}
            className={`p-3 rounded-xl border text-left transition-all ${
              activePreset === 'afforestation'
                ? 'bg-red-500/20 text-white border-red-400 shadow-[0_0_15px_rgba(239,68,68,0.4)]'
                : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:border-red-500/40 hover:text-white'
            }`}
          >
            <div className="flex items-center text-xs font-bold text-emerald-400 mb-1">
              <Trees size={15} className="mr-1.5" /> +25% Green Canopy
            </div>
            <div className="text-[11px] text-slate-400">Expand tree buffer belt for microclimate cooling & carbon capture</div>
          </motion.button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN - INPUT SLIDERS */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-card p-6 border border-red-950/40">
            <h2 className="text-base font-bold text-white mb-5 flex items-center">
              Fine-Tune Digital Twin Parameters
            </h2>
            
            <div className="space-y-5">
              {[
                { label: 'HVAC & Thermal Setpoint Modulation', name: 'hvac_change', min: -50, max: 50 },
                { label: 'Water Conservation Flow Reduction', name: 'water_change', min: -50, max: 50 },
                { label: 'Waste Collection & Segregation Freq.', name: 'waste_collection_change', min: -50, max: 50 },
                { label: 'Vehicular Traffic Rerouting Volume', name: 'traffic_change', min: -50, max: 50 },
                { label: 'Operating Hours Flexibility', name: 'operating_hours_change', min: -50, max: 50 },
                { label: 'Facility Dynamic Occupancy Shift', name: 'occupancy_change', min: -50, max: 50 },
              ].map((slider) => (
                <div key={slider.name}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-slate-300 font-medium">{slider.label}</span>
                    <span className="text-red-400 font-bold font-mono">{(inputs as any)[slider.name] > 0 ? '+' : ''}{(inputs as any)[slider.name]}%</span>
                  </div>
                  <input
                    type="range"
                    name={slider.name}
                    min={slider.min}
                    max={slider.max}
                    value={(inputs as any)[slider.name]}
                    onChange={handleSliderChange}
                    className="w-full accent-red-500 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
                    <span>{slider.min}%</span>
                    <span>0%</span>
                    <span>+{slider.max}%</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex space-x-2">
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSimulate}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold py-3 rounded-xl shadow-[0_0_15px_rgba(239,68,68,0.3)] transition-all flex items-center justify-center disabled:opacity-50 text-xs"
              >
                {loading ? <span className="animate-pulse">Computing ML Model...</span> : <><Activity size={16} className="mr-2"/> Run Custom Simulation</>}
              </motion.button>
              <button 
                onClick={resetInputs}
                className="px-4 py-3 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors border border-slate-700 text-xs font-semibold"
                title="Reset to baseline"
              >
                <RefreshCw size={14} />
              </button>
            </div>
            
            <div className="mt-4 flex items-start text-[11px] text-slate-400 bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
               <AlertTriangle size={14} className="text-amber-400 mr-2 flex-shrink-0 mt-0.5" />
               <p>SCENARIO ESTIMATE: Projections modeled using multivariate regression & EIA carbon offset algorithms.</p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN - RESULTS */}
        <div className="lg:col-span-8">
           {loading ? (
              <div className="glass-card p-12 h-full flex flex-col items-center justify-center border border-red-950/40">
                 <div className="w-14 h-14 border-4 border-red-500/20 border-t-red-500 rounded-full animate-spin mb-4"></div>
                 <p className="text-slate-300 font-semibold animate-pulse text-base">Digital Twin running environmental physics models...</p>
                 <span className="text-xs text-slate-500 mt-1">Recalculating energy demand curves, emissions & sustainability composite</span>
              </div>
           ) : error ? (
              <div className="glass-card p-12 h-full flex flex-col items-center justify-center text-red-400 border border-red-950/40">
                 <AlertTriangle size={48} className="mb-4" />
                 <p>{error}</p>
              </div>
           ) : result ? (
              <div className="glass-card p-6 h-full flex flex-col border border-red-950/40">
                 <div className="flex justify-between items-center mb-6 pb-3 border-b border-slate-800">
                    <h2 className="text-lg font-bold text-white flex items-center">
                       <Activity className="mr-2 text-red-400" /> Modeled Impact Assessment
                    </h2>
                    <span className="px-3 py-1 bg-red-500/20 text-red-300 text-xs font-bold rounded-full border border-red-500/40">
                       {result.label || 'SCENARIO ESTIMATE'}
                    </span>
                 </div>

                 <div className="grid grid-cols-2 md:grid-cols-3 gap-3.5 mb-6">
                    {[
                       { label: 'Demand Peak (kW)', current: result.current.energy, sim: result.simulated.energy, unit: 'kW' },
                       { label: 'Water Consumption (L/h)', current: result.current.water, sim: result.simulated.water, unit: 'L' },
                       { label: 'Waste Generation (kg/d)', current: result.current.waste, sim: result.simulated.waste, unit: 'kg' },
                       { label: 'CO₂ Footprint (Tons)', current: result.current.co2, sim: result.simulated.co2, unit: 'T' },
                       { label: 'Operating Cost (₹/Day)', current: result.current.cost, sim: result.simulated.cost, unit: '₹' },
                       { label: 'Sustainability Rating', current: result.current.sustainability_score, sim: result.simulated.sustainability_score, unit: '/100', invert: true },
                    ].map((metric, idx) => {
                       const currentVal = metric.current || 1;
                       const simVal = metric.sim || 1;
                       const pctChange = ((simVal - currentVal) / currentVal) * 100;
                       return (
                          <div key={idx} className="bg-slate-950/80 p-4 rounded-xl border border-slate-800/80 hover:border-red-500/30 transition">
                             <p className="text-xs text-slate-400 mb-1.5 font-semibold">{metric.label}</p>
                             <div className="flex items-center text-lg font-black text-white mb-1.5 font-mono">
                                <span>{currentVal.toLocaleString()}</span>
                                <ArrowRight size={14} className="mx-1.5 text-slate-500 flex-shrink-0" />
                                <span className={getDirectionColor(pctChange, metric.invert)}>
                                   <AnimatedCounter value={simVal} />
                                </span>
                             </div>
                             <div className="flex items-center text-xs font-mono font-bold">
                                <span className={`flex items-center ${getDirectionColor(pctChange, metric.invert)}`}>
                                   {pctChange > 0 ? '+' : ''}{pctChange.toFixed(1)}% {getDirectionIcon(pctChange)}
                                </span>
                             </div>
                          </div>
                       );
                    })}
                 </div>

                 <div className="mt-auto">
                    <h3 className="text-sm font-bold text-white mb-3 flex items-center">
                      <Sparkles size={16} className="mr-1.5 text-yellow-400" /> AI Executive Decision Insights
                    </h3>
                    <div className="space-y-2.5 bg-slate-950/80 p-4 rounded-xl border border-slate-800">
                       <ul className="space-y-2">
                          {result.insights?.map((insight, idx) => (
                             <li key={idx} className="text-xs text-slate-200 flex items-start leading-relaxed">
                                <span className="text-red-400 mr-2 mt-0.5 font-bold">&bull;</span> {insight}
                             </li>
                          ))}
                       </ul>
                    </div>
                 </div>
              </div>
           ) : (
              <div className="glass-card p-12 h-full flex flex-col items-center justify-center text-center border border-red-950/40">
                 <Activity size={48} className="text-slate-600 mb-4 animate-pulse" />
                 <h3 className="text-lg text-white font-bold">Digital Twin Ready</h3>
                 <p className="text-slate-400 text-xs mt-2 max-w-md">
                   Click one of the Quick What-If buttons above or adjust the parameter sliders to simulate the impact of environmental & operational decisions.
                 </p>
              </div>
           )}
        </div>
      </div>
    </motion.div>
  );
}
