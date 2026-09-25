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

export interface TreeData {
  id: string;
  species: string;
  common_name: string;
  age_years: number;
  height_m: number;
  carbon_seq_kg: number;
  health: 'excellent' | 'good' | 'fair' | 'critical';
  lat: number;
  lng: number;
  tag_id: string;
}

export interface BiodiversityData {
  green_cover_pct: number;
  tree_count: number;
  carbon_sequestered_tons: number;
  species_diversity_index: number;
  habitat_disturbance_score: number;
  canopy_growth_rate: number;
  history: Array<{ timestamp: string; green_cover: number; disturbance: number }>;
  trees: TreeData[];
  zones: Array<{
    name: string;
    green_pct: number;
    fauna_count: number;
    disturbance_level: 'low' | 'moderate' | 'high';
    flora_species: string[];
  }>;
  alerts: string[];
}

export interface SoilLandData {
  soil_health_index: number;
  avg_ph: number;
  heavy_metal_risk: 'low' | 'moderate' | 'elevated' | 'severe';
  moisture_pct: number;
  organic_carbon_pct: number;
  npk_rating: string;
  construction_area_pct: number;
  green_zone_pct: number;
  permeable_surface_pct: number;
  history: Array<{ timestamp: string; ph: number; moisture: number; health: number }>;
  sampling_points: Array<{
    id: string;
    location: string;
    lat: number;
    lng: number;
    ph: number;
    lead_ppm: number;
    cadmium_ppm: number;
    moisture: number;
    nitrogen_level: string;
    status: 'healthy' | 'caution' | 'contaminated';
  }>;
  land_use_changes: Array<{
    period: string;
    green_loss_sqm: number;
    constructed_sqm: number;
    afforestation_sqm: number;
  }>;
}

export interface NoiseData {
  current_db: number;
  daytime_avg_db: number;
  nighttime_avg_db: number;
  peak_db: number;
  compliance_rate_pct: number;
  active_violations: number;
  history: Array<{ timestamp: string; value: number; limit: number }>;
  sensitive_zones: Array<{
    id: string;
    name: string;
    type: 'hospital' | 'school' | 'hostel' | 'lab' | 'industrial';
    limit_db: number;
    current_db: number;
    peak_today_db: number;
    status: 'compliant' | 'warning' | 'violation';
    lat: number;
    lng: number;
  }>;
  compliance_alerts: Array<{
    id: string;
    location: string;
    decibel: number;
    limit: number;
    duration_min: number;
    timestamp: string;
    severity: 'moderate' | 'high' | 'critical';
  }>;
}

export interface GrievanceTicket {
  id: string;
  category: 'Air Quality' | 'Noise' | 'Water' | 'Waste' | 'Safety' | 'General';
  title: string;
  sentiment: 'positive' | 'neutral' | 'negative' | 'critical';
  status: 'open' | 'in_progress' | 'resolved';
  submitted_by: string;
  timestamp: string;
  location: string;
  ai_priority: 'low' | 'medium' | 'high' | 'urgent';
  ai_solution_summary: string;
}

export interface CommunitySocialData {
  community_satisfaction_index: number;
  sentiment_positive_pct: number;
  sentiment_neutral_pct: number;
  sentiment_negative_pct: number;
  open_grievances: number;
  resolved_grievances: number;
  avg_resolution_hours: number;
  health_indicators: {
    respiratory_health_risk: 'low' | 'moderate' | 'high';
    heat_strain_index: number; // 0-100
    drinking_water_safety_pct: number;
    acoustic_comfort_pct: number;
    campus_walkability_score: number;
  };
  heritage_and_cultural: Array<{
    name: string;
    type: string;
    conservation_status: string;
    integrity_pct: number;
    buffer_zone_cleared: boolean;
  }>;
  grievances: GrievanceTicket[];
  sentiment_history: Array<{ timestamp: string; positive: number; negative: number; neutral: number }>;
}

export interface DisasterRiskData {
  composite_risk_score: number;
  flood_risk_level: 'minimal' | 'moderate' | 'high' | 'severe';
  heatwave_wbgt_c: number;
  heatwave_category: 'Normal' | 'Caution' | 'Extreme Caution' | 'Danger';
  seismic_resilience_rating: string;
  emergency_readiness_pct: number;
  sirens_operational: number;
  total_sirens: number;
  evacuation_routes_clear_pct: number;
  hospital_bed_capacity_pct: number;
  waterlogging_hotspots: Array<{
    id: string;
    zone: string;
    water_depth_cm: number;
    drain_blockage_pct: number;
    risk: 'low' | 'moderate' | 'critical';
    lat: number;
    lng: number;
  }>;
  emergency_protocols: Array<{
    protocol: string;
    status: 'ready' | 'active' | 'drilled';
    last_drill: string;
    responsible_team: string;
    contact: string;
  }>;
  active_disaster_alerts: Array<{
    id: string;
    type: 'flood' | 'heatwave' | 'seismic' | 'cyclone';
    severity: 'warning' | 'high' | 'critical';
    title: string;
    instruction: string;
    timestamp: string;
  }>;
}

