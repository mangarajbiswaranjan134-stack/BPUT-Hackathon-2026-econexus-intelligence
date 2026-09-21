from backend.ml.anomaly_detector import AnomalyDetector
from backend.ml.forecaster import Forecaster
from backend.models.schemas import Anomaly, ForecastResult
from backend.services.data_service import data_service


class MLService:
    def __init__(self):
        self.detector = AnomalyDetector()
        self.forecaster = Forecaster()

    def detect_anomalies(self, metric: str = None) -> list[Anomaly]:
        """Run anomaly detection on specified metric or all metrics."""
        all_anomalies = []

        metrics_to_check = [metric] if metric else ['energy', 'water', 'air_quality', 'traffic']

        for m in metrics_to_check:
            try:
                if m == 'energy':
                    data = data_service.get_energy_history(48)
                    # Aggregate by hour
                    hourly = {}
                    for d in data:
                        ts = d['timestamp'][:13]
                        hourly[ts] = hourly.get(ts, 0) + d['value']
                    timestamps = sorted(hourly.keys())
                    values = [hourly[t] for t in timestamps]
                    ts_full = [t + ':00:00' for t in timestamps]
                    anomalies = self.detector.detect_all(values, ts_full, 'energy', 'Campus', 'Multiple')
                    all_anomalies.extend(anomalies)

                elif m == 'water':
                    data = data_service.get_water_history(48)
                    hourly = {}
                    for d in data:
                        ts = d['timestamp'][:13]
                        hourly[ts] = hourly.get(ts, 0) + d['value']
                    timestamps = sorted(hourly.keys())
                    values = [hourly[t] for t in timestamps]
                    ts_full = [t + ':00:00' for t in timestamps]
                    anomalies = self.detector.detect_all(values, ts_full, 'water', 'Campus', 'Multiple')
                    all_anomalies.extend(anomalies)

                elif m == 'air_quality':
                    data = data_service._cache.get('air_quality', [])[-48:]
                    if data:
                        values = [d['aqi'] for d in data]
                        timestamps = [d['timestamp'] for d in data]
                        anomalies = self.detector.detect_all(values, timestamps, 'air_quality', 'Campus', 'Outdoor')
                        all_anomalies.extend(anomalies)

                elif m == 'traffic':
                    data = data_service._cache.get('traffic', [])[-48:]
                    if data:
                        values = [float(d['vehicles']) for d in data]
                        timestamps = [d['timestamp'] for d in data]
                        anomalies = self.detector.detect_all(values, timestamps, 'traffic', 'Main Gate', 'Campus')
                        all_anomalies.extend(anomalies)
            except Exception as e:
                print(f"Error detecting anomalies for {m}: {e}")
                continue

        # Sort by severity and time
        severity_order = {'critical': 0, 'high': 1, 'medium': 2, 'low': 3}
        all_anomalies.sort(key=lambda a: (severity_order.get(a.severity, 4), a.timestamp), reverse=True)
        return all_anomalies[:20]

    def get_forecast(self, metric: str, horizon: str = '24h') -> ForecastResult:
        """Generate forecast for a specific metric."""
        try:
            if metric == 'energy':
                data = data_service.get_energy_history(168)
                hourly = {}
                for d in data:
                    ts = d['timestamp'][:13]
                    hourly[ts] = hourly.get(ts, 0) + d['value']
                chart_data = [{'timestamp': k + ':00:00', 'value': v} for k, v in sorted(hourly.items())]
            elif metric == 'water':
                data = data_service.get_water_history(168)
                hourly = {}
                for d in data:
                    ts = d['timestamp'][:13]
                    hourly[ts] = hourly.get(ts, 0) + d['value']
                chart_data = [{'timestamp': k + ':00:00', 'value': v} for k, v in sorted(hourly.items())]
            elif metric == 'waste':
                # Use daily waste generation history
                chart_data = data_service.get_waste_data().history
            elif metric == 'traffic':
                data = data_service._cache.get('traffic', [])
                chart_data = [{'timestamp': d['timestamp'], 'value': float(d['vehicles'])} for d in data]
            elif metric == 'air_quality':
                data = data_service._cache.get('air_quality', [])
                chart_data = [{'timestamp': d['timestamp'], 'value': d['aqi']} for d in data]
            else:
                return ForecastResult(
                    metric=metric, horizon=horizon, historical=[], forecast=[],
                    confidence=0.5, trend='stable',
                    summary=f'Insufficient data for {metric} forecast'
                )

            result = self.forecaster.forecast_metric(chart_data, metric, horizon)
            if result:
                result.summary = f"Forecast for {metric} over {horizon}. Trend: {result.trend}. Confidence: {round(result.confidence * 100)}%."
                return result
            else:
                return ForecastResult(
                    metric=metric, horizon=horizon,
                    historical=chart_data[-48:],
                    forecast=[], confidence=0.5, trend='stable',
                    summary='Insufficient historical data for reliable forecast.'
                )
        except Exception as e:
            print(f"Forecast error for {metric}: {e}")
            return ForecastResult(
                metric=metric, horizon=horizon, historical=[], forecast=[],
                confidence=0.0, trend='unknown',
                summary=f'Forecast generation failed: {str(e)}'
            )

    def get_all_anomalies(self) -> list[Anomaly]:
        return self.detect_anomalies()


ml_service = MLService()
