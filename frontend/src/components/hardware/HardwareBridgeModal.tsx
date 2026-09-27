import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Cpu, X, CheckCircle, AlertTriangle, Radio, Droplets, 
  Wind, Thermometer, Bell, Copy, Check, Terminal, ExternalLink, Zap
} from 'lucide-react';
import { useAppStore } from '../../stores/appStore';
import { hardwareBridge, SensorPacket } from '../../utils/hardwareBridge';

interface HardwareBridgeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HardwareBridgeModal({ isOpen, onClose }: HardwareBridgeModalProps) {
  const { hardwareData, setHardwareData, addNotification } = useAppStore();
  const [connecting, setConnecting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [activeTab, setActiveTab] = useState<'live' | 'pinout' | 'code'>('live');

  const handleConnectUSB = async () => {
    setConnecting(true);
    setStatusMessage('Select your Arduino / ESP32 COM port in the browser popup...');

    const ok = await hardwareBridge.connect(
      (packet: SensorPacket) => {
        const isLeak = packet.water === 1;
        setHardwareData({
          connected: true,
          aqi: packet.aqi,
          temperature: packet.temp,
          waterDetected: isLeak,
          lastUpdated: new Date().toLocaleTimeString()
        });

        // Trigger notification on real physical leak
        if (isLeak && !hardwareData.waterDetected) {
          addNotification({
            id: Date.now().toString(),
            type: 'critical',
            title: '🚨 HARDWARE ALERT: Physical Water Leak Detected',
            message: 'Sensor probe on Pin D2 detected water overflow! Physical alarm buzzer triggered.',
            timestamp: new Date().toISOString(),
            read: false
          });
        }
      },
      (connected: boolean, msg?: string) => {
        setHardwareData({ connected });
        setStatusMessage(msg || (connected ? 'Hardware connected!' : 'Disconnected'));
        setConnecting(false);
      }
    );

    if (!ok) {
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    await hardwareBridge.disconnect();
    setHardwareData({ connected: false });
  };

  const handleTestBuzzer = async () => {
    const nextState = !hardwareData.buzzerActive;
    setHardwareData({ buzzerActive: nextState });
    await hardwareBridge.sendBuzzerCommand(nextState);

    setTimeout(async () => {
      setHardwareData({ buzzerActive: false });
      await hardwareBridge.sendBuzzerCommand(false);
    }, 2000);
  };

  // Simulate hardware toggle for testing
  const toggleSimulatedLeak = () => {
    const next = !hardwareData.waterDetected;
    setHardwareData({ waterDetected: next });
    if (next) {
      handleTestBuzzer();
      addNotification({
        id: Date.now().toString(),
        type: 'critical',
        title: '🚨 HARDWARE ALERT: Water Leak Detected',
        message: 'Water probe triggered on Digital Pin D2. Buzzer sounding!',
        timestamp: new Date().toISOString(),
        read: false
      });
    }
  };

  const arduinoCodeSnippet = `// EcoNexus IoT Hardware Sensor Firmware
#define PIN_AQI_ANALOG    A0
#define PIN_WATER_SENSOR  2
#define PIN_BUZZER        8

void setup() {
  Serial.begin(9600);
  pinMode(PIN_WATER_SENSOR, INPUT_PULLUP);
  pinMode(PIN_BUZZER, OUTPUT);
}

void loop() {
  int aqi = map(analogRead(PIN_AQI_ANALOG), 50, 850, 30, 450);
  int waterLeak = (digitalRead(PIN_WATER_SENSOR) == LOW) ? 1 : 0;
  float temp = 28.5; // or read from DHT11 on Pin 4

  // Output JSON for Browser Web Serial:
  Serial.print("{\\"aqi\\":"); Serial.print(aqi);
  Serial.print(",\\"temp\\":"); Serial.print(temp);
  Serial.print(",\\"water\\":"); Serial.print(waterLeak);
  Serial.println("}");

  if (waterLeak == 1) {
    digitalWrite(PIN_BUZZER, HIGH); delay(200);
    digitalWrite(PIN_BUZZER, LOW);  delay(200);
  } else {
    delay(1000);
  }
}`;

  const copyCode = () => {
    navigator.clipboard.writeText(arduinoCodeSnippet);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="w-full max-w-2xl bg-[#0c0709] border border-red-900/60 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-5 border-b border-red-950/60 flex justify-between items-center bg-[#130b0e]">
            <div className="flex items-center space-x-3">
              <span className="p-2.5 bg-red-600/20 text-red-400 border border-red-500/40 rounded-2xl shadow-[0_0_15px_rgba(239,68,68,0.3)]">
                <Cpu size={22} className="animate-pulse" />
              </span>
              <div>
                <h2 className="text-lg font-black text-white flex items-center">
                  Live IoT Hardware Bridge & Sensors
                </h2>
                <p className="text-xs text-slate-400">Connect real Arduino / ESP32 sensors (AQI, Buzzer, Water Leak, Temp)</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/5 transition"
            >
              <X size={18} />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-red-950/40 bg-slate-950/60 px-5 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('live')}
              className={`py-3 px-4 border-b-2 transition-colors ${
                activeTab === 'live' ? 'border-red-500 text-white' : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              📡 Live Telemetry & Controls
            </button>
            <button
              onClick={() => setActiveTab('pinout')}
              className={`py-3 px-4 border-b-2 transition-colors ${
                activeTab === 'pinout' ? 'border-red-500 text-white' : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              🔌 Sensor Pin Connections
            </button>
            <button
              onClick={() => setActiveTab('code')}
              className={`py-3 px-4 border-b-2 transition-colors ${
                activeTab === 'code' ? 'border-red-500 text-white' : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              💻 Arduino / ESP32 Code
            </button>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto space-y-6">
            {activeTab === 'live' && (
              <>
                {/* Connection Status Card */}
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-red-950/60 flex flex-wrap justify-between items-center gap-4">
                  <div className="flex items-center space-x-3">
                    <span className={`w-3.5 h-3.5 rounded-full relative flex items-center justify-center ${
                      hardwareData.connected ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.8)]' : 'bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.8)]'
                    }`}>
                      <span className="w-full h-full rounded-full animate-ping opacity-75 bg-current" />
                    </span>
                    <div>
                      <div className="text-sm font-bold text-white flex items-center">
                        {hardwareData.connected ? 'Physical Hardware Connected' : 'Hardware Idle / Disconnected'}
                      </div>
                      <div className="text-xs text-slate-400">
                        {statusMessage || 'Click button on right to connect via USB Serial (Web Serial API)'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {hardwareData.connected ? (
                      <button
                        onClick={handleDisconnect}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition"
                      >
                        Disconnect
                      </button>
                    ) : (
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={handleConnectUSB}
                        disabled={connecting}
                        className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white rounded-xl text-xs font-bold transition shadow-[0_0_15px_rgba(239,68,68,0.4)] disabled:opacity-50"
                      >
                        {connecting ? 'Waiting for Port...' : '🔌 Connect USB Arduino'}
                      </motion.button>
                    )}
                  </div>
                </div>

                {/* Real-time Hardware Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                  {/* AQI Sensor */}
                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[11px] font-bold uppercase text-slate-400">Physical AQI</span>
                      <Wind size={16} className={hardwareData.aqi > 150 ? 'text-red-400 animate-pulse' : 'text-emerald-400'} />
                    </div>
                    <div className="text-2xl font-black text-white font-mono">
                      {hardwareData.aqi}
                    </div>
                    <span className={`text-[10px] font-semibold mt-1 block ${
                      hardwareData.aqi > 200 ? 'text-red-400' : hardwareData.aqi > 100 ? 'text-amber-400' : 'text-emerald-400'
                    }`}>
                      {hardwareData.aqi > 200 ? 'Hazardous Smoke' : hardwareData.aqi > 100 ? 'Moderate VOC' : 'Clean Ambient Air'}
                    </span>
                  </div>

                  {/* Temperature Sensor */}
                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[11px] font-bold uppercase text-slate-400">Temperature</span>
                      <Thermometer size={16} className="text-amber-400" />
                    </div>
                    <div className="text-2xl font-black text-white font-mono">
                      {hardwareData.temperature.toFixed(1)}°C
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 block">DHT Sensor Input</span>
                  </div>

                  {/* Water Leak Detector */}
                  <div className={`p-4 rounded-2xl border transition-all ${
                    hardwareData.waterDetected
                      ? 'bg-red-950/50 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.5)]'
                      : 'bg-slate-950/80 border-slate-800'
                  }`}>
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[11px] font-bold uppercase text-slate-400">Water Sensor</span>
                      <Droplets size={16} className={hardwareData.waterDetected ? 'text-red-400 animate-bounce' : 'text-blue-400'} />
                    </div>
                    <div className="text-xl font-black font-mono">
                      {hardwareData.waterDetected ? (
                        <span className="text-red-400">LEAK DETECTED</span>
                      ) : (
                        <span className="text-emerald-400">PROBE DRY</span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 block">Pin D2 Probe</span>
                  </div>

                  {/* Buzzer Output */}
                  <div className={`p-4 rounded-2xl border transition-all ${
                    hardwareData.buzzerActive
                      ? 'bg-red-950/60 border-red-400 shadow-[0_0_20px_rgba(239,68,68,0.6)] animate-pulse'
                      : 'bg-slate-950/80 border-slate-800'
                  }`}>
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[11px] font-bold uppercase text-slate-400">Buzzer Siren</span>
                      <Bell size={16} className={hardwareData.buzzerActive ? 'text-red-400' : 'text-slate-400'} />
                    </div>
                    <div className="text-xl font-black font-mono">
                      {hardwareData.buzzerActive ? (
                        <span className="text-red-400">BEEPING!</span>
                      ) : (
                        <span className="text-slate-400">SILENT</span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 block">Pin D8 Output</span>
                  </div>
                </div>

                {/* Quick Interactive Actions */}
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-red-950/40 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h4 className="text-xs font-bold text-white mb-0.5">Hardware Verification & Demo Triggers</h4>
                    <p className="text-[11px] text-slate-400">Test buzzer and simulate sensor drop for judge presentations</p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={toggleSimulatedLeak}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition ${
                        hardwareData.waterDetected 
                          ? 'bg-red-600 text-white border-red-400' 
                          : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
                      }`}
                    >
                      {hardwareData.waterDetected ? 'Reset Water Probe' : '💧 Trigger Water Leak Event'}
                    </button>

