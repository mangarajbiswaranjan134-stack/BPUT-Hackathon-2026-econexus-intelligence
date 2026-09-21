from fastapi import APIRouter
from backend.services.data_service import data_service
from backend.models.schemas import DashboardSummary, KPI

router = APIRouter(prefix='/api/dashboard', tags=['Dashboard'])

@router.get('/kpis', response_model=list[KPI])
def get_kpis():
    return data_service.get_dashboard_summary().kpis

@router.get('/summary', response_model=DashboardSummary)
def get_summary():
    return data_service.get_dashboard_summary()
