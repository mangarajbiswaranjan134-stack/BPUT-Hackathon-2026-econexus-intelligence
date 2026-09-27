import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wind, 
  Thermometer, 
  Droplets, 
  Bell, 
  Cpu, 
  CheckCircle2, 
  AlertTriangle, 
  ChevronUp, 
  ChevronDown, 
  Zap, 
  Volume2, 
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { useAppStore } from '../../stores/appStore';
import { hardwareBridge } from '../../utils/hardwareBridge';

interface LiveHardwareRibbonProps {
  onOpenModal: () => void;
}

export default function LiveHardwareRibbon({ onOpenModal }: LiveHardwareRibbonProps) {
  const { hardwareData, updateHardwareData } = useAppStore();
  const [isExpanded, setIsExpanded] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);

  // Play audio alert using Web Audio API when water leak or buzzer triggers
  const playWebBeep = (freq = 880, duration = 0.25) => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch {
      // AudioContext may be restricted by browser gesture policy
    }
  };

  const handleQuickConnect = async () => {
    setIsConnecting(true);
    await hardwareBridge.connect(
      (packet) => {
        const isWaterDetected = typeof packet.water === 'boolean' 
          ? packet.water 
          : (packet.water === 1);

        updateHardwareData({
          aqi: packet.aqi ?? hardwareData.aqi,
          temperature: packet.temp ?? hardwareData.temperature,
          humidity: packet.humidity ?? hardwareData.humidity,
          waterDetected: isWaterDetected,
          buzzerActive: packet.buzzer ? packet.buzzer === 1 : isWaterDetected
        });

        if (isWaterDetected) {
          playWebBeep(920, 0.4);
        }
      },
      (connected, message) => {
        setIsConnecting(false);
        updateHardwareData({
          connected,
          lastUpdated: connected ? 'Just now' : hardwareData.lastUpdated
        });
      }
    );
  };

  const toggleTestBuzzer = async () => {
    const nextState = !hardwareData.buzzerActive;
    updateHardwareData({ buzzerActive: nextState });
    await hardwareBridge.sendBuzzerCommand(nextState);
    if (nextState) playWebBeep(750, 0.3);
  };

  const toggleTestWater = () => {
    const nextState = !hardwareData.waterDetected;
    updateHardwareData({ 
      waterDetected: nextState,
      buzzerActive: nextState ? true : hardwareData.buzzerActive
    });
    if (nextState) {
      playWebBeep(1000, 0.45);
      hardwareBridge.sendBuzzerCommand(true);
    } else {
      hardwareBridge.sendBuzzerCommand(false);
    }
  };

  return (
    <div className="mb-6 relative z-10">
      {/* Top Banner Control Strip */}
      <div className="flex items-center justify-between bg-gradient-to-r from-[#140b0f] via-[#1a0a10] to-[#12070b] border border-red-900/40 rounded-2xl px-4 py-2.5 shadow-[0_4px_25px_rgba(239,68,68,0.15)] backdrop-blur-md">
        
        {/* Left Status Badge */}
        <div className="flex items-center space-x-3">
          <div className="relative flex items-center justify-center">
            <span className={`w-3 h-3 rounded-full ${
              hardwareData.connected 
                ? 'bg-emerald-500 animate-ping' 
                : hardwareData.waterDetected 
                ? 'bg-red-500 animate-ping' 
                : 'bg-amber-400'
            }`} />
            <span className={`absolute w-2 h-2 rounded-full ${
              hardwareData.connected 
                ? 'bg-emerald-400' 
                : hardwareData.waterDetected 
                ? 'bg-red-500' 
                : 'bg-amber-500'
            }`} />
          </div>

          <div className="flex items-center space-x-2">
            <Cpu size={15} className="text-red-400" />
            <span className="text-xs font-black uppercase tracking-wider text-white">
              Physical IoT Telemetry Deck
            </span>
            <span className="hidden sm:inline-block text-[10px] px-2 py-0.5 rounded-full font-mono font-semibold bg-red-950/80 text-red-300 border border-red-800/40">
              {hardwareData.connected ? 'USB REAL-TIME SENSORS ACTIVE' : 'HYBRID HARDWARE / SIMULATOR READY'}
            </span>
          </div>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center space-x-2">
          {!hardwareData.connected ? (
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={handleQuickConnect}
              disabled={isConnecting}
              className="flex items-center space-x-1.5 px-3 py-1 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white rounded-lg text-xs font-bold shadow-[0_0_12px_rgba(239,68,68,0.4)] transition"
              title="Connect Arduino / ESP32 via USB Serial"
            >
              <Zap size={12} className={isConnecting ? 'animate-spin' : ''} />
              <span>{isConnecting ? 'Detecting Port...' : 'Connect USB Arduino'}</span>
            </motion.button>
          ) : (
            <span className="text-[11px] font-mono text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-500/40 px-2.5 py-1 rounded-lg flex items-center space-x-1">
              <CheckCircle2 size={12} />
              <span>9600 BAUD LIVE</span>
            </span>
          )}

          <button
            onClick={onOpenModal}
            className="text-xs font-mono text-zinc-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 px-2.5 py-1 rounded-lg transition"
            title="Open Full Hardware Hub, Circuit Schematics & Code"
          >
            Pinout & Code
          </button>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition"
            title={isExpanded ? 'Collapse HUD' : 'Expand HUD'}
          >
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {/* Expandable Live Sensor Cards */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden pt-3"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              
              {/* CARD 1: Physical AQI (MQ-135) */}
              <motion.div 
                whileHover={{ y: -2 }}
                className="bg-[#12080c]/90 border border-red-950/80 hover:border-red-600/50 rounded-xl p-3 shadow-md relative overflow-hidden transition"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-mono uppercase text-zinc-400 flex items-center space-x-1">
                    <Wind size={13} className="text-teal-400" />
                    <span>Air Quality (A0)</span>
                  </span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded font-mono ${
                    hardwareData.aqi > 200 ? 'bg-red-500/20 text-red-400 border border-red-500/40' :
                    hardwareData.aqi > 100 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' :
                    'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  }`}>
                    {hardwareData.aqi > 200 ? 'SMOKE' : hardwareData.aqi > 100 ? 'MODERATE' : 'CLEAN'}
                  </span>
                </div>
                <div className="flex items-baseline space-x-2">
                  <span className="text-2xl font-black text-white font-mono tracking-tight">
                    {hardwareData.aqi}
                  </span>
                  <span className="text-[11px] text-zinc-400 font-mono">PPM / AQI</span>
                </div>
                <div className="w-full bg-zinc-900 rounded-full h-1 mt-2 overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ${
                      hardwareData.aqi > 200 ? 'bg-red-500' :
                      hardwareData.aqi > 100 ? 'bg-amber-400' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, (hardwareData.aqi / 300) * 100)}%` }}
                  />
                </div>
              </motion.div>

              {/* CARD 2: Temperature (DHT11 / LM35) */}
              <motion.div 
                whileHover={{ y: -2 }}
                className="bg-[#12080c]/90 border border-red-950/80 hover:border-amber-600/50 rounded-xl p-3 shadow-md relative overflow-hidden transition"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-mono uppercase text-zinc-400 flex items-center space-x-1">
                    <Thermometer size={13} className="text-amber-400" />
                    <span>Thermal (D4)</span>
                  </span>
                  <span className="text-[10px] font-mono text-zinc-400 bg-zinc-900 px-1.5 py-0.5 rounded">
                    REAL-TIME
                  </span>
                </div>
                <div className="flex items-baseline space-x-2">
                  <span className="text-2xl font-black text-white font-mono tracking-tight">
                    {hardwareData.temperature.toFixed(1)}°C
                  </span>
                  <span className="text-[11px] text-zinc-400 font-mono">AMBIENT</span>
                </div>
                <p className="text-[10px] text-zinc-400 mt-1 truncate">
                  Thermal equilibrium steady
                </p>
              </motion.div>

              {/* CARD 3: Water Leak Sensor (D2 Probe) */}
              <motion.div 
                whileHover={{ y: -2 }}
                className={`rounded-xl p-3 shadow-md relative overflow-hidden transition border ${
                  hardwareData.waterDetected
                    ? 'bg-red-950/70 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.5)] animate-pulse'
                    : 'bg-[#12080c]/90 border-red-950/80 hover:border-blue-600/50'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-mono uppercase text-zinc-400 flex items-center space-x-1">
                    <Droplets size={13} className={hardwareData.waterDetected ? 'text-red-400 animate-bounce' : 'text-blue-400'} />
                    <span>Leak Probe (D2)</span>
                  </span>
                  <button
                    onClick={toggleTestWater}
                    className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-white/10 hover:bg-white/20 text-white transition"
                    title="Click to toggle simulated water drop"
                  >
                    Simulate
                  </button>
                </div>
                <div className="flex items-baseline space-x-2">
                  <span className={`text-base font-black font-mono tracking-tight ${
                    hardwareData.waterDetected ? 'text-red-400' : 'text-emerald-400'
                  }`}>
                    {hardwareData.waterDetected ? '💧 LEAK DETECTED!' : 'PROBE DRY (SAFE)'}
                  </span>
                </div>
                <p className="text-[10px] text-zinc-400 mt-1 truncate">
                  {hardwareData.waterDetected ? 'Buzzer Siren Tripped' : 'Resistance > 1MΩ Nominal'}
                </p>
              </motion.div>

              {/* CARD 4: Physical Buzzer Siren (D8) */}
              <motion.div 
                whileHover={{ y: -2 }}
                className={`rounded-xl p-3 shadow-md relative overflow-hidden transition border ${
                  hardwareData.buzzerActive
                    ? 'bg-red-950/80 border-red-400 shadow-[0_0_25px_rgba(239,68,68,0.7)] animate-pulse'
                    : 'bg-[#12080c]/90 border-red-950/80 hover:border-rose-600/50'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-mono uppercase text-zinc-400 flex items-center space-x-1">
                    <Bell size={13} className={hardwareData.buzzerActive ? 'text-red-400 animate-wiggle' : 'text-zinc-400'} />
                    <span>Siren (D8)</span>
                  </span>
                  <button
                    onClick={toggleTestBuzzer}
                    className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded font-bold transition ${
                      hardwareData.buzzerActive
                        ? 'bg-red-500 text-white'
                        : 'bg-white/10 hover:bg-white/20 text-zinc-300'
                    }`}
                  >
                    {hardwareData.buzzerActive ? 'MUTE' : 'TEST'}
                  </button>
                </div>
                <div className="flex items-baseline space-x-2">
                  <span className={`text-base font-black font-mono tracking-tight ${
                    hardwareData.buzzerActive ? 'text-red-400' : 'text-zinc-400'
                  }`}>
                    {hardwareData.buzzerActive ? '🔊 ACTIVE BEEP' : 'STANDBY IDLE'}
                  </span>
                </div>
                <p className="text-[10px] text-zinc-400 mt-1 truncate">
                  Bidirectional serial trigger
                </p>
              </motion.div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
