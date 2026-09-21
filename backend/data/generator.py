import numpy as np
from datetime import datetime, timedelta
from backend.models.schemas import FacilityConfig


class DataGenerator:
    """Generates realistic synthetic sensor data for facility monitoring."""

    def __init__(self, facility: FacilityConfig, seed: int = 42):
        self.facility = facility
        self.seed = seed
        self.rng = np.random.RandomState(seed)
        self.now = datetime.now()

    def _diurnal(self, hour: int, peak_hours: list[tuple[int, int]] = None) -> float:
        """Generate diurnal multiplier based on hour of day."""
        if peak_hours is None:
            peak_hours = [(8, 18)]
        for start, end in peak_hours:
            if start <= hour <= end:
                mid = (start + end) / 2
                return 1.0 + 0.5 * (1 - abs(hour - mid) / ((end - start) / 2))
        return 0.4

    def _weekend_factor(self, dt: datetime) -> float:
        return 0.5 if dt.weekday() >= 5 else 1.0

    def _building_base_energy(self, building_type: str) -> float:
        bases = {
            'academic': 120, 'lab': 150, 'admin': 80, 'hostel': 60,
            'library': 50, 'canteen': 90, 'recreation': 70, 'utilities': 200
        }
        return bases.get(building_type, 100)

    def _building_base_water(self, building_type: str) -> float:
        bases = {
            'academic': 400, 'lab': 600, 'admin': 300, 'hostel': 1200,
            'library': 200, 'canteen': 800, 'recreation': 500, 'utilities': 100
        }
        return bases.get(building_type, 500)

    def generate_energy_data(self, hours: int = 168) -> list[dict]:
        data = []
        for i in range(hours):
            t = self.now - timedelta(hours=hours - i)
            total = 0
            for b in self.facility.buildings:
                base = self._building_base_energy(b.type)
                diurnal = self._diurnal(t.hour, [(8, 18)])
                weekend = self._weekend_factor(t)
                noise = self.rng.normal(0, 0.08)
                val = max(10, base * diurnal * weekend * (1 + noise))
                total += val
                data.append({
                    'timestamp': t.isoformat(), 'building': b.id,
                    'building_name': b.name, 'value': round(val, 1)
                })
        return data

    def generate_water_data(self, hours: int = 168) -> list[dict]:
        data = []
        for i in range(hours):
            t = self.now - timedelta(hours=hours - i)
            for b in self.facility.buildings:
                base = self._building_base_water(b.type)
                peak_hours = [(7, 9), (12, 14), (18, 20)] if b.type == 'hostel' else [(8, 17)]
                diurnal = self._diurnal(t.hour, peak_hours)
                weekend = self._weekend_factor(t) if b.type != 'hostel' else 0.9
                noise = self.rng.normal(0, 0.1)
                val = max(10, base * diurnal * weekend * (1 + noise))
                data.append({
                    'timestamp': t.isoformat(), 'building': b.id,
                    'building_name': b.name, 'value': round(val, 1)
                })
        return data

    def generate_waste_data(self) -> list[dict]:
        locations = [
            'Main Gate', 'Block A Entrance', 'Block B Corridor', 'Admin Lobby',
            'Boys Hostel Gate', 'Girls Hostel Gate', 'Library Entrance', 'Cafeteria East',
            'Cafeteria West', 'Sports Complex', 'Workshop Area', 'Parking Lot A',
            'Parking Lot B', 'Garden Area', 'Lab Building Side', 'Hostel Mess',
            'Faculty Quarters', 'Auditorium', 'Innovation Hub', 'Utility Block'
        ]
        types = ['general', 'recyclable', 'organic', 'e-waste', 'general',
                 'organic', 'general', 'organic', 'recyclable', 'general',
                 'general', 'recyclable', 'general', 'organic', 'e-waste',
                 'organic', 'general', 'general', 'e-waste', 'recyclable']
        data = []
        for i in range(20):
            fill = round(float(self.rng.uniform(15, 95)), 1)
            hours_since = int(self.rng.randint(2, 36))
            rate = fill / max(hours_since, 1)
            hours_to_full = max(1, int((100 - fill) / max(rate, 0.5)))
            data.append({
                'id': f'BIN-{chr(65 + i // 10)}{i % 10 + 1:02d}',
                'location': locations[i],
                'fill_pct': fill,
                'type': types[i],
                'last_collected': (self.now - timedelta(hours=hours_since)).isoformat(),
                'predicted_full': (self.now + timedelta(hours=hours_to_full)).isoformat()
            })
        return sorted(data, key=lambda x: x['fill_pct'], reverse=True)

    def generate_air_quality_data(self, hours: int = 168) -> list[dict]:
        data = []
        base_aqi = 90  # Bhubaneswar typical
        for i in range(hours):
            t = self.now - timedelta(hours=hours - i)
            hour = t.hour
            # AQI tends higher during morning/evening rush and cooking hours
            rush = 1.3 if hour in [8, 9, 17, 18, 19] else 1.0
            seasonal = 1.0 + 0.1 * np.sin(2 * np.pi * i / (168))
            aqi = max(30, min(300, base_aqi * rush * seasonal + self.rng.normal(0, 15)))
            pm25 = aqi * 0.5 + self.rng.normal(0, 5)
            pm10 = aqi * 0.7 + self.rng.normal(0, 8)
            co2 = 400 + aqi * 0.5 + self.rng.normal(0, 20)
            temp = 28 + 5 * np.sin(2 * np.pi * (hour - 6) / 24) + self.rng.normal(0, 1)
            humidity = 65 - 10 * np.sin(2 * np.pi * (hour - 6) / 24) + self.rng.normal(0, 3)
            data.append({
                'timestamp': t.isoformat(),
                'aqi': round(float(aqi)),
                'pm25': round(float(max(0, pm25)), 1),
                'pm10': round(float(max(0, pm10)), 1),
                'co2': round(float(max(350, co2)), 1),
                'temperature': round(float(temp), 1),
                'humidity': round(float(min(100, max(20, humidity))), 1)
            })
        return data

    def generate_traffic_data(self, hours: int = 168) -> list[dict]:
        data = []
        for i in range(hours):
            t = self.now - timedelta(hours=hours - i)
            hour = t.hour
            weekend = self._weekend_factor(t)
            if 8 <= hour <= 10:
                base = 180
            elif 16 <= hour <= 18:
                base = 200
            elif 11 <= hour <= 15:
                base = 100
            elif 7 <= hour or hour <= 20:
                base = 60
            else:
                base = 15
            vehicles = max(0, int(base * weekend * (1 + self.rng.normal(0, 0.12))))
            if vehicles > 150:
                cong = 'high'
            elif vehicles > 100:
                cong = 'moderate'
            elif vehicles > 50:
                cong = 'low'
            else:
                cong = 'minimal'
            data.append({
                'timestamp': t.isoformat(),
                'vehicles': vehicles,
                'congestion': cong
            })
        return data

    def generate_parking_data(self) -> list[dict]:
        zones = [
            {'id': 'PZ-01', 'name': 'Main Gate Parking', 'total': 150},
            {'id': 'PZ-02', 'name': 'Block A Faculty Parking', 'total': 80},
            {'id': 'PZ-03', 'name': 'Block B Student Parking', 'total': 120},
            {'id': 'PZ-04', 'name': 'Hostel Two-Wheeler Bay', 'total': 200},
            {'id': 'PZ-05', 'name': 'Sports Complex Parking', 'total': 60}
        ]
        hour = self.now.hour
        occupancy_base = 0.7 if 8 <= hour <= 17 else 0.3
        result = []
        for z in zones:
            occ = max(0, min(z['total'], int(z['total'] * occupancy_base * (1 + self.rng.normal(0, 0.15)))))
            result.append({
                'id': z['id'], 'name': z['name'], 'total': z['total'],
                'occupied': occ, 'pct': round(occ / z['total'] * 100, 1)
            })
        return result

    def generate_asset_data(self) -> list[dict]:
        assets = [
            ('Projector', 'AV Equipment', 'bld_01', 8), ('Projector', 'AV Equipment', 'bld_02', 6),
            ('Central AC Unit', 'HVAC', 'bld_01', 2), ('Central AC Unit', 'HVAC', 'bld_02', 2),
            ('Central AC Unit', 'HVAC', 'bld_03', 1), ('Split AC', 'HVAC', 'bld_06', 4),
            ('Desktop Computer', 'IT', 'bld_02', 60), ('Lab Oscilloscope', 'Lab Equipment', 'bld_02', 15),
            ('3D Printer', 'Lab Equipment', 'bld_09', 3), ('CNC Machine', 'Lab Equipment', 'bld_09', 2),
            ('Water Pump', 'Utilities', 'bld_10', 3), ('Diesel Generator', 'Utilities', 'bld_10', 2),
            ('Solar Inverter', 'Utilities', 'bld_10', 1), ('Elevator', 'Infrastructure', 'bld_01', 2),
            ('Elevator', 'Infrastructure', 'bld_04', 2), ('CCTV Camera', 'Security', 'bld_01', 12),
            ('Fire Alarm Panel', 'Safety', 'bld_01', 1), ('UPS System', 'IT', 'bld_02', 4),
            ('Server Rack', 'IT', 'bld_02', 2), ('Water Purifier', 'Utilities', 'bld_07', 3),
        ]
        statuses = ['active', 'active', 'active', 'active', 'active', 'active', 'active',
                     'maintenance', 'active', 'idle']
        result = []
        for idx, (name, atype, bld, count) in enumerate(assets):
            status = statuses[idx % len(statuses)]
            util = round(float(self.rng.uniform(0.3, 0.95) if status == 'active'
                               else (0.0 if status == 'idle' else self.rng.uniform(0.0, 0.2))), 2)
            maint_days = int(self.rng.randint(5, 90))
            next_maint = int(self.rng.randint(10, 180))
            result.append({
                'id': f'AST-{idx + 1:03d}', 'name': f'{name}',
                'type': atype, 'building': bld, 'count': count,
                'status': status, 'utilization': util,
                'last_maintenance': (self.now - timedelta(days=maint_days)).strftime('%Y-%m-%d'),
                'next_maintenance': (self.now + timedelta(days=next_maint)).strftime('%Y-%m-%d'),
                'hours_today': round(float(util * 12 if status == 'active' else 0), 1)
            })
        return result

    def generate_safety_data(self, days: int = 90) -> list[dict]:
        incident_types = ['slip_fall', 'electrical', 'fire_drill', 'chemical_spill',
                          'equipment_malfunction', 'medical_emergency', 'unauthorized_access',
                          'structural_concern']
        locations = ['bld_01', 'bld_02', 'bld_04', 'bld_07', 'bld_08', 'bld_09', 'bld_10']
        severities = ['low', 'low', 'low', 'medium', 'medium', 'high']
        statuses = ['closed', 'closed', 'closed', 'open', 'under_investigation']
        descriptions = {
            'slip_fall': 'Wet floor incident near stairwell',
            'electrical': 'Electrical panel sparking reported',
            'fire_drill': 'Scheduled fire evacuation drill conducted',
            'chemical_spill': 'Minor chemical spill in laboratory',
            'equipment_malfunction': 'Lab equipment malfunction reported',
            'medical_emergency': 'Student medical emergency in campus',
            'unauthorized_access': 'After-hours access attempt detected',
            'structural_concern': 'Wall crack reported in corridor'
        }
        count = int(self.rng.randint(8, 18))
        incidents = []
        for i in range(count):
            itype = str(self.rng.choice(incident_types))
            incidents.append({
                'id': f'INC-{i + 1:04d}',
                'timestamp': (self.now - timedelta(days=int(self.rng.randint(0, days)))).isoformat(),
                'type': itype,
                'location': str(self.rng.choice(locations)),
                'severity': str(self.rng.choice(severities)),
                'status': str(self.rng.choice(statuses)),
                'description': descriptions.get(itype, 'Incident reported')
            })
        return sorted(incidents, key=lambda x: x['timestamp'], reverse=True)

    def generate_emissions_data(self, hours: int = 168) -> list[dict]:
        energy = self.generate_energy_data(hours)
        emissions = {}
        for d in energy:
            ts = d['timestamp']
            if ts not in emissions:
                emissions[ts] = 0
            emissions[ts] += d['value'] * 0.82 / 1000  # kg CO2 per kWh, convert to tons
        return [{'timestamp': ts, 'co2_tons': round(v, 3)} for ts, v in emissions.items()]

    def inject_anomalies(self, data: list, metric: str, severity: str = 'high') -> list:
        if not data:
            return data
        factors = {'energy': 1.25, 'water': 1.35, 'traffic': 1.40, 'aqi': 1.30}
        factor = factors.get(metric, 1.25)
        # Inject anomalies at 3 points in the last 24 entries
        anomaly_indices = [len(data) - 5, len(data) - 12, len(data) - 18]
        for idx in anomaly_indices:
            if 0 <= idx < len(data):
                entry = data[idx].copy()
                if 'value' in entry:
                    entry['value'] = round(entry['value'] * factor, 1)
                    entry['is_anomaly'] = True
                elif 'aqi' in entry:
                    entry['aqi'] = round(entry['aqi'] * factor)
                    entry['is_anomaly'] = True
                elif 'vehicles' in entry:
                    entry['vehicles'] = int(entry['vehicles'] * factor)
                    entry['is_anomaly'] = True
                data[idx] = entry
        return data

    def get_current_values(self) -> dict:
        """Get current (latest) readings for all metrics with solar offset and TOD tariffs."""
        hour = self.now.hour
        base_energy_kw = sum(
            self._building_base_energy(b.type) * self._diurnal(hour) * (1 + self.rng.normal(0, 0.04))
            for b in self.facility.buildings
        )

        # Rooftop Solar Generation Offset (Peak solar output 11:00 - 15:00)
        solar_output = 0.0
        if 6 <= hour <= 18:
            solar_output = max(0, 60.0 * np.sin(np.pi * (hour - 6) / 12) * (1 + self.rng.normal(0, 0.05)))

        net_energy_kw = max(20.0, base_energy_kw - solar_output)

        # TOD Tariff Rate in INR (₹/kWh)
        if (10 <= hour <= 14) or (18 <= hour <= 22):
            tariff = 11.50  # Peak TOD Rate
        elif 22 <= hour or hour <= 6:
            tariff = 5.50   # Off-Peak Rate
        else:
            tariff = 8.00   # Normal Rate

        hourly_cost_inr = round(net_energy_kw * tariff, 0)

        water_lph = sum(
            self._building_base_water(b.type) * self._diurnal(hour, [(7, 9), (12, 14), (18, 20)]) * (1 + self.rng.normal(0, 0.05))
            for b in self.facility.buildings
        )
        aqi_val = max(30, min(250, 95 + self.rng.normal(0, 12)))
        bins = self.generate_waste_data()
        avg_fill = np.mean([b['fill_pct'] for b in bins])
        overflow_risk = sum(1 for b in bins if b['fill_pct'] > 80)
        parking = self.generate_parking_data()
        total_parking = sum(p['total'] for p in parking)
        occupied_parking = sum(p['occupied'] for p in parking)

        return {
            'energy_kw': round(float(net_energy_kw), 1),
            'gross_energy_kw': round(float(base_energy_kw), 1),
            'solar_generation_kw': round(float(solar_output), 1),
            'tod_tariff_rate': tariff,
            'hourly_cost_inr': hourly_cost_inr,
            'water_lph': round(float(water_lph), 1),
            'aqi': round(float(aqi_val)),
            'avg_waste_fill': round(float(avg_fill), 1),
            'overflow_risk_bins': overflow_risk,
            'parking_total': total_parking,
            'parking_occupied': occupied_parking,
            'co2_estimate': round(float(net_energy_kw * 0.82 / 1000), 3),
            'vehicles': max(10, int(100 * self._diurnal(hour, [(8, 10), (16, 18)]) * (1 + self.rng.normal(0, 0.1)))),
        }

    def get_hotspots(self) -> list[dict]:
        """Generate map hotspot markers around the facility."""
        lat, lng = self.facility.latitude, self.facility.longitude
        hotspots = [
            {'lat': lat + 0.002, 'lng': lng + 0.001, 'type': 'traffic', 'severity': 'high',
             'location': 'Main Gate', 'label': 'Traffic Congestion', 'value': '185 vehicles/hr'},
            {'lat': lat - 0.001, 'lng': lng + 0.003, 'type': 'parking', 'severity': 'warning',
             'location': 'Block A Parking', 'label': 'Parking 87% Full', 'value': '87% occupied'},
            {'lat': lat + 0.001, 'lng': lng - 0.002, 'type': 'air_quality', 'severity': 'moderate',
             'location': 'Cafeteria Area', 'label': 'AQI Elevated', 'value': 'AQI 142'},
            {'lat': lat - 0.002, 'lng': lng - 0.001, 'type': 'waste', 'severity': 'high',
             'location': 'Hostel Block', 'label': 'Bin Near Overflow', 'value': '92% full'},
            {'lat': lat + 0.003, 'lng': lng + 0.002, 'type': 'safety', 'severity': 'low',
             'location': 'Sports Complex', 'label': 'Recent Incident', 'value': 'Slip/Fall reported'},
            {'lat': lat, 'lng': lng, 'type': 'energy', 'severity': 'critical',
             'location': 'Block B Labs', 'label': 'Energy Spike', 'value': '24% above baseline'},
            {'lat': lat + 0.0015, 'lng': lng - 0.001, 'type': 'water', 'severity': 'warning',
             'location': 'Girls Hostel', 'label': 'Water Usage High', 'value': '35% above normal'},
        ]
        return hotspots
