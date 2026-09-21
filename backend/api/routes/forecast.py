from fastapi import APIRouter
from backend.services.ml_service import ml_service
from backend.models.schemas import ForecastResult

router = APIRouter(prefix='/api/forecast', tags=['Forecast'])

@router.get('/{metric}', response_model=ForecastResult)
def get_forecast(metric: str, horizon: str = '24h'):
    return ml_service.get_forecast(metric, horizon)
