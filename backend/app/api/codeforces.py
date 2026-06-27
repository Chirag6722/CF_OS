from fastapi import APIRouter, HTTPException
from app.services.cf_service import get_cf_service

router = APIRouter()


@router.get("/{handle}/profile")
async def get_cf_profile(handle: str):
    """Get full Codeforces profile for a handle."""
    cf = get_cf_service()
    try:
        data = await cf.get_full_profile(handle)
        return data
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch CF data: {str(e)}")


@router.get("/{handle}/rating")
async def get_rating_history(handle: str):
    """Get Codeforces rating history for a handle."""
    cf = get_cf_service()
    try:
        data = await cf.get_rating_history(handle)
        return {"handle": handle, "history": data}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/{handle}/submissions")
async def get_submissions(handle: str, count: int = 100):
    """Get recent submissions for a handle."""
    cf = get_cf_service()
    try:
        data = await cf.get_submissions(handle, count=min(count, 500))
        return {"handle": handle, "submissions": data}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/{handle}/user-info")
async def get_user_info(handle: str):
    """Get basic Codeforces user info."""
    cf = get_cf_service()
    try:
        data = await cf.get_user_info(handle)
        return data
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/{handle}/coach")
async def get_ai_coach_advice(handle: str):
    """Get dynamic AI Coach recommendations & guidance."""
    from app.services.ai_coach_service import get_ai_coach_service
    coach = get_ai_coach_service()
    try:
        data = await coach.get_coach_guidance(handle)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate coach advice: {str(e)}")
