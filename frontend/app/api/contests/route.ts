import { NextResponse } from "next/server"

async function fetchCFContests() {
  try {
    const res = await fetch("https://codeforces.com/api/contest.list?gym=false", {
      next: { revalidate: 300 },
    })
    const data = await res.json()
    if (data.status !== "OK") return []

    return data.result
      .filter((c: any) => c.phase === "BEFORE" || c.phase === "CODING")
      .slice(0, 15)
      .map((c: any) => ({
        platform: "codeforces",
        contest_id: String(c.id),
        name: c.name,
        start_time: new Date(c.startTimeSeconds * 1000).toISOString(),
        duration_secs: c.durationSeconds,
        url: `https://codeforces.com/contest/${c.id}`,
        phase: c.phase,
      }))
  } catch {
    return []
  }
}

async function fetchLCContests() {
  try {
    const res = await fetch("https://leetcode.com/contest/api/list/", {
      next: { revalidate: 300 },
    })
    const data = await res.json()
    const now = Date.now() / 1000
    return (data.contests || [])
      .filter((c: any) => c.startTime > now)
      .slice(0, 5)
      .map((c: any) => ({
        platform: "leetcode",
        contest_id: c.titleSlug,
        name: c.title,
        start_time: new Date(c.startTime * 1000).toISOString(),
        duration_secs: c.duration,
        url: `https://leetcode.com/contest/${c.titleSlug}`,
        phase: "BEFORE",
      }))
  } catch {
    return []
  }
}

async function fetchACContests() {
  try {
    const res = await fetch("https://kenkoooo.com/atcoder/resources/contests.json", {
      next: { revalidate: 300 },
    })
    const data = await res.json()
    const now = Date.now() / 1000
    return data
      .filter((c: any) => c.start_epoch_second > now)
      .sort((a: any, b: any) => a.start_epoch_second - b.start_epoch_second)
      .slice(0, 5)
      .map((c: any) => ({
        platform: "atcoder",
        contest_id: c.id,
        name: c.title,
        start_time: new Date(c.start_epoch_second * 1000).toISOString(),
        duration_secs: c.duration_second,
        url: `https://atcoder.jp/contests/${c.id}`,
        phase: "BEFORE",
      }))
  } catch {
    return []
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const platform = searchParams.get("platform") || "all"

  const results: any[] = []

  if (platform === "all" || platform === "codeforces") {
    results.push(...(await fetchCFContests()))
  }
  if (platform === "all" || platform === "leetcode") {
    results.push(...(await fetchLCContests()))
  }
  if (platform === "all" || platform === "atcoder") {
    results.push(...(await fetchACContests()))
  }

  results.sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())

  return NextResponse.json({ contests: results, count: results.length })
}
