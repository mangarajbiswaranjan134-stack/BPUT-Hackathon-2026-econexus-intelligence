import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, Zap, Droplets, Trash2, Wind, Car, Server, 
  ShieldAlert, Bot, FlaskConical, ListChecks, FileText, Upload, 
  Settings, ChevronLeft, ChevronRight, ChevronDown 
} from 'lucide-react';
import { useAppStore } from '../../stores/appStore';
import { UserRole } from '../../types';
import clsx from 'clsx';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'operations', 'sustainability'] },
  { path: '/energy', label: 'Energy', icon: Zap, roles: ['admin', 'operations', 'sustainability'] },
  { path: '/water', label: 'Water', icon: Droplets, roles: ['admin', 'operations', 'sustainability'] },
  { path: '/waste', label: 'Waste', icon: Trash2, roles: ['admin', 'operations', 'sustainability'] },
  { path: '/air-quality', label: 'Air Quality', icon: Wind, roles: ['admin', 'sustainability'] },
  { path: '/traffic', label: 'Traffic & Parking', icon: Car, roles: ['admin', 'operations'] },
  { path: '/assets', label: 'Assets', icon: Server, roles: ['admin', 'operations'] },
  { path: '/safety', label: 'Safety', icon: ShieldAlert, roles: ['admin', 'operations'] },
];

const actionItems = [
  { path: '/copilot', label: 'AI Copilot', icon: Bot, roles: ['admin', 'operations'] },
  { path: '/scenarios', label: 'Simulator', icon: FlaskConical, roles: ['admin', 'sustainability'] },
  { path: '/actions', label: 'Action Center', icon: ListChecks, roles: ['admin', 'operations'] },
  { path: '/reports', label: 'Reports', icon: FileText, roles: ['admin', 'sustainability'] },
  { path: '/csv-upload', label: 'CSV Upload', icon: Upload, roles: ['admin'] },
  { path: '/settings', label: 'Settings', icon: Settings, roles: ['admin'] },
];

