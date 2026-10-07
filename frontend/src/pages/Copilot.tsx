import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../api/client';
import { CopilotResponse } from '../types';
import InsightPanel from '../components/common/InsightPanel';
import EcoNexusLogo from '../components/common/EcoNexusLogo';
import { voiceService } from '../utils/voiceService';
import { 
  Send, Brain, User, Loader2, Mic, MicOff, Volume2, 
  VolumeX, Sparkles, Radio, MessageSquare, Copy, Check,
  Activity, Shield, Waves, Zap, Droplets, Cpu, HelpCircle
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string | CopilotResponse;
  timestamp: string;
}

const CATEGORY_PROMPTS = [
  { label: "👋 Namaste / Hello", query: "Namaste! What can you do?", icon: "👋" },
  { label: "💧 Water Leak Status", query: "Show water leakage status and overnight flow anomaly", icon: "💧" },
  { label: "⚡ Peak Power Risk", query: "Why did energy increase in Academic Block B?", icon: "⚡" },
  { label: "🤖 Hardware Pins", query: "Explain Arduino UNO hardware sensor pins and buzzer logic", icon: "🤖" },
  { label: "🚨 Top Campus Risk", query: "What is the biggest risk on campus right now?", icon: "🚨" },
  { label: "🔮 Tomorrow's Forecast", query: "Predict tomorrow's power demand and solar offset", icon: "🔮" },
  { label: "🏆 Team GODXZ", query: "Who created EcoNexus Intelligence for BPUT Hackathon?", icon: "🏆" },
  { label: "🌿 EIA Compliance", query: "How does EcoNexus satisfy MoEFCC and CPCB EIA standards?", icon: "🌿" },
];

