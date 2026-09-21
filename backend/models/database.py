from sqlalchemy import create_engine, Column, Integer, String, Float, Boolean
from sqlalchemy.orm import declarative_base, sessionmaker
from backend.utils.config import settings

engine = create_engine(settings.database_url, connect_args={"check_same_thread": False} if settings.database_url.startswith("sqlite") else {})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class DBSensorReading(Base):
    __tablename__ = 'sensor_readings'
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(String, index=True)
    facility_id = Column(String, index=True)
    building_id = Column(String, index=True)
    zone = Column(String)
    metric = Column(String, index=True)
    value = Column(Float)
    unit = Column(String)
    lat = Column(Float, nullable=True)
    lng = Column(Float, nullable=True)

class DBAnomaly(Base):
    __tablename__ = 'anomalies'
    id = Column(String, primary_key=True, index=True)
    timestamp = Column(String)
    metric = Column(String)
    location = Column(String)
    building = Column(String)
    observed = Column(Float)
    expected = Column(Float)
    deviation_pct = Column(Float)
    severity = Column(String)
    cause = Column(String)
    recommendation = Column(String)
    status = Column(String)

class DBAction(Base):
    __tablename__ = 'actions'
    id = Column(String, primary_key=True, index=True)
    priority = Column(String)
    problem = Column(String)
    who = Column(String)
    what = Column(String)
    where = Column(String)
    when_str = Column(String)
    why = Column(String)
    expected_impact = Column(String)
    confidence = Column(Float)
    status = Column(String)
    created_at = Column(String)
    metric = Column(String)

class DBSimulationState(Base):
    __tablename__ = 'simulation_state'
    id = Column(Integer, primary_key=True, index=True)
    active = Column(Boolean, default=False)
    tick = Column(Integer, default=0)
    anomaly_injected = Column(Boolean, default=False)
    speed = Column(Float, default=1.0)

def init_db():
    try:
        Base.metadata.create_all(bind=engine, checkfirst=True)
    except Exception as e:
        print(f"Database init warning (non-fatal): {e}")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
