from backend.models.schemas import FacilityConfig, BuildingConfig

ENGINEERING_COLLEGE = FacilityConfig(
    id='fac_eng_001',
    name='Engineering College Campus',
    type='engineering_college',
    location='Bhubaneswar, Odisha, India',
    latitude=20.2961,
    longitude=85.8245,
    timezone='Asia/Kolkata',
    buildings=[
        BuildingConfig(id='bld_01', name='Main Academic Block (Block A)', type='academic', area_sqft=50000, floors=4, zones=['classrooms', 'faculty_offices', 'seminar_halls']),
        BuildingConfig(id='bld_02', name='Science & Technology Block (Block B)', type='lab', area_sqft=40000, floors=3, zones=['computer_labs', 'electronics_lab', 'physics_lab', 'chemistry_lab']),
        BuildingConfig(id='bld_03', name='Administrative Block', type='admin', area_sqft=20000, floors=2, zones=['admin_offices', 'reception', 'conference_rooms']),
        BuildingConfig(id='bld_04', name='Boys Hostel Complex', type='hostel', area_sqft=60000, floors=5, zones=['rooms', 'common_areas', 'mess']),
        BuildingConfig(id='bld_05', name='Girls Hostel Complex', type='hostel', area_sqft=50000, floors=4, zones=['rooms', 'common_areas', 'mess']),
        BuildingConfig(id='bld_06', name='Central Library', type='library', area_sqft=25000, floors=3, zones=['reading_halls', 'stack_rooms', 'digital_center']),
        BuildingConfig(id='bld_07', name='Cafeteria & Food Court', type='canteen', area_sqft=15000, floors=1, zones=['kitchen', 'dining', 'food_stalls']),
        BuildingConfig(id='bld_08', name='Sports Complex', type='recreation', area_sqft=30000, floors=2, zones=['gymnasium', 'indoor_courts', 'outdoor_fields']),
        BuildingConfig(id='bld_09', name='Workshop & Innovation Lab', type='lab', area_sqft=20000, floors=2, zones=['mechanical_workshop', '3d_printing_lab', 'iot_lab']),
        BuildingConfig(id='bld_10', name='Power & Utilities Center', type='utilities', area_sqft=5000, floors=1, zones=['transformer', 'generator', 'water_pump'])
    ]
)

FACILITY_TEMPLATES = {
    'engineering_college': ENGINEERING_COLLEGE,
    'government_hospital': FacilityConfig(id='fac_hosp_001', name='Government Hospital', type='government_hospital', location='Bhubaneswar', latitude=20.29, longitude=85.82, buildings=[], timezone='Asia/Kolkata'),
    'industrial_estate': FacilityConfig(id='fac_ind_001', name='Industrial Estate', type='industrial_estate', location='Bhubaneswar', latitude=20.29, longitude=85.82, buildings=[], timezone='Asia/Kolkata'),
    'municipal_facility': FacilityConfig(id='fac_mun_001', name='Municipal Facility', type='municipal_facility', location='Bhubaneswar', latitude=20.29, longitude=85.82, buildings=[], timezone='Asia/Kolkata'),
    'corporate_campus': FacilityConfig(id='fac_corp_001', name='Corporate Campus', type='corporate_campus', location='Bhubaneswar', latitude=20.29, longitude=85.82, buildings=[], timezone='Asia/Kolkata')
}
