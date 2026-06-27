from fastapi import APIRouter, HTTPException
from app.services.cf_service import get_cf_service
from app.core.cache import cache_get, cache_set
import httpx
from datetime import datetime, timezone

router = APIRouter()


async def fetch_leetcode_contests() -> list:
    """Fetch upcoming LeetCode contests via their public API."""
    cache_key = "lc:contests:upcoming"
    cached = await cache_get(cache_key)
    if cached:
        return cached

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get("https://leetcode.com/contest/api/list/")
            data = response.json()
            contests = data.get("contests", [])
            upcoming = [
                {
                    "platform": "leetcode",
                    "contest_id": str(c.get("titleSlug", "")),
                    "name": c.get("title", ""),
                    "start_time": datetime.fromtimestamp(c.get("startTime", 0), tz=timezone.utc).isoformat(),
                    "duration_secs": c.get("duration", 0),
                    "url": f"https://leetcode.com/contest/{c.get('titleSlug', '')}",
                    "phase": "BEFORE",
                }
                for c in contests
                if c.get("startTime", 0) > datetime.now(timezone.utc).timestamp()
            ][:5]
            await cache_set(cache_key, upcoming, ttl=300)
            return upcoming
    except Exception as e:
        print(f"LC contest fetch error: {e}")
        return []


async def fetch_atcoder_contests() -> list:
    """Fetch upcoming AtCoder contests."""
    cache_key = "ac:contests:upcoming"
    cached = await cache_get(cache_key)
    if cached:
        return cached

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get("https://kenkoooo.com/atcoder/resources/contests.json")
            contests = response.json()
            now_ts = datetime.now(timezone.utc).timestamp()
            upcoming = [
                {
                    "platform": "atcoder",
                    "contest_id": c.get("id", ""),
                    "name": c.get("title", ""),
                    "start_time": datetime.fromtimestamp(c.get("start_epoch_second", 0), tz=timezone.utc).isoformat(),
                    "duration_secs": c.get("duration_second", 0),
                    "url": f"https://atcoder.jp/contests/{c.get('id', '')}",
                    "phase": "BEFORE",
                }
                for c in contests
                if c.get("start_epoch_second", 0) > now_ts
            ]
            upcoming.sort(key=lambda x: x["start_time"])
            upcoming = upcoming[:5]
            await cache_set(cache_key, upcoming, ttl=300)
            return upcoming
    except Exception as e:
        print(f"AtCoder contest fetch error: {e}")
        return []


@router.get("/upcoming")
async def get_upcoming_contests(platform: str = "all"):
    """Get upcoming contests from all platforms."""
    result = []

    if platform in ("all", "codeforces"):
        cf = get_cf_service()
        try:
            cf_contests = await cf.get_upcoming_contests()
            for c in cf_contests:
                result.append({
                    "platform": "codeforces",
                    "contest_id": str(c.get("id", "")),
                    "name": c.get("name", ""),
                    "start_time": datetime.fromtimestamp(
                        c.get("startTimeSeconds", 0), tz=timezone.utc
                    ).isoformat(),
                    "duration_secs": c.get("durationSeconds", 0),
                    "url": f"https://codeforces.com/contest/{c.get('id', '')}",
                    "phase": c.get("phase", "BEFORE"),
                })
        except Exception as e:
            print(f"CF contest error: {e}")

    if platform in ("all", "leetcode"):
        lc = await fetch_leetcode_contests()
        result.extend(lc)

    if platform in ("all", "atcoder"):
        ac = await fetch_atcoder_contests()
        result.extend(ac)

    # Sort by start_time
    result.sort(key=lambda x: x["start_time"])

    return {"contests": result, "count": len(result)}
