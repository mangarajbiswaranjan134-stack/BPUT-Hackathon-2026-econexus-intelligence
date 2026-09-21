import React, { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Sidebar from './Sidebar';
import Header from './Header';
import LoadingSkeleton from '../common/LoadingSkeleton';

export default function Layout() {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-950 text-slate-200 font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Background glow effects */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />
        
        <Header />
        
        <main className="flex-1 overflow-y-auto p-6 z-0">
          <Suspense fallback={<LoadingSkeleton className="w-full h-full min-h-[500px]" />}>
            <AnimatePresence mode="wait">
              <Outlet />
            </AnimatePresence>
          </Suspense>
        </main>
      </div>
    </div>
  );
}
