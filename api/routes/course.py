from fastapi import APIRouter, Depends, HTTPException, status
from typing import List

from core.dependencies import get_current_user
from schemas.course import CourseCreate, Course
from services.course import CourseService

router = APIRouter(
    prefix="/courses",
    tags=["Courses"],
    dependencies=[Depends(get_current_user)]  # All routes are protected
)

@router.post("/", status_code=status.HTTP_201_CREATED)
async def add_course(
    course: CourseCreate, 
    current_user: dict = Depends(get_current_user)
):
    """Add a course to track for the current user"""
    user_id = current_user.get("username")
    return await CourseService.add_course(user_id, course)

@router.get("/", status_code=status.HTTP_200_OK, response_model=List[Course])
async def get_user_courses(current_user: dict = Depends(get_current_user)):
    """Get all courses tracked by the current user"""
    user_id = current_user.get("username")
    return await CourseService.get_user_courses(user_id)

@router.post("/check", status_code=status.HTTP_200_OK)
async def check_all_courses(current_user: dict = Depends(get_current_user)):
    """Manually trigger checking all courses (admin only)"""
    if 'admin' not in current_user.get('groups', []):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admin users can perform this action"
        )
    
    return await CourseService.check_all_courses()

@router.post("/notify", status_code=status.HTTP_200_OK)
async def notify_users(current_user: dict = Depends(get_current_user)):
    """Manually trigger notifications for open courses (admin only)"""
    if 'admin' not in current_user.get('groups', []):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admin users can perform this action"
        )
    
    return await CourseService.notify_users_for_open_courses() 