/*
 * =====================================================================================
 * EcoNexus Intelligence - Hardware IoT Sensor Firmware
 * Microcontroller: Arduino Uno / Nano / ESP8266 / ESP32
 * 
 * SENSORS & PIN MAPPING:
 * 1. AQI Sensor (MQ-135 / MQ-2)        --> Analog Pin A0
 * 2. Water Detection / Rain Probe     --> Digital Pin D2 (or A1)
 * 3. Temperature Sensor (DHT11/DHT22) --> Digital Pin D4
 * 4. Physical Alert Buzzer (Active)   --> Digital Pin D8
 * =====================================================================================
 */

#define PIN_AQI_ANALOG    A0
#define PIN_WATER_SENSOR  2
#define PIN_BUZZER        8

// If using DHT library, uncomment these:
// #include "DHT.h"
// #define DHTPIN 4
// #define DHTTYPE DHT11
// DHT dht(DHTPIN, DHTTYPE);

void setup() {
  Serial.begin(9600);
  
  pinMode(PIN_WATER_SENSOR, INPUT_PULLUP);
  pinMode(PIN_BUZZER, OUTPUT);
  digitalWrite(PIN_BUZZER, LOW);

  // dht.begin();
  
  // Power-on buzzer beep confirmation
  digitalWrite(PIN_BUZZER, HIGH);
  delay(150);
  digitalWrite(PIN_BUZZER, LOW);
}

void loop() {
  // 1. Read AQI from MQ-135 Analog Pin
  int rawAqi = analogRead(PIN_AQI_ANALOG);
  // Map 0-1023 analog range to estimated AQI 20-500
  int aqi = map(rawAqi, 50, 850, 30, 450);
  if (aqi < 20) aqi = 25;

  // 2. Read Water Detection Sensor (0 = dry, 1 = water leak detected)
  // Most rain/water boards give LOW when wet, HIGH when dry with pullup
  int waterSensorVal = digitalRead(PIN_WATER_SENSOR);
  int waterLeakDetected = (waterSensorVal == LOW) ? 1 : 0;

  // 3. Read Temperature (using simulated curve or DHT if available)
  float temp = 28.5 + (random(-10, 10) / 10.0);
  // float temp = dht.readTemperature();

  // 4. Send JSON packet over USB Serial to Website / Browser
  Serial.print("{\"aqi\":");
  Serial.print(aqi);
  Serial.print(",\"temp\":");
  Serial.print(temp, 1);
  Serial.print(",\"water\":");
  Serial.print(waterLeakDetected);
  Serial.println("}");

  // 5. Check if Website sent incoming Buzzer command
  if (Serial.available() > 0) {
    String cmd = Serial.readStringUntil('\n');
    cmd.trim();
    if (cmd == "BUZZER:1" || cmd == "BUZZER:ON") {
      digitalWrite(PIN_BUZZER, HIGH);
    } else if (cmd == "BUZZER:0" || cmd == "BUZZER:OFF") {
      digitalWrite(PIN_BUZZER, LOW);
    }
  }

  // 6. Direct hardware failsafe: If water leak detected or AQI > 250, auto-beep buzzer
  if (waterLeakDetected == 1 || aqi > 250) {
    digitalWrite(PIN_BUZZER, HIGH);
    delay(200);
    digitalWrite(PIN_BUZZER, LOW);
    delay(200);
  } else {
    delay(1000); // 1-second transmission interval
  }
}
