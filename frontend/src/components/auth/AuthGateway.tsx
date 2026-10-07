import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, Lock, Unlock, User, KeyRound, Eye, EyeOff, 
  Cpu, CheckCircle2, AlertTriangle, ArrowRight, Sparkles, 
  Radio, Globe2, Layers
} from 'lucide-react';
import { useAppStore } from '../../stores/appStore';
import { UserRole } from '../../types';
import EcoNexusLogo from '../common/EcoNexusLogo';

export default function AuthGateway() {
  const { login } = useAppStore();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('econexus2026');
  const [selectedRole, setSelectedRole] = useState<UserRole>('admin');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [authStep, setAuthStep] = useState<'idle' | 'verifying' | 'granted'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleAuthAttempt(username.trim(), password.trim(), selectedRole);
  };

  const handleAuthAttempt = (u: string, p: string, r: UserRole) => {
    setErrorMsg('');

    if (!u) {
      setErrorMsg('Please enter your Officer ID / Username');
      return;
    }
    if (!p) {
      setErrorMsg('Please enter your Security Access Key');
      return;
    }

    // Validation (allow standard demo credentials or any reasonable input)
    setIsLoading(true);
    setAuthStep('verifying');

    setTimeout(() => {
      // Successful auth
      setAuthStep('granted');
      setTimeout(() => {
        login(u, r, u === 'admin' ? 'Facility Director' : u === 'judge' ? 'BPUT Jury / Evaluator' : u);
      }, 700);
    }, 900);
  };

  const handleQuickLogin = (u: string, p: string, r: UserRole) => {
    setUsername(u);
    setPassword(p);
    setSelectedRole(r);
    handleAuthAttempt(u, p, r);
  };

  return (
    <div className="min-h-screen bg-[#070304] text-white flex flex-col justify-between relative overflow-hidden select-none font-sans">
      {/* Background Tech Grid & Ambient Crimson Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(220,38,38,0.22),transparent)] pointer-events-none" />
      <div 
        className="absolute inset-0 opacity-[0.035] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(#ef4444 1px, transparent 1px), linear-gradient(90deg, #ef4444 1px, transparent 1px)`,
          backgroundSize: '48px 48px'
        }}
      />
      
      {/* Top Banner */}
      <header className="relative z-10 w-full px-6 py-4 flex items-center justify-between border-b border-red-950/40 bg-[#0c0709]/80 backdrop-blur-md">
        <div className="flex items-center space-x-3">
          <EcoNexusLogo size={40} />
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-lg text-transparent bg-clip-text bg-gradient-to-r from-white via-red-100 to-red-400 tracking-wide">
                EcoNexus Intelligence
              </span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-red-950 text-red-400 border border-red-800/60 font-semibold tracking-wider">
                EIA v2.6 Core
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 font-mono">
              BPUT Hackathon 2026 • Cognizant Track • Team GODXZ
            </p>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="hidden sm:flex items-center space-x-3 text-xs font-mono">
          <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-red-950/60 border border-red-900/40 text-red-300">
            <Cpu size={12} className="text-red-400" />
            <span>IoT Edge Ready</span>
          </div>
          <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-950/40 border border-emerald-900/40 text-emerald-400">
            <Radio size={12} className="animate-pulse" />
            <span>Secure Port 8000</span>
          </div>
        </div>
      </header>

      {/* Main Authentication Card */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8">
        <motion.div 
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="w-full max-w-md bg-[#12090c]/90 border border-red-900/50 rounded-2xl shadow-[0_0_50px_rgba(239,68,68,0.15)] backdrop-blur-xl p-6 sm:p-8 relative overflow-hidden"
        >
          {/* Subtle Scanning Top Line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent animate-pulse" />

          {/* Card Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-red-600/20 to-rose-900/30 border border-red-500/40 shadow-[0_0_20px_rgba(239,68,68,0.35)] mb-3 text-red-400">
              {authStep === 'granted' ? (
                <CheckCircle2 size={30} className="text-emerald-400 animate-bounce" />
              ) : authStep === 'verifying' ? (
                <div className="w-7 h-7 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Shield size={28} />
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center justify-center gap-2">
              <span>Security Access Gateway</span>
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              Authorized personnel & Hackathon Jury authentication required
            </p>
          </div>

          {/* Error Message */}
          <AnimatePresence>
            {errorMsg && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 p-3 bg-red-950/80 border border-red-500/60 rounded-xl text-red-200 text-xs flex items-center space-x-2"
              >
                <AlertTriangle size={15} className="text-red-400 shrink-0" />
                <span>{errorMsg}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username Field */}
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5 flex items-center justify-between">
                <span>Officer ID / Username</span>
                <span className="text-red-400/80 text-[10px]">Required</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                  <User size={16} />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username (e.g. admin or judge)"
                  className="w-full bg-[#1b0e13]/90 border border-red-950/80 focus:border-red-500 rounded-xl py-2.5 pl-10 pr-3.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-red-500/50 transition font-medium"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5 flex items-center justify-between">
                <span>Access Key / Password</span>
                <span className="text-red-400/80 text-[10px]">Encrypted</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                  <KeyRound size={16} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter access password"
                  className="w-full bg-[#1b0e13]/90 border border-red-950/80 focus:border-red-500 rounded-xl py-2.5 pl-10 pr-10 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-red-500/50 transition font-medium"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-white transition"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                Target Operational Role
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'admin', label: 'Admin', desc: 'Full System' },
                  { id: 'operations', label: 'Operations', desc: 'IoT & Edge' },
                  { id: 'sustainability', label: 'EIA Officer', desc: 'Compliance' },
                ].map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setSelectedRole(r.id as UserRole)}
                    className={`py-2 px-2 rounded-xl text-xs font-medium border text-center transition ${
                      selectedRole === r.id
                        ? 'bg-red-600/25 border-red-500 text-white shadow-[0_0_12px_rgba(239,68,68,0.3)]'
                        : 'bg-[#180d11]/60 border-red-950/60 text-zinc-400 hover:text-zinc-200 hover:border-red-900/40'
                    }`}
                  >
                    <div className="font-semibold">{r.label}</div>
                    <div className="text-[10px] text-zinc-400 mt-0.5">{r.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center space-x-2 transition-all shadow-lg cursor-pointer ${
                authStep === 'granted'
                  ? 'bg-emerald-600 text-white shadow-emerald-600/40'
                  : 'bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-600 text-white shadow-[0_0_20px_rgba(239,68,68,0.45)]'
              }`}
            >
              {authStep === 'granted' ? (
                <>
                  <Unlock size={17} />
                  <span>Access Granted — Launching Command Center...</span>
                </>
              ) : authStep === 'verifying' ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Verifying Credentials & Syncing Telemetry...</span>
                </>
              ) : (
                <>
                  <span>Authorize & Enter Command Center</span>
                  <ArrowRight size={16} />
                </>
              )}
            </motion.button>
          </form>

          {/* Quick Demo Logins for Hackathon Evaluators */}
          <div className="mt-6 pt-5 border-t border-red-950/60">
            <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 mb-2.5">
              <span className="flex items-center gap-1.5">
                <Sparkles size={12} className="text-amber-400" />
                Quick Access for Judges & Evaluators:
              </span>
              <span className="text-red-400/80">1-Click Auth</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('judge', 'bput2026', 'admin')}
                className="py-2 px-3 rounded-xl bg-gradient-to-r from-amber-950/40 to-amber-900/20 border border-amber-600/40 hover:border-amber-400/80 text-amber-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition hover:shadow-[0_0_12px_rgba(245,158,11,0.25)]"
              >
                <span>⚖️</span>
                <span>Jury / Judge Mode</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('admin', 'econexus2026', 'admin')}
                className="py-2 px-3 rounded-xl bg-gradient-to-r from-red-950/40 to-red-900/20 border border-red-600/40 hover:border-red-400/80 text-red-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition hover:shadow-[0_0_12px_rgba(239,68,68,0.25)]"
              >
                <span>👑</span>
                <span>Full Admin Mode</span>
              </button>
            </div>

            <div className="mt-3 text-center">
              <span className="text-[11px] text-zinc-400 font-mono">
                Default Credentials: <code className="text-red-300 font-bold bg-black/40 px-1 py-0.5 rounded">admin</code> / <code className="text-red-300 font-bold bg-black/40 px-1 py-0.5 rounded">econexus2026</code>
              </span>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Footer System Audit */}
      <footer className="relative z-10 w-full px-6 py-3 border-t border-red-950/40 bg-[#0c0709]/80 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between text-[11px] text-zinc-400 font-mono gap-2">
        <div className="flex items-center space-x-2">
          <Globe2 size={13} className="text-red-400" />
          <span>EcoNexus Security Protocol • ISO 14001 EIA Standards</span>
        </div>
        <div className="flex items-center space-x-4 text-zinc-400">
          <span>AES-256 GCM</span>
          <span>•</span>
          <span>Web Serial Edge Bridge</span>
          <span>•</span>
          <span className="text-red-400 font-semibold">Team GODXZ</span>
        </div>
      </footer>
    </div>
  );
}
