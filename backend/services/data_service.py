import numpy as np
from datetime import datetime, timedelta
from backend.models.schemas import (
    DashboardSummary, EnergyData, WaterData, WasteData, AirQualityData,
    TrafficData, AssetData, SafetyData, FacilityConfig, CSVUploadResult, KPI
)
from backend.data.seed_data import ENGINEERING_COLLEGE, FACILITY_TEMPLATES
from backend.data.generator import DataGenerator
import io
import csv


class DataService:
    def __init__(self):
        self.facility = ENGINEERING_COLLEGE
        self.generator = DataGenerator(self.facility)
        self._cache = {}
        self._initialized = False

    def initialize(self):
        """Generate and cache initial dataset."""
        self.generator = DataGenerator(self.facility)
        self._cache['energy'] = self.generator.generate_energy_data(168)
        self._cache['water'] = self.generator.generate_water_data(168)
        self._cache['waste'] = self.generator.generate_waste_data()
        self._cache['air_quality'] = self.generator.generate_air_quality_data(168)
        self._cache['traffic'] = self.generator.generate_traffic_data(168)
        self._cache['parking'] = self.generator.generate_parking_data()
        self._cache['assets'] = self.generator.generate_asset_data()
        self._cache['safety'] = self.generator.generate_safety_data(90)
        self._cache['emissions'] = self.generator.generate_emissions_data(168)
        self._cache['hotspots'] = self.generator.get_hotspots()
        self._cache['current'] = self.generator.get_current_values()
        # Inject some anomalies for demo
        self._cache['energy'] = self.generator.inject_anomalies(self._cache['energy'], 'energy')
        self._initialized = True

    def _ensure_init(self):
        if not self._initialized:
            self.initialize()

    def get_dashboard_summary(self) -> DashboardSummary:
        self._ensure_init()
        current = self._cache['current']
        energy_history = self._get_aggregated_history('energy', 24)
        water_history = self._get_aggregated_history('water', 24)
        waste_bins = self._cache['waste']
        aq = self._cache['air_quality']
        traffic = self._cache['traffic']

        overflow_risk = sum(1 for b in waste_bins if b['fill_pct'] > 80)
        recent_aqi = aq[-1] if aq else {'aqi': 0}

        kpis = [
            KPI(id='sustainability', label='Sustainability Score', value=0, unit='/ 100',
                trend=2.5, status='good', sparkline=[72, 74, 73, 76, 78, 79, 80],
                description='Weighted composite score'),
            KPI(id='energy', label='Energy', value=current['energy_kw'], unit='kW',
                trend=5.2, status='warning' if current['energy_kw'] > 800 else 'good',
                sparkline=[float(v) for v in energy_history[-8:]],
                description='Current total power consumption'),
            KPI(id='water', label='Water', value=current['water_lph'], unit='LPH',
                trend=-2.1, status='good',
                sparkline=[float(v) for v in water_history[-8:]],
                description='Current water flow rate'),
            KPI(id='waste', label='Waste Risk', value=float(overflow_risk), unit='bins at risk',
                trend=10.0 if overflow_risk > 3 else -5.0,
                status='critical' if overflow_risk > 5 else 'warning' if overflow_risk > 2 else 'good',
                sparkline=[2, 3, 2, 4, 3, overflow_risk, overflow_risk],
                description='Bins above 80% capacity'),
            KPI(id='aqi', label='Air Quality', value=float(recent_aqi['aqi']), unit='AQI',
                trend=3.0, status='warning' if recent_aqi['aqi'] > 100 else 'good',
                sparkline=[float(a['aqi']) for a in aq[-8:]],
                description='Current Air Quality Index'),
            KPI(id='anomalies', label='Active Anomalies', value=3, unit='detected',
                trend=0, status='warning',
                sparkline=[1, 2, 1, 3, 2, 3, 3],
                description='Anomalies detected in last 24h'),
            KPI(id='risks', label='Predicted Risks', value=2, unit='next 24h',
                trend=0, status='warning',
                sparkline=[1, 1, 2, 1, 2, 2, 2],
                description='Forecast-based risk predictions'),
            KPI(id='co2', label='CO₂ Estimate', value=round(current['co2_estimate'], 2), unit='tons/hr',
                trend=4.8, status='good',
                sparkline=[0.5, 0.6, 0.55, 0.58, 0.62, 0.60, current['co2_estimate']],
                description='Estimated carbon emissions'),
        ]

        return DashboardSummary(
            kpis=kpis,
            sustainability_score=78.5,
            active_anomalies=3,
            predicted_risks=2,
            top_insight=f"Block B energy consumption is 24% above baseline. HVAC load and afternoon temperature may be contributing factors. Recommend adjusting non-critical cooling between 13:00-16:00.",
            facility=self.facility,
            simulation_active=False,
            timestamp=datetime.now().isoformat()
        )

    def _get_aggregated_history(self, metric: str, hours: int) -> list[float]:
        """Aggregate per-building data into hourly totals."""
        data = self._cache.get(metric, [])
        if not data:
            return []
        hourly = {}
        cutoff = (datetime.now() - timedelta(hours=hours)).isoformat()
        for d in data:
            if d['timestamp'] >= cutoff:
                ts = d['timestamp'][:13]  # group by hour
                val = d.get('value', d.get('aqi', d.get('vehicles', 0)))
                if ts in hourly:
                    hourly[ts] += val
                else:
                    hourly[ts] = val
        return [round(v, 1) for v in hourly.values()]

    def _get_history_for_chart(self, metric: str, hours: int = 48) -> list[dict]:
        """Get time-series data formatted for charts."""
        data = self._cache.get(metric, [])
        cutoff = (datetime.now() - timedelta(hours=hours)).isoformat()
        hourly = {}
        for d in data:
            if d['timestamp'] >= cutoff:
                ts = d['timestamp'][:13] + ':00'
                val = d.get('value', d.get('aqi', d.get('vehicles', 0)))
                if ts in hourly:
                    hourly[ts] += val
                else:
                    hourly[ts] = val
        return [{'timestamp': k, 'value': round(v, 1)} for k, v in sorted(hourly.items())]

    def get_energy_data(self) -> EnergyData:
        self._ensure_init()
        current = self._cache['current']
        history = self._get_history_for_chart('energy', 48)
        energy = self._cache['energy']

        # By building aggregation
        building_totals = {}
        recent_data = [d for d in energy if d['timestamp'] >= (datetime.now() - timedelta(hours=24)).isoformat()]
        for d in recent_data:
            bname = d.get('building_name', d['building'])
            building_totals[bname] = building_totals.get(bname, 0) + d['value']
        total = sum(building_totals.values()) or 1
        by_building = [{'building': k, 'value': round(v, 1), 'pct': round(v / total * 100, 1)}
                       for k, v in sorted(building_totals.items(), key=lambda x: x[1], reverse=True)]

        # Heatmap data (hour x day)
        heatmap = []
        for d in energy[-168 * len(self.facility.buildings):]:
            dt = datetime.fromisoformat(d['timestamp'])
            heatmap.append({'hour': dt.hour, 'day': dt.weekday(), 'value': d['value']})

        # Anomalies in energy data
        anomalies = [d for d in energy if d.get('is_anomaly')]

        daily_kwh = round(sum(d['value'] for d in history[-24:]) if history else 0, 1)
        peak = max((d['value'] for d in history), default=0)

        return EnergyData(
            current_kw=current['energy_kw'],
            daily_kwh=daily_kwh,
            peak_kw=round(peak, 1),
            baseline_kw=round(current['energy_kw'] * 0.85, 1),
            trend_pct=5.2,
            cost_estimate=round(daily_kwh * 7.5, 2),  # ₹7.5 per kWh approx
            history=history,
            by_building=by_building,
            heatmap=heatmap[:200],  # Limit for performance
            anomalies=anomalies[:10]
        )

    def get_water_data(self) -> WaterData:
        self._ensure_init()
        current = self._cache['current']
        history = self._get_history_for_chart('water', 48)
        water = self._cache['water']

        # By zone
        zone_totals = {}
        recent = [d for d in water if d['timestamp'] >= (datetime.now() - timedelta(hours=24)).isoformat()]
        for d in recent:
            z = d.get('building_name', d['building'])
            zone_totals[z] = zone_totals.get(z, 0) + d['value']
        total = sum(zone_totals.values()) or 1
        by_zone = [{'zone': k, 'value': round(v, 1), 'pct': round(v / total * 100, 1)}
                   for k, v in sorted(zone_totals.items(), key=lambda x: x[1], reverse=True)]

        daily = round(sum(d['value'] for d in history[-24:]) if history else 0, 1)
        # Overnight baseline (11 PM - 5 AM average)
        overnight = [d for d in water
                     if 23 <= datetime.fromisoformat(d['timestamp']).hour or
                        datetime.fromisoformat(d['timestamp']).hour <= 5]
        overnight_avg = round(np.mean([d['value'] for d in overnight]) if overnight else 200, 1)

        return WaterData(
            current_lph=current['water_lph'],
            daily_liters=daily,
            baseline_lph=round(current['water_lph'] * 0.9, 1),
            trend_pct=-2.1,
            history=history,
            by_zone=by_zone,
            anomalies=[],
            overnight_baseline=float(overnight_avg)
        )

    def get_waste_data(self) -> WasteData:
        self._ensure_init()
        bins = self._cache['waste']
        overflow = sum(1 for b in bins if b['fill_pct'] > 80)
        avg_fill = np.mean([b['fill_pct'] for b in bins])

        by_type = {}
        for b in bins:
            by_type[b['type']] = by_type.get(b['type'], 0) + 1
        total = len(bins) or 1
        by_type_list = [{'type': k, 'value': v, 'pct': round(v / total * 100, 1)}
                        for k, v in by_type.items()]

        # Fake collection history
        history = []
        for i in range(30):
            d = datetime.now() - timedelta(days=30 - i)
            history.append({'timestamp': d.strftime('%Y-%m-%d'), 'value': round(400 + np.random.normal(0, 50), 1)})

        return WasteData(
            bins=bins,
            total_bins=len(bins),
            overflow_risk=overflow,
            collection_efficiency=round(float(100 - avg_fill / 2), 1),
            daily_generation_kg=round(float(450 + np.random.normal(0, 30)), 1),
            history=history,
            by_type=by_type_list
        )

    def get_air_quality_data(self) -> AirQualityData:
        self._ensure_init()
        aq = self._cache['air_quality']
        latest = aq[-1] if aq else {'aqi': 0, 'pm25': 0, 'pm10': 0, 'co2': 400, 'temperature': 28, 'humidity': 60}

        aqi = latest['aqi']
        if aqi <= 50:
            cat = 'Good'
        elif aqi <= 100:
            cat = 'Moderate'
        elif aqi <= 150:
            cat = 'Unhealthy for Sensitive Groups'
        elif aqi <= 200:
            cat = 'Unhealthy'
        elif aqi <= 300:
            cat = 'Very Unhealthy'
        else:
            cat = 'Hazardous'

        history = [{'timestamp': d['timestamp'][:13] + ':00', 'value': d['aqi']} for d in aq[-48:]]
        hotspots = self._cache.get('hotspots', [])
        aq_hotspots = [h for h in hotspots if h['type'] == 'air_quality']
        # Add more AQ-specific hotspots
        lat, lng = self.facility.latitude, self.facility.longitude
        aq_hotspots.extend([
            {'lat': lat + 0.002, 'lng': lng - 0.001, 'aqi': int(aqi * 1.1), 'location': 'Near Main Road'},
            {'lat': lat - 0.001, 'lng': lng + 0.002, 'aqi': int(aqi * 0.8), 'location': 'Library Garden'},
            {'lat': lat, 'lng': lng + 0.001, 'aqi': int(aqi), 'location': 'Central Campus'},
        ])

        prev_aqi = aq[-25]['aqi'] if len(aq) > 25 else aqi
        trend = round((aqi - prev_aqi) / max(prev_aqi, 1) * 100, 1)

        return AirQualityData(
            aqi=int(aqi), category=cat,
            pm25=latest['pm25'], pm10=latest['pm10'],
            co2=latest['co2'], temperature=latest['temperature'],
            humidity=latest['humidity'],
            history=history, hotspots=aq_hotspots, trend_pct=float(trend)
        )

    def get_traffic_data(self) -> TrafficData:
        self._ensure_init()
        current = self._cache['current']
        traffic = self._cache['traffic']
        parking = self._cache['parking']
        hotspots = [h for h in self._cache.get('hotspots', []) if h['type'] in ('traffic', 'parking')]

        history = [{'timestamp': d['timestamp'][:13] + ':00', 'value': d['vehicles']} for d in traffic[-48:]]
        latest = traffic[-1] if traffic else {'vehicles': 0, 'congestion': 'low'}

        total_p = sum(p['total'] for p in parking)
        occ_p = sum(p['occupied'] for p in parking)

        # Find peak hour
        hourly_max = {}
        for d in traffic[-24:]:
            h = datetime.fromisoformat(d['timestamp']).strftime('%H:00')
            hourly_max[h] = max(hourly_max.get(h, 0), d['vehicles'])
        peak_hour = max(hourly_max, key=hourly_max.get) if hourly_max else '09:00'

        return TrafficData(
            current_vehicles=latest['vehicles'],
            peak_hour=peak_hour,
            congestion_level=latest['congestion'],
            parking_total=total_p,
            parking_occupied=occ_p,
            parking_pct=round(occ_p / max(total_p, 1) * 100, 1),
            hotspots=hotspots,
            history=history,
            parking_zones=parking
        )

    def get_asset_data(self) -> AssetData:
        self._ensure_init()
        assets = self._cache['assets']
        active = sum(1 for a in assets if a['status'] == 'active')
        maintenance = sum(1 for a in assets if a['status'] == 'maintenance')
        idle = sum(1 for a in assets if a['status'] == 'idle')
        avg_util = round(float(np.mean([a['utilization'] for a in assets if a['status'] == 'active']) * 100), 1)

        # By category
        cat_data = {}
        for a in assets:
            t = a['type']
            if t not in cat_data:
                cat_data[t] = {'count': 0, 'util_sum': 0}
            cat_data[t]['count'] += 1
            cat_data[t]['util_sum'] += a['utilization']
        by_cat = [{'category': k, 'count': v['count'],
                   'utilization': round(v['util_sum'] / max(v['count'], 1) * 100, 1)}
                  for k, v in cat_data.items()]

        # Under-utilized anomalies
        anomalies_list = [{'asset': a['name'], 'building': a['building'],
                           'utilization': round(a['utilization'] * 100, 1),
                           'issue': 'Under-utilized' if a['utilization'] < 0.2 else 'Idle'}
                          for a in assets if a['utilization'] < 0.2 or a['status'] == 'idle']

        return AssetData(
            total_assets=len(assets),
            active=active, maintenance=maintenance, idle=idle,
            utilization_pct=avg_util, assets=assets,
            by_category=by_cat, anomalies=anomalies_list
        )

    def get_safety_data(self) -> SafetyData:
        self._ensure_init()
        incidents = self._cache['safety']
        open_inc = sum(1 for i in incidents if i['status'] == 'open')

        # By category
        cat_counts = {}
        for i in incidents:
            cat_counts[i['type']] = cat_counts.get(i['type'], 0) + 1
        by_cat = [{'category': k, 'count': v} for k, v in cat_counts.items()]

        # By location
        loc_counts = {}
        bld_names = {b.id: b.name for b in self.facility.buildings}
        for i in incidents:
            loc = bld_names.get(i['location'], i['location'])
            loc_counts[loc] = loc_counts.get(loc, 0) + 1
        by_loc = [{'location': k, 'count': v} for k, v in loc_counts.items()]

        # Monthly trend
        monthly = {}
        for i in incidents:
            m = i['timestamp'][:7]
            monthly[m] = monthly.get(m, 0) + 1
        monthly_trend = [{'month': k, 'count': v} for k, v in sorted(monthly.items())]

        risk = 'high' if open_inc > 3 else 'medium' if open_inc > 1 else 'low'

        return SafetyData(
            total_incidents=len(incidents),
            open_incidents=open_inc,
            trend_pct=-10.0,
            risk_level=risk,
            incidents=incidents,
            by_category=by_cat,
            by_location=by_loc,
            monthly_trend=monthly_trend
        )

    def get_current_facility(self) -> FacilityConfig:
        return self.facility

    def set_facility_type(self, facility_type: str) -> FacilityConfig:
        if facility_type in FACILITY_TEMPLATES:
            self.facility = FACILITY_TEMPLATES[facility_type]
            self.generator = DataGenerator(self.facility)
            self.initialize()
        return self.facility

    def get_all_current_values(self) -> dict:
        self._ensure_init()
        return self._cache.get('current', self.generator.get_current_values())

    def get_energy_history(self, hours: int = 168) -> list[dict]:
        """Get raw energy data for ML processing."""
        self._ensure_init()
        data = self._cache.get('energy', [])
        cutoff = (datetime.now() - timedelta(hours=hours)).isoformat()
        return [d for d in data if d['timestamp'] >= cutoff]

    def get_water_history(self, hours: int = 168) -> list[dict]:
        self._ensure_init()
        data = self._cache.get('water', [])
        cutoff = (datetime.now() - timedelta(hours=hours)).isoformat()
        return [d for d in data if d['timestamp'] >= cutoff]

    def get_hotspots(self) -> list[dict]:
        self._ensure_init()
        return self._cache.get('hotspots', [])

    def refresh_data(self):
        """Refresh with slight variations for live simulation."""
        self.generator = DataGenerator(self.facility, seed=int(datetime.now().timestamp()) % 10000)
        self._cache['current'] = self.generator.get_current_values()
        self._cache['parking'] = self.generator.generate_parking_data()
        self._cache['waste'] = self.generator.generate_waste_data()

    def process_csv(self, file_content: bytes, filename: str) -> CSVUploadResult:
        """Process uploaded CSV file."""
        try:
            text = file_content.decode('utf-8', errors='ignore')
            reader = list(csv.DictReader(io.StringIO(text)))
            if not reader:
                return CSVUploadResult(
                    filename=filename, rows=0, columns=[], preview=[],
                    issues=["CSV file appears to be empty"], insights=[], column_mapping={}
                )

            columns = list(reader[0].keys())
            preview = reader[:10]
            rows_count = len(reader)

            issues = []
            if rows_count < 10:
                issues.append("Dataset has fewer than 10 rows - limited analysis possible")

            # Check for missing values
            null_cols = set()
            for row in reader:
                for col, val in row.items():
                    if val is None or val.strip() == '':
                        null_cols.add(col)
            if null_cols:
                issues.append(f"Missing values found in columns: {', '.join(null_cols)}")

            mapping = {}
            for col in columns:
                cl = col.lower()
                if 'time' in cl or 'date' in cl:
                    mapping[col] = 'timestamp'
                elif 'energy' in cl or 'power' in cl or 'kwh' in cl or 'kw' in cl:
                    mapping[col] = 'energy'
                elif 'water' in cl or 'liter' in cl or 'flow' in cl:
                    mapping[col] = 'water'
                elif 'temp' in cl:
                    mapping[col] = 'temperature'
                elif 'humid' in cl:
                    mapping[col] = 'humidity'
                elif 'aqi' in cl or 'air' in cl or 'pm' in cl:
                    mapping[col] = 'air_quality'
                elif 'waste' in cl or 'bin' in cl:
                    mapping[col] = 'waste'

            insights = []
            for col in columns[:5]:
                vals = []
                for r in reader:
                    try:
                        vals.append(float(r[col]))
                    except (ValueError, TypeError):
                        pass
                if vals:
                    mean_val = sum(vals) / len(vals)
                    insights.append(f"{col}: mean={mean_val:.2f}, range=[{min(vals):.2f}, {max(vals):.2f}]")

            insights.append(f"Dataset contains {rows_count} rows and {len(columns)} columns")

            return CSVUploadResult(
                filename=filename,
                rows=rows_count,
                columns=columns,
                preview=preview,
                issues=issues,
                insights=insights,
                column_mapping=mapping
            )
        except Exception as e:
            return CSVUploadResult(
                filename=filename, rows=0, columns=[], preview=[],
                issues=[f"Error processing file: {str(e)}"],
                insights=[], column_mapping={}
            )


data_service = DataService()
