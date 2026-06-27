from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.planner_service import get_rating_based_plan
from typing import Optional
from datetime import date

router = APIRouter()


class PlannerSaveRequest(BaseModel):
    email: str
    date: str
    morning: list
    afternoon: list
    evening: list
    night: list
    notes: Optional[str] = None


@router.get("/today")
async def get_today_plan(rating: int = 0, handle: Optional[str] = None):
    """Get today's personalized study plan."""
    plan = get_rating_based_plan(rating)
    return plan


@router.post("/today")
async def save_today_plan(request: PlannerSaveRequest):
    """Save today's planner state."""
    # In production: save to DB. For now return success.
    return {"message": "Plan saved successfully", "date": request.date}
