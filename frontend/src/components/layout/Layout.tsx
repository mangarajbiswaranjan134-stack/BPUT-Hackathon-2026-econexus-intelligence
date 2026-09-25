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
    <div className="flex h-screen overflow-hidden bg-[#080507] text-white font-sans relative">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Animated background ambient light orbs - Red & White Theme */}
        <motion.div 
          animate={{
            x: [0, 30, -20, 0],
            y: [0, -30, 20, 0],
            scale: [1, 1.15, 0.95, 1],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-[-15%] left-[-10%] w-[55%] h-[55%] bg-gradient-to-br from-red-600/20 via-rose-600/10 to-transparent rounded-full blur-[140px] pointer-events-none" 
        />
        <motion.div 
          animate={{
            x: [0, -40, 25, 0],
            y: [0, 35, -25, 0],
            scale: [1, 1.2, 0.9, 1],
          }}
          transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-[-15%] right-[-10%] w-[55%] h-[55%] bg-gradient-to-tl from-white/10 via-red-500/10 to-transparent rounded-full blur-[140px] pointer-events-none" 
        />
        <motion.div 
          animate={{
            x: [0, 25, -25, 0],
            y: [0, 20, -20, 0],
            opacity: [0.3, 0.7, 0.3],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-[40%] right-[30%] w-[35%] h-[35%] bg-red-600/10 rounded-full blur-[120px] pointer-events-none" 
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
                className="flex items-center space-x-2.5 px-5 py-3.5 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white font-bold rounded-full shadow-[0_0_30px_rgba(239,68,68,0.6)] hover:shadow-[0_0_45px_rgba(255,23,68,0.9)] border-2 border-white/40 transition-all cursor-pointer backdrop-blur-md"
              >
                <div className="relative">
                  <Bot size={20} className="animate-bounce text-white" style={{ animationDuration: '2.5s' }} />
                  <Sparkles size={11} className="absolute -top-1.5 -right-1.5 text-white animate-pulse" />
                </div>
                <span className="text-xs font-black tracking-wider uppercase text-white">🎙️ Voice AI Copilot</span>
                <span className="flex space-x-0.5 items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                  <span className="w-1.5 h-1.5 rounded-full bg-red-200" />
                </span>
              </motion.button>
            </motion.div>
          )}
        </main>
      </div>
    </div>
  );
}

