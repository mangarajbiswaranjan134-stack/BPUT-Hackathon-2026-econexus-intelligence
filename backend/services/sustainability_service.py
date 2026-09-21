from backend.models.schemas import SustainabilityScore
from backend.ml.scoring import SustainabilityScorer
from backend.services.data_service import data_service
import numpy as np
from datetime import datetime, timedelta


class SustainabilityService:
    def __init__(self):
        self.scorer = SustainabilityScorer()

    def get_score(self) -> SustainabilityScore:
        """Calculate sustainability score from actual facility data."""
        current = data_service.get_all_current_values()
        energy_data = data_service.get_energy_data()
        water_data = data_service.get_water_data()
        waste_data = data_service.get_waste_data()
        aq_data = data_service.get_air_quality_data()
        asset_data = data_service.get_asset_data()
        safety_data = data_service.get_safety_data()

        energy_score = self.scorer.calculate_energy_score(
            energy_data.current_kw, energy_data.baseline_kw)
        water_score = self.scorer.calculate_water_score(
            water_data.current_lph, water_data.baseline_lph)
        waste_score = self.scorer.calculate_waste_score(
            float(np.mean([b['fill_pct'] for b in waste_data.bins]) if waste_data.bins else 50),
            waste_data.overflow_risk)
        aq_score = self.scorer.calculate_air_quality_score(aq_data.aqi)
        emissions_score = self.scorer.calculate_emissions_score(
            current.get('co2_estimate', 0.5), current.get('co2_estimate', 0.5) * 0.9)
        safety_score = self.scorer.calculate_safety_score(
            safety_data.open_incidents, max(safety_data.total_incidents / 3, 1))
        operational_score = self.scorer.calculate_operational_score(
            asset_data.utilization_pct / 100, asset_data.idle, asset_data.total_assets)

        scores = {
            'energy': round(energy_score, 1),
            'water': round(water_score, 1),
            'waste': round(waste_score, 1),
            'air_quality': round(aq_score, 1),
            'emissions': round(emissions_score, 1),
            'safety': round(safety_score, 1),
            'operational_efficiency': round(operational_score, 1)
        }

        result = self.scorer.calculate_overall(scores)
        result.methodology = (
            "The EcoNexus Sustainability Score is a weighted composite of 7 domain scores, "
            "each rated 0-100. Weights: Energy 20%, Water 15%, Waste 15%, Air Quality 15%, "
            "Emissions 10%, Safety 10%, Operational Efficiency 15%. "
            "This is a demonstration metric and does not represent an official environmental certification."
        )
        result.factors = [
            {'name': 'Energy Efficiency', 'score': scores['energy'], 'weight': 0.20,
             'description': f"Based on current ({energy_data.current_kw} kW) vs baseline ({energy_data.baseline_kw} kW) consumption"},
            {'name': 'Water Conservation', 'score': scores['water'], 'weight': 0.15,
             'description': f"Based on current ({water_data.current_lph} LPH) vs baseline ({water_data.baseline_lph} LPH) flow rate"},
            {'name': 'Waste Management', 'score': scores['waste'], 'weight': 0.15,
             'description': f"Based on average bin fill level and {waste_data.overflow_risk} overflow risk bins"},
            {'name': 'Air Quality', 'score': scores['air_quality'], 'weight': 0.15,
             'description': f"Based on current AQI: {aq_data.aqi} ({aq_data.category})"},
            {'name': 'Carbon Emissions', 'score': scores['emissions'], 'weight': 0.10,
             'description': f"Based on estimated CO₂ emissions from energy consumption"},
            {'name': 'Safety', 'score': scores['safety'], 'weight': 0.10,
             'description': f"Based on {safety_data.open_incidents} open incidents out of {safety_data.total_incidents} total"},
            {'name': 'Operational Efficiency', 'score': scores['operational_efficiency'], 'weight': 0.15,
             'description': f"Based on {asset_data.utilization_pct}% average asset utilization with {asset_data.idle} idle assets"},
        ]
        return result

    def get_score_history(self, days: int = 30) -> list[dict]:
        """Generate historical sustainability scores for trend visualization."""
        rng = np.random.RandomState(42)
        history = []
        base_score = 75.0
        for i in range(days):
            d = datetime.now() - timedelta(days=days - i)
            # Gradually improving trend with noise
            score = base_score + (i / days) * 8 + rng.normal(0, 2)
            score = round(max(50, min(100, score)), 1)
            history.append({
                'date': d.strftime('%Y-%m-%d'),
                'score': score,
                'energy': round(max(50, min(100, 80 + rng.normal(0, 5))), 1),
                'water': round(max(50, min(100, 78 + rng.normal(0, 4))), 1),
                'waste': round(max(50, min(100, 82 + rng.normal(0, 6))), 1),
            })
        return history


sustainability_service = SustainabilityService()
