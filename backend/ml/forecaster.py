import numpy as np
from datetime import datetime, timedelta
from backend.models.schemas import ForecastResult, ForecastPoint

try:
    from sklearn.linear_model import LinearRegression
    HAS_SKLEARN = True
except Exception:
    HAS_SKLEARN = False


class Forecaster:
    def __init__(self):
        pass

    def forecast(self, values: list[float], timestamps: list[str], horizon_hours: int = 24) -> ForecastResult:
        if not values or len(values) < 2:
            return None

        try:
            times = [datetime.fromisoformat(t.replace('Z', '')) for t in timestamps]
            y = np.array(values, dtype=float)
            x_idx = np.arange(len(values), dtype=float)

            if HAS_SKLEARN:
                try:
                    X = np.array([(t.hour, t.weekday(), 1 if t.weekday() >= 5 else 0) for t in times])
                    model = LinearRegression()
                    model.fit(X, y)
                    preds = model.predict(X)

                    last_time = times[-1]
                    future_times = [last_time + timedelta(hours=i+1) for i in range(horizon_hours)]
                    X_future = np.array([(t.hour, t.weekday(), 1 if t.weekday() >= 5 else 0) for t in future_times])
                    future_preds = model.predict(X_future)
                except Exception:
                    # Fallback to numpy polyfit
                    poly = np.polyfit(x_idx, y, 1)
                    preds = np.polyval(poly, x_idx)
                    last_time = times[-1]
                    future_times = [last_time + timedelta(hours=i+1) for i in range(horizon_hours)]
                    future_idx = np.arange(len(values), len(values) + horizon_hours, dtype=float)
                    future_preds = np.polyval(poly, future_idx)
            else:
                poly = np.polyfit(x_idx, y, 1)
                preds = np.polyval(poly, x_idx)
                last_time = times[-1]
                future_times = [last_time + timedelta(hours=i+1) for i in range(horizon_hours)]
                future_idx = np.arange(len(values), len(values) + horizon_hours, dtype=float)
                future_preds = np.polyval(poly, future_idx)

            residual_std = float(np.std(y - preds)) if len(y) > 1 else 1.0

            forecast_points = []
            for i, p in enumerate(future_preds):
                val = round(float(max(0, p)), 1)
                forecast_points.append(ForecastPoint(
                    timestamp=future_times[i].isoformat(),
                    value=val,
                    lower=round(float(max(0, val - 1.96 * residual_std)), 1),
                    upper=round(float(val + 1.96 * residual_std), 1)
                ))

            trend = 'increasing' if future_preds[-1] > future_preds[0] else 'decreasing' if future_preds[-1] < future_preds[0] else 'stable'

            return ForecastResult(
                metric='',
                horizon='',
                historical=[{'timestamp': timestamps[i], 'value': values[i]} for i in range(len(values))],
                forecast=forecast_points,
                confidence=0.85,
                trend=trend,
                summary='Forecast generated using regression model with confidence bands.'
            )
        except Exception as e:
            print(f"Forecast calculation error: {e}")
            return None

    def forecast_metric(self, data: list[dict], metric: str, horizon: str = '24h') -> ForecastResult:
        h_map = {'24h': 24, '7d': 168, '30d': 720}
        horizon_hours = h_map.get(horizon, 24)

        values = [d.get('value', 0) for d in data]
        timestamps = [d.get('timestamp') for d in data]

        res = self.forecast(values, timestamps, horizon_hours)
        if res:
            res.metric = metric
            res.horizon = horizon
        return res
