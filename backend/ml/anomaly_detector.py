import numpy as np
import uuid
from datetime import datetime
from backend.models.schemas import Anomaly

try:
    from sklearn.ensemble import IsolationForest
    HAS_SKLEARN = True
except Exception:
    HAS_SKLEARN = False


class AnomalyDetector:
    def __init__(self):
        pass

    def detect_isolation_forest(self, data: list[float], contamination: float = 0.05) -> list[bool]:
        if len(data) < 10:
            return [False] * len(data)
        if HAS_SKLEARN:
            try:
                X = np.array(data).reshape(-1, 1)
                clf = IsolationForest(contamination=contamination, random_state=42)
                preds = clf.fit_predict(X)
                return [p == -1 for p in preds]
            except Exception:
                pass
        # Fallback to Z-score anomaly detection if sklearn is unavailable or errors
        return self.detect_zscore(data, threshold=2.0)

    def detect_zscore(self, data: list[float], threshold: float = 2.5) -> list[bool]:
        if not data:
            return []
        arr = np.array(data)
        mean = np.mean(arr)
        std = np.std(arr)
        if std == 0:
            return [False] * len(data)
        z = np.abs((arr - mean) / std)
        return [bool(v > threshold) for v in z]

    def detect_iqr(self, data: list[float], multiplier: float = 1.5) -> list[bool]:
        if not data:
            return []
        arr = np.array(data)
        q1 = np.percentile(arr, 25)
        q3 = np.percentile(arr, 75)
        iqr = q3 - q1
        lower = q1 - multiplier * iqr
        upper = q3 + multiplier * iqr
        return [bool(v < lower or v > upper) for v in arr]

    def detect_all(self, values: list[float], timestamps: list[str], metric: str, location: str, building: str) -> list[Anomaly]:
        if not values:
            return []
        iso = self.detect_isolation_forest(values)
        zsc = self.detect_zscore(values)
        iqr = self.detect_iqr(values)
        anomalies = []
        mean_val = float(np.mean(values))
        for i in range(len(values)):
            if iso[i] or zsc[i] or iqr[i]:
                dev_pct = ((values[i] - mean_val) / (mean_val or 1)) * 100
                sev = self.get_severity(abs(dev_pct))
                anomalies.append(Anomaly(
                    id=str(uuid.uuid4())[:8],
                    timestamp=timestamps[i],
                    metric=metric,
                    location=location,
                    building=building,
                    observed=round(float(values[i]), 1),
                    expected=round(mean_val, 1),
                    deviation_pct=round(float(dev_pct), 1),
                    severity=sev,
                    possible_cause=self.get_possible_cause(metric, dev_pct, 12),
                    recommendation=self.get_recommendation(metric, sev)
                ))
        return anomalies

    def get_severity(self, deviation_pct: float) -> str:
        if deviation_pct < 15: return 'low'
        if deviation_pct < 25: return 'medium'
        if deviation_pct < 40: return 'high'
        return 'critical'

    def get_possible_cause(self, metric: str, deviation_pct: float, hour: int) -> str:
        if metric == 'energy':
            return 'HVAC over-consumption or lab equipment left active' if deviation_pct > 0 else 'Unusual power drop in building'
        elif metric == 'water':
            return 'Potential pipe leak or valve left open' if deviation_pct > 0 else 'Water pressure supply issue'
        elif metric == 'air_quality':
            return 'Elevated PM2.5 / traffic emission spike nearby'
        elif metric == 'traffic':
            return 'Gate queue congestion during shift change'
        return f'Observed value deviating {round(deviation_pct, 1)}% from 7-day average baseline'

    def get_recommendation(self, metric: str, severity: str) -> str:
        if severity in ('critical', 'high'):
            return f'Dispatch maintenance technician to inspect {metric} sensors and control panels immediately.'
        return f'Monitor {metric} trends over the next 2 hours and verify scheduled baseline.'
