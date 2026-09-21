from fastapi import APIRouter
from backend.services.data_service import data_service
from backend.services.ai_service import ai_service
from backend.models.schemas import AirQualityData

router = APIRouter(prefix='/api/airquality', tags=['AirQuality'])

@router.get('/', response_model=AirQualityData)
def get_aqi():
    return data_service.get_air_quality_data()

@router.get('/history')
def get_history():
    return data_service.get_air_quality_data().history

@router.get('/insight')
async def get_insight():
    return await ai_service.get_insight('air_quality', data_service.get_air_quality_data().model_dump())
