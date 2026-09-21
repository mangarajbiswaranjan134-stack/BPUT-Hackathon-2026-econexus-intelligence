from backend.models.schemas import SustainabilityScore

class SustainabilityScorer:
    WEIGHTS = {
        'energy': 0.20,
        'water': 0.15,
        'waste': 0.15,
        'air_quality': 0.15,
        'emissions': 0.10,
        'safety': 0.10,
        'operational_efficiency': 0.15
    }

    def calculate_energy_score(self, current_kwh: float, baseline_kwh: float) -> float:
        if baseline_kwh == 0: return 100.0
        score = 100 * (1 - max(0, (current_kwh - baseline_kwh) / baseline_kwh))
        return max(0.0, min(100.0, score))

    def calculate_water_score(self, current_lph: float, baseline_lph: float) -> float:
        if baseline_lph == 0: return 100.0
        score = 100 * (1 - max(0, (current_lph - baseline_lph) / baseline_lph))
        return max(0.0, min(100.0, score))

    def calculate_waste_score(self, avg_fill_pct: float, overflow_count: int) -> float:
        score = 100 - avg_fill_pct - (overflow_count * 5)
        return max(0.0, min(100.0, score))

    def calculate_air_quality_score(self, aqi: int) -> float:
        if aqi <= 50: return 100.0
        if aqi <= 100: return 80.0
        if aqi <= 150: return 60.0
        if aqi <= 200: return 40.0
        if aqi <= 300: return 20.0
        return 0.0

    def calculate_emissions_score(self, current_co2: float, baseline_co2: float) -> float:
        if baseline_co2 == 0: return 100.0
        score = 100 * (1 - max(0, (current_co2 - baseline_co2) / baseline_co2))
        return max(0.0, min(100.0, score))

    def calculate_safety_score(self, incidents_this_month: int, avg_monthly: float) -> float:
        score = 100 - (incidents_this_month / max(avg_monthly, 1)) * 30
        return max(0.0, min(100.0, score))

    def calculate_operational_score(self, avg_utilization: float, idle_assets: int, total_assets: int) -> float:
        if total_assets == 0: return 100.0
        util_score = 100 - abs(0.7 - avg_utilization) * 100
        idle_penalty = (idle_assets / total_assets) * 50
        score = util_score - idle_penalty
        return max(0.0, min(100.0, score))

    def calculate_overall(self, scores: dict) -> SustainabilityScore:
        overall = sum(scores.get(k, 0) * w for k, w in self.WEIGHTS.items())
        return SustainabilityScore(
            overall=overall,
            energy=scores.get('energy', 0),
            water=scores.get('water', 0),
            waste=scores.get('waste', 0),
            air_quality=scores.get('air_quality', 0),
            emissions=scores.get('emissions', 0),
            safety=scores.get('safety', 0),
            operational_efficiency=scores.get('operational_efficiency', 0),
            methodology='Weighted average of key metrics.',
            factors=[{'name': k, 'score': scores.get(k, 0), 'weight': w, 'description': f'{k} score'} for k, w in self.WEIGHTS.items()]
        )