                    <button
                      onClick={handleTestBuzzer}
                      className="px-3.5 py-2 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl text-xs font-bold shadow-[0_0_12px_rgba(239,68,68,0.3)] hover:opacity-95"
                    >
                      🔊 Test Physical Buzzer
                    </button>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'pinout' && (
              <div className="space-y-4">
                <div className="p-4 bg-slate-950/80 rounded-2xl border border-red-950/60 text-xs">
                  <h3 className="font-bold text-white text-sm mb-2 flex items-center">
                    <Cpu size={16} className="mr-2 text-red-400" /> Physical Circuit Wiring Guide
                  </h3>
                  <p className="text-slate-400 mb-4">Connect your sensors to Arduino Uno / Nano / ESP32 exactly as follows:</p>

                  <div className="space-y-3 font-mono text-xs">
                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex justify-between items-center">
                      <div>
                        <span className="text-white font-bold block">1. MQ-135 Air Quality Sensor</span>
                        <span className="text-slate-400 text-[11px]">VCC to 5V, GND to GND, AOUT to Analog Pin A0</span>
                      </div>
                      <span className="text-yellow-400 font-bold px-2.5 py-1 bg-yellow-500/10 rounded-lg border border-yellow-500/30">PIN A0</span>
                    </div>

                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex justify-between items-center">
                      <div>
                        <span className="text-white font-bold block">2. Water Detection / Rain Probe</span>
                        <span className="text-slate-400 text-[11px]">VCC to 5V, GND to GND, DOUT to Digital Pin 2</span>
                      </div>
                      <span className="text-blue-400 font-bold px-2.5 py-1 bg-blue-500/10 rounded-lg border border-blue-500/30">PIN D2</span>
                    </div>

                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex justify-between items-center">
                      <div>
                        <span className="text-white font-bold block">3. DHT11 / DHT22 Temperature Sensor</span>
                        <span className="text-slate-400 text-[11px]">VCC to 5V, GND to GND, DATA to Digital Pin 4</span>
                      </div>
                      <span className="text-emerald-400 font-bold px-2.5 py-1 bg-emerald-500/10 rounded-lg border border-emerald-500/30">PIN D4</span>
                    </div>

                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex justify-between items-center">
                      <div>
                        <span className="text-white font-bold block">4. Active Buzzer Alarm</span>
                        <span className="text-slate-400 text-[11px]">Positive (+) to Digital Pin 8, Negative (-) to GND</span>
                      </div>
                      <span className="text-red-400 font-bold px-2.5 py-1 bg-red-500/10 rounded-lg border border-red-500/30">PIN D8</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'code' && (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-slate-300 flex items-center">
                    <Terminal size={14} className="mr-1.5 text-red-400" /> econexus_sensors.ino (Flash via Arduino IDE)
                  </span>
                  <button
                    onClick={copyCode}
                    className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-mono transition"
                  >
                    {copiedCode ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                    <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
                  </button>
                </div>

                <pre className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-[11px] font-mono text-emerald-400/90 overflow-x-auto max-h-72">
                  {arduinoCodeSnippet}
                </pre>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
