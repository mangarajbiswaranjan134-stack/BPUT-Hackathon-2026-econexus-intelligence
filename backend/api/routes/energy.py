from fastapi import APIRouter
from backend.services.data_service import data_service
from backend.services.ml_service import ml_service
from backend.services.ai_service import ai_service
from backend.models.schemas import EnergyData, ForecastResult, Anomaly

router = APIRouter(prefix='/api/energy', tags=['Energy'])

@router.get('/', response_model=EnergyData)
def get_energy():
    return data_service.get_energy_data()

@router.get('/forecast', response_model=ForecastResult)
def get_forecast(horizon: str = '24h'):
    return ml_service.get_forecast('energy', horizon)

@router.get('/anomalies', response_model=list[Anomaly])
def get_anomalies():
    return ml_service.detect_anomalies('energy')

@router.get('/insight')
async def get_insight():
    return await ai_service.get_insight('energy', data_service.get_energy_data().model_dump())
