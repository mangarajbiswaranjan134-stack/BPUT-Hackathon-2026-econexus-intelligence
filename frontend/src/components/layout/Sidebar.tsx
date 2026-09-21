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
      className="h-full bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0 overflow-y-auto overflow-x-hidden relative"
    >
      <div>
        <div className="p-4 flex items-center h-16">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-xl">E</span>
          </div>
          {sidebarOpen && (
            <span className="ml-3 font-bold text-lg text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 whitespace-nowrap">
              EcoNexus
            </span>
          )}
        </div>

        {sidebarOpen && (
          <div className="px-4 mb-4 relative">
            <button 
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              className="w-full flex items-center justify-between text-sm bg-slate-800 p-2 rounded-lg hover:bg-slate-700 transition"
            >
              <span className="capitalize text-slate-300">{role}</span>
              <ChevronDown size={16} />
            </button>
            {roleDropdownOpen && (
              <div className="absolute top-full left-4 right-4 mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-lg z-50 py-1">
                {(['admin', 'operations', 'sustainability'] as UserRole[]).map(r => (
                  <button 
                    key={r}
                    onClick={() => { setRole(r); setRoleDropdownOpen(false); }}
                    className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 capitalize"
                  >
                    {r}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <nav className="px-2 space-y-1 mt-4">
          {navItems.filter(filterRoles).map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => clsx(
                "flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 group relative",
                isActive 
                  ? "bg-blue-500/10 text-blue-400" 
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              )}
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div
                      layoutId="activeNavIndicator"
                      className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-r-full"
                    />
                  )}
                  <item.icon size={20} className="shrink-0" />
                  {sidebarOpen && (
                    <span className="ml-3 text-sm font-medium whitespace-nowrap">{item.label}</span>
                  )}
                </>
              )}
            </NavLink>
          ))}
          
          {actionItems.filter(filterRoles).length > 0 && (
            <div className="my-4 pt-4 border-t border-slate-800/50 px-3">
              {sidebarOpen && <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">Tools & Admin</p>}
            </div>
          )}
          
          {actionItems.filter(filterRoles).map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => clsx(
                "flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 group relative",
                isActive 
                  ? "bg-blue-500/10 text-blue-400" 
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              )}
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div
                      layoutId="activeNavIndicator"
                      className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-r-full"
                    />
                  )}
                  <item.icon size={20} className="shrink-0" />
                  {sidebarOpen && (
                    <span className="ml-3 text-sm font-medium whitespace-nowrap">{item.label}</span>
                  )}
                </>
              )}
            </NavLink>
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
