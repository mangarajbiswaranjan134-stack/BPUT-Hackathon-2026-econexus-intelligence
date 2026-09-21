import React, { Suspense } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Bot, Sparkles } from 'lucide-react';
import Sidebar from './Sidebar';
import Header from './Header';
import LoadingSkeleton from '../common/LoadingSkeleton';

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const isCopilotPage = location.pathname === '/copilot';

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950 text-slate-200 font-sans relative">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Animated background ambient light orbs */}
        <motion.div 
          animate={{
            x: [0, 30, -20, 0],
            y: [0, -30, 20, 0],
            scale: [1, 1.15, 0.95, 1],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-[-15%] left-[-10%] w-[55%] h-[55%] bg-gradient-to-br from-blue-600/15 via-cyan-500/10 to-transparent rounded-full blur-[140px] pointer-events-none" 
        />
        <motion.div 
          animate={{
            x: [0, -40, 25, 0],
            y: [0, 35, -25, 0],
            scale: [1, 1.2, 0.9, 1],
          }}
          transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-[-15%] right-[-10%] w-[55%] h-[55%] bg-gradient-to-tl from-purple-600/15 via-pink-500/10 to-transparent rounded-full blur-[140px] pointer-events-none" 
        />
        <motion.div 
          animate={{
            x: [0, 25, -25, 0],
            y: [0, 20, -20, 0],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-[40%] right-[30%] w-[35%] h-[35%] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" 
        />
        
        <Header />
        
        <main className="flex-1 overflow-y-auto p-6 z-0 relative">
          <Suspense fallback={<LoadingSkeleton className="w-full h-full min-h-[500px]" />}>
            <AnimatePresence mode="wait">
              <Outlet />
            </AnimatePresence>
          </Suspense>

          {/* Floating AI Copilot Trigger Widget (when not on Copilot page) */}
          {!isCopilotPage && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 1, type: "spring" }}
              className="fixed bottom-6 right-6 z-50 group"
            >
              <motion.button
                onClick={() => navigate('/copilot')}
                whileHover={{ scale: 1.08, y: -2 }}
                whileTap={{ scale: 0.94 }}
                className="flex items-center space-x-2.5 px-4 py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-medium rounded-full shadow-[0_0_25px_rgba(79,70,229,0.5)] hover:shadow-[0_0_35px_rgba(79,70,229,0.8)] border border-white/20 transition-all cursor-pointer backdrop-blur-md"
              >
                <div className="relative">
                  <Bot size={18} className="animate-bounce" style={{ animationDuration: '2.5s' }} />
                  <Sparkles size={10} className="absolute -top-1 -right-1 text-yellow-300 animate-pulse" />
                </div>
                <span className="text-xs font-semibold tracking-wide">Ask Gemini AI Copilot</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              </motion.button>
            </motion.div>
          )}
        </main>
      </div>
    </div>
  );
}

