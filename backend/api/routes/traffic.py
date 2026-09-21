from fastapi import APIRouter
from backend.services.data_service import data_service
from backend.services.ai_service import ai_service
from backend.models.schemas import TrafficData

router = APIRouter(prefix='/api/traffic', tags=['Traffic'])

@router.get('/', response_model=TrafficData)
def get_traffic():
    return data_service.get_traffic_data()

@router.get('/parking')
def get_parking():
    return {'parking_zones': data_service.get_traffic_data().parking_zones}

@router.get('/insight')
async def get_insight():
    return await ai_service.get_insight('traffic', data_service.get_traffic_data().model_dump())
