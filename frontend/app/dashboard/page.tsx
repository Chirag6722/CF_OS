"use client"

import { useSession } from "next-auth/react"
import { useQuery } from "@tanstack/react-query"
import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import Link from "next/link"
import Sidebar from "@/components/layout/Sidebar"
import GreetingHeader from "@/components/ui/GreetingHeader"
import StatCard from "@/components/ui/StatCard"
import GlassCard from "@/components/ui/GlassCard"
import ContestCard from "@/components/ui/ContestCard"
import {
  Trophy, Zap, Target, TrendingUp, Star, Brain,
  Code2, ExternalLink, AlertCircle, Flame, Award,
} from "lucide-react"
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid,
} from "recharts"

// Dynamic XP calculation helper
export function calculateLevelAndXP(cfData: any) {
  if (!cfData) return { level: 1, currentXP: 0, levelXPNeeded: 100, progress: 0, totalXP: 0, badges: [] }

  const rating = cfData.rating || 0
  const solvedCount = cfData.solved_count || 0
  const contestCount = cfData.contest_count || 0
  const currentStreak = cfData.current_streak || 0
  const maxRating = cfData.max_rating || 0

  // XP Factors
  const ratingXP = Math.floor(rating * 0.5)
  const solvedXP = solvedCount * 12
  const contestXP = contestCount * 80
  const streakXP = currentStreak * 45

  const totalXP = ratingXP + solvedXP + contestXP + streakXP

  // Level Logic
  const level = Math.floor(Math.sqrt(totalXP / 100)) + 1
  const prevLevelXP = ((level - 1) ** 2) * 100
  const nextLevelXP = (level ** 2) * 100
  
  const currentXP = totalXP - prevLevelXP
  const levelXPNeeded = nextLevelXP - prevLevelXP
  const progress = levelXPNeeded > 0 ? (currentXP / levelXPNeeded) * 100 : 0

  // Badges list
  const badges = []

  if (maxRating >= 1900) {
    badges.push({ id: "gm", title: "Grandmaster Ascent", icon: "👑", desc: "Reached max rating >= 1900" })
  } else if (maxRating >= 1600) {
    badges.push({ id: "master", title: "Master Coder", icon: "🧠", desc: "Reached max rating >= 1600" })
  } else if (maxRating >= 1200) {
    badges.push({ id: "expert", title: "Specialist", icon: "⚡", desc: "Reached max rating >= 1200" })
  }

  if (currentStreak >= 5) {
    badges.push({ id: "streak", title: "Streak Master", icon: "🔥", desc: "Solving streak >= 5 days" })
  }
  if (solvedCount >= 50) {
    badges.push({ id: "solved_high", title: "Algorithm Expert", icon: "🎯", desc: "Solved >= 50 problems" })
  } else if (solvedCount >= 10) {
    badges.push({ id: "solved_med", title: "Problem Solver", icon: "📋", desc: "Solved >= 10 problems" })
  }

  if (contestCount >= 5) {
    badges.push({ id: "contests", title: "Contest Veteran", icon: "🏆", desc: "Participated in >= 5 contests" })
  }

  return {
    level,
    currentXP,
    levelXPNeeded,
    progress,
    totalXP,
    badges
  }
}

