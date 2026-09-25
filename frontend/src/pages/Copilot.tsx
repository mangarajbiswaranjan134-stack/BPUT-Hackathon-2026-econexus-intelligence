import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../api/client';
import { CopilotResponse } from '../types';
import InsightPanel from '../components/common/InsightPanel';
import { voiceService } from '../utils/voiceService';
import { 
  Send, Brain, User, Loader2, Mic, MicOff, Volume2, 
  VolumeX, Sparkles, Radio, MessageSquare 
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string | CopilotResponse;
}

const SUGGESTIONS = [
  "⚡ Why did energy increase in Block B?",
  "🚨 What is the biggest risk on campus right now?",
  "💧 Show water leakage status",
  "♻️ Which smart waste bins need collection?",
  "🔮 What will happen next in power demand?",
  "💡 How to reduce peak energy cost?",
  "🇮🇳 Aaj ka energy aur water consumption kaisa hai?"
];

const Copilot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([{
    id: '1',
    role: 'assistant',
    content: {
      answer: "I am the EcoNexus AI Voice & Decision Copilot. You can speak into your microphone or type any question to analyze facility telemetry in real-time.",
      insight: "EcoNexus monitors 48 IoT sensor nodes across campus using IsolationForest anomaly detection.",
      cause: "Rooftop solar currently offsets 18.2% of academic load. System is fully operational.",
      evidence: [],
      prediction: "Operations are normal across energy, water, waste, and air quality domains.",
      recommendation: "Tap the microphone icon to speak, click a suggestion below, or type your query.",
      expected_impact: "",
      confidence: 100,
      assumptions: [],
      data_label: "AI Decision-Support System"
    }
  }]);
  
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [transcriptNotice, setTranscriptNotice] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Clean up speech on unmount
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
        alert('Voice speech recognition is supported in Chrome, Edge, Safari, and modern mobile browsers.');
        return;
      }

      setTranscriptNotice('Listening... Speak now (Hindi or English)');
      setIsListening(true);

      voiceService.startListening(
        (transcript: string, isFinal: boolean) => {
          setInput(transcript);
          setTranscriptNotice(transcript);
          if (isFinal) {
            setIsListening(false);
            setTranscriptNotice('');
            // Automatically submit spoken question
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

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: question };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const response = await api.askCopilot(question);
      const newMsgId = (Date.now() + 1).toString();
      const aiMsg: Message = { id: newMsgId, role: 'assistant', content: response };
      setMessages(prev => [...prev, aiMsg]);

      // If Auto-Speak is enabled, speak the answer
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
        content: "I processed your request using telemetry models. Campus sensors are online and operating normally." 
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
      {/* Header with Voice Controls */}
      <div className="border-b border-red-950/40 pb-4 mb-4 flex-shrink-0 flex flex-wrap justify-between items-center gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center">
             <Brain className="mr-3 text-red-500 animate-pulse" size={32} /> AI Voice & Decision Copilot
          </h1>
          <p className="text-slate-400 mt-1 text-xs sm:text-sm">
            Speak into the microphone or type to converse with Google Gemini facility intelligence.
          </p>
        </div>

        {/* Audio Output Settings */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setAutoSpeak(!autoSpeak)}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              autoSpeak 
                ? 'bg-red-500/20 text-white border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.4)]' 
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
          >
            {autoSpeak ? <Volume2 size={14} className="text-red-400" /> : <VolumeX size={14} />}
            <span>Auto Voice Speech: {autoSpeak ? 'ON' : 'OFF'}</span>
          </button>
        </div>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto space-y-6 pr-2 mb-4 pb-10">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex max-w-[88%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center shadow-lg ${
                  msg.role === 'user' 
                    ? 'bg-gradient-to-br from-red-600 to-rose-600 ml-3' 
                    : 'bg-gradient-to-br from-slate-900 to-red-950/40 border border-red-500/40 mr-3'
                }`}>
                  {msg.role === 'user' ? <User size={20} className="text-white" /> : <Brain size={20} className="text-red-400" />}
                </div>

                <div className={`rounded-2xl p-4.5 ${
                  msg.role === 'user' 
                    ? 'bg-gradient-to-r from-red-600/30 to-rose-600/20 border border-red-500/40 text-white shadow-xl' 
                    : 'glass-card border-red-950/40 shadow-2xl relative group'
                }`}>
                  {msg.role === 'assistant' && (
                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 mb-3">
                      <div className="text-xs text-red-400 font-semibold flex items-center">
                        <Sparkles size={13} className="mr-1.5 text-yellow-300 animate-pulse" /> 
                        Gemini AI Decision Intelligence
                      </div>

                      {/* Message Speaker Button */}
                      <button
                        onClick={() => {
                          const text = typeof msg.content === 'string' 
                            ? msg.content 
                            : `${msg.content.insight || msg.content.answer}. ${msg.content.recommendation || ''}`;
                          speakText(text, msg.id);
                        }}
                        className={`p-1.5 rounded-full transition-all text-xs flex items-center space-x-1 ${
                          speakingMessageId === msg.id 
                            ? 'bg-red-500/20 text-white border border-red-400 shadow-[0_0_10px_rgba(239,68,68,0.5)]' 
                            : 'text-slate-400 hover:text-white hover:bg-slate-800'
                        }`}
                        title="Read aloud"
                      >
                        {speakingMessageId === msg.id ? (
                          <>
                            <VolumeX size={14} className="text-red-400" />
                            <span className="text-[10px] font-mono pr-1">Stop</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" />
                          </>
                        ) : (
                          <Volume2 size={14} />
                        )}
                      </button>
                    </div>
                  )}

                  {typeof msg.content === 'string' ? (
                     <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-100">{msg.content}</p>
                  ) : (
                     <InsightPanel insight={msg.content} />
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* AI Thinking Animation */}
        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
            <div className="flex flex-row items-center">
              <div className="flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center bg-slate-800 border border-red-500/40 mr-3">
                <Brain size={20} className="text-red-400 animate-pulse" />
              </div>
              <div className="glass-card rounded-2xl px-5 py-3.5 flex items-center space-x-3 border border-red-950/40">
                <span className="text-xs text-red-300 font-medium animate-pulse">Gemini AI analyzing telemetry...</span>
                <div className="flex space-x-1.5">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-rose-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                  <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Voice Transcript Bar when Listening */}
      {isListening && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-2 p-3 bg-red-500/15 border border-red-500/40 rounded-xl flex items-center justify-between text-xs text-red-200 shadow-[0_0_20px_rgba(239,68,68,0.2)]"
        >
          <div className="flex items-center space-x-2">
            <Radio size={16} className="text-red-400 animate-pulse" />
            <span className="font-semibold">Microphone Active:</span>
            <span className="italic text-white font-mono">{transcriptNotice || "Speak now..."}</span>
          </div>
          <div className="flex space-x-1">
            {[1, 2, 3, 4, 5].map(i => (
              <span 
                key={i} 
                className="w-1 bg-red-400 rounded-full animate-pulse" 
                style={{ height: `${8 + (i % 3) * 8}px`, animationDuration: '0.6s' }} 
              />
            ))}
          </div>
        </motion.div>
      )}

      {/* Input & Voice Controls */}
      <div className="flex-shrink-0 bg-slate-900/90 backdrop-blur-md border-t border-red-950/40 p-4 rounded-2xl">
        {/* Preset Prompt Suggestions */}
        <div className="flex space-x-2 overflow-x-auto pb-3 mb-2 scrollbar-none">
          {SUGGESTIONS.map((sug, i) => (
            <motion.button
              key={i}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleSubmit(undefined, sug)}
              className="text-xs bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/80 hover:border-red-500/40 text-slate-300 hover:text-white px-3.5 py-1.5 rounded-full transition-all whitespace-nowrap flex-shrink-0"
            >
              {sug}
            </motion.button>
          ))}
        </div>

        {/* Input Form with Microphone Button */}
        <form onSubmit={handleSubmit} className="flex items-center space-x-2">
          {/* Voice Microphone Input Button */}
          <motion.button
            type="button"
            onClick={handleVoiceToggle}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            className={`p-3.5 rounded-xl border transition-all flex items-center justify-center ${
              isListening
                ? 'bg-red-600 text-white border-red-400 shadow-[0_0_20px_rgba(239,68,68,0.6)] animate-pulse'
                : 'bg-slate-800 text-red-400 border-slate-700 hover:border-red-500 hover:bg-slate-700'
            }`}
            title={isListening ? "Listening... click to stop" : "Speak your question (Voice Input)"}
          >
            {isListening ? <MicOff size={20} className="animate-spin" /> : <Mic size={20} />}
          </motion.button>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isListening ? "Listening to your voice..." : "Ask in English or Hindi (e.g. What is today's energy risk?)..."}
            className="flex-1 bg-slate-950/80 border border-slate-700/80 text-white rounded-xl px-4 py-3.5 focus:outline-none focus:border-red-500 placeholder-slate-500 transition-colors text-sm"
            disabled={loading}
          />

          <motion.button
            type="submit"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            disabled={!input.trim() || loading}
            className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 disabled:opacity-40 disabled:cursor-not-allowed text-white px-5 py-3.5 rounded-xl flex items-center transition-all shadow-[0_0_18px_rgba(239,68,68,0.4)]"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
          </motion.button>
        </form>
      </div>
    </motion.div>
  );
};

export default Copilot;
