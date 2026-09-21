import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { api } from '../api/client';
import { ScenarioInput, ScenarioResult } from '../types';
import AnimatedCounter from '../components/common/AnimatedCounter';
import { AlertTriangle, Activity, ArrowRight, TrendingDown, TrendingUp, Minus } from 'lucide-react';

const Scenarios: React.FC = () => {
  const [inputs, setInputs] = useState<ScenarioInput>({
    hvac_change: 0,
    water_change: 0,
    waste_collection_change: 0,
    traffic_change: 0,
    operating_hours_change: 0,
    occupancy_change: 0
  });

  const [result, setResult] = useState<ScenarioResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInputs(prev => ({ ...prev, [name]: parseInt(value) }));
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
    setResult(null);
  };

  const handleSimulate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.simulateScenario(inputs);
      setResult(res);
    } catch (err) {
      setError('Simulation failed');
    } finally {
      setLoading(false);
    }
  };

  const getDirectionIcon = (change: number) => {
     if (change < 0) return <TrendingDown size={16} className="text-emerald-400 ml-1" />;
     if (change > 0) return <TrendingUp size={16} className="text-red-400 ml-1" />;
     return <Minus size={16} className="text-slate-400 ml-1" />;
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
      <div className="border-b border-slate-700/50 pb-4">
        <h1 className="text-3xl font-bold text-white">Scenario Simulator</h1>
        <p className="text-slate-400 mt-1">Estimate the impact of operational changes before implementation.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN - INPUTS */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-card p-6">
            <h2 className="text-lg font-medium text-white mb-6">Adjust Parameters</h2>
            
            <div className="space-y-6">
              {[
                { label: 'HVAC Output Change', name: 'hvac_change', min: -50, max: 50 },
                { label: 'Water Usage Change', name: 'water_change', min: -50, max: 50 },
                { label: 'Waste Collection Freq.', name: 'waste_collection_change', min: -50, max: 50 },
                { label: 'Traffic Volume', name: 'traffic_change', min: -50, max: 50 },
                { label: 'Operating Hours', name: 'operating_hours_change', min: -50, max: 50 },
                { label: 'Campus Occupancy', name: 'occupancy_change', min: -50, max: 50 },
              ].map((slider) => (
                <div key={slider.name}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-300">{slider.label}</span>
                    <span className="text-blue-400 font-medium font-mono">{(inputs as any)[slider.name] > 0 ? '+' : ''}{(inputs as any)[slider.name]}%</span>
                  </div>
                  <input
                    type="range"
                    name={slider.name}
                    min={slider.min}
                    max={slider.max}
                    value={(inputs as any)[slider.name]}
                    onChange={handleSliderChange}
                    className="w-full accent-blue-500 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-slate-500 mt-1 font-mono">
                    <span>{slider.min}%</span>
                    <span>{slider.max}%</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex space-x-3">
              <button 
                onClick={handleSimulate}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium py-3 rounded-lg shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center disabled:opacity-50"
              >
                {loading ? <span className="animate-pulse">Simulating...</span> : <><Activity size={18} className="mr-2"/> Simulate</>}
              </button>
              <button 
                onClick={resetInputs}
                className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors border border-slate-700"
              >
                Reset
              </button>
            </div>
            
            <div className="mt-6 flex items-start text-xs text-slate-400 bg-slate-800/50 p-3 rounded border border-slate-700">
               <AlertTriangle size={14} className="text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
               <p>⚠️ SCENARIO ESTIMATE - Results are modeled approximations based on historical patterns and should not be used as guaranteed outcomes.</p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN - RESULTS */}
        <div className="lg:col-span-8">
           {loading ? (
              <div className="glass-card p-12 h-full flex flex-col items-center justify-center">
                 <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-4"></div>
                 <p className="text-slate-400 animate-pulse text-lg">AI Engine running simulation models...</p>
              </div>
           ) : error ? (
              <div className="glass-card p-12 h-full flex flex-col items-center justify-center text-red-400">
                 <AlertTriangle size={48} className="mb-4" />
                 <p>{error}</p>
              </div>
           ) : result ? (
              <div className="glass-card p-6 h-full flex flex-col">
                 <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-medium text-white flex items-center">
                       <Activity className="mr-2 text-blue-400" /> Simulation Results
                    </h2>
                    <span className="px-3 py-1 bg-indigo-500/20 text-indigo-400 text-xs rounded-full border border-indigo-500/30">
                       {result.label || 'SCENARIO ESTIMATE'}
                    </span>
                 </div>

                 <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                    {[
                       { label: 'Energy', current: result.current.energy, sim: result.simulated.energy, unit: 'kWh' },
                       { label: 'Water', current: result.current.water, sim: result.simulated.water, unit: 'L' },
                       { label: 'Waste', current: result.current.waste, sim: result.simulated.waste, unit: 'kg' },
                       { label: 'CO₂ Emissions', current: result.current.co2, sim: result.simulated.co2, unit: 't' },
                       { label: 'Op. Cost Est.', current: result.current.cost, sim: result.simulated.cost, unit: '₹' },
                       { label: 'Sustainability Score', current: result.current.sustainability_score, sim: result.simulated.sustainability_score, unit: '/100', invert: true },
                    ].map((metric, idx) => {
                       const currentVal = metric.current || 1;
                       const simVal = metric.sim || 1;
                       const pctChange = ((simVal - currentVal) / currentVal) * 100;
                       return (
                          <div key={idx} className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50">
                             <p className="text-sm text-slate-400 mb-2">{metric.label}</p>
                             <div className="flex items-center text-lg font-semibold text-white mb-2">
                                <span>{currentVal.toLocaleString()}</span>
                                <ArrowRight size={14} className="mx-1.5 text-slate-500 flex-shrink-0" />
                                <span className={getDirectionColor(pctChange, metric.invert)}>
                                   <AnimatedCounter value={simVal} />
                                </span>
                             </div>
                             <div className="flex items-center text-xs font-mono">
                                <span className={`flex items-center ${getDirectionColor(pctChange, metric.invert)}`}>
                                   {pctChange > 0 ? '+' : ''}{pctChange.toFixed(1)}% {getDirectionIcon(pctChange)}
                                </span>
                             </div>
                          </div>
                       );
                    })}
                 </div>

                 <div className="mt-auto">
                    <h3 className="text-lg font-medium text-white mb-4">AI Impact Insights</h3>
                    <div className="space-y-3 bg-slate-800/30 p-4 rounded-lg border border-slate-700/30">
                       <ul className="space-y-2">
                          {result.insights?.map((insight, idx) => (
                             <li key={idx} className="text-sm text-slate-300 flex items-start">
                                <span className="text-blue-400 mr-2 mt-0.5">•</span> {insight}
                             </li>
                          ))}
                       </ul>
                    </div>
                 </div>
              </div>
           ) : (
              <div className="glass-card p-12 h-full flex flex-col items-center justify-center text-center">
                 <Activity size={48} className="text-slate-600 mb-4" />
                 <h3 className="text-xl text-slate-400 font-medium">Ready to Simulate</h3>
                 <p className="text-slate-500 mt-2 max-w-md">Adjust operational sliders on the left and click Simulate to generate AI scenario estimates for facility decision-support.</p>
              </div>
           )}
        </div>
      </div>
    </motion.div>
  );
};

export default Scenarios;
