from fastapi import APIRouter
from backend.services.data_service import data_service
from backend.services.ai_service import ai_service
from backend.models.schemas import AssetData

router = APIRouter(prefix='/api/assets', tags=['Assets'])

@router.get('/', response_model=AssetData)
def get_assets():
    return data_service.get_asset_data()

@router.get('/insight')
async def get_insight():
    return await ai_service.get_insight('assets', data_service.get_asset_data().model_dump())
