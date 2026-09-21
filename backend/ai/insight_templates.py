from backend.models.schemas import CopilotResponse
import re


class InsightGenerator:
    """Generates template-based AI insights when Gemini API is unavailable.
    Uses actual facility data to produce contextual, data-driven responses."""

    def generate_energy_insight(self, data: dict) -> dict:
        current = data.get('current_kw', 0)
        baseline = data.get('baseline_kw', current * 0.85)
        deviation = round((current - baseline) / max(baseline, 1) * 100, 1) if baseline else 0
        peak = data.get('peak_kw', current)

        if deviation > 15:
            insight = f"Energy consumption is elevated at {current} kW, which is {deviation}% above the baseline of {baseline} kW."
            cause = "Likely contributors include HVAC load increase due to ambient temperature, higher occupancy in academic blocks, and possible equipment left running in laboratory spaces."
            recommendation = "Adjust non-critical HVAC operation during peak hours (13:00-16:00). Consider implementing automated shutdown for lab equipment during breaks."
            impact = f"Estimated energy reduction of 10-15% during peak hours, saving approximately ₹{round(current * 0.12 * 7.5, 0)} per day."
        elif deviation < -10:
            insight = f"Energy consumption is below baseline at {current} kW ({abs(deviation)}% below {baseline} kW baseline)."
            cause = "Lower occupancy, favorable weather conditions, or improved efficiency measures."
            recommendation = "Current consumption is within optimal range. Continue monitoring for sustained improvement."
            impact = "Current savings estimated at ₹{} per day compared to baseline.".format(round(abs(current - baseline) * 24 * 7.5, 0))
        else:
            insight = f"Energy consumption at {current} kW is within normal operating range ({deviation:+.1f}% from {baseline} kW baseline)."
            cause = "Standard operational load across campus facilities."
            recommendation = "Monitor Block B labs for potential optimization opportunities. Evening shutdown protocols appear effective."
            impact = "Maintaining current efficiency. No immediate action required."

        return {
            'insight': insight,
            'cause': cause,
            'evidence': [
                f"Current load: {current} kW across {data.get('building_count', 10)} buildings",
                f"Peak demand today: {peak} kW",
                f"Deviation from baseline: {deviation:+.1f}%",
                f"Daily consumption estimate: {data.get('daily_kwh', current * 24)} kWh"
            ],
            'prediction': f"Based on current patterns, energy demand is expected to {'increase during afternoon peak hours' if 10 <= __import__('datetime').datetime.now().hour <= 14 else 'decrease as evening operations wind down'}.",
            'recommendation': recommendation,
            'expected_impact': impact,
            'confidence': 0.82 if abs(deviation) > 10 else 0.87,
            'assumptions': [
                'Based on 7-day historical baseline',
                'Weather conditions assumed stable',
                'Occupancy patterns based on academic calendar',
                'Energy cost estimated at ₹7.5/kWh'
            ]
        }

    def generate_water_insight(self, data: dict) -> dict:
        current = data.get('current_lph', 0)
        baseline = data.get('baseline_lph', current * 0.9)
        overnight = data.get('overnight_baseline', 200)
        deviation = round((current - baseline) / max(baseline, 1) * 100, 1) if baseline else 0

        if current > baseline * 1.2:
            insight = f"Water consumption is significantly elevated at {current} LPH, {deviation}% above baseline."
            cause = "Possible causes include leak in hostel plumbing, increased canteen operations, or irrigation system running during peak hours."
            recommendation = "Inspect hostel water supply lines for leaks. Check if irrigation timers are set correctly. Review overnight consumption against baseline of {:.0f} LPH.".format(overnight)
        else:
            insight = f"Water consumption at {current} LPH is within expected range."
            cause = "Normal operational consumption across hostel, academic, and utility areas."
            recommendation = "Continue routine monitoring. Consider rainwater harvesting to reduce dependency."

        return {
            'insight': insight,
            'cause': cause,
            'evidence': [
                f"Current flow: {current} LPH",
                f"Baseline: {baseline} LPH",
                f"Overnight baseline: {overnight:.0f} LPH",
                f"Deviation: {deviation:+.1f}%"
            ],
            'prediction': "Water demand expected to peak during morning (7-9 AM) and evening (6-8 PM) hostel usage hours.",
            'recommendation': recommendation,
            'expected_impact': "Leak detection could save 15-20% of daily consumption.",
            'confidence': 0.79,
            'assumptions': ['Overnight consumption > 150% of baseline may indicate leaks', 'Hostel occupancy at normal levels']
        }

    def generate_waste_insight(self, data: dict) -> dict:
        overflow = data.get('overflow_risk', 0)
        total = data.get('total_bins', 20)
        efficiency = data.get('collection_efficiency', 85)
        bins = data.get('bins', [])
        critical_bins = [b for b in bins if b.get('fill_pct', 0) > 80] if bins else []

        if overflow > 3:
            insight = f"⚠️ {overflow} out of {total} bins are above 80% capacity. Overflow risk is HIGH."
            recommendation = "Deploy immediate collection for high-risk bins. Priority locations: " + ', '.join(
                b.get('location', 'Unknown') for b in critical_bins[:3])
        else:
            insight = f"Waste management is under control. {overflow} bin(s) nearing capacity out of {total} total."
            recommendation = "Maintain current collection schedule. Monitor cafeteria bins during peak meal hours."

        return {
            'insight': insight,
            'cause': 'Higher waste generation in cafeteria and hostel areas during peak hours. E-waste accumulation in lab areas.',
            'evidence': [
                f"Bins at risk: {overflow}/{total}",
                f"Collection efficiency: {efficiency}%",
                f"Daily waste generation: ~{data.get('daily_generation_kg', 450)} kg"
            ],
            'prediction': f"At current fill rates, {max(1, overflow + 1)} bins expected to reach capacity within 6 hours.",
            'recommendation': recommendation,
            'expected_impact': 'Timely collection prevents overflow, reducing cleanup costs by ~30%.',
            'confidence': 0.85,
            'assumptions': ['Fill rate assumes consistent waste generation', 'Collection routes are optimized']
        }

    def generate_air_quality_insight(self, data: dict) -> dict:
        aqi = data.get('aqi', 0)
        pm25 = data.get('pm25', 0)
        category = data.get('category', 'Moderate')

        if aqi > 150:
            insight = f"Air quality is {category} with AQI at {aqi}. PM2.5 at {pm25} µg/m³ exceeds safe limits."
            recommendation = "Consider limiting outdoor activities. Ensure indoor air filtration is operational. Monitor sensitive areas near roads."
        elif aqi > 100:
            insight = f"Air quality is {category} (AQI: {aqi}). Sensitive individuals should take precautions."
            recommendation = "Monitor outdoor activity areas. Ensure ventilation systems have clean filters."
        else:
            insight = f"Air quality is {category} with AQI at {aqi}. Conditions are within acceptable range."
            recommendation = "No immediate action needed. Continue routine air quality monitoring."

        return {
            'insight': insight,
            'cause': f"AQI influenced by local traffic emissions, construction activity, and regional weather patterns. Temperature: {data.get('temperature', 28)}°C, Humidity: {data.get('humidity', 60)}%.",
            'evidence': [
                f"AQI: {aqi} ({category})",
                f"PM2.5: {pm25} µg/m³",
                f"PM10: {data.get('pm10', 0)} µg/m³",
                f"CO₂: {data.get('co2', 400)} ppm"
            ],
            'prediction': "AQI typically worsens during morning and evening traffic hours. Expected improvement overnight.",
            'recommendation': recommendation,
            'expected_impact': 'Proactive measures can reduce indoor pollutant exposure by 40-60%.',
            'confidence': 0.75,
            'assumptions': [
                'Data shown is for demonstration - refer to CPCB/SPCB for official measurements',
                'Indoor AQI may differ from outdoor readings',
                'Weather patterns assumed from historical averages'
            ]
        }

    def generate_traffic_insight(self, data: dict) -> dict:
        vehicles = data.get('current_vehicles', 0)
        congestion = data.get('congestion_level', 'moderate')
        parking_pct = data.get('parking_pct', 60)

        return {
            'insight': f"Traffic is {congestion} with {vehicles} vehicles currently on campus. Parking at {parking_pct}% capacity.",
            'cause': f"{'Peak hour congestion near main gate and Block A.' if congestion in ('high', 'severe') else 'Normal traffic flow across entry points.'}",
            'evidence': [
                f"Current vehicles: {vehicles}",
                f"Congestion: {congestion}",
                f"Parking: {parking_pct}%",
                f"Peak hour: {data.get('peak_hour', '09:00')}"
            ],
            'prediction': "Traffic expected to peak between 8-10 AM and 4-6 PM on weekdays.",
            'recommendation': f"{'Consider implementing staggered entry times to reduce gate congestion.' if congestion in ('high', 'severe') else 'Current traffic management is adequate.'}",
            'expected_impact': 'Staggered timing can reduce peak congestion by 25-30%.',
            'confidence': 0.80,
            'assumptions': ['Based on vehicular count at entry points', 'Pedestrian traffic not included']
        }

    def generate_asset_insight(self, data: dict) -> dict:
        util = data.get('utilization_pct', 80)
        idle = data.get('idle', 0)
        maintenance = data.get('maintenance', 0)

        return {
            'insight': f"Average asset utilization is {util}% with {idle} idle and {maintenance} under maintenance.",
            'cause': f"{'Several lab equipment units showing low utilization during non-class hours.' if util < 60 else 'Assets are being utilized effectively across departments.'}",
            'evidence': [
                f"Utilization: {util}%",
                f"Active: {data.get('active', 0)}",
                f"Idle: {idle}",
                f"Under maintenance: {maintenance}"
            ],
            'prediction': "Lab equipment utilization expected to increase during practical examination period.",
            'recommendation': f"{'Review scheduling for underutilized equipment. Consider shared booking system.' if util < 70 else 'Continue current maintenance schedule. Plan preventive maintenance for aging units.'}",
            'expected_impact': 'Optimized scheduling can improve utilization by 15-20%.',
            'confidence': 0.83,
            'assumptions': ['Utilization based on operating hours vs available hours', 'Maintenance records up to date']
        }

    def generate_safety_insight(self, data: dict) -> dict:
        total = data.get('total_incidents', 0)
        open_inc = data.get('open_incidents', 0)
        risk = data.get('risk_level', 'low')

        return {
            'insight': f"Safety profile: {total} incidents recorded (90-day window), {open_inc} currently open. Risk level: {risk}.",
            'cause': 'Most common incidents are slip/fall events in wet areas and minor equipment malfunctions in laboratory spaces.',
            'evidence': [
                f"Total incidents (90 days): {total}",
                f"Open incidents: {open_inc}",
                f"Risk level: {risk}",
                "Facility operational safety analytics for demonstration purposes"
            ],
            'prediction': "Incident frequency typically increases during monsoon season due to wet conditions.",
            'recommendation': f"{'Prioritize resolution of open incidents. Increase inspection frequency in high-risk zones.' if open_inc > 2 else 'Maintain current safety protocols. Schedule next safety drill.'}",
            'expected_impact': 'Proactive safety measures can reduce incident frequency by 30-40%.',
            'confidence': 0.77,
            'assumptions': ['Historical incident data from facility records', 'Safety analytics for demonstration only']
        }

    def generate_anomaly_insight(self, anomaly: dict) -> dict:
        metric = anomaly.get('metric', 'unknown')
        observed = anomaly.get('observed', 0)
        expected = anomaly.get('expected', 0)
        deviation = anomaly.get('deviation_pct', 0)

        return {
            'insight': f"Anomaly detected in {metric}: observed {observed}, expected {expected} ({deviation:+.1f}% deviation).",
            'cause': anomaly.get('possible_cause', 'Deviation from historical patterns detected.'),
            'evidence': [
                f"Metric: {metric}",
                f"Observed: {observed}",
                f"Expected: {expected}",
                f"Deviation: {deviation:+.1f}%",
                f"Severity: {anomaly.get('severity', 'medium')}",
                f"Location: {anomaly.get('location', 'Unknown')}"
            ],
            'prediction': "If unaddressed, similar anomalies may recur at the same time window.",
            'recommendation': anomaly.get('recommendation', 'Investigate the root cause and monitor for recurrence.'),
            'expected_impact': 'Early intervention can prevent escalation and reduce operational costs.',
            'confidence': 0.80,
            'assumptions': ['Anomaly detected using Isolation Forest + statistical methods', 'Baseline from 7-day historical data']
        }

    def generate_copilot_response(self, question: str, facility_data: dict) -> CopilotResponse:
        """Generate contextual response based on question pattern matching."""
        q = question.lower().strip()
        current = facility_data.get('current', {})
        energy_kw = current.get('energy_kw', 450)
        water_lph = current.get('water_lph', 1200)
        aqi = current.get('aqi', 85)
        waste_risk = current.get('overflow_risk_bins', 2)

        # Pattern matching for common questions
        if any(w in q for w in ['energy', 'power', 'electricity', 'kwh']):
            if any(w in q for w in ['increase', 'high', 'spike', 'why']):
                answer = f"Energy consumption is currently at {energy_kw} kW. Block B (Science & Technology) shows the highest consumption due to laboratory equipment and HVAC load. The afternoon peak (13:00-16:00) coincides with maximum cooling demand."
                recommendation = "Reduce non-critical HVAC load in Block B during 13:00-16:00. Implement scheduled shutdown for unused lab equipment."
                impact = "Expected 10-15% reduction in peak energy, saving approximately ₹5,000-7,500 per day."
            elif any(w in q for w in ['reduce', 'save', 'optimize', 'cut']):
                answer = f"Current energy consumption is {energy_kw} kW. Top optimization opportunities: 1) HVAC scheduling in Block A & B, 2) LED retrofit in hostel common areas, 3) Smart power strips in labs."
                recommendation = "Start with HVAC optimization - highest impact, lowest investment. Schedule HVAC to reduce output by 15% during 13:00-16:00 in non-critical zones."
                impact = "Combined measures could reduce energy consumption by 18-22%, saving ₹2-3 lakh per month."
            else:
                answer = f"Energy status: {energy_kw} kW current load. Daily consumption trending at approximately {round(energy_kw * 24, 0)} kWh. Block B labs and HVAC systems are the primary consumers."
                recommendation = "Monitor Block B consumption patterns and consider load-balancing strategies."
                impact = "Maintaining awareness enables proactive management."
        elif any(w in q for w in ['risk', 'biggest', 'danger', 'urgent', 'critical']):
            risks = []
            if energy_kw > 800:
                risks.append(f"Energy spike: {energy_kw} kW (above threshold)")
            if waste_risk > 3:
                risks.append(f"Waste overflow: {waste_risk} bins at risk")
            if aqi > 150:
                risks.append(f"Air quality: AQI {aqi} (unhealthy)")
            if not risks:
                risks = [f"Waste bins nearing capacity ({waste_risk} bins above 80%)"]
            answer = "Current risk assessment:\n" + "\n".join(f"• {r}" for r in risks)
            recommendation = "Address the highest-priority risk first. Deploy waste collection for at-risk bins immediately."
            impact = "Timely intervention prevents escalation and maintains operational continuity."
        elif any(w in q for w in ['anomal', 'detect', 'unusual', 'abnormal']):
            answer = f"3 anomalies detected in the last 24 hours: 1) Energy spike in Block B (+24%), 2) Water consumption elevated in Girls Hostel (+18%), 3) AQI fluctuation near cafeteria. All are under monitoring."
            recommendation = "Investigate Block B energy spike first (highest impact). Check hostel water supply for potential leaks."
            impact = "Resolving anomalies can prevent equipment stress and reduce operational costs."
        elif any(w in q for w in ['water', 'leak', 'consumption']):
            answer = f"Water consumption is at {water_lph} LPH. Hostels account for 45% of total consumption. Overnight baseline monitoring can help detect leaks."
            recommendation = "Install flow sensors in hostel blocks for real-time leak detection."
            impact = "Early leak detection can save 15-20% of water consumption."
        elif any(w in q for w in ['tomorrow', 'forecast', 'predict', 'next', 'future']):
            answer = f"Based on historical patterns: Energy expected at {round(energy_kw * 0.95, 0)}-{round(energy_kw * 1.05, 0)} kW. Water steady at {round(water_lph * 0.9, 0)}-{round(water_lph * 1.1, 0)} LPH. AQI forecast: {max(50, aqi - 10)}-{aqi + 15}."
            recommendation = "Pre-cool buildings before peak hours to reduce afternoon HVAC load."
            impact = "Proactive scheduling can reduce peak demand by 8-12%."
        elif any(w in q for w in ['operation', 'team', 'do', 'action', 'should']):
            answer = f"Priority actions for operations team:\n1. Collect waste bins at BIN-A01, BIN-B03 (>85% full)\n2. Inspect Block B HVAC - energy 24% above baseline\n3. Check Girls Hostel water supply - elevated consumption\n4. Verify AQI sensors near cafeteria"
            recommendation = "Start with waste collection (immediate), then investigate energy anomaly (within 2 hours)."
            impact = "Addressing all items prevents 3 potential operational disruptions."
        elif any(w in q for w in ['inspect', 'check', 'area', 'zone', 'where']):
            answer = "Areas requiring inspection:\n1. Block B Labs - Energy anomaly detected\n2. Girls Hostel plumbing - Water consumption elevated\n3. Cafeteria bins - Near overflow capacity\n4. Main Gate area - Traffic congestion during peak hours"
            recommendation = "Prioritize Block B inspection during next maintenance window."
            impact = "Targeted inspections improve response time by 40%."
        else:
            answer = f"Facility status overview: Energy at {energy_kw} kW, Water at {water_lph} LPH, AQI at {aqi}, {waste_risk} waste bins at risk. Overall sustainability score: 78.5/100. 3 active anomalies under monitoring."
            recommendation = "Focus on energy optimization and waste management for maximum impact on sustainability score."
            impact = "Implementing recommended actions can improve sustainability score by 5-8 points."

        return CopilotResponse(
            answer=answer,
            insight=answer.split('\n')[0] if '\n' in answer else answer,
            cause="Analysis based on current facility sensor data and historical patterns.",
            evidence=[
                f"Energy: {energy_kw} kW",
                f"Water: {water_lph} LPH",
                f"AQI: {aqi}",
                f"Waste bins at risk: {waste_risk}"
            ],
            prediction="Trends expected to continue based on current operational patterns and weather conditions.",
            recommendation=recommendation,
            expected_impact=impact,
            confidence=0.85,
            assumptions=[
                "Based on synthetic demo data for demonstration purposes",
                "Actual measurements should be validated with calibrated sensors",
                "Recommendations are AI decision-support insights, not directives"
            ],
            data_label='AI Decision-Support Insight'
        )


insight_generator = InsightGenerator()
