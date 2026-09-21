import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../api/client';
import { CopilotResponse } from '../types';
import InsightPanel from '../components/common/InsightPanel';
import { Send, Brain, User, Loader2 } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string | CopilotResponse;
}

const SUGGESTIONS = [
  "Why did energy increase?",
  "What is the biggest risk?",
  "What should operations do?",
  "Which area needs inspection?",
  "How can we reduce energy?",
  "Show me today's anomalies",
  "What will happen tomorrow?"
];

const Copilot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([{
    id: '1',
    role: 'assistant',
    content: {
      answer: "I am the EcoNexus AI Copilot. I analyze all facility telemetry and operational metrics in real-time.",
      insight: "I am the EcoNexus AI Copilot. Ready to answer questions about operations, anomalies, and forecasting.",
      cause: "Monitoring 10 campus buildings with IsolationForest anomaly detection.",
      evidence: [],
      prediction: "Operations are normal across energy, water, and waste domains.",
      recommendation: "Select a suggestion below or type your question.",
      expected_impact: "",
      confidence: 100,
      assumptions: [],
      data_label: "Demo Telemetry"
    }
  }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSubmit = async (e?: React.FormEvent, presetQuestion?: string) => {
    if (e) e.preventDefault();
    const question = presetQuestion || input;
    if (!question.trim() || loading) return;

    setInput('');
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: question };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const response = await api.askCopilot(question);
      const aiMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: response };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      const errorMsg: Message = { 
        id: (Date.now() + 1).toString(), 
        role: 'assistant', 
        content: "Sorry, I encountered an error processing your request. Please try again." 
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col h-[calc(100vh-8rem)]"
    >
      <div className="border-b border-slate-700/50 pb-4 mb-4 flex-shrink-0">
        <h1 className="text-3xl font-bold text-white flex items-center">
           <Brain className="mr-3 text-blue-500" size={32} /> AI Facility Copilot
        </h1>
        <p className="text-slate-400 mt-1">Ask questions about facility operations, anomalies, and recommendations.</p>
      </div>

      <div className="flex-1 overflow-y-auto space-y-6 pr-2 mb-4 pb-10">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${msg.role === 'user' ? 'bg-blue-600 ml-3' : 'bg-slate-700 mr-3'}`}>
                  {msg.role === 'user' ? <User size={20} className="text-white" /> : <Brain size={20} className="text-blue-400" />}
                </div>
                <div className={`rounded-xl p-4 ${msg.role === 'user' ? 'bg-blue-600/20 border border-blue-500/30 text-white' : 'glass-card'}`}>
                  {msg.role === 'assistant' && <div className="text-xs text-blue-400 font-semibold mb-2 flex items-center"><Brain size={14} className="mr-1"/> AI Decision-Support Insight</div>}
                  {typeof msg.content === 'string' ? (
                     <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
                  ) : (
                     <InsightPanel insight={msg.content} />
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
            <div className="flex flex-row">
              <div className="flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center bg-slate-700 mr-3">
                <Brain size={20} className="text-blue-400" />
              </div>
              <div className="glass-card rounded-xl p-4 flex items-center space-x-2">
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex-shrink-0 bg-slate-900 border-t border-slate-700 pt-4">
        <div className="flex flex-wrap gap-2 mb-4">
          {SUGGESTIONS.map((sug, i) => (
            <button
              key={i}
              onClick={() => handleSubmit(undefined, sug)}
              className="text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 px-3 py-1.5 rounded-full transition-colors whitespace-nowrap"
            >
              {sug}
            </button>
          ))}
        </div>
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about operations, anomalies, forecasts..."
            className="flex-1 bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg flex items-center transition-colors"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
          </button>
        </form>
      </div>
    </motion.div>
  );
};

export default Copilot;
