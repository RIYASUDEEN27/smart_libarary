from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    mongodb_url: str = Field(default="mongodb+srv://riyasudeenit27_db_user:Gz3Y6mADElTneNmv@simpletask.mqxjb4u.mongodb.net/?appName=simpletask")
    database_name: str = Field(default="smart_library")
    secret_key: str = Field(default="supersecretkey_please_change_in_production")
    algorithm: str = Field(default="HS256")
    access_token_expire_minutes: int = Field(default=1440)

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
