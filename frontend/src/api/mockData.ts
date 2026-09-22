import { 
  DashboardSummary, EnergyData, WaterData, WasteData, 
  AirQualityData, TrafficData, AssetData, SafetyData, 
  Anomaly, Action, CopilotResponse, ForecastResult, ScenarioResult, SustainabilityScore
} from '../types';

export const mockFacility = {
  id: 'fac_eng_001',
  name: 'Engineering College Campus',
  type: 'engineering_college',
  location: 'Bhubaneswar, Odisha, India',
  latitude: 20.2961,
  longitude: 85.8245,
  timezone: 'Asia/Kolkata',
  buildings: [
    { id: 'bld_01', name: 'Main Academic Block (Block A)', type: 'academic', area_sqft: 50000, floors: 4, zones: ['Classrooms', 'Faculty Offices', 'Seminar Hall'] },
    { id: 'bld_02', name: 'Science & Technology Block (Block B)', type: 'lab', area_sqft: 40000, floors: 3, zones: ['Computer Labs', 'IoT Lab', 'Physics Lab'] },
    { id: 'bld_03', name: 'Administrative Complex', type: 'admin', area_sqft: 20000, floors: 2, zones: ['Offices', 'Board Room'] },
    { id: 'bld_04', name: 'Hostel Complex Alpha', type: 'hostel', area_sqft: 60000, floors: 5, zones: ['Rooms', 'Mess', 'Recreation'] },
    { id: 'bld_05', name: 'Central Library & Digital Hub', type: 'library', area_sqft: 25000, floors: 3, zones: ['Reading Halls', 'Stack Rooms'] },
  ]
};

export const mockKPIs = [
  { id: 'sustainability', label: 'Sustainability Score', value: 78.5, unit: '/100', trend: 2.4, status: 'good' as const, sparkline: [72, 73, 75, 76, 78, 78.5], description: 'Campus composite rating' },
  { id: 'energy', label: 'Real-Time Power', value: 412.5, unit: 'kW', trend: -4.2, status: 'good' as const, sparkline: [450, 440, 430, 425, 412.5], description: 'Live electrical demand' },
  { id: 'water', label: 'Water Consumption', value: 1240, unit: 'L/h', trend: 1.8, status: 'good' as const, sparkline: [1180, 1200, 1220, 1240], description: 'Hydraulic flow rate' },
  { id: 'waste', label: 'Bins Near Capacity', value: 3, unit: 'bins', trend: 0, status: 'warning' as const, sparkline: [1, 2, 2, 3, 3], description: 'Bins exceeding 80% fill' },
  { id: 'aqi', label: 'Air Quality Index', value: 68, unit: 'AQI', trend: -6.5, status: 'good' as const, sparkline: [82, 75, 71, 68], description: 'Moderate clean air' },
  { id: 'traffic', label: 'Active Vehicles', value: 142, unit: 'vehicles', trend: 8.2, status: 'warning' as const, sparkline: [110, 125, 135, 142], description: 'Peak campus entry volume' },
  { id: 'assets', label: 'Asset Health', value: 94.2, unit: '%', trend: 0.5, status: 'good' as const, sparkline: [92, 93, 94, 94.2], description: 'Operational equipment uptime' },
  { id: 'safety', label: 'Open Incidents', value: 0, unit: 'incidents', trend: 0, status: 'good' as const, sparkline: [1, 0, 0, 0], description: 'Zero active hazards' },
];

export const mockDashboardSummary: DashboardSummary = {
  kpis: mockKPIs,
  sustainability_score: 78.5,
  active_anomalies: 2,
  predicted_risks: 1,
  top_insight: "Peak solar offset is currently absorbing 18.2% of academic load. Recommended adjustment: throttle Block B cooling towers between 14:00-16:00 to reduce peak grid draw.",
  facility: mockFacility,
  simulation_active: true,
  timestamp: new Date().toISOString()
};

export const mockAnomalies: Anomaly[] = [
  {
    id: 'anom-101',
    metric: 'energy',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    location: 'Science & Tech Block B',
    building: 'Block B',
    observed: 184.2,
    expected: 132.0,
    deviation_pct: 39.5,
    severity: 'high',
    possible_cause: 'Simultaneous HVAC chiller cycle during laboratory high-load period',
    recommendation: 'Stagger chiller startup timing and activate thermal buffer storage',
    status: 'new'
  },
  {
    id: 'anom-102',
    metric: 'water',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    location: 'Hostel Complex Alpha (Riser 2)',
    building: 'Hostel Alpha',
    observed: 310.0,
    expected: 140.0,
    deviation_pct: 121.4,
    severity: 'medium',
    possible_cause: 'Overnight flow anomaly detected indicative of slow toilet cistern leak',
    recommendation: 'Dispatch maintenance to inspect ground floor ablution blocks',
    status: 'acknowledged'
  }
];

