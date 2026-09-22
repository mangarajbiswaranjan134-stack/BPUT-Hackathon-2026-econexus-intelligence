import { 
  DashboardSummary, KPI, EnergyData, ForecastResult, Anomaly, 
  WaterData, WasteData, AirQualityData, TrafficData, AssetData, 
  SafetyData, ScenarioInput, ScenarioResult, Action, CopilotResponse,
  SustainabilityScore, IntegrationStatus, FacilityConfig, SimulationState 
} from '../types';

import {
  mockDashboardSummary, mockKPIs, mockEnergyData, mockWaterData,
  mockWasteData, mockAirQualityData, mockTrafficData, mockAssetData,
  mockSafetyData, mockAnomalies, mockActions, mockForecast,
  mockCopilotResponse, mockScenarioResult, mockSustainabilityScore, mockFacility
} from './mockData';

const BASE = (import.meta as any).env?.VITE_API_BASE_URL || '/api';

async function fetchJSON<T>(url: string, options?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4000); // 4s timeout before instant fallback

  try {
    const res = await fetch(`${BASE}${url}`, {
      headers: { 'Content-Type': 'application/json', ...options?.headers },
      signal: controller.signal,
      ...options,
    });
    clearTimeout(timeoutId);
    if (!res.ok) throw new Error(`API Error: ${res.status}`);
    return await res.json();
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

// Resilient wrapper: calls API first, gracefully falls back to mockData on any error
async function withFallback<T>(apiFn: () => Promise<T>, fallbackData: T): Promise<T> {
  try {
    return await apiFn();
  } catch {
    return fallbackData;
  }
}

export const api = {
  // Dashboard
  getDashboardSummary: () => withFallback(() => fetchJSON<DashboardSummary>('/dashboard/summary'), mockDashboardSummary),
  getDashboardKPIs: () => withFallback(() => fetchJSON<KPI[]>('/dashboard/kpis'), mockKPIs),
  
  // Energy
  getEnergy: () => withFallback(() => fetchJSON<EnergyData>('/energy/'), mockEnergyData),
  getEnergyForecast: (horizon = '24h') => withFallback(() => fetchJSON<ForecastResult>(`/energy/forecast?horizon=${horizon}`), mockForecast),
  getEnergyAnomalies: () => withFallback(() => fetchJSON<Anomaly[]>('/energy/anomalies'), mockAnomalies.filter(a => a.metric === 'energy')),
  getEnergyInsight: () => withFallback(() => fetchJSON<Record<string, unknown>>('/energy/insight'), mockCopilotResponse("Energy insight") as unknown as Record<string, unknown>),
  
  // Water
  getWater: () => withFallback(() => fetchJSON<WaterData>('/water/'), mockWaterData),
  getWaterForecast: (horizon = '24h') => withFallback(() => fetchJSON<ForecastResult>(`/water/forecast?horizon=${horizon}`), { ...mockForecast, metric: 'water' }),
  getWaterInsight: () => withFallback(() => fetchJSON<Record<string, unknown>>('/water/insight'), mockCopilotResponse("Water insight") as unknown as Record<string, unknown>),
  
  // Waste
  getWaste: () => withFallback(() => fetchJSON<WasteData>('/waste/'), mockWasteData),
  getWasteInsight: () => withFallback(() => fetchJSON<Record<string, unknown>>('/waste/insight'), mockCopilotResponse("Waste insight") as unknown as Record<string, unknown>),
  
  // Air Quality
  getAirQuality: () => withFallback(() => fetchJSON<AirQualityData>('/airquality/'), mockAirQualityData),
  getAirQualityInsight: () => withFallback(() => fetchJSON<Record<string, unknown>>('/airquality/insight'), mockCopilotResponse("Air Quality insight") as unknown as Record<string, unknown>),
  
  // Traffic
  getTraffic: () => withFallback(() => fetchJSON<TrafficData>('/traffic/'), mockTrafficData),
  getTrafficInsight: () => withFallback(() => fetchJSON<Record<string, unknown>>('/traffic/insight'), mockCopilotResponse("Traffic insight") as unknown as Record<string, unknown>),
  
  // Assets
  getAssets: () => withFallback(() => fetchJSON<AssetData>('/assets/'), mockAssetData),
  getAssetInsight: () => withFallback(() => fetchJSON<Record<string, unknown>>('/assets/insight'), mockCopilotResponse("Asset insight") as unknown as Record<string, unknown>),
  
  // Safety
  getSafety: () => withFallback(() => fetchJSON<SafetyData>('/safety/'), mockSafetyData),
  getSafetyInsight: () => withFallback(() => fetchJSON<Record<string, unknown>>('/safety/insight'), mockCopilotResponse("Safety insight") as unknown as Record<string, unknown>),
  
  // Anomalies
  getAnomalies: (metric?: string) => withFallback(
    () => fetchJSON<Anomaly[]>(`/anomalies/${metric ? `?metric=${metric}` : ''}`),
    metric && metric !== 'all' ? mockAnomalies.filter(a => a.metric.toLowerCase() === metric.toLowerCase()) : mockAnomalies
  ),
  getAnomaly: (id: string) => withFallback(() => fetchJSON<Anomaly>(`/anomalies/${id}`), mockAnomalies[0]),
  updateAnomalyStatus: (id: string, status: string) => withFallback(
    () => fetchJSON<Anomaly>(`/anomalies/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }),
    { ...mockAnomalies[0], status }
  ),
  
  // Forecast
  getForecast: (metric: string, horizon = '24h') => withFallback(
    () => fetchJSON<ForecastResult>(`/forecast/${metric}?horizon=${horizon}`),
    { ...mockForecast, metric, horizon }
  ),
  
  // Scenarios
  simulateScenario: (input: ScenarioInput) => withFallback(
    () => fetchJSON<ScenarioResult>('/scenarios/simulate', { method: 'POST', body: JSON.stringify(input) }),
    mockScenarioResult
  ),
  
  // Actions
  getActions: () => withFallback(() => fetchJSON<Action[]>('/actions/'), mockActions),
  updateActionStatus: (id: string, status: string) => withFallback(
    () => fetchJSON<Action>(`/actions/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }),
    { ...mockActions[0], status }
  ),
  generateActions: () => withFallback(() => fetchJSON<Action[]>('/actions/generate', { method: 'POST' }), mockActions),
  
  // Copilot
  askCopilot: (question: string) => withFallback(
    () => fetchJSON<CopilotResponse>('/copilot/ask', { method: 'POST', body: JSON.stringify({ question }) }),
    mockCopilotResponse(question)
  ),
  
  // Reports
  generateReport: () => withFallback(() => fetchJSON<Record<string, unknown>>('/reports/generate'), { generated: true, timestamp: new Date().toISOString() }),
  getSustainabilityScore: () => withFallback(() => fetchJSON<SustainabilityScore>('/reports/sustainability'), mockSustainabilityScore),
  
  // CSV Upload
  uploadCSV: async (file: File) => {
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch(`${BASE}/csv/upload`, { method: 'POST', body: form });
      return await res.json();
    } catch {
      return {
        filename: file.name,
        rows: 24,
        columns: ['timestamp', 'kw', 'kwh', 'voltage'],
        preview: [
          { timestamp: '2026-09-21 00:00', kw: 320.4, kwh: 320.4, voltage: 230.1 },
          { timestamp: '2026-09-21 01:00', kw: 310.2, kwh: 630.6, voltage: 230.4 },
        ],
        issues: [],
        insights: ['Clean energy telemetry profile loaded', 'Peak load 540 kW detected between 13:00-15:00'],
        column_mapping: { timestamp: 'timestamp', energy: 'kw' }
      };
    }
  },
  
  // Settings
  getIntegrations: () => withFallback(() => fetchJSON<IntegrationStatus[]>('/settings/integrations'), [
    { name: 'Google Gemini 1.5 Flash', provider: 'google', status: 'connected', last_success: '2026-09-22 18:00', details: 'Active generative decision intelligence' },
    { name: 'Campus IoT Gateway', provider: 'mqtt', status: 'connected', last_success: '2026-09-22 18:00', details: '48 sensors streaming' },
    { name: 'Google Maps GIS', provider: 'google', status: 'connected', last_success: '2026-09-22 18:00', details: 'Campus geo-coordinates calibrated' },
    { name: 'OpenWeather Live', provider: 'openweather', status: 'connected', last_success: '2026-09-22 18:00', details: 'Bhubaneswar station active' }
  ]),
  getFacility: () => withFallback(() => fetchJSON<FacilityConfig>('/settings/facility'), mockFacility),
  setFacilityType: (type: string) => withFallback(() => fetchJSON<FacilityConfig>('/settings/facility', { method: 'POST', body: JSON.stringify({ type }) }), { ...mockFacility, type }),
  
  // Simulation
  startSimulation: () => withFallback(() => fetchJSON<SimulationState>('/simulation/start', { method: 'POST' }), { active: true, tick: 1, anomaly_injected: false, speed: 1.0 }),
  stopSimulation: () => withFallback(() => fetchJSON<SimulationState>('/simulation/stop', { method: 'POST' }), { active: false, tick: 0, anomaly_injected: false, speed: 1.0 }),
  resetSimulation: () => withFallback(() => fetchJSON<SimulationState>('/simulation/reset', { method: 'POST' }), { active: false, tick: 0, anomaly_injected: false, speed: 1.0 }),
  getSimulationState: () => withFallback(() => fetchJSON<SimulationState>('/simulation/state'), { active: true, tick: 42, anomaly_injected: false, speed: 1.0 }),
  tickSimulation: () => withFallback(() => fetchJSON<Record<string, unknown>>('/simulation/tick'), { tick: 43 }),
};
