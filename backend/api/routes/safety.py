from fastapi import APIRouter
from backend.services.data_service import data_service
from backend.services.ai_service import ai_service
from backend.models.schemas import SafetyData

router = APIRouter(prefix='/api/safety', tags=['Safety'])

@router.get('/', response_model=SafetyData)
def get_safety():
    return data_service.get_safety_data()

@router.get('/insight')
async def get_insight():
    return await ai_service.get_insight('safety', data_service.get_safety_data().model_dump())
