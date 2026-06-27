import { NextResponse } from "next/server"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ handle: string }> }
) {
  const { handle } = await params

  try {
    // Fetch user info
    const userRes = await fetch(
      `https://codeforces.com/api/user.info?handles=${handle}`,
      { next: { revalidate: 900 } } // cache 15 min
    )
    const userData = await userRes.json()

    if (userData.status !== "OK") {
      return NextResponse.json(
        { error: "Handle not found" },
        { status: 404 }
      )
    }

    const user = userData.result[0]

    // Fetch rating history
    const ratingRes = await fetch(
      `https://codeforces.com/api/user.rating?handle=${handle}`,
      { next: { revalidate: 1800 } }
    )
    const ratingData = await ratingRes.json()
    const ratingHistory = ratingData.status === "OK" ? ratingData.result : []

    // Fetch recent submissions
    const subsRes = await fetch(
      `https://codeforces.com/api/user.status?handle=${handle}&from=1&count=500`,
      { next: { revalidate: 600 } }
    )
    const subsData = await subsRes.json()
    const submissions = subsData.status === "OK" ? subsData.result : []

    // Compute solved problems & stats
    const solvedSet = new Set<string>()
    const ratingBucket: Record<string, number> = {}
    const tagBucket: Record<string, number> = {}
    const heatmap: Record<string, number> = {}

    for (const sub of submissions) {
      if (sub.verdict === "OK") {
        const problem = sub.problem || {}
        const pid = `${problem.contestId}-${problem.index}`
        if (!solvedSet.has(pid)) {
          solvedSet.add(pid)
          const r = problem.rating || 0
          if (r) {
            const bucket = String(Math.floor(r / 100) * 100)
            ratingBucket[bucket] = (ratingBucket[bucket] || 0) + 1
          }
          for (const tag of problem.tags || []) {
            tagBucket[tag] = (tagBucket[tag] || 0) + 1
          }
        }
        // Heatmap
        const day = new Date(sub.creationTimeSeconds * 1000)
          .toISOString()
          .split("T")[0]
        heatmap[day] = (heatmap[day] || 0) + 1
      }
    }

    // Normalize avatar
    let avatar = user.titlePhoto || user.avatar || ""
    if (avatar.startsWith("//")) avatar = "https:" + avatar

    const result = {
      handle,
      rating: user.rating || 0,
      max_rating: user.maxRating || 0,
      rank: user.rank || "unrated",
      max_rank: user.maxRank || "unrated",
      contribution: user.contribution || 0,
      friend_count: user.friendOfCount || 0,
      avatar_url: avatar,
      country: user.country || null,
      organization: user.organization || null,
      solved_count: solvedSet.size,
      rating_history: ratingHistory,
      submissions: submissions.slice(0, 100),
      problem_stats: {
        by_rating: ratingBucket,
        by_tag: tagBucket,
      },
      heatmap,
      contest_count: ratingHistory.length,
      rating_chart: ratingHistory.map((r: any) => ({
        contest: (r.contestName || "").slice(0, 30),
        rating: r.newRating,
        date: new Date(r.ratingUpdateTimeSeconds * 1000).toLocaleDateString(
          "en-IN",
          { month: "short", year: "numeric" }
        ),
        rank: r.rank,
        change: r.newRating - r.oldRating,
      })),
      ...calculateStreaks(heatmap),
    }

    return NextResponse.json(result)
  } catch (err) {
    console.error("CF API error:", err)
    return NextResponse.json(
      { error: "Failed to fetch Codeforces data" },
      { status: 500 }
    )
  }
}

function calculateStreaks(heatmap: Record<string, number>) {
  const solvedDates = Object.keys(heatmap)
    .filter(d => heatmap[d] > 0)
    .sort();

  if (solvedDates.length === 0) {
    return { current_streak: 0, longest_streak: 0 };
  }

  // Calculate Longest Streak
  let longestStreak = 0;
  let currentRun = 0;
  let prevDate: Date | null = null;

  for (const dateStr of solvedDates) {
    const currentDate = new Date(dateStr);
    if (prevDate === null) {
      currentRun = 1;
    } else {
      const diffTime = Math.abs(currentDate.getTime() - prevDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        currentRun += 1;
      } else if (diffDays > 1) {
        longestStreak = Math.max(longestStreak, currentRun);
        currentRun = 1;
      }
    }
    prevDate = currentDate;
  }
  longestStreak = Math.max(longestStreak, currentRun);

  // Calculate Current Streak
  // Compare in UTC dates (YYYY-MM-DD)
  const todayStr = new Date().toISOString().split("T")[0];
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  let currentStreak = 0;
  if (heatmap[todayStr] && heatmap[todayStr] > 0) {
    currentStreak = 1;
    let checkDate = new Date();
    while (true) {
      checkDate.setDate(checkDate.getDate() - 1);
      const checkStr = checkDate.toISOString().split("T")[0];
      if (heatmap[checkStr] && heatmap[checkStr] > 0) {
        currentStreak += 1;
      } else {
        break;
      }
    }
  } else if (heatmap[yesterdayStr] && heatmap[yesterdayStr] > 0) {
    currentStreak = 1;
    let checkDate = new Date(yesterday);
    while (true) {
      checkDate.setDate(checkDate.getDate() - 1);
      const checkStr = checkDate.toISOString().split("T")[0];
      if (heatmap[checkStr] && heatmap[checkStr] > 0) {
        currentStreak += 1;
      } else {
        break;
      }
    }
  }

  return { 
    current_streak: currentStreak, 
    longest_streak: longestStreak 
  };
}
