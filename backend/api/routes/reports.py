from fastapi import APIRouter
from backend.services.sustainability_service import sustainability_service
from backend.services.data_service import data_service
from backend.services.ml_service import ml_service
from backend.services.ai_service import ai_service
from backend.models.schemas import SustainabilityScore
from datetime import datetime

router = APIRouter(prefix='/api/reports', tags=['Reports'])


@router.get('/generate')
def generate_report():
    """Generate comprehensive facility intelligence report."""
    sustainability = sustainability_service.get_score()
    energy = data_service.get_energy_data()
    water = data_service.get_water_data()
    waste = data_service.get_waste_data()
    air_quality = data_service.get_air_quality_data()
    safety = data_service.get_safety_data()
    anomalies = ml_service.get_all_anomalies()
    actions = ai_service.get_recommendations()
    facility = data_service.get_current_facility()

    return {
        'metadata': {
            'generated_at': datetime.now().isoformat(),
            'facility_name': facility.name,
            'facility_type': facility.type,
            'location': facility.location,
            'period': 'Last 7 days',
            'label': 'AI Decision-Support Report'
        },
        'sustainability': sustainability.model_dump(),
        'energy': {
            'current_kw': energy.current_kw,
            'daily_kwh': energy.daily_kwh,
            'peak_kw': energy.peak_kw,
            'baseline_kw': energy.baseline_kw,
            'trend_pct': energy.trend_pct,
            'cost_estimate': energy.cost_estimate,
            'building_count': len(energy.by_building),
            'anomaly_count': len(energy.anomalies)
        },
        'water': {
            'current_lph': water.current_lph,
            'daily_liters': water.daily_liters,
            'baseline_lph': water.baseline_lph,
            'trend_pct': water.trend_pct,
            'overnight_baseline': water.overnight_baseline
        },
        'waste': {
            'total_bins': waste.total_bins,
            'overflow_risk': waste.overflow_risk,
            'collection_efficiency': waste.collection_efficiency,
            'daily_generation_kg': waste.daily_generation_kg
        },
        'air_quality': {
            'aqi': air_quality.aqi,
            'category': air_quality.category,
            'pm25': air_quality.pm25,
            'pm10': air_quality.pm10,
            'co2': air_quality.co2
        },
        'safety': {
            'total_incidents': safety.total_incidents,
            'open_incidents': safety.open_incidents,
            'risk_level': safety.risk_level,
            'trend_pct': safety.trend_pct
        },
        'anomalies': {
            'total': len(anomalies),
            'critical': sum(1 for a in anomalies if a.severity == 'critical'),
            'high': sum(1 for a in anomalies if a.severity == 'high'),
            'medium': sum(1 for a in anomalies if a.severity == 'medium'),
            'low': sum(1 for a in anomalies if a.severity == 'low'),
            'items': [a.model_dump() for a in anomalies[:5]]
        },
        'actions': {
            'total': len(actions),
            'items': [a.model_dump() for a in actions[:5]]
        }
    }


@router.get('/sustainability', response_model=SustainabilityScore)
def get_sustainability():
    return sustainability_service.get_score()
