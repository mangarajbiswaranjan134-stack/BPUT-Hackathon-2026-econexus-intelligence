import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../api/client';
import { Action } from '../types';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import { AlertTriangle, CheckCircle, Clock, Zap, RefreshCw, ChevronDown } from 'lucide-react';

const Actions: React.FC = () => {
  const [actions, setActions] = useState<Action[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'new' | 'in_progress' | 'completed'>('all');

  const fetchActions = async () => {
    try {
      const data = await api.getActions();
      setActions(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch actions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActions();
  }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const newActs = await api.generateActions();
      setActions(newActs);
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      await api.updateActionStatus(id, newStatus);
      setActions(prev => prev.map(a => a.id === id ? { ...a, status: newStatus as any } : a));
    } catch (err) {
      console.error("Failed to update status");
    }
  };

  if (loading) return <LoadingSkeleton lines={8} />;

  if (error) return (
    <div className="flex flex-col items-center justify-center h-full text-red-400">
      <AlertTriangle size={48} className="mb-4" />
      <p>{error}</p>
      <button onClick={fetchActions} className="mt-4 px-4 py-2 bg-slate-800 rounded hover:bg-slate-700">Retry</button>
    </div>
  );

  const filteredActions = filter === 'all' ? actions : actions.filter(a => a.status === filter);
  
  const stats = {
     new: actions.filter(a => a.status === 'new').length,
     inProgress: actions.filter(a => a.status === 'in_progress').length,
     completed: actions.filter(a => a.status === 'completed').length,
  };

  const getPriorityColor = (priority: string) => {
     switch(priority.toLowerCase()) {
        case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/30';
        case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
        case 'medium': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
        default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
     }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-end border-b border-slate-700/50 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center">
             <Zap className="mr-3 text-yellow-400" /> Action Center (AI Recommendations)
          </h1>
          <p className="text-slate-400 mt-1">AI-generated operational tasks to optimize facility performance.</p>
        </div>
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
        >
          <RefreshCw size={16} className={`mr-2 ${generating ? 'animate-spin' : ''}`} />
          {generating ? 'Analyzing...' : 'Generate New Recommendations'}
        </button>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-800/30 p-4 rounded-xl border border-slate-700/30">
         <div className="flex space-x-2">
            {[
               { id: 'all', label: 'All' },
               { id: 'new', label: 'New' },
               { id: 'in_progress', label: 'In Progress' },
               { id: 'completed', label: 'Completed' }
            ].map(f => (
               <button
                  key={f.id}
                  onClick={() => setFilter(f.id as any)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${filter === f.id ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
               >
                  {f.label}
               </button>
            ))}
         </div>
         <div className="flex space-x-6 text-sm text-slate-400">
            <span className="flex items-center"><AlertTriangle size={14} className="mr-1 text-blue-400"/> {stats.new} New</span>
            <span className="flex items-center"><Clock size={14} className="mr-1 text-amber-400"/> {stats.inProgress} In Progress</span>
            <span className="flex items-center"><CheckCircle size={14} className="mr-1 text-emerald-400"/> {stats.completed} Done</span>
         </div>
      </div>

      <div className="space-y-4">
         <AnimatePresence>
            {filteredActions.map(action => (
               <motion.div
                  key={action.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="glass-card p-0 overflow-hidden"
               >
                  <div className={`h-1 w-full ${action.priority === 'critical' ? 'bg-red-500' : action.priority === 'high' ? 'bg-orange-500' : 'bg-amber-500'}`} />
                  <div className="p-5">
                     <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                        <div>
                           <div className="flex items-center space-x-3 mb-2">
                              <span className={`px-2.5 py-0.5 text-xs font-semibold rounded border ${getPriorityColor(action.priority)} uppercase tracking-wider`}>
                                 {action.priority}
                              </span>
                              <span className="text-xs text-slate-400 font-mono">#{action.id}</span>
                              {action.metric && <span className="text-xs text-slate-300 bg-slate-700 px-2 py-0.5 rounded capitalize">{action.metric}</span>}
                              {action.confidence && <span className="text-xs text-blue-400">{(action.confidence * 100).toFixed(0)}% Confidence</span>}
                           </div>
                           <h3 className="text-lg font-medium text-white">{action.what}</h3>
                        </div>
                        <div className="relative group">
                           <select 
                              value={action.status}
                              onChange={(e) => updateStatus(action.id, e.target.value)}
                              className={`appearance-none outline-none cursor-pointer pl-3 pr-8 py-1.5 rounded-full text-sm font-medium border transition-colors
                                 ${action.status === 'new' ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' : 
                                   action.status === 'in_progress' ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' : 
                                   'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'}`}
                           >
                              <option value="new" className="bg-slate-800">New</option>
                              <option value="in_progress" className="bg-slate-800">In Progress</option>
                              <option value="completed" className="bg-slate-800">Completed</option>
                           </select>
                           <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-current opacity-70" />
                        </div>
                     </div>
                     
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 mb-4 text-sm">
                        <div><span className="text-slate-500 w-16 inline-block">Where:</span> <span className="text-slate-300">{action.where}</span></div>
                        <div><span className="text-slate-500 w-16 inline-block">Who:</span> <span className="text-slate-300">{action.who}</span></div>
                        <div><span className="text-slate-500 w-16 inline-block">When:</span> <span className="text-slate-300">{action.when}</span></div>
                        <div><span className="text-slate-500 w-16 inline-block">Impact:</span> <span className="text-emerald-400 font-medium">{action.expected_impact}</span></div>
                     </div>
                     
                     <div className="bg-slate-800/50 p-3 rounded border border-slate-700/50 text-sm">
                        <span className="text-blue-400 font-medium block mb-1">AI Problem & Rationale:</span>
                        <p className="text-slate-300">{action.problem} &bull; {action.why}</p>
                     </div>
                  </div>
               </motion.div>
            ))}
            {filteredActions.length === 0 && (
               <div className="text-center py-12 text-slate-500">
                  No actions found for this filter.
               </div>
            )}
         </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default Actions;
