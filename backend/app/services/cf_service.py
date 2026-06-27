import httpx
import asyncio
from datetime import datetime, timezone, timedelta
from typing import Optional
from app.core.config import get_settings
from app.core.cache import cache_get, cache_set

settings = get_settings()

CF_BASE = "https://codeforces.com/api"
RATE_LIMIT_DELAY = 2.1  # seconds between CF API calls


class CodeforcesService:
    def __init__(self):
        self.client = httpx.AsyncClient(timeout=30.0)

    async def _get(self, endpoint: str, params: dict = None) -> dict:
        """Make a GET request to the Codeforces API."""
        url = f"{CF_BASE}/{endpoint}"
        response = await self.client.get(url, params=params or {})
        response.raise_for_status()
        data = response.json()

        if data.get("status") != "OK":
            raise ValueError(f"CF API error: {data.get('comment', 'Unknown error')}")

        return data["result"]

    async def get_user_info(self, handle: str) -> dict:
        """Fetch user profile from Codeforces."""
        cache_key = f"cf:user:{handle}"
        cached = await cache_get(cache_key)
        if cached:
            return cached

        result = await self._get("user.info", {"handles": handle})
        user = result[0] if result else {}

        # Normalize avatar URL
        if user.get("titlePhoto"):
            if user["titlePhoto"].startswith("//"):
                user["titlePhoto"] = "https:" + user["titlePhoto"]
        if user.get("avatar"):
            if user["avatar"].startswith("//"):
                user["avatar"] = "https:" + user["avatar"]

        await cache_set(cache_key, user, ttl=900)  # 15 min cache
        return user

    async def get_rating_history(self, handle: str) -> list:
        """Fetch contest rating history."""
        cache_key = f"cf:rating:{handle}"
        cached = await cache_get(cache_key)
        if cached:
            return cached

        result = await self._get("user.rating", {"handle": handle})
        await cache_set(cache_key, result, ttl=1800)  # 30 min cache
        return result

    async def get_submissions(self, handle: str, count: int = 100) -> list:
        """Fetch recent submissions."""
        cache_key = f"cf:submissions:{handle}:{count}"
        cached = await cache_get(cache_key)
        if cached:
            return cached

        result = await self._get("user.status", {"handle": handle, "from": 1, "count": count})
        await cache_set(cache_key, result, ttl=600)  # 10 min cache
        return result

    async def get_full_profile(self, handle: str) -> dict:
        """Fetch all data for a user and compute stats."""
        cache_key = f"cf:full:{handle}"
        cached = await cache_get(cache_key)
        if cached:
            return cached

        # Fetch all in parallel with small delay between CF calls
        user_info = await self.get_user_info(handle)
        await asyncio.sleep(RATE_LIMIT_DELAY)
        rating_history = await self.get_rating_history(handle)
        await asyncio.sleep(RATE_LIMIT_DELAY)
        submissions = await self.get_submissions(handle, count=500)

        # Compute problem stats from submissions
        solved_set = set()
        rating_bucket = {}
        tag_bucket = {}

        for sub in submissions:
            if sub.get("verdict") == "OK":
                problem = sub.get("problem", {})
                pid = f"{problem.get('contestId', '')}-{problem.get('index', '')}"
                if pid not in solved_set:
                    solved_set.add(pid)
                    r = problem.get("rating", 0)
                    if r:
                        bucket = (r // 100) * 100
                        rating_bucket[str(bucket)] = rating_bucket.get(str(bucket), 0) + 1
                    for tag in problem.get("tags", []):
                        tag_bucket[tag] = tag_bucket.get(tag, 0) + 1

        full_data = {
            "handle": handle,
            "rating": user_info.get("rating", 0),
            "max_rating": user_info.get("maxRating", 0),
            "rank": user_info.get("rank", "unrated"),
            "max_rank": user_info.get("maxRank", "unrated"),
            "contribution": user_info.get("contribution", 0),
            "friend_count": user_info.get("friendOfCount", 0),
            "avatar_url": user_info.get("titlePhoto") or user_info.get("avatar"),
            "country": user_info.get("country"),
            "organization": user_info.get("organization"),
            "solved_count": len(solved_set),
            "rating_history": rating_history,
            "submissions": submissions[:100],  # Store last 100
            "problem_stats": {
                "by_rating": rating_bucket,
                "by_tag": tag_bucket,
            },
        }

        # Calculate streaks
        streaks = calculate_streaks(submissions)
        full_data.update(streaks)

        await cache_set(cache_key, full_data, ttl=900)
        return full_data

    async def get_upcoming_contests(self) -> list:
        """Fetch upcoming/ongoing CF contests."""
        cache_key = "cf:contests:upcoming"
        cached = await cache_get(cache_key)
        if cached:
            return cached

        result = await self._get("contest.list", {"gym": False})
        upcoming = [
            c for c in result
            if c.get("phase") in ("BEFORE", "CODING")
        ][:20]  # limit to 20

        await cache_set(cache_key, upcoming, ttl=300)  # 5 min cache
        return upcoming

    async def close(self):
        await self.client.aclose()


# Singleton instance
_cf_service: Optional[CodeforcesService] = None


def get_cf_service() -> CodeforcesService:
    global _cf_service
    if _cf_service is None:
        _cf_service = CodeforcesService()
    return _cf_service


def calculate_streaks(submissions: list) -> dict:
    solved_dates = set()
    for sub in submissions:
        if sub.get("verdict") == "OK":
            dt = datetime.fromtimestamp(sub.get("creationTimeSeconds", 0), tz=timezone.utc)
            solved_dates.add(dt.strftime("%Y-%m-%d"))
            
    sorted_dates = sorted(list(solved_dates))
    if not sorted_dates:
        return {"current_streak": 0, "longest_streak": 0}
        
    # Calculate Longest Streak
    longest_streak = 0
    current_run = 0
    prev_date = None
    
    for date_str in sorted_dates:
        curr_date = datetime.strptime(date_str, "%Y-%m-%d")
        if prev_date is None:
            current_run = 1
        else:
            diff = curr_date - prev_date
            if diff.days == 1:
                current_run += 1
            elif diff.days > 1:
                longest_streak = max(longest_streak, current_run)
                current_run = 1
        prev_date = curr_date
    longest_streak = max(longest_streak, current_run)
    
    # Calculate Current Streak
    today_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    yesterday_str = (datetime.now(timezone.utc) - timedelta(days=1)).strftime("%Y-%m-%d")
    
    current_streak = 0
    dates_set = set(sorted_dates)
    
    if today_str in dates_set:
        current_streak = 1
        check_date = datetime.now(timezone.utc)
        while True:
            check_date -= timedelta(days=1)
            check_str = check_date.strftime("%Y-%m-%d")
            if check_str in dates_set:
                current_streak += 1
            else:
                break
    elif yesterday_str in dates_set:
        current_streak = 1
        check_date = datetime.now(timezone.utc) - timedelta(days=1)
        while True:
            check_date -= timedelta(days=1)
            check_str = check_date.strftime("%Y-%m-%d")
            if check_str in dates_set:
                current_streak += 1
            else:
                break
                
    return {
        "current_streak": current_streak,
        "longest_streak": longest_streak
    }
