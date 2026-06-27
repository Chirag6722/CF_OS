import { NextResponse } from "next/server"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ handle: string }> }
) {
  const { handle } = await params

  const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"

  try {
    // 1. Try to fetch from FastAPI backend first
    const backendRes = await fetch(
      `${apiBase}/api/codeforces/${handle}/coach`,
      { next: { revalidate: 600 } } // Cache 10 min
    )
    if (backendRes.ok) {
      const data = await backendRes.json()
      return NextResponse.json(data)
    }
  } catch (err) {
    console.log("[INFO] Backend offline, using local JS coach template.")
  }

  // 2. Local fallback if backend is down or fails
  try {
    const userRes = await fetch(
      `https://codeforces.com/api/user.info?handles=${handle}`
    )
    const userData = await userRes.json()
    
    let rating = 0
    if (userData.status === "OK") {
      rating = userData.result[0].rating || 0
    }

    const fallbackAdvice = getLocalFallback(handle, rating)
    return NextResponse.json(fallbackAdvice)
  } catch (err) {
    return NextResponse.json(getLocalFallback(handle, 0))
  }
}

function getLocalFallback(handle: string, rating: number) {
  if (rating === 0) {
    return {
      strengths: ["Profile tracking active"],
      weaknesses: ["No contest baseline yet"],
      tips: [
        { icon: "🎯", text: "Start practicing on Codeforces Div. 3/4 A and B problems rated 800." },
        { icon: "📚", text: "Master basic loop controls, array storage, and string transformations." },
        { icon: "🔁", text: "Solve at least one problem daily to build standard coding habits." }
      ],
      recommended_problems: [
        { id: "4-A", name: "Watermelon", rating: 800, tags: ["brute force"] },
        { id: "71-A", name: "Way Too Long Words", rating: 800, tags: ["strings"] }
      ]
    }
  } else if (rating < 1200) {
    return {
      strengths: ["Baseline established", "Regular code submissions active"],
      weaknesses: ["Boundary checks", "Time-limit constraints on large inputs"],
      tips: [
        { icon: "🎯", text: "Master basic vector usage, sorting routines, and dynamic maps." },
        { icon: "📚", text: "Read problem statements carefully for corner cases (e.g. n=1, negative numbers)." },
        { icon: "🔁", text: "Do not spend >40 mins stuck; consult the editorial and code it yourself." }
      ],
      recommended_problems: [
        { id: "158-A", name: "Next Round", rating: 800, tags: ["implementation"] },
        { id: "282-A", name: "Bit++", rating: 800, tags: ["implementation"] }
      ]
    }
  } else if (rating < 1600) {
    return {
      strengths: ["Strong syntax competency", "Fast implementation speeds"],
      weaknesses: ["Dynamic Programming state parameters", "Greedy proof verification"],
      tips: [
        { icon: "🎯", text: "Focus on binary search on answer and greedy sorting routines." },
        { icon: "📚", text: "Learn simple DFS/BFS traversals on grids and adjacency list trees." },
        { icon: "🔁", text: "Solve 10+ problems rated rating+100 every week to build intuition." }
      ],
      recommended_problems: [
        { id: "1360-C", name: "Similar Pairs", rating: 1000, tags: ["greedy", "graphs"] },
        { id: "1899-C", name: "Yarik and Array", rating: 1100, tags: ["greedy", "math"] }
      ]
    }
  } else {
    return {
      strengths: ["Mastered basic data structures", "High rating range established"],
      weaknesses: ["Complex range queries (Segment Trees)", "Advanced Dynamic Programming optimizations"],
      tips: [
        { icon: "🎯", text: "Master Range Query structures (Segment Trees, Fenwick Trees, Sparse Tables)." },
        { icon: "📚", text: "Practice dynamic programming state reductions (bitmask, digit DP)." },
        { icon: "🔁", text: "Upsolve Div. 2 D and E tasks within 24 hours of contest completion." }
      ],
      recommended_problems: [
        { id: "1899-E", name: "Queue Sort", rating: 1400, tags: ["greedy", "sortings"] },
        { id: "1915-F", name: "Greetings", rating: 1500, tags: ["data structures", "divide and conquer"] }
      ]
    }
  }
}
