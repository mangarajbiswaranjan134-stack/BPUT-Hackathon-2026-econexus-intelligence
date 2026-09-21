from fastapi import APIRouter
from pydantic import BaseModel
from backend.services.data_service import data_service
from backend.services.ai_service import ai_service
from backend.utils.config import Settings
from backend.models.schemas import IntegrationStatus, FacilityConfig
from datetime import datetime


router = APIRouter(prefix='/api/settings', tags=['Settings'])


@router.get('/integrations', response_model=list[IntegrationStatus])
def get_integrations():
    """Return status of all external API integrations."""
    current_settings = Settings()
    integrations = []

    # Gemini AI
    gemini_status = 'connected' if ai_service.is_gemini_available() else (
        'not_configured' if not current_settings.gemini_api_key else 'error')
    integrations.append(IntegrationStatus(
        name='Gemini AI',
        provider='Google',
        status=gemini_status,
        last_success=datetime.now().isoformat() if gemini_status == 'connected' else None,
        details='AI copilot, insights, and recommendations' if gemini_status == 'connected'
                else 'Using template-based fallback insights'
    ))

    # Maps
    map_status = 'connected' if current_settings.map_api_key else 'fallback'
    integrations.append(IntegrationStatus(
        name='Maps',
        provider=current_settings.map_provider.title() if current_settings.map_api_key else 'OpenStreetMap (Free)',
        status=map_status,
        last_success=datetime.now().isoformat() if map_status == 'connected' else None,
        details='Google Maps integration' if map_status == 'connected' else 'Using free OpenStreetMap tiles'
    ))

    # Weather
    weather_status = 'connected' if current_settings.weather_api_key else 'not_configured'
    integrations.append(IntegrationStatus(
        name='Weather',
        provider=current_settings.weather_provider.title() if current_settings.weather_api_key else 'None',
        status='fallback' if not current_settings.weather_api_key else weather_status,
        last_success=None,
        details='Real-time weather data' if weather_status == 'connected'
                else 'Using synthetic weather data'
    ))

    # Environmental Data
    integrations.append(IntegrationStatus(
        name='Environmental Data',
        provider='Synthetic Generator',
        status='fallback',
        last_success=datetime.now().isoformat(),
        details='Using synthetic IoT sensor data for demonstration'
    ))

    return integrations


@router.get('/facility', response_model=FacilityConfig)
def get_facility():
    return data_service.get_current_facility()


class FacilityTypeRequest(BaseModel):
    type: str


@router.post('/facility', response_model=FacilityConfig)
def set_facility(req: FacilityTypeRequest):
    return data_service.set_facility_type(req.type)