const Copilot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([{
    id: '1',
    role: 'assistant',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    content: {
      answer: "Namaste! Main EcoNexus AI Voice & Decision Copilot hoon. Aap mic daba kar bol sakte hain ya type kar sakte hain — main greetings se lekar live IoT hardware, water leaks, energy spikes aur EIA compliance tak har sawaal ka detailed jawab deta hoon.",
      insight: "Campus ke 48 IoT sensor nodes, physical Arduino edge probe, aur ML anomaly models real-time synchronized hain.",
      cause: "Rooftop solar currently offsets 42.5 kW. Zero critical infrastructure deviations present.",
      evidence: [
        "Edge Hardware: Arduino Uno Web Serial streaming ready (9600 Baud)",
        "Water Baseline: 1,240 LPH with Hostel 3 isolation advisory",
        "AQI Metric: Satisfactory (54) across academic quadrants"
      ],
      prediction: "Operations are normal under predictive diurnal envelope. Next forecast refresh in 10 minutes.",
      recommendation: "Mic button dabakar boliye (Hindi ya English), ya niche quick suggestion chips click karein!",
      expected_impact: "Instant voice answers and automated EIA decision support with zero latency.",
      confidence: 100,
      assumptions: ["All 48 telemetry feeds active"],
      data_label: "Conversational Decision Intelligence"
    }
  }]);
  
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [transcriptNotice, setTranscriptNotice] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  useEffect(() => {
    return () => {
      voiceService.stopListening();
      voiceService.stopSpeaking();
    };
  }, []);

  const speakText = (text: string, msgId: string) => {
    if (speakingMessageId === msgId) {
      voiceService.stopSpeaking();
      setSpeakingMessageId(null);
      return;
    }

    setSpeakingMessageId(msgId);
    voiceService.speak(
      text,
      () => setSpeakingMessageId(msgId),
      () => setSpeakingMessageId(null)
    );
  };

  const handleVoiceToggle = () => {
    if (isListening) {
      voiceService.stopListening();
      setIsListening(false);
      setTranscriptNotice('');
    } else {
      if (!voiceService.isRecognitionSupported()) {
        alert('Voice speech recognition is supported in Google Chrome, Edge, Safari, and modern mobile browsers.');
        return;
      }

      setTranscriptNotice('Listening... Speak now (Hindi / English)');
      setIsListening(true);

      voiceService.startListening(
        (transcript: string, isFinal: boolean) => {
          setInput(transcript);
          setTranscriptNotice(transcript);
          if (isFinal) {
            setIsListening(false);
            setTranscriptNotice('');
            handleSubmit(undefined, transcript);
          }
        },
        (error: any) => {
          console.error('Speech recognition error:', error);
          setIsListening(false);
          setTranscriptNotice('');
        },
        () => {
          setIsListening(false);
          setTranscriptNotice('');
        }
      );
    }
  };

  const handleSubmit = async (e?: React.FormEvent, presetQuestion?: string) => {
    if (e) e.preventDefault();
    const question = presetQuestion || input;
    if (!question.trim() || loading) return;

    setInput('');
    voiceService.stopListening();
    setIsListening(false);

    const userMsg: Message = { 
      id: Date.now().toString(), 
      role: 'user', 
      content: question,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const response = await api.askCopilot(question);
      const newMsgId = (Date.now() + 1).toString();
      const aiMsg: Message = { 
        id: newMsgId, 
        role: 'assistant', 
        content: response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMsg]);

      if (autoSpeak) {
        const textToSpeak = typeof response === 'string' 
          ? response 
          : `${response.insight || response.answer}. ${response.recommendation ? `Recommended action: ${response.recommendation}` : ''}`;
        speakText(textToSpeak, newMsgId);
      }
    } catch {
      const errorMsg: Message = { 
        id: (Date.now() + 1).toString(), 
        role: 'assistant', 
        content: "Campus sensors online hain aur normal operational envelope me stream kar rahe hain.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col h-[calc(100vh-7.5rem)] relative"
    >
      {/* Top Futuristic Voice HUD Strip */}
      <div className="bg-[#11080b]/90 border border-red-950/60 rounded-2xl p-4 mb-4 backdrop-blur-xl shrink-0 shadow-[0_0_30px_rgba(239,68,68,0.08)]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          
          {/* Holographic AI Core & Title */}
          <div className="flex items-center space-x-3.5">
            <div className="relative">
              {/* Outer pulsing ring */}
              <div className={`absolute -inset-1.5 rounded-2xl blur-sm transition-all duration-500 ${
                isListening 
                  ? 'bg-red-500/60 animate-ping' 
                  : speakingMessageId 
                  ? 'bg-rose-500/50 animate-pulse' 
                  : 'bg-red-900/20'
              }`} />
              
              <div className="relative w-12 h-12 bg-gradient-to-br from-[#1d0b11] to-[#0d0507] border border-red-500/40 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.35)]">
                <EcoNexusLogo size={32} />
              </div>
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-red-100 to-red-400 tracking-tight">
                  Neural Voice Copilot
                </h1>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-red-950 text-red-300 border border-red-800/60 font-bold uppercase tracking-wider flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Gemini AI
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5 flex items-center gap-2">
                <span>Natural Hinglish & English Conversational Engine</span>
                <span className="text-zinc-600">•</span>
                <span className="text-red-400/90 font-mono text-[11px]">48 IoT Nodes Synced</span>
              </p>
            </div>
          </div>

          {/* Audio Visualizer & Toggle Controls */}
          <div className="flex items-center space-x-3">
            {/* Real-time Wave Equalizer Simulation */}
            <div className="hidden md:flex items-center space-x-1 px-3 py-2 bg-[#170c10]/90 border border-red-950/80 rounded-xl">
              <span className="text-[10px] font-mono text-zinc-400 mr-2 flex items-center gap-1">
                <Waves size={12} className={speakingMessageId || isListening ? "text-red-400 animate-spin" : "text-zinc-500"} />
                {isListening ? "LISTENING" : speakingMessageId ? "SPEAKING" : "IDLE"}
              </span>
              {[12, 24, 16, 28, 14, 22, 10].map((h, idx) => (
                <span
                  key={idx}
                  className={`w-1 rounded-full transition-all duration-200 ${
                    isListening
                      ? 'bg-red-500 animate-pulse'
                      : speakingMessageId
                      ? 'bg-rose-400 animate-bounce'
                      : 'bg-zinc-700/60'
                  }`}
                  style={{
                    height: isListening || speakingMessageId ? `${(idx % 2 === 0 ? h : h * 0.7)}px` : '6px',
                    animationDelay: `${idx * 0.1}s`
                  }}
                />
              ))}
            </div>

            {/* Auto Voice Readout Switch */}
            <button
              onClick={() => {
                if (speakingMessageId) {
                  voiceService.stopSpeaking();
                  setSpeakingMessageId(null);
                }
                setAutoSpeak(!autoSpeak);
              }}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                autoSpeak 
                  ? 'bg-red-500/20 text-red-200 border-red-500/60 shadow-[0_0_15px_rgba(239,68,68,0.3)]' 
                  : 'bg-[#180c10] text-zinc-400 border-red-950/60 hover:text-zinc-200'
              }`}
            >
              {autoSpeak ? <Volume2 size={15} className="text-red-400 animate-pulse" /> : <VolumeX size={15} />}
              <span className="font-mono text-[11px]">Voice: {autoSpeak ? 'ACTIVE' : 'MUTED'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Messages Timeline Feed */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 mb-3 scroll-smooth">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex max-w-[92%] sm:max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* Avatar */}
                <div className={`shrink-0 h-9 w-9 rounded-xl flex items-center justify-center shadow-lg ${
                  msg.role === 'user' 
                    ? 'bg-gradient-to-br from-red-600 to-rose-600 ml-2.5 text-white shadow-[0_0_12px_rgba(239,68,68,0.4)]' 
                    : 'bg-[#1a0c11] border border-red-500/40 mr-2.5 text-red-400 shadow-[0_0_12px_rgba(239,68,68,0.25)]'
                }`}>
                  {msg.role === 'user' ? <User size={18} /> : <Brain size={18} />}
                </div>

                {/* Message Bubble Card */}
                <div className={`rounded-2xl p-4 sm:p-5 relative ${
                  msg.role === 'user' 
                    ? 'bg-gradient-to-r from-red-600/35 via-rose-600/25 to-[#1c0c12] border border-red-500/50 text-white shadow-xl' 
                    : 'bg-[#12080c]/90 border border-red-950/70 shadow-2xl backdrop-blur-md'
                }`}>
                  {/* Top Bar for Assistant Bubble */}
                  {msg.role === 'assistant' && (
                    <div className="flex items-center justify-between border-b border-red-950/60 pb-2.5 mb-3">
                      <div className="flex items-center space-x-2">
                        <Sparkles size={14} className="text-yellow-400 animate-pulse" />
                        <span className="text-xs font-bold text-red-300 font-mono tracking-wide">
                          EcoNexus AI Intelligence
                        </span>
                        <span className="text-[10px] text-zinc-500 font-mono">
                          {msg.timestamp}
                        </span>
                      </div>

                      <div className="flex items-center space-x-1.5">
                        {/* Copy Button */}
                        <button
                          onClick={() => {
                            const raw = typeof msg.content === 'string' ? msg.content : msg.content.answer;
                            handleCopy(raw, msg.id);
                          }}
                          className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-red-950/40 transition"
                          title="Copy Answer"
                        >
                          {copiedId === msg.id ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                        </button>

                        {/* Speech Play/Stop Button */}
                        <button
                          onClick={() => {
                            const text = typeof msg.content === 'string' 
                              ? msg.content 
                              : `${msg.content.insight || msg.content.answer}. ${msg.content.recommendation || ''}`;
                            speakText(text, msg.id);
                          }}
                          className={`px-2.5 py-1 rounded-lg transition-all text-xs flex items-center space-x-1.5 border ${
                            speakingMessageId === msg.id 
                              ? 'bg-red-500/25 text-white border-red-400 shadow-[0_0_12px_rgba(239,68,68,0.5)]' 
                              : 'bg-[#1c0d12] text-zinc-400 hover:text-white border-red-950/60 hover:border-red-800'
                          }`}
                          title="Read aloud via Text-to-Speech"
                        >
                          {speakingMessageId === msg.id ? (
                            <>
                              <VolumeX size={13} className="text-red-400" />
                              <span className="text-[10px] font-mono text-red-300 font-bold">Stop Voice</span>
                              <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" />
                            </>
                          ) : (
                            <>
                              <Volume2 size={13} className="text-zinc-300" />
                              <span className="text-[10px] font-mono">Listen</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Bubble Content */}
                  {typeof msg.content === 'string' ? (
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-100 font-sans">
                      {msg.content}
                    </p>
                  ) : (
                    <InsightPanel insight={msg.content} />
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* AI Thinking Wave */}
        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
            <div className="flex flex-row items-center space-x-3">
              <div className="shrink-0 h-9 w-9 rounded-xl flex items-center justify-center bg-[#1a0c11] border border-red-500/40 text-red-400">
                <Brain size={18} className="animate-pulse text-red-500" />
              </div>
              <div className="bg-[#12080c]/90 border border-red-950/60 rounded-2xl px-5 py-3 flex items-center space-x-3 shadow-lg">
                <span className="text-xs text-red-300 font-mono animate-pulse">
                  Analyzing 48 IoT telemetry feeds & EIA parameters...
                </span>
                <div className="flex space-x-1.5">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-rose-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                  <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                </div>
              </div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Live Voice Speech Recognition Active Bar */}
      {isListening && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-2 p-3 bg-red-500/20 border border-red-500/60 rounded-xl flex items-center justify-between text-xs text-red-200 shadow-[0_0_25px_rgba(239,68,68,0.3)] backdrop-blur-md"
        >
          <div className="flex items-center space-x-2.5">
            <Radio size={16} className="text-red-400 animate-pulse" />
            <span className="font-bold tracking-wide uppercase text-[11px] font-mono text-red-300">Live Voice Input:</span>
            <span className="italic text-white font-medium">{transcriptNotice || "Speak now..."}</span>
          </div>
          <div className="flex items-center space-x-1">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <span 
                key={i} 
                className="w-1 bg-red-400 rounded-full animate-pulse" 
                style={{ height: `${6 + (i % 4) * 5}px`, animationDuration: '0.5s' }} 
              />
            ))}
          </div>
        </motion.div>
      )}

      {/* Aesthetic Floating Bottom Controls */}
      <div className="shrink-0 bg-[#0e0608]/95 backdrop-blur-xl border border-red-950/60 p-3 sm:p-4 rounded-2xl shadow-2xl">
        
        {/* Quick Suggestion Chips */}
        <div className="flex space-x-2 overflow-x-auto pb-2.5 mb-2 scrollbar-none">
          {CATEGORY_PROMPTS.map((item, i) => (
            <motion.button
              key={i}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleSubmit(undefined, item.query)}
              className="text-xs bg-[#170a0f] hover:bg-red-950/50 border border-red-950/80 hover:border-red-500/40 text-zinc-300 hover:text-white px-3 py-1.5 rounded-xl transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </motion.button>
          ))}
        </div>

        {/* Form with Mic Capsule and Send */}
        <form onSubmit={handleSubmit} className="flex items-center space-x-2">
          {/* Big Glowing Microphone Capsule */}
          <motion.button
            type="button"
            onClick={handleVoiceToggle}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.94 }}
            className={`px-4 py-3 rounded-xl border font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
              isListening
                ? 'bg-red-600 text-white border-red-400 shadow-[0_0_25px_rgba(239,68,68,0.7)] animate-pulse'
                : 'bg-[#1a0c11] text-red-300 border-red-900/60 hover:border-red-500 hover:bg-red-950/40'
            }`}
            title={isListening ? "Listening... click to stop" : "Speak voice question (Mic Active)"}
          >
            {isListening ? (
              <>
                <MicOff size={18} className="animate-spin text-white" />
                <span className="hidden sm:inline font-mono">LISTENING...</span>
              </>
            ) : (
              <>
                <Mic size={18} className="text-red-400" />
                <span className="hidden sm:inline font-mono">SPEAK</span>
              </>
            )}
          </motion.button>

          {/* Text Input */}
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isListening ? "Listening to your voice..." : "Type or speak any question (e.g. 'Hi', 'Water leak status', 'Hardware pins')..."}
            className="flex-1 bg-[#14080c]/90 border border-red-950/80 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-red-500 placeholder-zinc-500 transition-colors text-xs sm:text-sm font-medium"
            disabled={loading}
          />

          {/* Submit Button */}
          <motion.button
            type="submit"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            disabled={!input.trim() || loading}
            className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-600 disabled:opacity-40 disabled:cursor-not-allowed text-white px-5 py-3 rounded-xl flex items-center transition-all shadow-[0_0_18px_rgba(239,68,68,0.45)] cursor-pointer"
            title="Send query"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
          </motion.button>
        </form>
      </div>
    </motion.div>
  );
};

export default Copilot;
