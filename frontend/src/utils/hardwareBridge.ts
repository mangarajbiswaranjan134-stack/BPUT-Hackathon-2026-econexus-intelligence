// Web Serial API bridge to connect Arduino / ESP32 physical sensors directly in browser
export interface SensorPacket {
  aqi: number;
  temp: number;
  humidity?: number;
  water: number; // 0 = dry, 1 = leak detected
  buzzer?: number;
}

class HardwareBridge {
  private port: any = null;
  private reader: any = null;
  private writer: any = null;
  private isConnected = false;
  private onDataCallback: ((data: SensorPacket) => void) | null = null;
  private onStatusCallback: ((connected: boolean, message?: string) => void) | null = null;

  isSupported(): boolean {
    return 'serial' in navigator;
  }

  async connect(onData: (data: SensorPacket) => void, onStatus: (connected: boolean, message?: string) => void) {
    this.onDataCallback = onData;
    this.onStatusCallback = onStatus;

    if (!this.isSupported()) {
      onStatus(false, 'Web Serial API is not supported in this browser. Use Chrome, Edge or Opera on Desktop.');
      return false;
    }

    try {
      this.port = await (navigator as any).serial.requestPort();
      await this.port.open({ baudRate: 9600 });
      this.isConnected = true;
      onStatus(true, 'Connected to USB Microcontroller (9600 baud)');

      this.readLoop();
      return true;
    } catch (err: any) {
      console.error('Serial connection error:', err);
      this.isConnected = false;
      onStatus(false, err.message || 'Connection cancelled or device busy');
      return false;
    }
  }

  private async readLoop() {
    const textDecoder = new TextDecoderStream();
    const readableStreamClosed = this.port.readable.pipeTo(textDecoder.writable);
    this.reader = textDecoder.readable.getReader();

    let buffer = '';

    try {
      while (true) {
        const { value, done } = await this.reader.read();
        if (done) break;
        if (value) {
          buffer += value;
          const lines = buffer.split('\n');
          buffer = lines.pop() || ''; // Keep partial line

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;
            try {
              // Expected format: {"aqi": 82, "temp": 28.5, "water": true/1, "buzzer": false/0}
              const raw: any = JSON.parse(trimmed);
              const isWater = typeof raw.water === 'boolean' 
                ? (raw.water ? 1 : 0) 
                : typeof raw.water === 'string'
                ? (raw.water.toLowerCase() === 'true' || raw.water === '1' ? 1 : 0)
                : Number(raw.water || 0);

              const isBuzzer = typeof raw.buzzer === 'boolean'
                ? (raw.buzzer ? 1 : 0)
                : typeof raw.buzzer === 'string'
                ? (raw.buzzer.toLowerCase() === 'true' || raw.buzzer === '1' ? 1 : 0)
                : Number(raw.buzzer || 0);

              const packet: SensorPacket = {
                aqi: Number(raw.aqi ?? 65),
                temp: Number(raw.temp ?? raw.temperature ?? 28),
                humidity: raw.humidity ? Number(raw.humidity) : undefined,
                water: isWater,
                buzzer: isBuzzer,
              };

              if (this.onDataCallback) {
                this.onDataCallback(packet);
              }
            } catch {
              // Plain text format fallback: AQI:82,TEMP:28.5,WATER:1
              const packet: Partial<SensorPacket> = {};
              const parts = trimmed.split(',');
              parts.forEach(p => {
                const [k, v] = p.split(':');
                if (k && v) {
                  const key = k.trim().toLowerCase();
                  const valStr = v.trim().toLowerCase();
                  const num = parseFloat(valStr);
                  if (key === 'aqi') packet.aqi = isNaN(num) ? 60 : num;
                  if (key === 'temp' || key === 'temperature') packet.temp = isNaN(num) ? 28 : num;
                  if (key === 'water' || key === 'leak') {
                    packet.water = (valStr === 'true' || valStr === '1' || valStr === 'wet') ? 1 : 0;
                  }
                  if (key === 'buzzer' || key === 'siren') {
                    packet.buzzer = (valStr === 'true' || valStr === '1' || valStr === 'on') ? 1 : 0;
                  }
                }
              });
              if (packet.aqi !== undefined && this.onDataCallback) {
                this.onDataCallback({
                  aqi: packet.aqi ?? 60,
                  temp: packet.temp ?? 28,
                  water: packet.water ?? 0,
                  buzzer: packet.buzzer ?? 0
                });
              }
            }
          }
        }
      }
    } catch (err) {
      console.warn('Serial read loop ended:', err);
    } finally {
      this.reader.releaseLock();
    }
  }

  async sendBuzzerCommand(on: boolean) {
    if (!this.port || !this.isConnected || !this.port.writable) return;

    try {
      const textEncoder = new TextEncoderStream();
      const writableStreamClosed = textEncoder.readable.pipeTo(this.port.writable);
      this.writer = textEncoder.writable.getWriter();
      const cmd = on ? "BUZZER:1\n" : "BUZZER:0\n";
      await this.writer.write(cmd);
      await this.writer.close();
    } catch (err) {
      console.error('Failed to send buzzer command:', err);
    }
  }

  async disconnect() {
    this.isConnected = false;
    try {
      if (this.reader) await this.reader.cancel();
      if (this.port) await this.port.close();
    } catch (err) {
      console.error('Error closing serial port:', err);
    }
    if (this.onStatusCallback) {
      this.onStatusCallback(false, 'Disconnected from USB hardware');
    }
  }

  isHardwareConnected() {
    return this.isConnected;
  }
}

export const hardwareBridge = new HardwareBridge();
