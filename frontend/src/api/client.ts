import { 
  DashboardSummary, KPI, EnergyData, ForecastResult, Anomaly, 
  WaterData, WasteData, AirQualityData, TrafficData, AssetData, 
  SafetyData, ScenarioInput, ScenarioResult, Action, CopilotResponse,
  SustainabilityScore, IntegrationStatus, FacilityConfig, SimulationState 
} from '../types';

const BASE = import.meta.env.VITE_API_BASE_URL || '/api';

async function fetchJSON<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${url}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });
  if (!res.ok) throw new Error(`API Error: ${res.status}`);
  return res.json();
}

export const api = {
  // Dashboard
  getDashboardSummary: () => fetchJSON<DashboardSummary>('/dashboard/summary'),
  getDashboardKPIs: () => fetchJSON<KPI[]>('/dashboard/kpis'),
  
  // Energy
  getEnergy: () => fetchJSON<EnergyData>('/energy/'),
  getEnergyForecast: (horizon = '24h') => fetchJSON<ForecastResult>(`/energy/forecast?horizon=${horizon}`),
  getEnergyAnomalies: () => fetchJSON<Anomaly[]>('/energy/anomalies'),
  getEnergyInsight: () => fetchJSON<Record<string, unknown>>('/energy/insight'),
  
  // Water
  getWater: () => fetchJSON<WaterData>('/water/'),
  getWaterForecast: (horizon = '24h') => fetchJSON<ForecastResult>(`/water/forecast?horizon=${horizon}`),
  getWaterInsight: () => fetchJSON<Record<string, unknown>>('/water/insight'),
  
  // Waste
  getWaste: () => fetchJSON<WasteData>('/waste/'),
  getWasteInsight: () => fetchJSON<Record<string, unknown>>('/waste/insight'),
  
  // Air Quality
  getAirQuality: () => fetchJSON<AirQualityData>('/airquality/'),
  getAirQualityInsight: () => fetchJSON<Record<string, unknown>>('/airquality/insight'),
  
  // Traffic
  getTraffic: () => fetchJSON<TrafficData>('/traffic/'),
  getTrafficInsight: () => fetchJSON<Record<string, unknown>>('/traffic/insight'),
  
  // Assets
  getAssets: () => fetchJSON<AssetData>('/assets/'),
  getAssetInsight: () => fetchJSON<Record<string, unknown>>('/assets/insight'),
  
  // Safety
  getSafety: () => fetchJSON<SafetyData>('/safety/'),
  getSafetyInsight: () => fetchJSON<Record<string, unknown>>('/safety/insight'),
  
  // Anomalies
  getAnomalies: (metric?: string) => fetchJSON<Anomaly[]>(`/anomalies/${metric ? `?metric=${metric}` : ''}`),
  getAnomaly: (id: string) => fetchJSON<Anomaly>(`/anomalies/${id}`),
  updateAnomalyStatus: (id: string, status: string) => fetchJSON<Anomaly>(`/anomalies/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  
  // Forecast
  getForecast: (metric: string, horizon = '24h') => fetchJSON<ForecastResult>(`/forecast/${metric}?horizon=${horizon}`),
  
  // Scenarios
  simulateScenario: (input: ScenarioInput) => fetchJSON<ScenarioResult>('/scenarios/simulate', { method: 'POST', body: JSON.stringify(input) }),
  
  // Actions
  getActions: () => fetchJSON<Action[]>('/actions/'),
  updateActionStatus: (id: string, status: string) => fetchJSON<Action>(`/actions/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  generateActions: () => fetchJSON<Action[]>('/actions/generate', { method: 'POST' }),
  
  // Copilot
  askCopilot: (question: string) => fetchJSON<CopilotResponse>('/copilot/ask', { method: 'POST', body: JSON.stringify({ question }) }),
  
  // Reports
  generateReport: () => fetchJSON<Record<string, unknown>>('/reports/generate'),
  getSustainabilityScore: () => fetchJSON<SustainabilityScore>('/reports/sustainability'),
  
  // CSV Upload
  uploadCSV: (file: File) => {
    const form = new FormData();
    form.append('file', file);
    return fetch(`${BASE}/csv/upload`, { method: 'POST', body: form }).then(r => r.json());
  },
  
  // Settings
  getIntegrations: () => fetchJSON<IntegrationStatus[]>('/settings/integrations'),
  getFacility: () => fetchJSON<FacilityConfig>('/settings/facility'),
  setFacilityType: (type: string) => fetchJSON<FacilityConfig>('/settings/facility', { method: 'POST', body: JSON.stringify({ type }) }),
  
  // Simulation
  startSimulation: () => fetchJSON<SimulationState>('/simulation/start', { method: 'POST' }),
  stopSimulation: () => fetchJSON<SimulationState>('/simulation/stop', { method: 'POST' }),
  resetSimulation: () => fetchJSON<SimulationState>('/simulation/reset', { method: 'POST' }),
  getSimulationState: () => fetchJSON<SimulationState>('/simulation/state'),
  tickSimulation: () => fetchJSON<Record<string, unknown>>('/simulation/tick'),
};