function XPProgressCard({ cfData }: { cfData: any }) {
  const stats = calculateLevelAndXP(cfData)

  if (!cfData) return null

  return (
    <GlassCard
      title="Level & Achievements"
      titleIcon={<Award size={14} color="white" />}
      delay={0.52}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        {/* Level indicator */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <span style={{ fontSize: "15px", fontWeight: 800, color: "var(--text-primary)" }}>
            Level {stats.level} Coder
          </span>
          <span style={{ fontSize: "11px", fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>
            {stats.totalXP} total XP
          </span>
        </div>

        {/* Progress Bar */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "var(--text-secondary)", marginBottom: "4px" }}>
            <span>Progress to Level {stats.level + 1}</span>
            <span style={{ fontFamily: "var(--font-mono)" }}>
              {stats.currentXP} / {stats.levelXPNeeded} XP
            </span>
          </div>
          <div
            style={{
              width: "100%",
              height: "6px",
              background: "var(--bg-elevated)",
              border: "1px solid var(--border-default)",
              borderRadius: "999px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${stats.progress}%`,
                height: "100%",
                background: "var(--teal-500)",
                borderRadius: "999px",
                transition: "width 0.4s ease",
              }}
            />
          </div>
        </div>

        {/* Badges Earned */}
        {stats.badges.length > 0 ? (
          <div style={{ borderTop: "1px solid var(--border-default)", paddingTop: "12px" }}>
            <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", display: "block", marginBottom: "8px" }}>
              Badges Earned
            </span>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {stats.badges.map((b) => (
                <div
                  key={b.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "4px 8px",
                    borderRadius: "var(--radius-sm)",
                    background: "var(--bg-base)",
                    border: "1px solid var(--border-default)",
                    cursor: "default",
                    fontSize: "11.5px",
                    color: "var(--text-secondary)",
                  }}
                  title={b.desc}
                >
                  <span>{b.icon}</span>
                  <span style={{ fontWeight: 600 }}>{b.title}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ borderTop: "1px solid var(--border-default)", paddingTop: "12px", fontSize: "12px", color: "var(--text-muted)", textAlign: "center" }}>
            Unlock your first badge by solving problems or climbing ratings!
          </div>
        )}
      </div>
    </GlassCard>
  )
}

function AICoachCard({ handle, rating }: { handle: string; rating: number }) {
  const { data: coachData, isLoading, error } = useQuery({
    queryKey: ["cf-coach", handle],
    queryFn: () => fetch(`/api/cf/${handle}/coach`).then((r) => {
      if (!r.ok) throw new Error("Coach API error")
      return r.json()
    }),
    enabled: !!handle,
    staleTime: 10 * 60 * 1000,
  })

  if (isLoading || !handle) {
    return (
      <GlassCard title="AI Coach" titleIcon={<Brain size={14} color="white" />} delay={0.5}>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <div className="skeleton" style={{ height: 50, borderRadius: "var(--radius-md)" }} />
          <div className="skeleton" style={{ height: 80, borderRadius: "var(--radius-md)" }} />
          <div className="skeleton" style={{ height: 60, borderRadius: "var(--radius-md)" }} />
        </div>
      </GlassCard>
    )
  }

  const strengths = coachData?.strengths || []
  const weaknesses = coachData?.weaknesses || []
  const tips = coachData?.tips || []
  const recommendedProblems = coachData?.recommended_problems || []

  return (
    <GlassCard
      title="AI Coach"
      titleIcon={<Brain size={14} color="white" />}
      delay={0.5}
      action={
        <span style={{
          fontSize: "10px", color: "var(--teal-500)",
          background: "var(--bg-elevated)",
          padding: "2px 8px", borderRadius: "999px",
          border: "1px solid var(--border-default)",
          fontFamily: "var(--font-mono)",
        }}>
          {rating > 0 ? `Rating ${rating}` : "unrated"}
        </span>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        {/* Strengths & Weaknesses */}
        {(strengths.length > 0 || weaknesses.length > 0) && (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {strengths.length > 0 && (
              <div style={{
                padding: "10px 12px", borderRadius: "var(--radius-md)",
                background: "rgba(245, 124, 6, 0.03)",
                border: "1px solid var(--border-default)",
              }}>
                <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--teal-500)", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>Strengths</span>
                <ul style={{ margin: 0, paddingLeft: "16px", fontSize: "12px", color: "var(--text-secondary)" }}>
                  {strengths.map((s: string, idx: number) => (
                    <li key={idx} style={{ marginBottom: "2px" }}>{s}</li>
                  ))}
                </ul>
              </div>
            )}
            {weaknesses.length > 0 && (
              <div style={{
                padding: "10px 12px", borderRadius: "var(--radius-md)",
                background: "var(--bg-base)",
                border: "1px solid var(--border-default)",
              }}>
                <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>Weaknesses</span>
                <ul style={{ margin: 0, paddingLeft: "16px", fontSize: "12px", color: "var(--text-secondary)" }}>
                  {weaknesses.map((w: string, idx: number) => (
                    <li key={idx} style={{ marginBottom: "2px" }}>{w}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Actionable Tips */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {tips.map((tip: any, i: number) => (
            <div
              key={i}
              style={{
                display: "flex", gap: "10px", alignItems: "flex-start",
                padding: "10px", borderRadius: "var(--radius-md)",
                background: "var(--bg-elevated)",
                border: "1px solid var(--border-default)",
              }}
            >
              <span style={{ fontSize: "15px", flexShrink: 0 }}>{tip.icon}</span>
              <span style={{ fontSize: "12.5px", color: "var(--text-secondary)", lineHeight: 1.4 }}>{tip.text}</span>
            </div>
          ))}
        </div>

        {/* Recommended Problems */}
        {recommendedProblems.length > 0 && (
          <div style={{ borderTop: "1px solid var(--border-default)", paddingTop: "12px" }}>
            <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", display: "block", marginBottom: "8px" }}>Recommended Tasks</span>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {recommendedProblems.map((prob: any, idx: number) => {
                const parts = (prob.id || "").split("-")
                const contestId = parts[0]
                const index = parts[1] || ""
                const url = `https://codeforces.com/problemset/problem/${contestId}/${index}`
                return (
                  <a key={idx} href={url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                    <div
                      style={{
                        display: "flex", alignItems: "center",
                        padding: "8px 10px", borderRadius: "var(--radius-md)",
                        background: "var(--bg-base)",
                        border: "1px solid var(--border-default)",
                        cursor: "pointer",
                        transition: "border-color 0.15s ease",
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.borderColor = "var(--teal-500)"}
                      onMouseLeave={(e) => e.currentTarget.style.borderColor = "var(--border-default)"}
                    >
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>{prob.name}</span>
                        <span style={{ fontSize: "10px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                          ID: {prob.id} · {prob.tags?.slice(0, 2).join(", ")}
                        </span>
                      </div>
                      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{
                          fontSize: "11px", fontFamily: "var(--font-mono)", fontWeight: 700,
                          color: "var(--teal-500)",
                        }}>
                          {prob.rating}
                        </span>
                        <ExternalLink size={12} style={{ color: "var(--text-disabled)" }} />
                      </div>
                    </div>
                  </a>
                )
              })}
            </div>
          </div>
        )}

        <Link href="/planner" style={{ textDecoration: "none" }}>
          <button className="btn-gradient" style={{ width: "100%", marginTop: "4px", fontSize: "13px" }}>
            View Today's Plan →
          </button>
        </Link>
      </div>
    </GlassCard>
  )
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const [cfHandle, setCfHandle] = useState<string | null>(null)
  const [profileLoaded, setProfileLoaded] = useState(false)

  // Read CF handle from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("cp_os_profile")
    if (saved) {
      try {
        const p = JSON.parse(saved)
        if (p.cf_handle) setCfHandle(p.cf_handle)
      } catch {}
    }
    setProfileLoaded(true)
  }, [])

  // Fetch CF data via Next.js API route (no backend needed)
  const { data: cfData, isLoading: cfLoading, error: cfError } = useQuery({
    queryKey: ["cf-profile", cfHandle],
    queryFn: () => fetch(`/api/cf/${cfHandle}`).then((r) => {
      if (!r.ok) throw new Error("CF API error")
      return r.json()
    }),
    enabled: !!cfHandle,
    staleTime: 15 * 60 * 1000,
    retry: 1,
  })

  // Fetch upcoming contests
  const { data: contestsData } = useQuery({
    queryKey: ["upcoming-contests-dashboard"],
    queryFn: () => fetch("/api/contests?platform=all").then((r) => r.json()),
    staleTime: 5 * 60 * 1000,
  })

  const contests = contestsData?.contests?.slice(0, 3) || []

  if (status === "loading" || !profileLoaded) {
    return (
      <div className="app-layout">
        <Sidebar />
        <main className="main-content" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div>
            <div className="skeleton" style={{ width: 240, height: 28, marginBottom: 14 }} />
            <div className="skeleton" style={{ width: 320, height: 16 }} />
          </div>
        </main>
      </div>
    )
  }

  // No CF handle yet
  if (profileLoaded && !cfHandle) {
    return (
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          <GreetingHeader />
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            style={{
              maxWidth: 480,
              margin: "40px auto",
              textAlign: "center",
              padding: "40px",
              background: "rgba(13,13,26,0.7)",
              border: "1px solid var(--border-default)",
              borderRadius: "var(--radius-xl)",
              backdropFilter: "blur(16px)",
            }}
          >
            <div style={{
              width: 64, height: 64, borderRadius: "50%",
              background: "var(--gradient-primary)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 20px",
              boxShadow: "0 8px 24px rgba(124,58,237,0.3)",
            }}>
              <Code2 size={28} color="white" />
            </div>
            <h2 style={{ fontSize: "22px", fontWeight: 800, marginBottom: 10, color: "var(--text-primary)" }}>
              Connect Codeforces
            </h2>
            <p style={{ color: "var(--text-muted)", fontSize: "14px", marginBottom: 8, lineHeight: 1.7 }}>
              Add your <strong style={{ color: "var(--text-secondary)" }}>Codeforces handle</strong> (your CF username) to unlock your personalized dashboard, live rating, and analytics.
            </p>
            <p style={{ color: "var(--text-disabled)", fontSize: "12px", marginBottom: 24, lineHeight: 1.6 }}>
              Find it at: <span style={{ color: "var(--purple-300)", fontFamily: "var(--font-mono)" }}>codeforces.com/profile/<em>your-handle</em></span>
            </p>
            <Link href="/profile" style={{ textDecoration: "none" }}>
              <button className="btn-gradient" style={{ padding: "12px 28px", fontSize: "14px" }}>
                Set Up Profile →
              </button>
            </Link>
          </motion.div>

          {/* Still show contests even without handle */}
          {contests.length > 0 && (
            <div style={{ marginTop: "32px" }}>
              <GlassCard
                title="Upcoming Contests"
                titleIcon={<Trophy size={14} color="white" />}
                delay={0.3}
                padding="16px"
                action={<Link href="/contests" style={{ textDecoration: "none", fontSize: "12px", color: "var(--purple-300)" }}>View All →</Link>}
              >
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "12px" }}>
                  {contests.map((c: any, i: number) => (
                    <ContestCard key={i} contest={c} delay={0.4 + i * 0.1} />
                  ))}
                </div>
              </GlassCard>
            </div>
          )}
        </main>
      </div>
    )
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <GreetingHeader />

        {/* CF Error banner */}
        {cfError && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              display: "flex", alignItems: "center", gap: "10px",
              padding: "12px 16px", borderRadius: "10px",
              background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)",
              marginBottom: "20px",
            }}
          >
            <AlertCircle size={16} color="var(--red-400)" />
            <span style={{ fontSize: "13px", color: "var(--red-400)" }}>
              Could not fetch data for <strong>@{cfHandle}</strong>. Codeforces API may be busy — try refreshing.
            </span>
            <Link href="/profile" style={{ marginLeft: "auto", fontSize: "12px", color: "var(--purple-300)", textDecoration: "none" }}>
              Change handle →
            </Link>
          </motion.div>
        )}

        {/* Stats Grid */}
        <div className="stats-grid" style={{ marginBottom: "24px" }}>
          {cfLoading ? (
            Array(4).fill(0).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 140, borderRadius: "var(--radius-lg)" }} />
            ))
          ) : (
            <>
              <StatCard
                title="CF Rating"
                value={cfData?.rating || 0}
                subtitle={cfData?.rank || "unrated"}
                icon={<Trophy size={18} />}
                trend={
                  cfData?.rating_history?.length > 1
                    ? {
                        value:
                          (cfData.rating_history[cfData.rating_history.length - 1]?.newRating || 0) -
                          (cfData.rating_history[cfData.rating_history.length - 2]?.newRating || 0),
                        label: "last contest",
                      }
                    : undefined
                }
                color="purple"
                delay={0.1}
                badge={cfData?.rank}
              />
              <StatCard
                title="Max Rating"
                value={cfData?.max_rating || 0}
                subtitle={cfData?.max_rank}
                icon={<Star size={18} />}
                color="orange"
                delay={0.2}
              />
              <StatCard
                title="Problems Solved"
                value={cfData?.solved_count || 0}
                subtitle="unique AC"
                icon={<Target size={18} />}
                color="green"
                delay={0.3}
              />
              <StatCard
                title="Contests"
                value={cfData?.contest_count || 0}
                subtitle="participated"
                icon={<Zap size={18} />}
                color="blue"
                delay={0.4}
              />
              <StatCard
                title="Solving Streak"
                value={cfData?.current_streak || 0}
                subtitle={`max: ${cfData?.longest_streak || 0} days`}
                icon={<Flame size={18} />}
                color="orange"
                delay={0.5}
                badge={cfData?.current_streak > 0 ? "🔥 active" : undefined}
              />
            </>
          )}
        </div>

        {/* Main Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "20px" }}>
          
          {/* Left Column: Analytics & Schedules */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* Rating Chart */}
            <GlassCard
              title="Rating History"
              titleIcon={<TrendingUp size={14} color="white" />}
              delay={0.45}
              action={
                <Link href="/analytics" style={{ textDecoration: "none" }}>
                  <span style={{ fontSize: "12px", color: "var(--teal-500)" }}>Full Analytics →</span>
                </Link>
              }
            >
              {cfLoading ? (
                <div className="skeleton" style={{ height: 200, borderRadius: "10px" }} />
              ) : cfData?.rating_history?.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart
                    data={cfData.rating_history.map((r: any) => ({
                      rating: r.newRating,
                      name: (r.contestName || "").slice(0, 20),
                      change: r.newRating - r.oldRating,
                    }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="name" hide />
                    <YAxis tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        background: "var(--bg-elevated)", border: "1px solid var(--border-default)",
                        borderRadius: "10px", fontSize: "12px", fontFamily: "var(--font-sans)",
                        color: "var(--text-primary)",
                      }}
                      formatter={(v: any, _: any, p: any) => [
                        `${v} (${p.payload.change >= 0 ? "+" : ""}${p.payload.change})`,
                        "Rating",
                      ]}
                    />
                    <Line
                      type="monotone" dataKey="rating"
                      stroke="var(--teal-500)" strokeWidth={1.8}
                      dot={false}
                      activeDot={{ r: 4, fill: "var(--teal-500)", stroke: "var(--text-primary)", strokeWidth: 1.5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="empty-state">
                  <TrendingUp size={32} />
                  <p>No contest history yet.</p>
                  <p style={{ fontSize: "12px" }}>Participate in a CF contest to see your rating graph!</p>
                </div>
              )}
            </GlassCard>

            {/* Upcoming Contests */}
            <GlassCard
              title="Upcoming Contests"
              titleIcon={<Trophy size={14} color="white" />}
              delay={0.5}
              padding="16px"
              action={
                <Link href="/contests" style={{ textDecoration: "none" }}>
                  <span style={{ fontSize: "12px", color: "var(--teal-500)" }}>View All →</span>
                </Link>
              }
            >
              {contests.length === 0 ? (
                <div className="empty-state" style={{ padding: "32px" }}>
                  <Trophy size={28} />
                  <p>No upcoming contests found.</p>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px" }}>
                  {contests.slice(0, 4).map((c: any, i: number) => (
                    <ContestCard key={i} contest={c} delay={0.6 + i * 0.1} />
                  ))}
                </div>
              )}
            </GlassCard>
          </div>

          {/* Right Column: Widgets & Access */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* AI Coach Card */}
            <AICoachCard handle={cfHandle || ""} rating={cfData?.rating || 0} />

            {/* Level & XP Achievements */}
            <XPProgressCard cfData={cfData} />

            {/* Quick Access */}
            <GlassCard
              title="Quick Access"
              titleIcon={<Zap size={14} color="white" />}
              delay={0.55}
              padding="16px"
            >
              {[
                { label: "My CF Profile", url: `https://codeforces.com/profile/${cfHandle}`, icon: "🔵", desc: `@${cfHandle}` },
                { label: "CF Problemset", url: "https://codeforces.com/problemset", icon: "📋", desc: "Practice problems" },
                { label: "CF Gym", url: "https://codeforces.com/gym", icon: "🏋️", desc: "Archived contests" },
                { label: "A2OJ Ladders", url: "https://a2oj.netlify.app/", icon: "🪜", desc: "Rating-based ladders" },
              ].map((link, i) => (
                <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                  <motion.div
                    whileHover={{ x: 3 }}
                    style={{
                      display: "flex", alignItems: "center", gap: "10px",
                      padding: "9px 10px", borderRadius: "10px",
                      border: "1px solid transparent",
                      marginBottom: "4px", cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <span style={{ fontSize: "18px" }}>{link.icon}</span>
                    <div>
                      <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>{link.label}</div>
                      <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{link.desc}</div>
                    </div>
                    <ExternalLink size={12} style={{ marginLeft: "auto", color: "var(--text-disabled)" }} />
                  </motion.div>
                </a>
              ))}
            </GlassCard>
          </div>

        </div>
      </main>
    </div>
  )
}