export const mockActions: Action[] = [
  {
    id: 'act-01',
    priority: 'critical',
    problem: 'Excess HVAC draw during 13:00-16:00 TOD tariff peak',
    who: 'Facility Energy Team',
    what: 'Pre-cool Academic Block A by 1.5°C before 12:30 PM then setpoint to 24°C',
    where: 'Block A & Block B',
    when: 'Immediate (TOD Peak Period)',
    why: 'Avoid TOD peak tariff surcharge of ₹3.20/kWh',
    expected_impact: 'Estimated savings: ₹14,800/week and 1.8 tons CO2',
    confidence: 0.92,
    status: 'new',
    created_at: new Date().toISOString(),
    metric: 'energy'
  },
  {
    id: 'act-02',
    priority: 'high',
    problem: 'Waste Bin #04 at Food Court reached 88% capacity',
    who: 'Sanitation Dispatch',
    what: 'Reroute compactor truck to collect Food Court bin cluster',
    where: 'Cafeteria Zone',
    when: 'Within 45 minutes',
    why: 'Prevent bin overflow during student lunch hour rush',
    expected_impact: 'Zero overflow risk; 100% waste segregation hygiene',
    confidence: 0.95,
    status: 'in_progress',
    created_at: new Date().toISOString(),
    metric: 'waste'
  }
];

const now = new Date();
const hourlyTimestamps = Array.from({ length: 24 }, (_, i) => {
  const d = new Date(now.getTime() - (23 - i) * 3600000);
  return d.toISOString();
});

export const mockEnergyData: EnergyData = {
  current_kw: 412.5,
  daily_kwh: 4820.0,
  peak_kw: 540.2,
  baseline_kw: 380.0,
  trend_pct: -4.2,
  cost_estimate: 36150.0,
  history: hourlyTimestamps.map((ts, i) => ({
    timestamp: ts,
    value: 320 + Math.sin(i / 3.8) * 140 + Math.random() * 20
  })),
  by_building: [
    { building: 'Science & Tech (Block B)', value: 165.2, pct: 40.0 },
    { building: 'Main Academic (Block A)', value: 122.8, pct: 29.8 },
    { building: 'Hostel Complex Alpha', value: 68.4, pct: 16.6 },
    { building: 'Library & Admin', value: 56.1, pct: 13.6 }
  ],
  heatmap: [],
  anomalies: []
};

export const mockWaterData: WaterData = {
  current_lph: 1240.0,
  daily_liters: 28400.0,
  baseline_lph: 950.0,
  trend_pct: 1.8,
  history: hourlyTimestamps.map((ts, i) => ({
    timestamp: ts,
    value: 800 + Math.sin((i - 6) / 3.5) * 500 + Math.random() * 40
  })),
  by_zone: [
    { zone: 'Hostel Alpha & Alpha Mess', value: 620.0, pct: 50.0 },
    { zone: 'Academic & Labs', value: 340.0, pct: 27.4 },
    { zone: 'Cafeteria & Kitchen', value: 180.0, pct: 14.5 },
    { zone: 'Landscaping & Cooling', value: 100.0, pct: 8.1 }
  ],
  anomalies: [],
  overnight_baseline: 140.0
};

