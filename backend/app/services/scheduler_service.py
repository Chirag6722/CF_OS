import asyncio
from datetime import datetime, timezone, timedelta
from sqlalchemy import select
from apscheduler.schedulers.asyncio import AsyncIOScheduler

from app.core.database import AsyncSessionLocal
from app.models import ContestReminder, Contest, DiscordWebhook
from app.services.discord_service import send_contest_reminder

_scheduler = None


async def check_contest_reminders_job():
    """Scan database for upcoming contest reminders and dispatch notifications."""
    async with AsyncSessionLocal() as session:
        try:
            now = datetime.now(timezone.utc)
            # Find reminders that are due in the next 35 minutes and haven't been sent yet
            query = select(ContestReminder).where(
                ContestReminder.reminded_at.is_(None),
                ContestReminder.via_discord == True
            )
            result = await session.execute(query)
            reminders = result.scalars().all()

            for reminder in reminders:
                # Fetch associated contest details
                contest_query = select(Contest).where(Contest.id == reminder.contest_id)
                contest_res = await session.execute(contest_query)
                contest = contest_res.scalar_one_or_none()

                if not contest:
                    continue

                # Ensure start time is in future and starting within 35 minutes
                time_diff = contest.start_time - now
                if timedelta(minutes=0) <= time_diff <= timedelta(minutes=35):
                    # Fetch user's Discord webhook settings
                    webhook_query = select(DiscordWebhook).where(DiscordWebhook.user_id == reminder.user_id)
                    webhook_res = await session.execute(webhook_query)
                    webhook = webhook_res.scalar_one_or_none()

                    if webhook and webhook.webhook_url and webhook.notify_contests:
                        minutes_until = int(time_diff.total_seconds() / 60)
                        
                        # Formatter fields
                        duration_secs = contest.duration_secs or 7200
                        duration_str = f"{duration_secs // 3600}h {(duration_secs % 3600) // 60}m"
                        start_str = contest.start_time.strftime("%d-%b-%Y %I:%M %p UTC")

                        success = await send_contest_reminder(
                            webhook_url=webhook.webhook_url,
                            contest_name=contest.name,
                            platform=contest.platform,
                            start_time=start_str,
                            duration=duration_str,
                            contest_url=contest.url or "",
                            minutes_until=minutes_until
                        )

                        if success:
                            # Flag as notified to avoid double reminding
                            reminder.reminded_at = datetime.now(timezone.utc)
                            session.add(reminder)
                            await session.commit()
                            print(f"[INFO] Dispatched Discord reminder for contest: {contest.name}")
        except Exception as e:
            print(f"[ERROR] Contest reminder background job error: {e}")


def start_scheduler():
    """Initialize and start the background scheduler."""
    global _scheduler
    if _scheduler is None:
        _scheduler = AsyncIOScheduler()
        # Scan reminders every 3 minutes
        _scheduler.add_job(check_contest_reminders_job, "interval", minutes=3)
        _scheduler.start()


def stop_scheduler():
    """Stop the background scheduler."""
    global _scheduler
    if _scheduler:
        _scheduler.shutdown()
        _scheduler = None
