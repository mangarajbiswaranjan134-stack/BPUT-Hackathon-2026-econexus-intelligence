from backend.ai.gemini_client import gemini_client
from backend.ai.insight_templates import insight_generator
from backend.models.schemas import CopilotResponse, Action
from backend.services.data_service import data_service
import uuid
from datetime import datetime


class AIService:
    def __init__(self):
        self.gemini = gemini_client
        self.templates = insight_generator

    async def get_insight(self, metric: str, data: dict) -> dict:
        """Get AI insight for a metric. Tries Gemini first, falls back to templates."""
        if self.gemini.available:
            prompt = f"Analyze the current {metric} data for this facility and provide actionable insight."
            res = await self.gemini.generate_insight(prompt, data)
            if res:
                return res

        # Template fallback
        generators = {
            'energy': self.templates.generate_energy_insight,
            'water': self.templates.generate_water_insight,
            'waste': self.templates.generate_waste_insight,
            'air_quality': self.templates.generate_air_quality_insight,
            'airquality': self.templates.generate_air_quality_insight,
            'traffic': self.templates.generate_traffic_insight,
            'assets': self.templates.generate_asset_insight,
            'safety': self.templates.generate_safety_insight,
        }
        generator = generators.get(metric)
        if generator:
            return generator(data)
        return self.templates.generate_energy_insight(data)

    async def copilot_ask(self, question: str) -> CopilotResponse:
        """Process a copilot question. Uses actual facility data."""
        facility_data = {
            'current': data_service.get_all_current_values(),
            'facility': data_service.get_current_facility().model_dump(),
        }

        if self.gemini.available:
            res = await self.gemini.copilot_chat(question, facility_data)
            if res:
                return res

        return self.templates.generate_copilot_response(question, facility_data)

    def get_recommendations(self) -> list[Action]:
        """Generate AI-driven action recommendations based on current data."""
        current = data_service.get_all_current_values()
        actions = []
        now = datetime.now().isoformat()

        # Energy recommendation
        energy = current.get('energy_kw', 0)
        if energy > 700:
            actions.append(Action(
                id=str(uuid.uuid4())[:8],
                priority='high',
                problem=f'Energy consumption elevated at {energy} kW, 24% above baseline',
                who='Maintenance Team',
                what='Adjust HVAC setpoints in Block B from 22°C to 24°C during 13:00-16:00',
                where='Block B - Science & Technology Block',
                when='Today, 13:00-16:00',
                why='HVAC is the largest energy consumer (~60%). Afternoon peak coincides with maximum cooling demand.',
                expected_impact='Estimated 10-15% reduction in Block B energy consumption, saving ~₹5,000/day',
                confidence=0.87,
                status='new',
                created_at=now,
                metric='energy'
            ))

        # Waste recommendation
        waste_risk = current.get('overflow_risk_bins', 0)
        if waste_risk > 0:
            actions.append(Action(
                id=str(uuid.uuid4())[:8],
                priority='critical' if waste_risk > 4 else 'high',
                problem=f'{waste_risk} waste bins above 80% capacity - overflow risk',
                who='Housekeeping / Waste Management',
                what=f'Deploy immediate waste collection for {waste_risk} high-risk bins',
                where='Cafeteria East, Hostel Block, Workshop Area',
                when='Immediate - within next 2 hours',
                why='Bins approaching overflow create health hazards and attract pests.',
                expected_impact='Prevent overflow incidents. Maintain hygiene standards.',
                confidence=0.92,
                status='new',
                created_at=now,
                metric='waste'
            ))

        # Water recommendation
        water = current.get('water_lph', 0)
        if water > 1500:
            actions.append(Action(
                id=str(uuid.uuid4())[:8],
                priority='medium',
                problem=f'Water consumption elevated at {water} LPH',
                who='Plumbing / Maintenance',
                what='Inspect hostel water supply lines for potential leaks. Check irrigation timers.',
                where='Girls Hostel Complex, Garden Irrigation System',
                when='Next maintenance window (within 24 hours)',
                why='Consumption 18% above overnight baseline suggests possible leak or misconfigured irrigation.',
                expected_impact='Leak detection could save 15-20% of daily water consumption (~5,000 liters/day)',
                confidence=0.75,
                status='new',
                created_at=now,
                metric='water'
            ))

        # AQI recommendation
        aqi = current.get('aqi', 0)
        if aqi > 120:
            actions.append(Action(
                id=str(uuid.uuid4())[:8],
                priority='medium',
                problem=f'Air quality index at {aqi} - Unhealthy for sensitive groups',
                who='Administration / Health Office',
                what='Issue advisory for sensitive individuals. Ensure indoor air filtration is operational.',
                where='Outdoor activity areas, Sports Complex',
                when='Until AQI drops below 100',
                why='Elevated PM2.5 levels near main road and construction zones.',
                expected_impact='Reduce health risk for sensitive individuals. Indoor measures can cut exposure by 40-60%.',
                confidence=0.78,
                status='new',
                created_at=now,
                metric='air_quality'
            ))

        # Parking recommendation
        parking_occ = current.get('parking_occupied', 0)
        parking_total = current.get('parking_total', 1)
        if parking_occ / max(parking_total, 1) > 0.85:
            actions.append(Action(
                id=str(uuid.uuid4())[:8],
                priority='low',
                problem=f'Parking at {round(parking_occ/max(parking_total,1)*100)}% capacity',
                who='Security / Traffic Management',
                what='Activate overflow parking area. Direct incoming vehicles to alternate zones.',
                where='Main Gate, Block A Parking',
                when='During peak hours (8-10 AM, 4-6 PM)',
                why='High parking occupancy causes congestion at entry gates.',
                expected_impact='Reduce gate congestion by 20-25%. Improve entry time.',
                confidence=0.82,
                status='new',
                created_at=now,
                metric='traffic'
            ))

        # Equipment recommendation
        actions.append(Action(
            id=str(uuid.uuid4())[:8],
            priority='medium',
            problem='Scheduled preventive maintenance due for 3 HVAC units',
            who='Facilities Maintenance',
            what='Complete preventive maintenance for HVAC units in Block A, Block B, Admin Block',
            where='Block A, Block B, Administrative Block',
            when='This week - schedule during low-occupancy hours',
            why='Preventive maintenance prevents unexpected breakdowns and maintains energy efficiency.',
            expected_impact='Reduce breakdown risk by 60%. Maintain HVAC efficiency at optimal levels.',
            confidence=0.90,
            status='new',
            created_at=now,
            metric='assets'
        ))

        return actions

    def is_gemini_available(self) -> bool:
        return self.gemini.available


ai_service = AIService()
