from pydantic import BaseModel, Field
from typing import List, Optional
from enum import Enum


class Semester(str, Enum):
    SPRING = "Spring"
    SUMMER = "Summer"
    FALL = "Fall"


class CourseCreate(BaseModel):
    crn: str = Field(description="Course Registration Number")
    year: int = Field(description="Academic year")
    semester: Semester = Field(description="Academic semester")


class Course(CourseCreate):
    class_id: str = Field(description="Unique identifier for the class")
    is_open: bool = Field(default=False, description="Whether the class is open for registration")
    last_checked: Optional[str] = Field(default=None, description="Timestamp when the class was last checked")


class UserCourse(BaseModel):
    user_id: str = Field(description="User ID")
    class_id: str = Field(description="Class ID") 