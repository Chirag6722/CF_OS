from datetime import datetime, date
from typing import Optional
import uuid


# ─── Planner Task ──────────────────────────────────────────────
PLANNER_TEMPLATE = {
    "morning": [
        {"id": "m1", "title": "Solve 2 CF problems (target rating)", "type": "practice", "completed": False},
        {"id": "m2", "title": "Review yesterday's wrong answers", "type": "upsolve", "completed": False},
    ],
    "afternoon": [
        {"id": "a1", "title": "Learn a new algorithm / data structure", "type": "learning", "completed": False},
        {"id": "a2", "title": "Implement and test solution", "type": "practice", "completed": False},
    ],
    "evening": [
        {"id": "e1", "title": "Upsolve 1 contest problem", "type": "upsolve", "completed": False},
        {"id": "e2", "title": "Read editorial / approach explanation", "type": "editorial", "completed": False},
    ],
    "night": [
        {"id": "n1", "title": "Plan tomorrow's goals", "type": "planning", "completed": False},
        {"id": "n2", "title": "Review notes and tag weak topics", "type": "review", "completed": False},
    ],
}


def get_rating_based_plan(rating: int) -> dict:
    """Generate a personalized planner based on CF rating."""
    if rating == 0:
        # New user / unrated
        target_low, target_high = 800, 1000
        focus = "fundamentals (implementation, brute force)"
        algorithm = "prefix sums, sorting, binary search basics"
    elif rating < 1200:
        target_low, target_high = 900, 1100
        focus = "implementation and ad-hoc problems"
        algorithm = "sorting, greedy basics, simple math"
    elif rating < 1400:
        target_low, target_high = 1100, 1300
        focus = "greedy algorithms and constructive problems"
        algorithm = "greedy, number theory, two pointers"
    elif rating < 1600:
        target_low, target_high = 1300, 1500
        focus = "graphs and DP foundations"
        algorithm = "BFS/DFS, basic DP (1D/2D), binary search on answer"
    elif rating < 1900:
        target_low, target_high = 1500, 1800
        focus = "advanced DP and graph algorithms"
        algorithm = "Dijkstra, segment trees, DP optimization"
    elif rating < 2100:
        target_low, target_high = 1800, 2000
        focus = "advanced algorithms and data structures"
        algorithm = "convex hull trick, SCC, network flow basics"
    else:
        target_low, target_high = 2000, 2300
        focus = "competitive-level algorithms"
        algorithm = "advanced DP, suffix arrays, advanced graph theory"

    today = date.today().strftime("%A, %B %d")

    return {
        "date": date.today().isoformat(),
        "greeting_context": f"Today is {today}",
        "rating_target": f"{target_low}–{target_high}",
        "focus": focus,
        "algorithm_of_day": algorithm,
        "morning": [
            {"id": str(uuid.uuid4())[:8], "title": f"Solve 1 problem (rating {target_low})", "type": "practice", "completed": False},
            {"id": str(uuid.uuid4())[:8], "title": f"Solve 1 problem (rating {target_high - 100})", "type": "practice", "completed": False},
            {"id": str(uuid.uuid4())[:8], "title": f"Study: {algorithm}", "type": "learning", "completed": False},
        ],
        "afternoon": [
            {"id": str(uuid.uuid4())[:8], "title": f"Implement {algorithm.split(',')[0].strip()} problems (x2)", "type": "practice", "completed": False},
            {"id": str(uuid.uuid4())[:8], "title": "Check solutions vs editorial", "type": "editorial", "completed": False},
        ],
        "evening": [
            {"id": str(uuid.uuid4())[:8], "title": "Upsolve 1 problem from last contest", "type": "upsolve", "completed": False},
            {"id": str(uuid.uuid4())[:8], "title": f"Focus area: {focus}", "type": "learning", "completed": False},
        ],
        "night": [
            {"id": str(uuid.uuid4())[:8], "title": "Update problem notes", "type": "review", "completed": False},
            {"id": str(uuid.uuid4())[:8], "title": "Set tomorrow's target problems", "type": "planning", "completed": False},
        ],
        "motivation": get_motivation(rating),
        "expected_growth": get_expected_growth(rating),
    }


def get_motivation(rating: int) -> str:
    messages = {
        0: "Every expert was once a beginner. Start your journey today! 🚀",
        1200: "You're building a solid foundation. Keep solving! 💪",
        1400: "You're approaching Pupil territory. Focus on greedy and DP! 🎯",
        1600: "Expert is within reach! Consistency beats talent every day. ⚡",
        1900: "Candidate Master level thinking required. Go deeper into algorithms! 🧠",
        2100: "You're among the top competitive programmers. Keep pushing! 🏆",
        2400: "Grandmaster territory. Every problem solved makes you stronger! 🌟",
    }
    for threshold in sorted(messages.keys(), reverse=True):
        if rating >= threshold:
            return messages[threshold]
    return messages[0]


def get_expected_growth(rating: int) -> str:
    if rating == 0:
        return "Reach 800 with consistent practice this week"
    elif rating < 1200:
        return f"+50 to +100 rating possible this month with daily solving"
    elif rating < 1600:
        return f"+30 to +70 rating possible this month"
    elif rating < 2100:
        return f"+20 to +50 rating possible with focused contest participation"
    else:
        return "Maintain and push for next rank with deep algorithmic study"
