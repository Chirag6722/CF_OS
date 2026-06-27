from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.discord_service import send_discord_notification, send_contest_reminder

router = APIRouter()


class TestNotificationRequest(BaseModel):
    webhook_url: str
    message: str = "Hello from CP OS! 🚀 Your notifications are working perfectly."


class ContestReminderRequest(BaseModel):
    webhook_url: str
    contest_name: str
    platform: str
    start_time: str
    duration: str
    contest_url: str
    minutes_until: int


@router.post("/discord/test")
async def test_discord_notification(request: TestNotificationRequest):
    """Send a test notification to a Discord webhook."""
    success = await send_discord_notification(
        webhook_url=request.webhook_url,
        title="✅ CP OS Connected!",
        description=request.message,
        color=0x7C3AED,
    )
    if not success:
        raise HTTPException(status_code=400, detail="Failed to send Discord notification")
    return {"message": "Notification sent successfully"}


@router.post("/discord/contest")
async def send_discord_contest_reminder(request: ContestReminderRequest):
    """Send a contest reminder to a Discord webhook."""
    success = await send_contest_reminder(
        webhook_url=request.webhook_url,
        contest_name=request.contest_name,
        platform=request.platform,
        start_time=request.start_time,
        duration=request.duration,
        contest_url=request.contest_url,
        minutes_until=request.minutes_until,
    )
    if not success:
        raise HTTPException(status_code=400, detail="Failed to send Discord notification")
    return {"message": "Contest reminder sent successfully"}