export const mockWasteData: WasteData = {
  bins: [
    { id: 'BIN-01', location: 'Main Academic Entrance', fill_pct: 42, type: 'Recyclable', last_collected: '3h ago', predicted_full: 'in 8h' },
    { id: 'BIN-02', location: 'Science Block Lobby', fill_pct: 64, type: 'General', last_collected: '4h ago', predicted_full: 'in 5h' },
    { id: 'BIN-03', location: 'Hostel Alpha Mess', fill_pct: 78, type: 'Organic', last_collected: '2h ago', predicted_full: 'in 2h' },
    { id: 'BIN-04', location: 'Food Court Plaza', fill_pct: 88, type: 'General', last_collected: '5h ago', predicted_full: 'in 40m' },
    { id: 'BIN-05', location: 'Central Library Lawn', fill_pct: 35, type: 'Paper', last_collected: '1d ago', predicted_full: 'in 18h' },
  ],
  total_bins: 24,
  overflow_risk: 2,
  collection_efficiency: 94.2,
  daily_generation_kg: 340.5,
  history: hourlyTimestamps.map((ts, i) => ({ timestamp: ts, value: 20 + i * 2 + Math.random() * 5 })),
  by_type: [
    { type: 'Organic / Mess', value: 160.0, pct: 47.0 },
    { type: 'Dry Recyclables', value: 95.0, pct: 27.9 },
    { type: 'General Municipal', value: 65.5, pct: 19.2 },
    { type: 'E-Waste / Lab', value: 20.0, pct: 5.9 }
  ]
};

export const mockAirQualityData: AirQualityData = {
  aqi: 68,
  category: 'Moderate (Acceptable)',
  pm25: 22.4,
  pm10: 48.1,
  co2: 440.0,
  temperature: 28.5,
  humidity: 62.0,
  history: hourlyTimestamps.map((ts, i) => ({ timestamp: ts, value: 55 + Math.sin(i / 4) * 25 + Math.random() * 5 })),
  hotspots: [
    { lat: 20.2965, lng: 85.8242, aqi: 88, location: 'Campus Main Gate Intersection' },
    { lat: 20.2958, lng: 85.8249, aqi: 74, location: 'Cafeteria Exhaust Riser' },
    { lat: 20.2970, lng: 85.8252, aqi: 52, location: 'Botanical Garden & Lawn' }
  ],
  trend_pct: -6.5
};

export const mockTrafficData: TrafficData = {
  current_vehicles: 142,
  peak_hour: '09:00 - 10:30 AM',
  congestion_level: 'Moderate',
  parking_total: 280,
  parking_occupied: 194,
  parking_pct: 69.3,
  hotspots: [],
  history: hourlyTimestamps.map((ts, i) => ({ timestamp: ts, value: Math.max(10, 80 + Math.sin((i - 8) / 3) * 60) })),
  parking_zones: [
    { id: 'zone-a', name: 'Faculty & Admin Parking', total: 80, occupied: 62, pct: 77.5 },
    { id: 'zone-b', name: 'Student Two-Wheeler Bay', total: 150, occupied: 110, pct: 73.3 },
    { id: 'zone-c', name: 'Visitor & Service Lot', total: 50, occupied: 22, pct: 44.0 }
  ]
};

export const mockAssetData: AssetData = {
  total_assets: 86,
  active: 81,
  maintenance: 3,
  idle: 2,
  utilization_pct: 94.2,
  assets: [
    { id: 'ast-01', name: 'Chiller Unit #01 (Block B)', type: 'HVAC', building: 'Science Block', status: 'Operational', utilization: 86, last_maintenance: '2026-08-15', next_maintenance: '2026-10-15', hours_today: 9.4 },
    { id: 'ast-02', name: 'Solar PV Inverter 50kW', type: 'Electrical', building: 'Block A Rooftop', status: 'Operational', utilization: 98, last_maintenance: '2026-07-10', next_maintenance: '2026-11-10', hours_today: 10.2 },
    { id: 'ast-03', name: 'Campus Water Pump #02', type: 'Plumbing', building: 'Utilities Center', status: 'Warning', utilization: 72, last_maintenance: '2026-06-20', next_maintenance: '2026-09-25', hours_today: 6.8 },
  ],
  by_category: [
    { category: 'HVAC & Cooling', count: 24, utilization: 86.4 },
    { category: 'Electrical & Power', count: 32, utilization: 92.1 },
    { category: 'Pumps & Plumbing', count: 18, utilization: 78.5 },
    { category: 'IoT Gateways', count: 12, utilization: 99.0 }
  ],
  anomalies: []
};

export const mockSafetyData: SafetyData = {
  total_incidents: 4,
  open_incidents: 0,
  trend_pct: -100.0,
  risk_level: 'Low',
  incidents: [
    { id: 'inc-01', timestamp: '2026-09-12 14:20', type: 'Electrical Trip', location: 'Lab 302 Block B', severity: 'low', status: 'resolved', description: 'Surge protector tripped on test bench; reset and load cleared.' }
  ],
  by_category: [{ category: 'Electrical', count: 2 }, { category: 'Plumbing', count: 2 }],
  by_location: [{ location: 'Science Block B', count: 2 }, { location: 'Hostel Alpha', count: 2 }],
  monthly_trend: [{ month: 'Jul', count: 3 }, { month: 'Aug', count: 2 }, { month: 'Sep', count: 1 }]
};

