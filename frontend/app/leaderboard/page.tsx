"use client"

import { useState, useEffect } from "react"
import { useQueries, useQuery } from "@tanstack/react-query"
import { motion } from "framer-motion"
import Link from "next/link"
import Sidebar from "@/components/layout/Sidebar"
import GreetingHeader from "@/components/ui/GreetingHeader"
import GlassCard from "@/components/ui/GlassCard"
import {
  Users, UserPlus, Trash2, Award, Zap, Target,
  TrendingUp, Star, Flame, ExternalLink, ChevronRight, AlertCircle
} from "lucide-react"
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend
} from "recharts"

// Default friends handles for an engaging experience out of the box
const DEFAULT_FRIENDS = ["tourist", "Benq", "Radewoosh"]

export default function LeaderboardPage() {
  const [userHandle, setUserHandle] = useState<string | null>(null)
  const [activeGroup, setActiveGroup] = useState("Friends List")
  const [groups, setGroups] = useState<Record<string, string[]>>({
    "Friends List": DEFAULT_FRIENDS
  })
  const [newGroupName, setNewGroupName] = useState("")
  const [newFriendHandle, setNewFriendHandle] = useState("")
  const [profileLoaded, setProfileLoaded] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)

  // 1. Load user profile and custom groups
  useEffect(() => {
    // User profile
    const savedProfile = localStorage.getItem("cp_os_profile")
    if (savedProfile) {
      try {
        const p = JSON.parse(savedProfile)
        if (p.cf_handle) setUserHandle(p.cf_handle)
      } catch {}
    }

    // Groups
    const savedGroups = localStorage.getItem("cp_os_groups")
    if (savedGroups) {
      try {
        const parsed = JSON.parse(savedGroups)
        setGroups(parsed)
        const keys = Object.keys(parsed)
        if (keys.length > 0) setActiveGroup(keys[0])
      } catch {
        setGroups({ "Friends List": DEFAULT_FRIENDS })
      }
    } else {
      const initialGroups = {
        "Friends List": DEFAULT_FRIENDS,
        "DSATM Batch": ["Benq", "Radewoosh"]
      }
      setGroups(initialGroups)
      localStorage.setItem("cp_os_groups", JSON.stringify(initialGroups))
    }
    setProfileLoaded(true)
  }, [])

  const currentGroupMembers = groups[activeGroup] || []

  // Combine user handle and active group members
  const allHandles = Array.from(
    new Set([
      ...(userHandle ? [userHandle] : []),
      ...currentGroupMembers
    ])
  )

  // 2. Fetch profile data for all handles in parallel
  const queries = useQueries({
    queries: allHandles.map((handle) => ({
      queryKey: ["cf-profile", handle],
      queryFn: () =>
        fetch(`/api/cf/${handle}`).then((r) => {
          if (!r.ok) throw new Error(`Failed to fetch @${handle}`)
          return r.json()
        }),
      staleTime: 10 * 60 * 1000, // cache 10 mins
      retry: 1,
    }))
  })

  // Check if any query is loading
  const isLoading = queries.some((q) => q.isLoading)

  // Map successfully fetched profiles
  const profilesData = queries
    .map((q) => q.data)
    .filter(Boolean) as any[]

  // Calculate solved counts in the last 7 days from recent submissions
  const getWeeklySolvedCount = (submissions: any[]) => {
    if (!submissions || !Array.isArray(submissions)) return 0
    const oneWeekAgoSecs = Date.now() / 1000 - 7 * 24 * 60 * 60
    const solvedSet = new Set()
    
    for (const sub of submissions) {
      if (sub.verdict === "OK" && sub.creationTimeSeconds >= oneWeekAgoSecs) {
        const problem = sub.problem || {}
        solvedSet.add(`${problem.contestId}-${problem.index}`)
      }
    }
    return solvedSet.size
  }

  // Build Leaderboard List
  const leaderboardList = profilesData.map((p) => {
    const isMe = p.handle.toLowerCase() === userHandle?.toLowerCase()
    const weeklySolved = getWeeklySolvedCount(p.submissions || [])
    return {
      handle: p.handle,
      rating: p.rating || 0,
      maxRating: p.max_rating || 0,
      rank: p.rank || "unrated",
      avatar: p.avatar_url,
      solvedCount: p.solved_count || 0,
      weeklySolved,
      currentStreak: p.current_streak || 0,
      longestStreak: p.longest_streak || 0,
      isMe
    }
  }).sort((a, b) => b.rating - a.rating) // Sort by CF Rating descending

  // 3. Add Friend to Current Active Group
  const handleAddFriend = async (e: React.FormEvent) => {
    e.preventDefault()
    setAddError(null)
    const handleClean = newFriendHandle.trim()
    if (!handleClean) return

    if (handleClean.toLowerCase() === userHandle?.toLowerCase()) {
      setAddError("You are already on the leaderboard!")
      return
    }

    const currentMembers = groups[activeGroup] || []
    if (currentMembers.some((f) => f.toLowerCase() === handleClean.toLowerCase())) {
      setAddError("Coder already in this group!")
      return
    }

    try {
      const res = await fetch(`/api/cf/${handleClean}`)
      if (!res.ok) {
        setAddError("Invalid Codeforces handle!")
        return
      }
      
      const updatedMembers = [...currentMembers, handleClean]
      const updatedGroups = { ...groups, [activeGroup]: updatedMembers }
      setGroups(updatedGroups)
      localStorage.setItem("cp_os_groups", JSON.stringify(updatedGroups))
      setNewFriendHandle("")
    } catch {
      setAddError("Verification failed. Try again.")
    }
  }

  // 4. Remove Friend from Current Active Group
  const handleRemoveFriend = (handle: string) => {
    const currentMembers = groups[activeGroup] || []
    const updatedMembers = currentMembers.filter((f) => f.toLowerCase() !== handle.toLowerCase())
    const updatedGroups = { ...groups, [activeGroup]: updatedMembers }
    setGroups(updatedGroups)
    localStorage.setItem("cp_os_groups", JSON.stringify(updatedGroups))
  }

  // 4b. Create a New Custom Group
  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault()
    const nameClean = newGroupName.trim()
    if (!nameClean) return
    if (groups[nameClean]) {
      setAddError("Group name already exists!")
      return
    }
    const updatedGroups = { ...groups, [nameClean]: [] }
    setGroups(updatedGroups)
    localStorage.setItem("cp_os_groups", JSON.stringify(updatedGroups))
    setActiveGroup(nameClean)
    setNewGroupName("")
  }

  // 4c. Delete Active Group
  const handleDeleteGroup = (groupName: string) => {
    const keys = Object.keys(groups)
    if (keys.length <= 1) return // Keep at least one group
    const { [groupName]: _, ...remainingGroups } = groups
    setGroups(remainingGroups)
    localStorage.setItem("cp_os_groups", JSON.stringify(remainingGroups))
    setActiveGroup(Object.keys(remainingGroups)[0])
  }

  // 5. Build Group Rating Chart Data
  // We align rating histories chronologically
  const buildChartData = () => {
    // Generate a mapping of contest index -> rating for each handle
    // For simplicity, we compare up to the last 15 contests chronologically
    const maxContests = 12
    const tempData: Record<number, Record<string, number>> = {}
    
    profilesData.forEach((p) => {
      const history = p.rating_history || []
      const start = Math.max(0, history.length - maxContests)
      const sliced = history.slice(start)
      
      sliced.forEach((contest: any, idx: number) => {
        if (!tempData[idx]) {
          tempData[idx] = { name: `Contest ${idx + 1}` } as any
        }
        tempData[idx][p.handle] = contest.newRating
      })
    })

    return Object.values(tempData)
  }

  const chartData = buildChartData()

  // Dynamic ranking color generator
  const getRankColor = (rank: string) => {
    const r = rank.toLowerCase()
    if (r.includes("legendary") || r.includes("grandmaster")) return "var(--red-400)"
    if (r.includes("master")) return "var(--teal-500)"
    if (r.includes("expert") || r.includes("candidate")) return "var(--blue-400)"
    if (r.includes("specialist")) return "#10b981"
    if (r.includes("pupil")) return "#10b981"
    return "var(--text-secondary)"
  }

  // Render Skeleton while loading
  const renderLoadingSkeleton = () => (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <GreetingHeader />
        <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
          <div className="skeleton" style={{ width: 140, height: 28 }} />
          <div className="skeleton" style={{ width: 220, height: 16 }} />
        </div>
        <div className="skeleton" style={{ height: 350, borderRadius: "10px", marginBottom: "20px" }} />
        <div className="skeleton" style={{ height: 200, borderRadius: "10px" }} />
      </main>
    </div>
  )

  if (!profileLoaded || isLoading) {
    return renderLoadingSkeleton()
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <GreetingHeader />

        <div style={{ display: "flex", alignItems: "center", justifyItems: "center", justifyContent: "space-between", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "8px" }}>
              <Users size={22} style={{ color: "var(--teal-500)" }} /> Friends Arena
            </h1>
            <p style={{ fontSize: "13.5px", color: "var(--text-muted)", marginTop: "4px" }}>
              Compete with friends, compare live rating history, and track weekly solving streaks.
            </p>
          </div>

          {/* Add Friend Form */}
          <form onSubmit={handleAddFriend} style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <div style={{ position: "relative" }}>
              <input
                type="text"
                className="input-glass"
                placeholder={`Add to ${activeGroup}...`}
                value={newFriendHandle}
                onChange={(e) => setNewFriendHandle(e.target.value)}
                style={{ width: "180px", fontSize: "13px", padding: "6px 12px" }}
              />
              {addError && (
                <div style={{ position: "absolute", top: "100%", right: 0, color: "var(--red-400)", fontSize: "10.5px", marginTop: "2px", whiteSpace: "nowrap" }}>
                  {addError}
                </div>
              )}
            </div>
            <button className="btn-gradient" type="submit" style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", padding: "7px 14px" }}>
              <UserPlus size={14} /> Add
            </button>
          </form>
        </div>

        {/* Custom Group Manager Controls */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 16px",
            background: "var(--bg-elevated)",
            border: "1px solid var(--border-default)",
            borderRadius: "var(--radius-lg)",
            marginBottom: "20px",
            gap: "16px",
            flexWrap: "wrap"
          }}
        >
          {/* Dropdown Selector */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)" }}>Arena Group:</span>
            <select
              value={activeGroup}
              onChange={(e) => {
                setActiveGroup(e.target.value)
                setAddError(null)
              }}
              style={{
                background: "var(--bg-base)",
                color: "var(--text-primary)",
                border: "1px solid var(--border-default)",
                padding: "6px 12px",
                borderRadius: "var(--radius-md)",
                fontSize: "13px",
                fontWeight: 600,
                outline: "none",
                cursor: "pointer"
              }}
            >
              {Object.keys(groups).map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>

            {Object.keys(groups).length > 1 && (
              <button
                type="button"
                onClick={() => handleDeleteGroup(activeGroup)}
                style={{
                  background: "none", border: "none", color: "var(--text-muted)",
                  fontSize: "12px", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px"
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = "var(--red-400)"}
                onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-muted)"}
              >
                Delete Group
              </button>
            )}
          </div>

          {/* Create Group Form */}
          <form onSubmit={handleCreateGroup} style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <input
              type="text"
              placeholder="New group name..."
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              className="input-glass"
              style={{ width: "160px", fontSize: "12.5px", padding: "5px 10px" }}
            />
            <button
              type="submit"
              className="btn-ghost"
              style={{ fontSize: "12.5px", padding: "6px 12px" }}
            >
              Create Group
            </button>
          </form>
        </div>

        {/* ── Friends Leaderboard Table ── */}
        <div style={{ marginBottom: "24px" }}>
          <GlassCard title="Leaderboard" titleIcon={<Award size={14} color="white" />} padding="0">
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13.5px" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border-default)", background: "var(--bg-elevated)", color: "var(--text-muted)" }}>
                    <th style={{ padding: "12px 16px", fontWeight: 600 }}>Rank</th>
                    <th style={{ padding: "12px 16px", fontWeight: 600 }}>Coder</th>
                    <th style={{ padding: "12px 16px", fontWeight: 600 }}>CF Rating</th>
                    <th style={{ padding: "12px 16px", fontWeight: 600 }}>Solved (Total)</th>
                    <th style={{ padding: "12px 16px", fontWeight: 600 }}>Solved (7 Days)</th>
                    <th style={{ padding: "12px 16px", fontWeight: 600 }}>Streak</th>
                    <th style={{ padding: "12px 16px", fontWeight: 600 }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboardList.map((row, idx) => (
                    <tr
                      key={row.handle}
                      style={{
                        borderBottom: "1px solid var(--border-subtle)",
                        background: row.isMe ? "rgba(245, 124, 6, 0.02)" : "transparent",
                        transition: "background 0.15s ease",
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg-elevated)"}
                      onMouseLeave={(e) => e.currentTarget.style.background = row.isMe ? "rgba(245, 124, 6, 0.02)" : "transparent"}
                    >
                      {/* Rank Index */}
                      <td style={{ padding: "14px 16px", fontFamily: "var(--font-mono)", fontWeight: 700 }}>
                        {idx + 1 === 1 ? "🏆" : `#${idx + 1}`}
                      </td>
                      
                      {/* User Info */}
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <img
                            src={row.avatar || "https://codeforces.org/s/0/images/no-avatar.jpg"}
                            alt={row.handle}
                            style={{ width: "24px", height: "24px", borderRadius: "50%", border: "1px solid var(--border-default)" }}
                          />
                          <a
                            href={`https://codeforces.com/profile/${row.handle}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              fontWeight: 600,
                              color: row.isMe ? "var(--teal-500)" : "var(--text-primary)",
                              textDecoration: "none",
                              display: "flex",
                              alignItems: "center",
                              gap: "4px"
                            }}
                          >
                            {row.handle} {row.isMe && <span style={{ fontSize: "9px", color: "var(--teal-500)", background: "rgba(245,124,6,0.08)", padding: "1px 5px", borderRadius: "3px" }}>me</span>}
                          </a>
                        </div>
                      </td>
                      
                      {/* Rating Details */}
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ display: "flex", flexDirection: "column" }}>
                          <span style={{ fontWeight: 700, color: getRankColor(row.rank), fontFamily: "var(--font-mono)" }}>
                            {row.rating}
                          </span>
                          <span style={{ fontSize: "10.5px", color: "var(--text-muted)" }}>{row.rank}</span>
                        </div>
                      </td>

                      {/* Solved Problems */}
                      <td style={{ padding: "14px 16px", fontFamily: "var(--font-mono)" }}>{row.solvedCount}</td>

                      {/* Weekly Solved Problems */}
                      <td style={{ padding: "14px 16px", fontFamily: "var(--font-mono)", fontWeight: 700, color: row.weeklySolved > 0 ? "var(--teal-500)" : "var(--text-muted)" }}>
                        {row.weeklySolved > 0 ? `+${row.weeklySolved}` : "0"}
                      </td>

                      {/* Streaks */}
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", fontFamily: "var(--font-mono)" }}>
                          <Flame size={14} style={{ color: row.currentStreak > 0 ? "var(--teal-500)" : "var(--text-disabled)" }} />
                          <span style={{ fontWeight: row.currentStreak > 0 ? 700 : 500 }}>{row.currentStreak}d</span>
                          <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>({row.longestStreak}m)</span>
                        </div>
                      </td>

                      {/* Remove Option */}
                      <td style={{ padding: "14px 16px" }}>
                        {row.isMe ? (
                          <span style={{ fontSize: "11px", color: "var(--text-disabled)" }}>N/A</span>
                        ) : (
                          <button
                            onClick={() => handleRemoveFriend(row.handle)}
                            style={{
                              background: "none", border: "none", color: "var(--text-muted)",
                              cursor: "pointer", transition: "color 0.15s ease", padding: "4px"
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.color = "var(--red-400)"}
                            onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-muted)"}
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>

        {/* ── Rating Comparison deck ── */}
        {chartData.length > 0 && (
          <div>
            <GlassCard title="Rating History Comparison" titleIcon={<TrendingUp size={14} color="white" />}>
              <div style={{ width: "100%", height: 320, paddingRight: "10px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis tick={{ fill: "var(--text-muted)", fontSize: 10 }} hide />
                    <YAxis tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} domain={["dataMin - 100", "dataMax + 100"]} />
                    <Tooltip
                      contentStyle={{
                        background: "var(--bg-elevated)", border: "1px solid var(--border-default)",
                        borderRadius: "8px", fontSize: "12px", fontFamily: "var(--font-sans)",
                        color: "var(--text-primary)"
                      }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
                    {allHandles.map((handle, idx) => {
                      const isMe = handle.toLowerCase() === userHandle?.toLowerCase()
                      
                      // Predefined aesthetic color lines
                      const colors = ["#f57c06", "#3b82f6", "#10b981", "#ef4444", "#a855f7", "#06b6d4"]
                      const strokeColor = isMe ? "var(--teal-500)" : colors[idx % colors.length]
                      
                      return (
                        <Line
                          key={handle}
                          type="monotone"
                          dataKey={handle}
                          stroke={strokeColor}
                          strokeWidth={isMe ? 2.2 : 1.5}
                          dot={false}
                          activeDot={{ r: 4 }}
                        />
                      )
                    })}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>
          </div>
        )}
      </main>
    </div>
  )
}
