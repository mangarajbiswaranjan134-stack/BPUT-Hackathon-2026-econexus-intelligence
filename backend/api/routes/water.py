from fastapi import APIRouter
from backend.services.data_service import data_service
from backend.services.ml_service import ml_service
from backend.services.ai_service import ai_service
from backend.models.schemas import WaterData, ForecastResult, Anomaly

router = APIRouter(prefix='/api/water', tags=['Water'])

@router.get('/', response_model=WaterData)
def get_water():
    return data_service.get_water_data()

@router.get('/forecast', response_model=ForecastResult)
def get_forecast(horizon: str = '24h'):
    return ml_service.get_forecast('water', horizon)

@router.get('/anomalies', response_model=list[Anomaly])
def get_anomalies():
    return ml_service.detect_anomalies('water')

@router.get('/insight')
async def get_insight():
    return await ai_service.get_insight('water', data_service.get_water_data().model_dump())
