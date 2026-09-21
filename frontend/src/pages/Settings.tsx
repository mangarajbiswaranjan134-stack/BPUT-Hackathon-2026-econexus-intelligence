import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { api } from '../api/client';
import { IntegrationStatus, FacilityConfig } from '../types';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import { useAppStore } from '../stores/appStore';
import { Settings as SettingsIcon, Server, Database, Cloud, Activity, CheckCircle, AlertTriangle, Power } from 'lucide-react';

const Settings: React.FC = () => {
  const [integrations, setIntegrations] = useState<IntegrationStatus[]>([]);
  const [facility, setFacility] = useState<FacilityConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { simulationActive, setSimulationActive, facilityType, setFacilityType } = useAppStore();
  const [selectedType, setSelectedType] = useState(facilityType || 'engineering_college');

  const fetchData = async () => {
    try {
      const [integData, facData] = await Promise.all([
        api.getIntegrations(),
        api.getFacility()
      ]);
      setIntegrations(integData);
      setFacility(facData);
      setError(null);
    } catch (err) {
      setError('Failed to load settings data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleFacilityChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value;
    setSelectedType(newType);
    setFacilityType(newType);
    try {
      const updated = await api.setFacilityType(newType);
      setFacility(updated);
    } catch (err) {
      console.error("Failed to set facility type");
    }
  };

  const toggleSimulation = () => {
    const nextState = !simulationActive;
    setSimulationActive(nextState);
    if (nextState) {
      api.startSimulation().catch(console.error);
    } else {
      api.stopSimulation().catch(console.error);
    }
  };

  if (loading) return <LoadingSkeleton lines={8} />;

  const getStatusDisplay = (status: string) => {
     switch(status) {
        case 'connected': return <span className="flex items-center text-emerald-400 text-sm font-medium"><CheckCircle size={14} className="mr-1"/> Connected</span>;
        case 'fallback': return <span className="flex items-center text-yellow-400 text-sm font-medium"><AlertTriangle size={14} className="mr-1"/> Fallback (Demo)</span>;
        case 'error': return <span className="flex items-center text-red-400 text-sm font-medium"><AlertTriangle size={14} className="mr-1"/> Error</span>;
        default: return <span className="flex items-center text-slate-400 text-sm">Not Configured</span>;
     }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-8 pb-12"
    >
      <div className="border-b border-slate-700/50 pb-4">
        <h1 className="text-3xl font-bold text-white flex items-center">
           <SettingsIcon className="mr-3 text-slate-400" /> Settings & Configuration
        </h1>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         {/* LEFT COL */}
         <div className="space-y-8">
            <div className="glass-card p-6">
               <h2 className="text-xl font-medium text-white mb-6 flex items-center">
                  <Server className="mr-2 text-blue-400" /> Facility Configuration
               </h2>
               
               <div className="space-y-4">
                  <div>
                     <label className="block text-sm text-slate-400 mb-2">Facility Template Profile</label>
                     <select 
                        value={selectedType}
                        onChange={handleFacilityChange}
                        className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500"
                     >
                        <option value="engineering_college">Engineering College Campus (Bhubaneswar)</option>
                        <option value="government_hospital">Government Hospital</option>
                        <option value="industrial_estate">Industrial Estate</option>
                        <option value="municipal_facility">Municipal Facility</option>
                        <option value="corporate_campus">Corporate Campus</option>
                     </select>
                     <p className="text-xs text-slate-500 mt-2">Changing the template updates building baselines, sensor locations, and synthetic telemetry parameters.</p>
                  </div>
                  
                  <div className="pt-4 border-t border-slate-700/50">
                     <p className="text-sm text-slate-400 mb-1">Current Active Facility:</p>
                     <p className="text-lg text-white font-medium">{facility?.name || 'Engineering College Campus'}</p>
                     <p className="text-sm text-slate-500">{facility?.location || 'Bhubaneswar, Odisha, India'}</p>
                  </div>
               </div>
            </div>

            <div className="glass-card p-6 border border-blue-500/20 bg-slate-800/80">
               <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-medium text-white flex items-center">
                     <Activity className="mr-2 text-indigo-400" /> Live Simulation Engine
                  </h2>
                  <div className={`px-2 py-1 text-xs rounded-full border ${simulationActive ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-slate-700 text-slate-400 border-slate-600'}`}>
                     {simulationActive ? 'ACTIVE' : 'PAUSED'}
                  </div>
               </div>
               
               <p className="text-sm text-slate-400 mb-6">
                  The simulation engine generates realistic facility data continuously, creating anomalies and trends for the AI to analyze when live sensor data is unavailable.
               </p>

               <div className="flex space-x-4">
                  <button 
                     onClick={toggleSimulation}
                     className={`flex-1 py-2.5 rounded-lg font-medium flex justify-center items-center transition-colors ${
                        simulationActive 
                        ? 'bg-slate-700 hover:bg-slate-600 text-white' 
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                     }`}
                  >
                     <Power size={18} className="mr-2" />
                     {simulationActive ? 'Stop Simulation' : 'Start Simulation'}
                  </button>
                  <button
                     onClick={() => api.resetSimulation().then(fetchData)}
                     className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-300"
                  >
                     Reset Demo Data
                  </button>
               </div>
            </div>
         </div>

         {/* RIGHT COL */}
         <div className="space-y-8">
            <div className="glass-card p-6">
               <h2 className="text-xl font-medium text-white mb-6 flex items-center">
                  <Cloud className="mr-2 text-cyan-400" /> System Integrations & APIs
               </h2>
               
               <div className="space-y-4">
                  {integrations.map((integ, idx) => (
                     <div key={idx} className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50 flex justify-between items-center">
                        <div>
                           <h4 className="text-white font-medium">{integ.name}</h4>
                           <p className="text-xs text-slate-400 mt-1">Provider: {integ.provider}</p>
                           {integ.details && <p className="text-xs text-slate-500 mt-0.5">{integ.details}</p>}
                        </div>
                        <div className="text-right">
                           {getStatusDisplay(integ.status)}
                        </div>
                     </div>
                  ))}
               </div>
            </div>

            <div className="glass-card p-6">
               <h2 className="text-xl font-medium text-white mb-6 flex items-center">
                  <Database className="mr-2 text-emerald-400" /> Data Sources Mapping
               </h2>
               
               <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-slate-800 p-3 rounded border border-slate-700 flex justify-between items-center">
                     <span className="text-slate-300">Energy Meters</span>
                     <span className="w-2 h-2 rounded-full bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.6)]" title="Demo Data"></span>
                  </div>
                  <div className="bg-slate-800 p-3 rounded border border-slate-700 flex justify-between items-center">
                     <span className="text-slate-300">Water Sensors</span>
                     <span className="w-2 h-2 rounded-full bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.6)]" title="Demo Data"></span>
                  </div>
                  <div className="bg-slate-800 p-3 rounded border border-slate-700 flex justify-between items-center">
                     <span className="text-slate-300">Waste Smart Bins</span>
                     <span className="w-2 h-2 rounded-full bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.6)]" title="Demo Data"></span>
                  </div>
                  <div className="bg-slate-800 p-3 rounded border border-slate-700 flex justify-between items-center">
                     <span className="text-slate-300">AQI Monitors</span>
                     <span className="w-2 h-2 rounded-full bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.6)]" title="Demo Data"></span>
                  </div>
                  <div className="bg-slate-800 p-3 rounded border border-slate-700 flex justify-between items-center">
                     <span className="text-slate-300">Cameras / Traffic</span>
                     <span className="w-2 h-2 rounded-full bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.6)]" title="Demo Data"></span>
                  </div>
                  <div className="bg-slate-800 p-3 rounded border border-slate-700 flex justify-between items-center">
                     <span className="text-slate-300">Gemini AI Engine</span>
                     <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.6)]" title="Connected"></span>
                  </div>
               </div>
               <div className="mt-4 flex space-x-4 text-xs text-slate-400">
                  <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-emerald-400 mr-2"></span> 🟢 LIVE DATA</span>
                  <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-yellow-400 mr-2"></span> 🟡 DEMO DATA</span>
               </div>
            </div>
         </div>
      </div>
    </motion.div>
  );
};

export default Settings;
