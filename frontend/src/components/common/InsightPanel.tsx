import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, Info, Target, AlertTriangle, TrendingUp, Volume2, VolumeX } from 'lucide-react';
import { CopilotResponse } from '../../types';
import { voiceService } from '../../utils/voiceService';

interface InsightPanelProps {
  insight: Partial<CopilotResponse> & { insight: string; cause?: string; evidence?: string[]; prediction?: string; recommendation?: string; expected_impact?: string; confidence?: number; assumptions?: string[] };
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  show: { opacity: 1, x: 0 }
};

export default function InsightPanel({ insight }: InsightPanelProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    return () => {
      voiceService.stopSpeaking();
    };
  }, []);

  const toggleSpeak = () => {
    if (isSpeaking) {
      voiceService.stopSpeaking();
      setIsSpeaking(false);
    } else {
      const textToRead = `${insight.insight || insight.answer}. ${insight.cause ? `Root cause: ${insight.cause}` : ''}. ${insight.recommendation ? `Recommended action: ${insight.recommendation}` : ''}`;
      voiceService.speak(
        textToRead,
        () => setIsSpeaking(true),
        () => setIsSpeaking(false)
      );
    }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="glass-card p-5 border-blue-500/30 bg-gradient-to-br from-slate-800/80 to-blue-900/10 relative overflow-hidden"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-blue-500/20 rounded-md">
            <Lightbulb size={18} className="text-blue-400" />
          </div>
          <h3 className="text-sm font-semibold text-blue-100 uppercase tracking-wider">AI Decision-Support Insight</h3>
        </div>

        {voiceService.isSynthSupported() && (
          <button
            onClick={toggleSpeak}
            className={`flex items-center space-x-1.5 text-xs px-2.5 py-1 rounded-full border transition-all ${
              isSpeaking
                ? 'bg-blue-600/30 text-blue-300 border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.4)]'
                : 'bg-slate-800/60 text-slate-400 border-slate-700 hover:text-white hover:border-slate-600'
            }`}
          >
            {isSpeaking ? (
              <>
                <VolumeX size={14} className="text-blue-400" />
                <span className="font-semibold text-blue-300">Stop Voice</span>
                <span className="flex space-x-0.5 ml-1">
                  <span className="w-1 h-3 bg-blue-400 animate-pulse rounded-full" />
                  <span className="w-1 h-3 bg-cyan-400 animate-pulse rounded-full" style={{ animationDelay: '0.15s' }} />
                  <span className="w-1 h-3 bg-purple-400 animate-pulse rounded-full" style={{ animationDelay: '0.3s' }} />
                </span>
              </>
            ) : (
              <>
                <Volume2 size={14} />
                <span>Read Aloud</span>
              </>
            )}
          </button>
        )}
      </div>

      
      <motion.div variants={itemVariants} className="mb-4">
        <p className="text-slate-200 font-medium leading-relaxed">{insight.insight || insight.answer}</p>
      </motion.div>

      {insight.cause && (
        <motion.div variants={itemVariants} className="mb-3 flex items-start space-x-2">
          <Info size={16} className="text-amber-400 mt-0.5 shrink-0" />
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase">Root Cause Analysis</span>
            <p className="text-sm text-slate-300">{insight.cause}</p>
          </div>
        </motion.div>
      )}

      {insight.evidence && insight.evidence.length > 0 && (
        <motion.div variants={itemVariants} className="mb-4 pl-6">
          <ul className="list-disc text-sm text-slate-400 space-y-1">
            {insight.evidence.map((ev, i) => <li key={i}>{ev}</li>)}
          </ul>
        </motion.div>
      )}

      {insight.prediction && (
        <motion.div variants={itemVariants} className="mb-3 flex items-start space-x-2">
          <TrendingUp size={16} className="text-purple-400 mt-0.5 shrink-0" />
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase">Forecast</span>
            <p className="text-sm text-slate-300">{insight.prediction}</p>
          </div>
        </motion.div>
      )}

      {insight.recommendation && (
        <motion.div variants={itemVariants} className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
          <div className="flex items-start space-x-2">
            <Target size={18} className="text-emerald-400 mt-0.5 shrink-0" />
            <div>
              <span className="text-xs font-semibold text-emerald-400 uppercase">Recommended Action</span>
              <p className="text-sm text-emerald-100 mt-1">{insight.recommendation}</p>
              {insight.expected_impact && (
                <p className="text-xs text-emerald-300 mt-2 font-medium">Expected Impact: {insight.expected_impact}</p>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {(insight.confidence || insight.assumptions?.length) && (
        <motion.div variants={itemVariants} className="mt-5 pt-4 border-t border-slate-700/50 flex flex-col space-y-3">
          {insight.confidence && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">AI Confidence Score</span>
              <div className="flex items-center space-x-2">
                <div className="w-32 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 rounded-full" 
                    style={{ width: `${insight.confidence}%` }}
                  />
                </div>
                <span className="font-mono text-blue-400">{insight.confidence}%</span>
              </div>
            </div>
          )}
          {insight.assumptions && insight.assumptions.length > 0 && (
            <div className="flex items-start space-x-1.5 text-[11px] text-slate-500 italic">
              <AlertTriangle size={12} className="mt-0.5 shrink-0" />
              <span>Assumptions: {insight.assumptions.join('; ')}</span>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
