import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache


class Settings(BaseSettings):
    AWS_REGION_NAME: str
    AWS_COGNITO_APP_CLIENT_ID: str
    AWS_COGNITO_USER_POOL_ID: str
    CLASSES_TABLE_NAME: str = "Course-Classes"
    USERS_TABLE_NAME: str = "Course-Users"
    USER_COURSES_TABLE_NAME: str = "Course-UserCourses"
    SNS_TOPIC_ARN: str = None


@lru_cache
def get_settings():
    return Settings()


env_vars = get_settings()