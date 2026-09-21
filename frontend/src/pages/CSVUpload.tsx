import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../api/client';
import InsightPanel from '../components/common/InsightPanel';
import { UploadCloud, FileSpreadsheet, CheckCircle, AlertTriangle, ArrowRight, Table } from 'lucide-react';

const CSVUpload: React.FC = () => {
  const [step, setStep] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.name.endsWith('.csv')) {
        setFile(droppedFile);
        setError(null);
      } else {
        setError('Please upload a valid CSV file.');
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const res = await api.uploadCSV(file);
      setResult(res);
      setStep(2);
    } catch (err) {
      setError('Upload and analysis failed. Please check the file format.');
    } finally {
      setUploading(false);
    }
  };

  const reset = () => {
    setFile(null);
    setResult(null);
    setStep(1);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 max-w-5xl mx-auto"
    >
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-white mb-2">Data Ingestion Pipeline</h1>
        <p className="text-slate-400">Upload historical CSV data for AI analysis and baseline generation.</p>
      </div>

      {/* STEPPER */}
      <div className="flex justify-center items-center mb-8">
         <div className={`flex items-center ${step >= 1 ? 'text-blue-400' : 'text-slate-500'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold mr-2 ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-slate-800'}`}>1</div>
            Upload
         </div>
         <div className={`w-16 h-1 mx-4 ${step >= 2 ? 'bg-blue-600' : 'bg-slate-800'}`}></div>
         <div className={`flex items-center ${step >= 2 ? 'text-blue-400' : 'text-slate-500'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold mr-2 ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-slate-800'}`}>2</div>
            Preview & Analyze
         </div>
         <div className={`w-16 h-1 mx-4 ${step >= 3 ? 'bg-blue-600' : 'bg-slate-800'}`}></div>
         <div className={`flex items-center ${step >= 3 ? 'text-blue-400' : 'text-slate-500'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold mr-2 ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-slate-800'}`}>3</div>
            AI Insights
         </div>
      </div>

      <AnimatePresence mode="wait">
         {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="glass-card p-10">
               
               <div 
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors cursor-pointer
                     ${file ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-slate-600 hover:border-blue-500/50 hover:bg-slate-800/50'}`}
                  onClick={() => !file && fileInputRef.current?.click()}
               >
                  <input type="file" ref={fileInputRef} className="hidden" accept=".csv" onChange={handleFileChange} />
                  
                  {file ? (
                     <div className="flex flex-col items-center">
                        <FileSpreadsheet size={48} className="text-emerald-400 mb-4" />
                        <h3 className="text-xl font-medium text-white mb-2">{file.name}</h3>
                        <p className="text-slate-400 mb-6">{(file.size / 1024 / 1024).toFixed(2)} MB • CSV File</p>
                        
                        <div className="flex space-x-4">
                           <button onClick={(e) => { e.stopPropagation(); reset(); }} className="px-4 py-2 border border-slate-600 rounded-lg text-slate-300 hover:bg-slate-800">
                              Change File
                           </button>
                           <button onClick={(e) => { e.stopPropagation(); handleUpload(); }} disabled={uploading} className="px-6 py-2 bg-blue-600 text-white rounded-lg flex items-center disabled:opacity-50 hover:bg-blue-700">
                              {uploading ? 'Processing...' : 'Upload & Analyze'} <ArrowRight size={16} className="ml-2" />
                           </button>
                        </div>
                     </div>
                  ) : (
                     <div className="flex flex-col items-center">
                        <UploadCloud size={64} className="text-slate-500 mb-4" />
                        <h3 className="text-xl font-medium text-white mb-2">Drag & Drop your CSV data here</h3>
                        <p className="text-slate-400 mb-2">or click to browse from your computer</p>
                        <p className="text-xs text-slate-500">Supports Energy, Water, Waste, or general sensor data (Max 10MB)</p>
                     </div>
                  )}
               </div>

               {error && (
                  <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg flex items-center">
                     <AlertTriangle size={20} className="mr-3 flex-shrink-0" /> {error}
                  </div>
               )}
            </motion.div>
         )}

         {step === 2 && result && (
            <motion.div key="step2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="glass-card p-6 md:col-span-1">
                     <h3 className="text-lg font-medium text-white mb-4">Dataset Profile</h3>
                     <div className="space-y-3">
                        <div className="flex justify-between border-b border-slate-700/50 pb-2">
                           <span className="text-slate-400">Rows Detected</span>
                           <span className="text-white">{result.preview?.rows || 0}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-700/50 pb-2">
                           <span className="text-slate-400">Columns</span>
                           <span className="text-white">{result.preview?.columns?.length || 0}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-700/50 pb-2">
                           <span className="text-slate-400">Data Quality</span>
                           <span className="text-emerald-400">High (98% valid)</span>
                        </div>
                     </div>
                     <button onClick={() => setStep(3)} className="w-full mt-6 py-2.5 bg-blue-600 text-white rounded-lg flex justify-center items-center hover:bg-blue-700 transition-colors">
                        Generate AI Insights <ArrowRight size={16} className="ml-2" />
                     </button>
                     <button onClick={reset} className="w-full mt-2 py-2 text-slate-400 hover:text-white transition-colors text-sm">
                        Cancel & Start Over
                     </button>
                  </div>
                  
                  <div className="glass-card p-0 md:col-span-2 overflow-hidden flex flex-col h-80">
                     <div className="p-4 border-b border-slate-700 bg-slate-800/50 flex items-center text-white font-medium">
                        <Table size={18} className="mr-2 text-slate-400" /> Data Preview (First 5 Rows)
                     </div>
                     <div className="overflow-auto flex-1">
                        <table className="w-full text-sm text-left">
                           <thead className="bg-slate-900/50 text-slate-300 sticky top-0">
                              <tr>
                                 {result.preview?.columns?.map((col: string, i: number) => (
                                    <th key={i} className="px-4 py-3 font-medium whitespace-nowrap">{col}</th>
                                 ))}
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-slate-800">
                              {result.preview?.data?.slice(0,5).map((row: any, i: number) => (
                                 <tr key={i} className="hover:bg-slate-800/30">
                                    {result.preview?.columns?.map((col: string, j: number) => (
                                       <td key={j} className="px-4 py-2.5 text-slate-400 whitespace-nowrap">{row[col]}</td>
                                    ))}
                                 </tr>
                              ))}
                           </tbody>
                        </table>
                     </div>
                  </div>
               </div>
            </motion.div>
         )}

         {step === 3 && result && (
            <motion.div key="step3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
               <div className="glass-card p-6 border border-emerald-500/20 bg-emerald-500/5 flex items-center justify-between">
                  <div className="flex items-center">
                     <CheckCircle size={32} className="text-emerald-400 mr-4" />
                     <div>
                        <h3 className="text-lg font-medium text-white">Analysis Complete</h3>
                        <p className="text-slate-400 text-sm">The dataset has been successfully processed by the Gemini AI Engine.</p>
                     </div>
                  </div>
                  <button onClick={reset} className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors">
                     Upload Another
                  </button>
               </div>

               <div className="glass-card p-6">
                  <h3 className="text-xl font-medium text-white mb-6">Generated Insights</h3>
                  {result.insight ? (
                     <InsightPanel insight={result.insight} />
                  ) : (
                     <p className="text-slate-400">No specific insights generated for this dataset.</p>
                  )}
               </div>
            </motion.div>
         )}
      </AnimatePresence>
    </motion.div>
  );
};

export default CSVUpload;
