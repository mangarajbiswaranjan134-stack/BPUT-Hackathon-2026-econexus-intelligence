// Web Speech API Voice Service for EcoNexus Intelligence
// Supports Speech-to-Text (Voice input) and Text-to-Speech (Voice output)
// Works 100% free, offline-ready, in all modern browsers without API keys!

class VoiceService {
  private recognition: any = null;
  private isListeningState: boolean = false;
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      // Speech Synthesis (Text to Speech)
      if ('speechSynthesis' in window) {
        this.synth = window.speechSynthesis;
      }

      // Speech Recognition (Speech to Text)
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-IN'; // Indian English / Hinglish friendly
      }
    }
  }

  // Check support
  public isSpeechSupported(): boolean {
    return !!(this.recognition || this.synth);
  }

  public isRecognitionSupported(): boolean {
    return !!this.recognition;
  }

  public isSynthSupported(): boolean {
    return !!this.synth;
  }

  // Speech Recognition (Mic listening)
  public startListening(
    onResult: (transcript: string, isFinal: boolean) => void,
    onError?: (error: any) => void,
    onEnd?: () => void
  ) {
    if (!this.recognition) {
      if (onError) onError('Speech recognition not supported in this browser.');
      return;
    }

    if (this.isListeningState) {
      this.stopListening();
    }

    // Stop any ongoing speech
    this.stopSpeaking();

    this.isListeningState = true;

    this.recognition.onresult = (event: any) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }

      const text = final || interim;
      const isFinal = !!final;
      onResult(text, isFinal);
    };

    this.recognition.onerror = (event: any) => {
      this.isListeningState = false;
      if (onError) onError(event.error);
    };

    this.recognition.onend = () => {
      this.isListeningState = false;
      if (onEnd) onEnd();
    };

    try {
      this.recognition.start();
    } catch (e) {
      this.isListeningState = false;
      if (onError) onError(e);
    }
  }

  public stopListening() {
    if (this.recognition && this.isListeningState) {
      try {
        this.recognition.stop();
      } catch { /* ignore */ }
    }
    this.isListeningState = false;
  }

  public isListening(): boolean {
    return this.isListeningState;
  }

  // Text to Speech (Audio voice output)
  public speak(text: string, onStart?: () => void, onEnd?: () => void): boolean {
    if (!this.synth) return false;

    // Stop any current speech
    this.stopSpeaking();

    // Clean markdown and technical punctuation for natural audio playback
    const cleanText = text
      .replace(/[#*_`~>\[\]()]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleanText) return false;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    this.currentUtterance = utterance;

    // Pick best English / natural voice
    const voices = this.synth.getVoices();
    const naturalVoice = voices.find(v => (v.lang.includes('en-IN') || v.lang.includes('en-US')) && !v.name.includes('Google')) || voices[0];
    if (naturalVoice) {
      utterance.voice = naturalVoice;
    }

    utterance.rate = 1.05; // Slightly brisk, clear pace
    utterance.pitch = 1.0;

    if (onStart) utterance.onstart = onStart;
    if (onEnd) utterance.onend = onEnd;
    utterance.onerror = () => {
      if (onEnd) onEnd();
    };

    this.synth.speak(utterance);
    return true;
  }

  public stopSpeaking() {
    if (this.synth) {
      try {
        this.synth.cancel();
      } catch { /* ignore */ }
    }
    this.currentUtterance = null;
  }

  public isSpeaking(): boolean {
    return !!(this.synth && this.synth.speaking);
  }
}

export const voiceService = new VoiceService();
