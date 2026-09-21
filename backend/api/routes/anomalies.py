from fastapi import APIRouter, HTTPException
from backend.services.ml_service import ml_service
from backend.models.schemas import Anomaly
from typing import Optional

router = APIRouter(prefix='/api/anomalies', tags=['Anomalies'])

@router.get('/', response_model=list[Anomaly])
def get_anomalies(metric: Optional[str] = None, severity: Optional[str] = None):
    return ml_service.get_all_anomalies()

@router.get('/{anomaly_id}', response_model=Anomaly)
def get_anomaly(anomaly_id: str):
    ans = ml_service.get_all_anomalies()
    for a in ans:
        if a.id == anomaly_id: return a
    raise HTTPException(status_code=404, detail="Anomaly not found")

@router.patch('/{anomaly_id}', response_model=Anomaly)
def update_anomaly(anomaly_id: str):
    ans = ml_service.get_all_anomalies()
    for a in ans:
        if a.id == anomaly_id: 
            a.status = 'acknowledged'
            return a
    raise HTTPException(status_code=404, detail="Anomaly not found")
