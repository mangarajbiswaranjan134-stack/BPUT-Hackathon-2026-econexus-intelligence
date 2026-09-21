from backend.models.schemas import ScenarioInput, ScenarioResult
from backend.services.data_service import data_service
from backend.ml.scoring import SustainabilityScorer


class ScenarioService:
    def __init__(self):
        self.scorer = SustainabilityScorer()

    def simulate(self, scenario: ScenarioInput) -> ScenarioResult:
        """Simulate the impact of operational changes on facility metrics."""
        current_vals = data_service.get_all_current_values()

        # Current baseline values
        energy_kwh = current_vals.get('energy_kw', 450) * 24
        water_liters = current_vals.get('water_lph', 1200) * 24
        waste_kg = 450  # daily baseline
        co2_tons = current_vals.get('co2_estimate', 0.5) * 24
        cost_inr = energy_kwh * 7.5 + water_liters * 0.05 + waste_kg * 2.0

        current = {
            'energy': round(energy_kwh, 1),
            'water': round(water_liters, 1),
            'waste': round(waste_kg, 1),
            'co2': round(co2_tons, 3),
            'cost': round(cost_inr, 0),
            'sustainability_score': 78.5
        }

        # Apply changes
        # HVAC is ~60% of energy
        hvac_factor = scenario.hvac_change / 100
        energy_change = hvac_factor * 0.6 + (scenario.operating_hours_change / 100) * 0.3 + (scenario.occupancy_change / 100) * 0.25

        water_change = (scenario.water_change / 100) + (scenario.occupancy_change / 100) * 0.5 + (scenario.operating_hours_change / 100) * 0.15

        waste_change = -(scenario.waste_collection_change / 100) * 0.4 + (scenario.occupancy_change / 100) * 0.4

        traffic_impact = scenario.traffic_change / 100
        co2_change = energy_change * 0.85 + traffic_impact * 0.15

        cost_change = energy_change * 0.55 + water_change * 0.15 + waste_change * 0.10 + traffic_impact * 0.05

        sim_energy = round(energy_kwh * (1 + energy_change), 1)
        sim_water = round(water_liters * (1 + water_change), 1)
        sim_waste = round(waste_kg * (1 + waste_change), 1)
        sim_co2 = round(co2_tons * (1 + co2_change), 3)
        sim_cost = round(cost_inr * (1 + cost_change), 0)

        # Recalculate sustainability score
        base_score = 78.5
        score_delta = -energy_change * 20 - water_change * 15 - waste_change * 15 - co2_change * 10
        sim_score = round(max(0, min(100, base_score + score_delta)), 1)

        simulated = {
            'energy': sim_energy,
            'water': sim_water,
            'waste': sim_waste,
            'co2': sim_co2,
            'cost': sim_cost,
            'sustainability_score': sim_score
        }

        changes = {
            'energy_pct': round(energy_change * 100, 1),
            'water_pct': round(water_change * 100, 1),
            'waste_pct': round(waste_change * 100, 1),
            'co2_pct': round(co2_change * 100, 1),
            'cost_pct': round(cost_change * 100, 1),
            'score_change': round(sim_score - base_score, 1)
        }

        # Generate insights based on the scenario
        insights = []
        if energy_change < -0.05:
            savings = round(abs(energy_change) * energy_kwh * 7.5, 0)
            insights.append(f"Energy reduction of {abs(changes['energy_pct'])}% would save approximately ₹{savings:,.0f} per day.")
        elif energy_change > 0.05:
            extra = round(energy_change * energy_kwh * 7.5, 0)
            insights.append(f"Energy increase of {changes['energy_pct']}% would add approximately ₹{extra:,.0f} to daily costs.")

        if water_change < -0.05:
            insights.append(f"Water reduction of {abs(changes['water_pct'])}% contributes to sustainability improvement.")

        if changes['score_change'] > 0:
            insights.append(f"Sustainability score would improve by {changes['score_change']} points to {sim_score}/100.")
        elif changes['score_change'] < 0:
            insights.append(f"Sustainability score would decrease by {abs(changes['score_change'])} points to {sim_score}/100.")

        if co2_change < 0:
            co2_saved = round(abs(co2_change) * co2_tons, 3)
            insights.append(f"CO₂ emissions would decrease by {co2_saved} tons per day.")

        if not insights:
            insights.append("Minimal impact detected with current parameter changes. Adjust sliders for more significant scenarios.")

        insights.append("⚠️ These are modeled estimates based on simplified assumptions. Actual results may vary.")

        return ScenarioResult(
            current=current,
            simulated=simulated,
            changes=changes,
            insights=insights,
            label='Scenario Estimate'
        )


scenario_service = ScenarioService()
