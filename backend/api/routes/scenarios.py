from fastapi import APIRouter
from backend.services.scenario_service import scenario_service
from backend.models.schemas import ScenarioInput, ScenarioResult

router = APIRouter(prefix='/api/scenarios', tags=['Scenarios'])

@router.post('/simulate', response_model=ScenarioResult)
def simulate(input: ScenarioInput):
    return scenario_service.simulate(input)
