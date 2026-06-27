import httpx
import json
from typing import Optional, Dict, Any, List
from app.core.config import get_settings
from app.services.cf_service import get_cf_service

settings = get_settings()

GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent"


class AICoachService:
    def __init__(self):
        self.cf_service = get_cf_service()

    async def get_coach_guidance(self, handle: str) -> Dict[str, Any]:
        """Fetch Codeforces user telemetry and return personalized coaching advice."""
        try:
            cf_profile = await self.cf_service.get_full_profile(handle)
        except Exception as e:
            return self._get_fallback_guidance(handle, None)

        # If API key is present, attempt live Gemini generation
        if settings.gemini_api_key:
            try:
                return await self._get_gemini_guidance(handle, cf_profile)
            except Exception as e:
                print(f"[WARNING] Gemini API call failed: {e}. Falling back to templates.")
                return self._get_fallback_guidance(handle, cf_profile)
        
        # Otherwise, use high-fidelity template logic
        return self._get_fallback_guidance(handle, cf_profile)

    async def _get_gemini_guidance(self, handle: str, profile: Dict[str, Any]) -> Dict[str, Any]:
        """Generate guidance using the Gemini LLM API."""
        rating = profile.get("rating", 0)
        rank = profile.get("rank", "unrated")
        solved_count = profile.get("solved_count", 0)
        problem_stats = profile.get("problem_stats", {})
        
        # Summarize submissions for context (look for recent failed tags)
        failed_tags = []
        recent_subs = profile.get("submissions", [])
        for sub in recent_subs[:30]:
            if sub.get("verdict") not in ("OK", "TESTING"):
                prob = sub.get("problem", {})
                for tag in prob.get("tags", []):
                    failed_tags.append(tag)
        
        failed_tags_summary = ", ".join(list(set(failed_tags))[:5]) if failed_tags else "None"
        solved_tags_summary = ", ".join(list(problem_stats.get("by_tag", {}).keys())[:6])

        prompt = f"""
        You are an elite Competitive Programming Coach. Analyze the following profile details of a Codeforces user:
        - Handle: {handle}
        - Current Rating: {rating}
        - Rank: {rank}
        - Total Unique Solved Problems: {solved_count}
        - Strong Topics: {solved_tags_summary}
        - Recent Failed Submission Topics: {failed_tags_summary}

        Provide a structured coaching response in JSON format. Do not write any preamble or markdown formatting. The JSON must exactly match this structure:
        {{
          "strengths": ["Strength 1 based on solved counts", "Strength 2"],
          "weaknesses": ["Weakness 1 based on failed topics/rating", "Weakness 2"],
          "tips": [
            {{"icon": "🎯", "text": "Specific topic recommendation based on rating range."}},
            {{"icon": "📚", "text": "Practice methodology tip."}},
            {{"icon": "🔁", "text": "Daily routine or upsolving recommendation."}}
          ],
          "recommended_problems": [
            {{"id": "problem_contest_id-index e.g. 1900-A", "name": "Problem Name", "rating": 1200, "tags": ["greedy", "math"]}}
          ]
        }}
        Provide 1-2 realistic strengths, 1-2 weaknesses, exactly 3 helpful tips, and 2 recommended problems matching their current rating range of {rating} to {rating + 200}.
        """

        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(
                f"{GEMINI_URL}?key={settings.gemini_api_key}",
                json={
                    "contents": [{
                        "parts": [{"text": prompt}]
                    }]
                }
            )
            resp.raise_for_status()
            data = resp.json()
            
            # Parse text out of response candidates
            candidates = data.get("candidates", [])
            if not candidates:
                raise ValueError("No generation candidates returned from Gemini.")
            
            raw_text = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "")
            
            # Clean text if wrapped in markdown code blocks
            raw_text = raw_text.strip()
            if raw_text.startswith("```json"):
                raw_text = raw_text[7:]
            if raw_text.startswith("```"):
                raw_text = raw_text[3:]
            if raw_text.endswith("```"):
                raw_text = raw_text[:-3]
            raw_text = raw_text.strip()
            
            parsed = json.loads(raw_text)
            return parsed

    def _get_fallback_guidance(self, handle: str, profile: Optional[Dict[str, Any]]) -> Dict[str, Any]:
        """Generate high-fidelity template coaching response if Gemini key is missing or offline."""
        if not profile:
            return {
                "strengths": ["Initialized profile tracking"],
                "weaknesses": ["Telemetry profile not fully loaded"],
                "tips": [
                    {"icon": "🎯", "text": "Set up your Codeforces handle in your Profile settings."},
                    {"icon": "📚", "text": "Practice solving 800-rated problems first to build your baseline."},
                    {"icon": "🔁", "text": "Always click upsolve on failed tasks to learn from mistakes."}
                ],
                "recommended_problems": []
            }

        rating = profile.get("rating", 0)
        solved_count = profile.get("solved_count", 0)

        # Dynamic details based on user rating range
        if rating == 0:
            streaks_msg = "Connected profile successfully"
            strengths = [streaks_msg, "Active portfolio monitoring"]
            weaknesses = ["No contest history loaded", "Practice baseline unestablished"]
            tips = [
                {"icon": "🎯", "text": "Solve 800-1000 rated Div. 3/4 A and B problems first."},
                {"icon": "📚", "text": "Spend time on standard implementation and math-based tags."},
                {"icon": "🔁", "text": "Upsolve at least one problem daily to establish consistency."}
            ]
            recommended = [
                {"id": "4-A", "name": "Watermelon", "rating": 800, "tags": ["brute force"]},
                {"id": "71-A", "name": "Way Too Long Words", "rating": 800, "tags": ["strings"]}
            ]
        elif rating < 1200:
            strengths = [f"Solved {solved_count} problems", "Consistent participation"]
            weaknesses = ["Implementation speed", "Brute-force logic logic corner-cases"]
            tips = [
                {"icon": "🎯", "text": "Focus on A and B tasks in Div. 3 and Div. 4 contests."},
                {"icon": "📚", "text": "Master basic data structures: vectors, arrays, maps, and sets."},
                {"icon": "🔁", "text": "Do not skip upsolving: review editorial logic if stuck > 30 mins."}
            ]
            recommended = [
                {"id": "158-A", "name": "Next Round", "rating": 800, "tags": ["implementation"]},
                {"id": "231-A", "name": "Team", "rating": 800, "tags": ["greedy"]}
            ]
        elif rating < 1600:
            strengths = ["Strong implementation skills", "Good contest participation rate"]
            weaknesses = ["Greedy strategy proof verification", "Basic dynamic programming concepts"]
            tips = [
                {"icon": "🎯", "text": "Practice C problems in Div. 2 and master binary search on answer."},
                {"icon": "📚", "text": "Study DFS/BFS graph traversals and simple prefix-sum techniques."},
                {"icon": "🔁", "text": "Solve 10-15 problems rated rating+100 every week to stretch capacity."}
            ]
            recommended = [
                {"id": "1360-C", "name": "Similar Pairs", "rating": 1000, "tags": ["greedy", "graphs"]},
                {"id": "1899-C", "name": "Yarik and Array", "rating": 1100, "tags": ["greedy", "math"]}
            ]
        else:
            strengths = ["Mastered basic data structures", "Strong logic capability"]
            weaknesses = ["Advanced dynamic programming", "Segment trees or advanced graphs"]
            tips = [
                {"icon": "🎯", "text": "Focus on Div. 2 D and E problems to break into Candidate Master."},
                {"icon": "📚", "text": "Deep dive into dynamic programming state optimization and digit DP."},
                {"icon": "🔁", "text": "Participate in virtual contests weekly to practice pacing."}
            ]
            recommended = [
                {"id": "1899-E", "name": "Queue Sort", "rating": 1400, "tags": ["greedy", "sortings"]},
                {"id": "1915-F", "name": "Greetings", "rating": 1500, "tags": ["data structures", "divide and conquer"]}
            ]

        return {
            "strengths": strengths,
            "weaknesses": weaknesses,
            "tips": tips,
            "recommended_problems": recommended
        }


# Singleton
_ai_coach_service: Optional[AICoachService] = None


def get_ai_coach_service() -> AICoachService:
    global _ai_coach_service
    if _ai_coach_service is None:
        _ai_coach_service = AICoachService()
    return _ai_coach_service