export default function Sidebar() {
  const { role, setRole, sidebarOpen, toggleSidebar, simulationActive, setSimulationActive } = useAppStore();
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const filterRoles = (item: any) => item.roles.includes(role);

  return (
    <motion.div 
      initial={false}
      animate={{ width: sidebarOpen ? 256 : 64 }}
      className="h-full bg-[#0c0709] border-r border-red-950/60 flex flex-col justify-between shrink-0 overflow-y-auto overflow-x-hidden relative z-20"
    >
      <div>
        <div className="p-4 flex items-center h-16 border-b border-red-950/40">
          <div className="w-8 h-8 bg-gradient-to-br from-red-600 to-rose-700 rounded-lg flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(239,68,68,0.6)] border border-white/20">
            <span className="text-white font-black text-xl tracking-tighter">E</span>
          </div>
          {sidebarOpen && (
            <span className="ml-3 font-extrabold text-xl text-transparent bg-clip-text bg-gradient-to-r from-white via-red-200 to-red-500 whitespace-nowrap tracking-wide">
              EcoNexus
            </span>
          )}
        </div>

        {sidebarOpen && (
          <div className="px-4 mt-4 relative">
            <button 
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              className="w-full flex items-center justify-between text-xs font-semibold bg-[#170e11] p-2.5 rounded-xl border border-red-900/40 hover:border-red-500/40 transition text-zinc-200"
            >
              <span className="capitalize tracking-wider">{role}</span>
              <ChevronDown size={14} className="text-red-400" />
            </button>
            {roleDropdownOpen && (
              <div className="absolute top-full left-4 right-4 mt-1 bg-[#170e11] border border-red-800/60 rounded-xl shadow-2xl z-50 py-1">
                {(['admin', 'operations', 'sustainability'] as UserRole[]).map(r => (
                  <button 
                    key={r}
                    onClick={() => { setRole(r); setRoleDropdownOpen(false); }}
                    className="w-full text-left px-3 py-2 text-xs text-zinc-300 hover:bg-red-600/20 hover:text-white capitalize font-medium"
                  >
                    {r}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <nav className="px-2 space-y-1.5 mt-4">
          {navItems.filter(filterRoles).map((item) => (
            <motion.div key={item.path} whileHover={{ x: 4 }} whileTap={{ scale: 0.97 }} transition={{ duration: 0.15 }}>
              <NavLink
                to={item.path}
                className={({ isActive }) => clsx(
                  "flex items-center px-3 py-2.5 rounded-xl transition-all duration-200 group relative",
                  isActive 
                    ? "bg-gradient-to-r from-red-600/25 via-red-950/20 to-transparent text-white border border-red-500/40 shadow-[0_0_15px_rgba(239,68,68,0.25)] font-semibold" 
                    : "text-zinc-400 hover:bg-red-950/30 hover:text-white"
                )}
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.div
                        layoutId="activeNavIndicator"
                        className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-gradient-to-b from-white to-red-600 rounded-r-full shadow-[0_0_12px_rgba(255,23,68,1)]"
                      />
                    )}
                    <item.icon size={20} className={clsx("shrink-0 transition-transform group-hover:scale-110", isActive ? "text-red-400" : "text-zinc-400 group-hover:text-red-400")} />
                    {sidebarOpen && (
                      <span className="ml-3 text-sm whitespace-nowrap">{item.label}</span>
                    )}
                  </>
                )}
              </NavLink>
            </motion.div>
          ))}
          
          {actionItems.filter(filterRoles).length > 0 && (
            <div className="my-4 pt-4 border-t border-red-950/50 px-3">
              {sidebarOpen && <p className="text-[10px] font-black text-red-400/80 mb-2 uppercase tracking-widest">AI Intelligence & Tools</p>}
            </div>
          )}
          
          {actionItems.filter(filterRoles).map((item) => (
            <motion.div key={item.path} whileHover={{ x: 4 }} whileTap={{ scale: 0.97 }} transition={{ duration: 0.15 }}>
              <NavLink
                to={item.path}
                className={({ isActive }) => clsx(
                  "flex items-center px-3 py-2.5 rounded-xl transition-all duration-200 group relative",
                  isActive 
                    ? "bg-gradient-to-r from-red-600/30 via-rose-950/20 to-transparent text-white border border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.3)] font-semibold" 
                    : "text-zinc-400 hover:bg-red-950/30 hover:text-white"
                )}
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.div
                        layoutId="activeNavIndicator"
                        className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-gradient-to-b from-white to-red-600 rounded-r-full shadow-[0_0_12px_rgba(255,23,68,1)]"
                      />
                    )}
                    <item.icon size={20} className={clsx("shrink-0 transition-transform group-hover:scale-110", isActive ? "text-white" : "text-zinc-400 group-hover:text-red-400")} />
                    {sidebarOpen && (
                      <div className="ml-3 flex items-center justify-between w-full">
                        <span className="text-sm whitespace-nowrap">{item.label}</span>
                        {item.path === '/copilot' && (
                          <span className="text-[9px] font-black bg-gradient-to-r from-red-600 to-rose-600 text-white px-2 py-0.5 rounded-full uppercase shadow-[0_0_10px_rgba(239,68,68,0.6)] animate-pulse">
                            VOICE AI
                          </span>
                        )}
                      </div>
                    )}
                  </>
                )}
              </NavLink>
            </motion.div>
          ))}


        </nav>
      </div>

      <div className="p-4 border-t border-slate-800">
        {sidebarOpen && (
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-slate-400 font-medium">Live Simulation</span>
            <button 
              onClick={() => setSimulationActive(!simulationActive)}
              className={clsx(
                "w-8 h-4 rounded-full relative transition-colors duration-200",
                simulationActive ? "bg-emerald-500" : "bg-slate-600"
              )}
            >
              <div className={clsx(
                "w-3 h-3 bg-white rounded-full absolute top-0.5 transition-transform duration-200",
                simulationActive ? "translate-x-4" : "translate-x-0.5"
              )} />
            </button>
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className="w-full flex items-center justify-center p-2 rounded-lg text-slate-400 hover:bg-slate-800 transition"
        >
          {sidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>
      </div>
    </motion.div>
  );
}
