import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Search, User, Activity, Shield, Clock, Wifi, Brain } from 'lucide-react';
import { useAppStore } from '../../stores/appStore';
import clsx from 'clsx';
import { format } from 'date-fns';

const ALERTS_TICKER = [
  "⚡ Peak Demand Alert: Academic Block B HVAC load +18% above baseline",
  "💧 Flow Warning: Overnight leakage baseline elevated in Hostel 3 riser",
  "🌬️ Air Quality: PM2.5 spike detected near Main Gate road intersection",
  "♻️ Smart Bin Alert: Canteen Waste Bin #04 reached 88% fill capacity",
  "🚗 Traffic Update: Gate 2 queue cleared; Parking Zone A at 84% capacity"
];

export default function Header() {
  const { simulationActive, notifications, role } = useAppStore();
  const [notifOpen, setNotifOpen] = useState(false);
  const [tickerIdx, setTickerIdx] = useState(0);
  const [timeStr, setTimeStr] = useState('');

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const updateTime = () => {
      setTimeStr(format(new Date(), 'HH:mm:ss') + ' IST');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const tickerInterval = setInterval(() => {
      setTickerIdx(prev => (prev + 1) % ALERTS_TICKER.length);
    }, 6000);
    return () => clearInterval(tickerInterval);
  }, []);

  return (
    <header className="h-16 bg-slate-900/80 backdrop-blur-md border-b border-slate-800/80 flex items-center justify-between px-6 shrink-0 z-20 sticky top-0">
      
      {/* Search & Live Alert Ticker */}
      <div className="flex items-center space-x-6 flex-1 min-w-0 pr-4">
        <div className="relative w-56 flex-shrink-0 hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <input 
            type="text" 
            placeholder="Search sensors, buildings..." 
            className="w-full bg-slate-950/60 border border-slate-800 rounded-full py-1.5 pl-9 pr-4 text-xs text-slate-200 focus:outline-none focus:border-blue-500 placeholder-slate-500 transition"
          />
        </div>

        {/* Streaming Ticker */}
        <div className="hidden xl:flex items-center bg-slate-950/60 border border-slate-800/80 px-3 py-1 rounded-full text-xs text-slate-300 max-w-lg min-w-0 overflow-hidden">
          <span className="flex-shrink-0 text-amber-400 font-semibold flex items-center mr-2">
            <Activity size={12} className="mr-1 animate-pulse" /> LIVE TELEMETRY:
          </span>
          <AnimatePresence mode="wait">
            <motion.span
              key={tickerIdx}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="truncate text-slate-300 text-[11px]"
            >
              {ALERTS_TICKER[tickerIdx]}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>
      
      {/* Right System Info Bar */}
      <div className="flex items-center space-x-4 flex-shrink-0">
        
        {/* Real-Time Clock */}
        <div className="hidden sm:flex items-center space-x-1.5 text-xs font-mono text-slate-400 bg-slate-950/60 px-3 py-1.5 rounded-lg border border-slate-800/80">
          <Clock size={13} className="text-blue-400" />
          <span>{timeStr || '00:00:00 IST'}</span>
        </div>

        {/* Live IoT Sensor Health Pill */}
        <div className="flex items-center space-x-2 text-[11px] font-mono bg-slate-950/60 px-3 py-1.5 rounded-lg border border-slate-800/80">
          <Wifi size={13} className="text-emerald-400" />
          <span className="text-slate-300 hidden sm:inline">48 SENSORS</span>
          {simulationActive ? (
            <span className="text-emerald-400 flex items-center font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse mr-1"></span>ONLINE
            </span>
          ) : (
            <span className="text-amber-400 flex items-center font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mr-1"></span>DEMO
            </span>
          )}
        </div>

        {/* User Role Badge */}
        <div className="flex items-center space-x-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30 uppercase tracking-wider">
          <Shield size={12} />
          <span>{role}</span>
        </div>
        
        <div className="h-6 w-px bg-slate-800"></div>

        {/* Notifications Button */}
        <div className="relative">
          <button 
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative p-2 text-slate-400 hover:text-white transition rounded-lg hover:bg-slate-800"
            title="Notifications"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>
            )}
          </button>
          
          <AnimatePresence>
            {notifOpen && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-2 w-80 glass-card shadow-2xl z-50 overflow-hidden"
              >
                <div className="p-3 border-b border-slate-700/50 flex justify-between items-center bg-slate-800/80">
                  <h3 className="text-sm font-semibold text-slate-200">System Notifications</h3>
                  <span className="text-xs bg-slate-700 px-2 py-0.5 rounded-full text-slate-300">{unreadCount} New</span>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-sm text-slate-500">No new notifications</div>
                  ) : (
                    notifications.map(n => (
                      <div key={n.id} className={clsx("p-3 border-b border-slate-700/30 hover:bg-slate-800/50 transition cursor-pointer", !n.read && "bg-slate-800/30")}>
                        <div className="flex items-center justify-between mb-1">
                          <span className={clsx(
                            "text-xs font-semibold px-1.5 rounded",
                            n.type === 'critical' ? 'text-red-400 bg-red-400/10' :
                            n.type === 'warning' ? 'text-amber-400 bg-amber-400/10' :
                            n.type === 'success' ? 'text-emerald-400 bg-emerald-400/10' :
                            'text-blue-400 bg-blue-400/10'
                          )}>{n.type.toUpperCase()}</span>
                          <span className="text-[10px] text-slate-500">{format(new Date(n.timestamp), 'HH:mm')}</span>
                        </div>
                        <p className="text-sm text-slate-200 font-medium">{n.title}</p>
                        <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="h-8 w-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden text-blue-400">
          <Brain size={16} />
        </div>
      </div>
    </header>
  );
}
