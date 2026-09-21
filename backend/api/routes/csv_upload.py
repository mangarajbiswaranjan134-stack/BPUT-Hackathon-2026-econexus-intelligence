from fastapi import APIRouter, UploadFile, File
from backend.services.data_service import data_service
from backend.models.schemas import CSVUploadResult

router = APIRouter(prefix='/api/csv', tags=['CSV'])

@router.post('/upload', response_model=CSVUploadResult)
async def upload_csv(file: UploadFile = File(...)):
    content = await file.read()
    return data_service.process_csv(content, file.filename)
