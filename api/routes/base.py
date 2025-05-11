from fastapi import APIRouter, Request, status
from services.course import CourseService

router = APIRouter()

@router.get("/")
async def base():
    return {"message": "Course Monitoring API"}

@router.post("/check-courses", status_code=status.HTTP_200_OK)
async def check_courses(request: Request):
    """
    EventBridge triggered endpoint to check course availability and notify users.
    This endpoint is not protected as it's meant to be called by EventBridge.
    """
    # In a production environment, you might want to add additional security
    # such as checking for specific headers or source IP
    
    # Check all courses and notify users
    await CourseService.notify_users_for_open_courses()
    
    return {"message": "Course check completed successfully"} 