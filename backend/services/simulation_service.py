from backend.models.schemas import SimulationState
from backend.services.data_service import data_service
import numpy as np


class SimulationService:
    """Manages live demo simulation with realistic sensor value updates."""

    def __init__(self):
        self.state = SimulationState(active=False, tick=0, anomaly_injected=False, speed=1.0)
        self._base_values = None

    def start(self):
        self.state.active = True
        self.state.tick = 0
        self.state.anomaly_injected = False
        self._base_values = data_service.get_all_current_values()

    def stop(self):
        self.state.active = False

    def reset(self):
        self.state.active = False
        self.state.tick = 0
        self.state.anomaly_injected = False
        self._base_values = None
        data_service.initialize()  # Regenerate base data

    def tick(self) -> dict:
        """Advance simulation by one tick. Returns updated values."""
        if not self.state.active:
            return self.get_live_values()

        self.state.tick += 1
        rng = np.random.RandomState(self.state.tick)

        # Get base values
        if self._base_values is None:
            self._base_values = data_service.get_all_current_values()

        # Apply small random variations
        variation = 0.02 + (self.state.tick % 20) * 0.001  # Slight increasing variation

        values = {}
        values['energy_kw'] = round(self._base_values['energy_kw'] * (1 + rng.normal(0, variation)), 1)
        values['water_lph'] = round(self._base_values['water_lph'] * (1 + rng.normal(0, variation)), 1)
        values['aqi'] = max(30, round(self._base_values['aqi'] + rng.normal(0, 5)))
        values['vehicles'] = max(0, int(self._base_values['vehicles'] * (1 + rng.normal(0, variation * 2))))

        # Inject anomaly after tick 10
        if self.state.tick >= 10 and not self.state.anomaly_injected:
            self.state.anomaly_injected = True
            values['energy_kw'] = round(self._base_values['energy_kw'] * 1.25, 1)  # 25% spike

        # Maintain anomaly for a few ticks
        if self.state.anomaly_injected and 10 <= self.state.tick <= 15:
            values['energy_kw'] = round(self._base_values['energy_kw'] * (1.15 + rng.uniform(0, 0.15)), 1)

        # Update cached current values
        data_service._cache['current'] = {
            **data_service._cache.get('current', {}),
            **values,
            'co2_estimate': round(values['energy_kw'] * 0.82 / 1000, 3)
        }

        # Refresh waste and parking data occasionally
        if self.state.tick % 5 == 0:
            data_service.refresh_data()

        return self.get_live_values()

    def get_state(self) -> SimulationState:
        return self.state

    def get_live_values(self) -> dict:
        """Return current live values including simulation state."""
        current = data_service.get_all_current_values()
        return {
            **current,
            'simulation': self.state.model_dump(),
            'timestamp': __import__('datetime').datetime.now().isoformat()
        }


simulation_service = SimulationService()
