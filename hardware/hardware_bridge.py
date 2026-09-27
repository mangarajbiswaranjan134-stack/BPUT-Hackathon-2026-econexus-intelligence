"""
EcoNexus Intelligence - Python USB Serial Hardware Bridge
Reads physical sensors from Arduino / ESP32 over USB COM Port
and synchronizes live telemetry with the EcoNexus platform.

Usage:
  pip install pyserial requests
  python hardware_bridge.py
"""

import sys
import time
import json

try:
    import serial
    import serial.tools.list_ports
except ImportError:
    print("Installing required serial libraries...")
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "pyserial", "requests"])
    import serial
    import serial.tools.list_ports

import requests

API_ENDPOINT = "http://localhost:8000/api/sensors/hardware"

def auto_detect_serial_port():
    ports = list(serial.tools.list_ports.comports())
    if not ports:
        return None
    for p in ports:
        desc = p.description.lower()
        if "arduino" in desc or "ch340" in desc or "cp210" in desc or "usb-serial" in desc:
            return p.device
    return ports[0].device

def main():
    print("=" * 60)
    print("  ECONEXUS INTELLIGENCE - PHYSICAL IOT HARDWARE BRIDGE")
    print("=" * 60)

    port = auto_detect_serial_port()
    if not port:
        print("❌ No USB Serial COM port detected.")
        print("   Please connect your Arduino / ESP32 via USB and restart.")
        return

    print(f"🔌 Connecting to Microcontroller on: {port} at 9600 baud...")

    try:
        ser = serial.Serial(port, 9600, timeout=2)
        time.sleep(2) # Wait for Arduino reset
        print(f"✅ Successfully Connected to {port}!")
        print("📡 Reading physical sensors (AQI, Temperature, Water Detection, Buzzer)...")
        print("   Press Ctrl+C to exit.\n")

        while True:
            line = ser.readline().decode('utf-8', errors='ignore').strip()
            if not line:
                continue

            try:
                data = json.loads(line)
                aqi = data.get("aqi", 0)
                temp = data.get("temp", 0)
                water_leak = data.get("water", 0)

                # Format terminal display
                water_status = "🚨 LEAK DETECTED!" if water_leak == 1 else "✅ DRY (Normal)"
                aqi_status = "⚠️ UNHEALTHY" if aqi > 200 else ("🟡 MODERATE" if aqi > 100 else "🟢 GOOD")

                print(f"[{time.strftime('%H:%M:%S')}] AQI: {aqi:3d} ({aqi_status}) | Temp: {temp:4.1f}°C | Water: {water_status}")

                # Send Buzzer command if critical water leak detected
                if water_leak == 1 or aqi > 250:
                    ser.write(b"BUZZER:1\n")
                else:
                    ser.write(b"BUZZER:0\n")

            except json.JSONDecodeError:
                pass

    except serial.SerialException as e:
        print(f"❌ Serial Error: {e}")
    except KeyboardInterrupt:
        print("\n🛑 Hardware bridge stopped by user.")

if __name__ == "__main__":
    main()
