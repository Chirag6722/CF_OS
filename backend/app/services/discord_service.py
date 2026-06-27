import httpx
from typing import Optional
from app.core.config import get_settings
from app.core.cache import cache_get, cache_set

settings = get_settings()


async def send_discord_notification(
    webhook_url: str,
    title: str,
    description: str,
    color: int = 0x7C3AED,  # Purple
    fields: list[dict] = None,
    url: str = None,
    thumbnail: str = None,
) -> bool:
    """Send a rich embed notification to a Discord webhook."""
    embed = {
        "title": title,
        "description": description,
        "color": color,
        "footer": {"text": "CP OS — Competitive Programming OS"},
        "timestamp": None,
    }

    if fields:
        embed["fields"] = fields
    if url:
        embed["url"] = url
    if thumbnail:
        embed["thumbnail"] = {"url": thumbnail}

    payload = {
        "username": "CP OS",
        "avatar_url": "https://codeforces.com/predownloaded/7b/2a/7b2a3e3c5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e.png",
        "embeds": [embed],
    }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(webhook_url, json=payload)
            return response.status_code in (200, 204)
    except Exception as e:
        print(f"Discord webhook error: {e}")
        return False


async def send_contest_reminder(
    webhook_url: str,
    contest_name: str,
    platform: str,
    start_time: str,
    duration: str,
    contest_url: str,
    minutes_until: int,
) -> bool:
    """Send a contest reminder embed to Discord."""
    platform_emojis = {
        "codeforces": "🔵",
        "leetcode": "🟡",
        "atcoder": "🔴",
        "icpc": "🏆",
    }
    emoji = platform_emojis.get(platform.lower(), "🏁")
    color = {
        "codeforces": 0x1DA1F2,
        "leetcode": 0xFFA116,
        "atcoder": 0xFF6B6B,
        "icpc": 0x7C3AED,
    }.get(platform.lower(), 0x7C3AED)

    return await send_discord_notification(
        webhook_url=webhook_url,
        title=f"{emoji} Contest Starting Soon!",
        description=f"**{contest_name}** starts in **{minutes_until} minutes**!",
        color=color,
        fields=[
            {"name": "Platform", "value": platform.capitalize(), "inline": True},
            {"name": "Start Time", "value": start_time, "inline": True},
            {"name": "Duration", "value": duration, "inline": True},
        ],
        url=contest_url,
    )
