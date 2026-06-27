from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.models import User, Profile, CodeforcesData, Streak, UserSettings
from app.services.cf_service import get_cf_service
from pydantic import BaseModel
from typing import Optional
import uuid

router = APIRouter()


class UserSyncRequest(BaseModel):
    email: str
    name: Optional[str] = None
    image: Optional[str] = None
    provider: str = "credentials"


class ProfileUpdateRequest(BaseModel):
    bio: Optional[str] = None
    country: Optional[str] = None
    institute: Optional[str] = None
    cf_handle: Optional[str] = None
    lc_username: Optional[str] = None
    gh_username: Optional[str] = None
    ac_handle: Optional[str] = None
    timezone: Optional[str] = None
    onboarding_done: Optional[bool] = None


@router.post("/sync")
async def sync_user(request: UserSyncRequest, db: AsyncSession = Depends(get_db)):
    """Create or update a user (called after OAuth sign-in)."""
    result = await db.execute(select(User).where(User.email == request.email))
    user = result.scalar_one_or_none()

    if not user:
        user = User(
            email=request.email,
            name=request.name,
            image=request.image,
            provider=request.provider,
        )
        db.add(user)
        await db.flush()

        # Create default profile
        profile = Profile(user_id=user.id)
        db.add(profile)

        # Create default streak
        streak = Streak(user_id=user.id)
        db.add(streak)

        # Create default settings
        settings_obj = UserSettings(user_id=user.id)
        db.add(settings_obj)
    else:
        if request.name:
            user.name = request.name
        if request.image:
            user.image = request.image

    await db.commit()
    await db.refresh(user)
    return {"id": str(user.id), "email": user.email, "name": user.name}


@router.get("/me")
async def get_me(email: str, db: AsyncSession = Depends(get_db)):
    """Get current user with profile data."""
    result = await db.execute(
        select(User).where(User.email == email)
    )
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    profile_result = await db.execute(select(Profile).where(Profile.user_id == user.id))
    profile = profile_result.scalar_one_or_none()

    streak_result = await db.execute(select(Streak).where(Streak.user_id == user.id))
    streak = streak_result.scalar_one_or_none()

    return {
        "id": str(user.id),
        "email": user.email,
        "name": user.name,
        "image": user.image,
        "profile": {
            "bio": profile.bio if profile else None,
            "country": profile.country if profile else None,
            "institute": profile.institute if profile else None,
            "cf_handle": profile.cf_handle if profile else None,
            "lc_username": profile.lc_username if profile else None,
            "gh_username": profile.gh_username if profile else None,
            "timezone": profile.timezone if profile else "Asia/Kolkata",
            "onboarding_done": profile.onboarding_done if profile else False,
        },
        "streak": {
            "current": streak.current_streak if streak else 0,
            "longest": streak.longest_streak if streak else 0,
        }
    }


@router.put("/me/profile")
async def update_profile(request: ProfileUpdateRequest, email: str, db: AsyncSession = Depends(get_db)):
    """Update user profile including CF handle."""
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    profile_result = await db.execute(select(Profile).where(Profile.user_id == user.id))
    profile = profile_result.scalar_one_or_none()

    if not profile:
        profile = Profile(user_id=user.id)
        db.add(profile)

    # Validate CF handle if provided
    if request.cf_handle and request.cf_handle != profile.cf_handle:
        cf_service = get_cf_service()
        try:
            await cf_service.get_user_info(request.cf_handle)
        except Exception:
            raise HTTPException(status_code=400, detail=f"Invalid Codeforces handle: {request.cf_handle}")

    # Update fields
    for field, value in request.model_dump(exclude_none=True).items():
        setattr(profile, field, value)

    await db.commit()
    return {"message": "Profile updated successfully"}
