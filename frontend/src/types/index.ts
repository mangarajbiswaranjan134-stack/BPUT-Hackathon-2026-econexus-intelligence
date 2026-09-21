export interface FacilityConfig {
  id: string;
  name: string;
  type: string;
  location: string;
  latitude: number;
  longitude: number;
  buildings: BuildingConfig[];
  timezone: string;
}

export interface BuildingConfig {
  id: string;
  name: string;
  zones: string[];
  type: string;
  area_sqft: number;
  floors: number;
}

export interface KPI {
  id: string;
  label: string;
  value: number;
  unit: string;
  trend: number;
  status: 'good' | 'warning' | 'critical';
  sparkline: number[];
  description: string;
}

export interface DashboardSummary {
  kpis: KPI[];
  sustainability_score: number;
  active_anomalies: number;
  predicted_risks: number;
  top_insight: string;
  facility: FacilityConfig;
  simulation_active: boolean;
  timestamp: string;
}

export interface EnergyData {
  current_kw: number;
  daily_kwh: number;
  peak_kw: number;
  baseline_kw: number;
  trend_pct: number;
  cost_estimate: number;
  history: Array<{ timestamp: string; value: number }>;
  by_building: Array<{ building: string; value: number; pct: number }>;
  heatmap: Array<{ hour: number; day: number; value: number }>;
  anomalies: Array<Record<string, unknown>>;
}

export interface WaterData {
  current_lph: number;
  daily_liters: number;
  baseline_lph: number;
  trend_pct: number;
  history: Array<{ timestamp: string; value: number }>;
  by_zone: Array<{ zone: string; value: number; pct: number }>;
  anomalies: Array<Record<string, unknown>>;
  overnight_baseline: number;
}

export interface WasteData {
  bins: Array<{
    id: string;
    location: string;
    fill_pct: number;
    type: string;
    last_collected: string;
    predicted_full: string;
  }>;
  total_bins: number;
  overflow_risk: number;
  collection_efficiency: number;
  daily_generation_kg: number;
  history: Array<{ timestamp: string; value: number }>;
  by_type: Array<{ type: string; value: number; pct: number }>;
}

export interface AirQualityData {
  aqi: number;
  category: string;
  pm25: number;
  pm10: number;
  co2: number;
  temperature: number;
  humidity: number;
  history: Array<{ timestamp: string; value: number }>;
  hotspots: Array<{ lat: number; lng: number; aqi: number; location: string }>;
  trend_pct: number;
}

export interface TrafficData {
  current_vehicles: number;
  peak_hour: string;
  congestion_level: string;
  parking_total: number;
  parking_occupied: number;
  parking_pct: number;
  hotspots: Array<{ lat: number; lng: number; type: string; severity: string; location: string }>;
  history: Array<{ timestamp: string; value: number }>;
  parking_zones: Array<{ id: string; name: string; total: number; occupied: number; pct: number }>;
}

export interface AssetData {
  total_assets: number;
  active: number;
  maintenance: number;
  idle: number;
  utilization_pct: number;
  assets: Array<{
    id: string;
    name: string;
    type: string;
    building: string;
    status: string;
    utilization: number;
    last_maintenance: string;
    next_maintenance: string;
    hours_today: number;
  }>;
  by_category: Array<{ category: string; count: number; utilization: number }>;
  anomalies: Array<Record<string, unknown>>;
}

export interface SafetyData {
  total_incidents: number;
  open_incidents: number;
  trend_pct: number;
  risk_level: string;
  incidents: Array<{
    id: string;
    timestamp: string;
    type: string;
    location: string;
    severity: string;
    status: string;
    description: string;
  }>;
  by_category: Array<{ category: string; count: number }>;
  by_location: Array<{ location: string; count: number }>;
  monthly_trend: Array<{ month: string; count: number }>;
}

export interface Anomaly {
  id: string;
  timestamp: string;
  metric: string;
  location: string;
  building: string;
  observed: number;
  expected: number;
  deviation_pct: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  possible_cause: string;
  recommendation: string;
  status: string;
}

export interface ForecastPoint {
  timestamp: string;
  value: number;
  lower: number;
  upper: number;
}

export interface ForecastResult {
  metric: string;
  horizon: string;
  historical: Array<{ timestamp: string; value: number }>;
  forecast: ForecastPoint[];
  confidence: number;
  trend: string;
  summary: string;
}

export interface ScenarioInput {
  hvac_change: number;
  water_change: number;
  waste_collection_change: number;
  traffic_change: number;
  operating_hours_change: number;
  occupancy_change: number;
}

export interface ScenarioResult {
  current: Record<string, number>;
  simulated: Record<string, number>;
  changes: Record<string, number>;
  insights: string[];
  label: string;
}

export interface Action {
  id: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  problem: string;
  who: string;
  what: string;
  where: string;
  when: string;
  why: string;
  expected_impact: string;
  confidence: number;
  status: 'new' | 'acknowledged' | 'in_progress' | 'completed';
  created_at: string;
  metric: string;
}

export interface CopilotResponse {
  answer: string;
  insight: string;
  cause: string;
  evidence: string[];
  prediction: string;
  recommendation: string;
  expected_impact: string;
  confidence: number;
  assumptions: string[];
  data_label: string;
}

export interface SustainabilityScore {
  overall: number;
  energy: number;
  water: number;
  waste: number;
  air_quality: number;
  emissions: number;
  safety: number;
  operational_efficiency: number;
  methodology: string;
  factors: Array<{ name: string; score: number; weight: number; description: string }>;
}

export interface IntegrationStatus {
  name: string;
  provider: string;
  status: 'connected' | 'not_configured' | 'error' | 'fallback';
  last_success: string | null;
  details: string;
}

export interface SimulationState {
  active: boolean;
  tick: number;
  anomaly_injected: boolean;
  speed: number;
}

export type UserRole = 'admin' | 'operations' | 'sustainability';
