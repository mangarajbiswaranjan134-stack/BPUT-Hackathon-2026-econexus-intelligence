import os
from pydantic_settings import BaseSettings

_BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
_ENV_PATH = os.path.join(_BASE_DIR, '.env')

class Settings(BaseSettings):
    gemini_api_key: str = ''
    map_api_key: str = ''
    map_provider: str = 'openstreetmap'
    weather_api_key: str = ''
    weather_provider: str = 'openweather'
    geocoding_api_key: str = ''
    database_url: str = 'sqlite:///./econexus.db'
    host: str = '0.0.0.0'
    port: int = 8000
    debug: bool = True
    frontend_url: str = 'http://localhost:5173'

    @property
    def has_gemini(self) -> bool:
        return bool(self.gemini_api_key)

    @property
    def has_maps(self) -> bool:
        return bool(self.map_api_key)

    @property
    def has_weather(self) -> bool:
        return bool(self.weather_api_key)

    class Config:
        env_file = (_ENV_PATH, '.env', '../.env')
        env_file_encoding = 'utf-8'

settings = Settings()
