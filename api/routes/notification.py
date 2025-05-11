from fastapi import APIRouter, Depends, HTTPException, status
from typing import Optional
from pydantic import BaseModel, EmailStr

from core.dependencies import get_current_user
from services.notification import NotificationService

router = APIRouter(
    prefix="/notifications",
    tags=["Notifications"],
    dependencies=[Depends(get_current_user)]  # All routes are protected
)

class SubscriptionRequest(BaseModel):
    phone_number: Optional[str] = None

@router.post("/subscribe", status_code=status.HTTP_200_OK)
async def subscribe_to_notifications(
    subscription: SubscriptionRequest,
    current_user: dict = Depends(get_current_user)
):
    """Subscribe to course availability notifications"""
    email = current_user.get("email")
    
    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User email not found"
        )
    
    return NotificationService.subscribe_user_to_notifications(
        email=email,
        phone_number=subscription.phone_number
    ) 