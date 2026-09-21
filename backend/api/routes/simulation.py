from fastapi import APIRouter
from backend.services.simulation_service import simulation_service
from backend.models.schemas import SimulationState

router = APIRouter(prefix='/api/simulation', tags=['Simulation'])

@router.post('/start', response_model=SimulationState)
def start_simulation():
    simulation_service.start()
    return simulation_service.get_state()

@router.post('/stop', response_model=SimulationState)
def stop_simulation():
    simulation_service.stop()
    return simulation_service.get_state()

@router.post('/reset', response_model=SimulationState)
def reset_simulation():
    simulation_service.reset()
    return simulation_service.get_state()

@router.get('/state', response_model=SimulationState)
def get_state():
    return simulation_service.get_state()

@router.get('/tick')
def tick():
    simulation_service.tick()
    return simulation_service.get_live_values()
