from __future__ import annotations
from pydantic import BaseModel
from typing import Optional

class BuildingConfig(BaseModel):
    id: str
    name: str
    zones: list[str]
    type: str
    area_sqft: float
    floors: int

class FacilityConfig(BaseModel):
    id: str
    name: str
    type: str
    location: str
    latitude: float
    longitude: float
    buildings: list[BuildingConfig]
    timezone: str = 'Asia/Kolkata'

class SensorReading(BaseModel):
    timestamp: str
    facility_id: str
    building_id: str
    zone: str
    metric: str
    value: float
    unit: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class KPI(BaseModel):
    id: str
    label: str
    value: float
    unit: str
    trend: float
    status: str
    sparkline: list[float]
    description: str

class DashboardSummary(BaseModel):
    kpis: list[KPI]
    sustainability_score: float
    active_anomalies: int
    predicted_risks: int
    top_insight: str
    facility: FacilityConfig
    simulation_active: bool
    timestamp: str

class EnergyData(BaseModel):
    current_kw: float
    daily_kwh: float
    peak_kw: float
    baseline_kw: float
    trend_pct: float
    cost_estimate: float
    history: list[dict]
    by_building: list[dict]
    heatmap: list[dict]
    anomalies: list[dict]

class WaterData(BaseModel):
    current_lph: float
    daily_liters: float
    baseline_lph: float
    trend_pct: float
    history: list[dict]
    by_zone: list[dict]
    anomalies: list[dict]
    overnight_baseline: float

class WasteData(BaseModel):
    bins: list[dict]
    total_bins: int
    overflow_risk: int
    collection_efficiency: float
    daily_generation_kg: float
    history: list[dict]
    by_type: list[dict]

class AirQualityData(BaseModel):
    aqi: int
    category: str
    pm25: float
    pm10: float
    co2: float
    temperature: float
    humidity: float
    history: list[dict]
    hotspots: list[dict]
    trend_pct: float

class TrafficData(BaseModel):
    current_vehicles: int
    peak_hour: str
    congestion_level: str
    parking_total: int
    parking_occupied: int
    parking_pct: float
    hotspots: list[dict]
    history: list[dict]
    parking_zones: list[dict]

class AssetData(BaseModel):
    total_assets: int
    active: int
    maintenance: int
    idle: int
    utilization_pct: float
    assets: list[dict]
    by_category: list[dict]
    anomalies: list[dict]

class SafetyData(BaseModel):
    total_incidents: int
    open_incidents: int
    trend_pct: float
    risk_level: str
    incidents: list[dict]
    by_category: list[dict]
    by_location: list[dict]
    monthly_trend: list[dict]

class Anomaly(BaseModel):
    id: str
    timestamp: str
    metric: str
    location: str
    building: str
    observed: float
    expected: float
    deviation_pct: float
    severity: str
    possible_cause: str
    recommendation: str
    status: str = 'new'

class ForecastPoint(BaseModel):
    timestamp: str
    value: float
    lower: float
    upper: float

class ForecastResult(BaseModel):
    metric: str
    horizon: str
    historical: list[dict]
    forecast: list[ForecastPoint]
    confidence: float
    trend: str
    summary: str

class ScenarioInput(BaseModel):
    hvac_change: float = 0
    water_change: float = 0
    waste_collection_change: float = 0
    traffic_change: float = 0
    operating_hours_change: float = 0
    occupancy_change: float = 0

class ScenarioResult(BaseModel):
    current: dict
    simulated: dict
    changes: dict
    insights: list[str]
    label: str = 'Scenario Estimate'

class Action(BaseModel):
    id: str
    priority: str
    problem: str
    who: str
    what: str
    where: str
    when: str
    why: str
    expected_impact: str
    confidence: float
    status: str = 'new'
    created_at: str
    metric: str

class CopilotQuery(BaseModel):
    question: str
    context: str = 'general'

class CopilotResponse(BaseModel):
    answer: str
    insight: str
    cause: str
    evidence: list[str]
    prediction: str
    recommendation: str
    expected_impact: str
    confidence: float
    assumptions: list[str]
    data_label: str = 'AI Decision-Support Insight'

class SustainabilityScore(BaseModel):
    overall: float
    energy: float
    water: float
    waste: float
    air_quality: float
    emissions: float
    safety: float
    operational_efficiency: float
    methodology: str
    factors: list[dict]

class IntegrationStatus(BaseModel):
    name: str
    provider: str
    status: str
    last_success: Optional[str] = None
    details: str = ''

class CSVUploadResult(BaseModel):
    filename: str
    rows: int
    columns: list[str]
    preview: list[dict]
    issues: list[str]
    insights: list[str]
    column_mapping: dict

class SimulationState(BaseModel):
    active: bool
    tick: int = 0
    anomaly_injected: bool = False
    speed: float = 1.0
