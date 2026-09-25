import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import LoadingSkeleton from './components/common/LoadingSkeleton';

// Lazy load all pages for code splitting
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Energy = lazy(() => import('./pages/Energy'));
const Water = lazy(() => import('./pages/Water'));
const Waste = lazy(() => import('./pages/Waste'));
const AirQuality = lazy(() => import('./pages/AirQuality'));
const Traffic = lazy(() => import('./pages/Traffic'));
const Assets = lazy(() => import('./pages/Assets'));
const Safety = lazy(() => import('./pages/Safety'));
const Biodiversity = lazy(() => import('./pages/Biodiversity'));
const SoilLand = lazy(() => import('./pages/SoilLand'));
const Noise = lazy(() => import('./pages/Noise'));
const Community = lazy(() => import('./pages/Community'));
const DisasterRisk = lazy(() => import('./pages/DisasterRisk'));
const Copilot = lazy(() => import('./pages/Copilot'));
const Scenarios = lazy(() => import('./pages/Scenarios'));
const Actions = lazy(() => import('./pages/Actions'));
const Reports = lazy(() => import('./pages/Reports'));
const CSVUpload = lazy(() => import('./pages/CSVUpload'));
const Settings = lazy(() => import('./pages/Settings'));

function App() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen bg-slate-950">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading EcoNexus Intelligence...</p>
        </div>
      </div>
    }>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="energy" element={<Energy />} />
          <Route path="water" element={<Water />} />
          <Route path="waste" element={<Waste />} />
          <Route path="air-quality" element={<AirQuality />} />
          <Route path="traffic" element={<Traffic />} />
          <Route path="assets" element={<Assets />} />
          <Route path="safety" element={<Safety />} />
          <Route path="biodiversity" element={<Biodiversity />} />
          <Route path="land-soil" element={<SoilLand />} />
          <Route path="noise" element={<Noise />} />
          <Route path="community" element={<Community />} />
          <Route path="disaster-risk" element={<DisasterRisk />} />
          <Route path="copilot" element={<Copilot />} />
          <Route path="scenarios" element={<Scenarios />} />
          <Route path="actions" element={<Actions />} />
          <Route path="reports" element={<Reports />} />
          <Route path="csv-upload" element={<CSVUpload />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default App;
