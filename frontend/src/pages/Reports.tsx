import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { api } from '../api/client';
import { format } from 'date-fns';
import { SustainabilityScore } from '../types';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import GaugeChart from '../components/charts/GaugeChart';
import { FileText, Download, AlertTriangle, RefreshCw, CheckCircle } from 'lucide-react';

const Reports: React.FC = () => {
  const [report, setReport] = useState<any>(null);
  const [sustainability, setSustainability] = useState<SustainabilityScore | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const [reportData, susData] = await Promise.all([
        api.generateReport(),
        api.getSustainabilityScore()
      ]);
      setReport(reportData);
      setSustainability(susData);
      setError(null);
    } catch (err) {
      setError('Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    await fetchReport();
    setGenerating(false);
  };

  const handleDownload = () => {
    if (!report) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(report, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `EcoNexus_Report_${format(new Date(), 'yyyy-MM-dd')}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  if (loading && !report) return <LoadingSkeleton lines={8} />;

  if (error && !report) return (
    <div className="flex flex-col items-center justify-center h-full text-red-400">
      <AlertTriangle size={48} className="mb-4" />
      <p>{error}</p>
      <button onClick={fetchReport} className="mt-4 px-4 py-2 bg-slate-800 rounded hover:bg-slate-700">Retry</button>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 pb-12"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-slate-700/50 pb-4 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center">
             <FileText className="mr-3 text-blue-500" /> Facility Intelligence Report
          </h1>
          <p className="text-slate-400 mt-1">
            Generated: {format(new Date(), 'PPpp')} &bull; {report?.metadata?.facility_name || 'Facility'} ({report?.metadata?.location})
          </p>
        </div>
        <div className="flex space-x-3">
           <button 
             onClick={handleGenerate}
             disabled={generating}
             className="flex items-center px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors disabled:opacity-50"
           >
             <RefreshCw size={16} className={`mr-2 ${generating ? 'animate-spin' : ''}`} /> Re-Generate
           </button>
           <button 
             onClick={handleDownload}
             className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
           >
             <Download size={16} className="mr-2" /> Export JSON
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* LEFT COL - SCORE */}
         <div className="lg:col-span-1 space-y-6">
            <div className="glass-card p-6 flex flex-col items-center">
               <h3 className="text-lg font-medium text-white mb-6 w-full text-center">Overall Sustainability</h3>
               <div className="h-44 w-44 mb-6">
                  <GaugeChart value={sustainability?.overall || 0} max={100} size="md" />
               </div>
               <div className="w-full space-y-3">
                  {sustainability?.factors?.map((f, i) => (
                     <div key={i} className="flex flex-col">
                        <div className="flex justify-between text-xs mb-1">
                           <span className="text-slate-300">{f.name} ({(f.weight * 100)}%)</span>
                           <span className="text-white font-medium font-mono">{f.score}/100</span>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-1.5">
                           <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${Math.min(100, f.score)}%` }} />
                        </div>
                     </div>
                  ))}
               </div>
            </div>

            <div className="glass-card p-6">
               <h3 className="text-lg font-medium text-white mb-4">Summary Statistics</h3>
               <div className="space-y-3 text-sm">
                  <div className="flex justify-between border-b border-slate-700/50 pb-2">
                     <span className="text-slate-400">Total Anomalies</span>
                     <span className="text-white font-medium font-mono">{report?.anomalies?.total || 0}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-700/50 pb-2">
                     <span className="text-slate-400">Critical Anomalies</span>
                     <span className="text-red-400 font-medium font-mono">{report?.anomalies?.critical || 0}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-700/50 pb-2">
                     <span className="text-slate-400">High Severity</span>
                     <span className="text-orange-400 font-medium font-mono">{report?.anomalies?.high || 0}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-700/50 pb-2">
                     <span className="text-slate-400">AI Actions Recommended</span>
                     <span className="text-blue-400 font-medium font-mono">{report?.actions?.total || 0}</span>
                  </div>
               </div>
            </div>
         </div>

         {/* RIGHT COL - DETAILS */}
         <div className="lg:col-span-2 space-y-6">
            <div className="glass-card p-6">
               <h3 className="text-lg font-medium text-white mb-3 text-blue-400 border-b border-slate-700/50 pb-2">Executive Summary</h3>
               <p className="text-slate-300 leading-relaxed text-sm">
                 Facility operating with overall Sustainability Score of <span className="text-emerald-400 font-bold">{sustainability?.overall?.toFixed(1)}/100</span>.
                 {report?.anomalies?.total > 0
                   ? ` AI models detected ${report.anomalies.total} anomalies across energy, water, and environmental domains.`
                   : ' All monitored systems operating within expected baselines.'}
                 {report?.actions?.total > 0
                   ? ` ${report.actions.total} high-priority recommendations are queued for facility operations.`
                   : ''}
               </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <ReportSection title="Energy Profile" data={report?.energy} icon="⚡" />
               <ReportSection title="Water Usage" data={report?.water} icon="💧" />
               <ReportSection title="Waste Management" data={report?.waste} icon="♻️" />
               <ReportSection title="Air Quality & Safety" data={{ ...report?.air_quality, ...report?.safety }} icon="🛡️" />
            </div>

            <div className="glass-card p-6">
               <h3 className="text-lg font-medium text-white mb-4 text-emerald-400 border-b border-slate-700/50 pb-2 flex items-center">
                  <CheckCircle size={18} className="mr-2" /> Action Center Recommendations
               </h3>
               <ul className="space-y-3">
                  {report?.actions?.items?.slice(0, 5).map((rec: any, idx: number) => (
                     <li key={idx} className="flex items-start text-sm">
                        <span className="text-blue-500 mr-2 mt-0.5">•</span>
                        <div>
                           <span className="text-slate-200 font-medium block">{rec.what}</span>
                           <span className="text-slate-400 text-xs block mt-0.5">{rec.why} &bull; <span className="text-emerald-400">{rec.expected_impact}</span></span>
                        </div>
                     </li>
                  ))}
               </ul>
            </div>
         </div>
      </div>
    </motion.div>
  );
};

const ReportSection = ({ title, data, icon }: { title: string, data: any, icon: string }) => {
   if (!data) return null;
   return (
      <div className="glass-card p-5 bg-slate-800/30">
         <h4 className="text-md font-medium text-white mb-3 flex items-center">{icon} {title}</h4>
         <div className="space-y-2 text-sm">
            {Object.entries(data).map(([key, val], idx) => {
               if (typeof val === 'object' || Array.isArray(val)) return null;
               const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').replace(/^./, str => str.toUpperCase());
               return (
                  <div key={idx} className="flex justify-between text-xs">
                     <span className="text-slate-400">{formattedKey}</span>
                     <span className="text-slate-200 font-mono font-medium">{String(val)}</span>
                  </div>
               );
            })}
         </div>
      </div>
   );
};

export default Reports;
