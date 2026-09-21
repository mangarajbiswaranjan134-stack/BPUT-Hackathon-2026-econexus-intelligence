from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from backend.utils.config import settings
from backend.models.database import init_db
from backend.services.data_service import data_service

from backend.api.routes.dashboard import router as dashboard_router
from backend.api.routes.energy import router as energy_router
from backend.api.routes.water import router as water_router
from backend.api.routes.waste import router as waste_router
from backend.api.routes.airquality import router as airquality_router
from backend.api.routes.traffic import router as traffic_router
from backend.api.routes.assets import router as assets_router
from backend.api.routes.safety import router as safety_router
from backend.api.routes.anomalies import router as anomalies_router
from backend.api.routes.forecast import router as forecast_router
from backend.api.routes.scenarios import router as scenarios_router
from backend.api.routes.actions import router as actions_router
from backend.api.routes.copilot import router as copilot_router
from backend.api.routes.reports import router as reports_router
from backend.api.routes.csv_upload import router as csv_upload_router
from backend.api.routes.settings import router as settings_router
from backend.api.routes.simulation import router as simulation_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    data_service.initialize()
    yield

app = FastAPI(
    title='EcoNexus Intelligence',
    description='AI-Powered Facility Decision Intelligence Platform',
    version='1.0.0',
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.frontend_url,
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:3000',
        '*'
    ],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

app.include_router(dashboard_router)
app.include_router(energy_router)
app.include_router(water_router)
app.include_router(waste_router)
app.include_router(airquality_router)
app.include_router(traffic_router)
app.include_router(assets_router)
app.include_router(safety_router)
app.include_router(anomalies_router)
app.include_router(forecast_router)
app.include_router(scenarios_router)
app.include_router(actions_router)
app.include_router(copilot_router)
app.include_router(reports_router)
app.include_router(csv_upload_router)
app.include_router(settings_router)
app.include_router(simulation_router)

@app.get('/')
def root():
    return {
        'service': 'EcoNexus Intelligence API',
        'status': 'online',
        'version': '1.0.0',
        'docs_url': '/docs',
        'health_url': '/api/health'
    }

@app.get('/api/health')
def health():
    return {'status': 'ok', 'version': '1.0.0'}

