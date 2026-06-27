from fastapi import APIRouter, HTTPException
from app.services.cf_service import get_cf_service
from datetime import datetime

router = APIRouter()


@router.get("/{handle}")
async def get_analytics(handle: str):
    """Get full analytics data for a CF handle."""
    cf = get_cf_service()
    try:
        data = await cf.get_full_profile(handle)

        # Build heatmap from submissions
        heatmap = {}
        for sub in data.get("submissions", []):
            if sub.get("verdict") == "OK":
                ts = sub.get("creationTimeSeconds", 0)
                day = datetime.fromtimestamp(ts).strftime("%Y-%m-%d")
                heatmap[day] = heatmap.get(day, 0) + 1

        # Rating history formatted for Recharts
        rating_chart = [
            {
                "contest": r.get("contestName", "")[:30],
                "rating": r.get("newRating", 0),
                "date": datetime.fromtimestamp(r.get("ratingUpdateTimeSeconds", 0)).strftime("%b %Y"),
                "rank": r.get("rank", 0),
                "change": r.get("newRating", 0) - r.get("oldRating", 0),
            }
            for r in data.get("rating_history", [])
        ]

        return {
            "handle": handle,
            "rating": data.get("rating", 0),
            "max_rating": data.get("max_rating", 0),
            "rank": data.get("rank", "unrated"),
            "solved_count": data.get("solved_count", 0),
            "rating_chart": rating_chart,
            "heatmap": heatmap,
            "problem_stats": data.get("problem_stats", {}),
            "contest_count": len(data.get("rating_history", [])),
        }
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
