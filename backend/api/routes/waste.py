from fastapi import APIRouter
from backend.services.data_service import data_service
from backend.services.ml_service import ml_service
from backend.services.ai_service import ai_service
from backend.models.schemas import WasteData, ForecastResult

router = APIRouter(prefix='/api/waste', tags=['Waste'])

@router.get('/', response_model=WasteData)
def get_waste():
    return data_service.get_waste_data()

@router.get('/forecast', response_model=ForecastResult)
def get_forecast(horizon: str = '24h'):
    return ml_service.get_forecast('waste', horizon)

@router.get('/insight')
async def get_insight():
    return await ai_service.get_insight('waste', data_service.get_waste_data().model_dump())