export const mockForecast: ForecastResult = {
  metric: 'energy',
  horizon: '24h',
  historical: hourlyTimestamps.slice(-12).map((ts, i) => ({ timestamp: ts, value: 380 + i * 5 })),
  forecast: Array.from({ length: 24 }, (_, i) => {
    const val = 390 + Math.sin(i / 3.5) * 120;
    return {
      timestamp: new Date(Date.now() + (i + 1) * 3600000).toISOString(),
      value: Math.round(val * 10) / 10,
      lower: Math.round((val - 25) * 10) / 10,
      upper: Math.round((val + 25) * 10) / 10,
    };
  }),
  confidence: 0.91,
  trend: 'stable',
  summary: 'Projected demand shows afternoon peak of 510 kW at 14:30 IST. Solar generation expected to offset 38 kW during peak window.'
};

export const mockCopilotResponse = (question: string): CopilotResponse => ({
  answer: `Analysis for "${question}": EcoNexus facility intelligence monitors 48 IoT sensor nodes across campus. Current aggregate demand is 412.5 kW with optimal solar offset (42.5 kW). All water flow and air quality indices are within healthy parameters.`,
  insight: "Predictive model forecasts stable diurnal consumption with peak risk localized to Block B laboratory HVAC clusters.",
  cause: "Combined equipment usage during academic lab sessions between 13:00 and 16:00.",
  evidence: ["Block B energy load +39.5% above baseline", "Outdoor temperature reached 31°C", "Solar PV generation steady at 42.5 kW"],
  prediction: "Grid peak tariff will apply from 14:00 onwards. Total projected daily energy spend is ₹36,150.",
  recommendation: "Shift non-urgent thermal loads and engage campus battery/chiller storage to reduce grid peak draw by 45 kW.",
  expected_impact: "Expected cost reduction of ₹14,800/week and 1.8 tons CO2 emissions avoided.",
  confidence: 0.88,
  assumptions: ["Solar irradiance remains above 750 W/m²", "Hostel evening peak commences at 18:30 IST"],
  data_label: "AI Decision-Support Insight"
});

export const mockScenarioResult: ScenarioResult = {
  current: { energy: 412.5, water: 1240, waste: 340, co2: 338.2, cost: 36150, sustainability_score: 78.5 },
  simulated: { energy: 362.0, water: 1100, waste: 290, co2: 296.8, cost: 31700, sustainability_score: 84.2 },
  changes: { energy_pct: -12.2, water_pct: -11.3, waste_pct: -14.7, co2_pct: -12.2, cost_pct: -12.3, score_change: 5.7 },
  insights: [
    "10% HVAC setpoint modulation yields ₹4,450/day in utility savings",
    "Water fixture throttling saves 3,360 Liters daily across hostel risers",
    "Overall campus Sustainability Index elevates from 78.5 to 84.2 (+5.7 points)"
  ],
  label: "Simulated Operational Optimization"
};

export const mockSustainabilityScore: SustainabilityScore = {
  overall: 78.5,
  energy: 82.0,
  water: 76.5,
  waste: 74.0,
  air_quality: 85.0,
  emissions: 80.0,
  safety: 95.0,
  operational_efficiency: 79.0,
  methodology: "Weighted Composite Facility Assessment (ISO 50001 & GRI Standard)",
  factors: [
    { name: 'Energy Efficiency & Solar Share', score: 82.0, weight: 0.20, description: 'Renewable offset & diurnal load curve efficiency' },
    { name: 'Water Conservation & Leakage Control', score: 76.5, weight: 0.15, description: 'Overnight baseline flow & recycling ratio' },
    { name: 'Smart Waste Management', score: 74.0, weight: 0.15, description: 'Bin fill alerts & segregation rate' },
    { name: 'Campus Air Quality Index', score: 85.0, weight: 0.15, description: 'PM2.5, PM10 & indoor CO2 standards' },
    { name: 'Safety & Hazard Prevention', score: 95.0, weight: 0.15, description: 'Zero open electrical or chemical incidents' },
    { name: 'Operational Asset Uptime', score: 79.0, weight: 0.20, description: 'Preventative maintenance adherence' }
  ]
};
