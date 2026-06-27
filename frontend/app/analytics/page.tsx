"use client"

import { useQuery } from "@tanstack/react-query"
import { useSession } from "next-auth/react"
import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import Sidebar from "@/components/layout/Sidebar"
import GlassCard from "@/components/ui/GlassCard"
import StatCard from "@/components/ui/StatCard"
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, BarChart, Bar, Cell, PieChart, Pie, Legend,
  Area, AreaChart, RadarChart, Radar, PolarGrid, PolarAngleAxis
} from "recharts"
import {
  BarChart3, TrendingUp, Target, Zap, Calendar, Star
} from "lucide-react"

const API = "/api"

// GitHub-style heatmap
function Heatmap({ data }: { data: Record<string, number> }) {
  const today = new Date()
  const weeks: { date: Date; count: number }[][] = []
  let current: { date: Date; count: number }[] = []

  for (let i = 364; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const key = d.toISOString().split("T")[0]
    const count = data[key] || 0

    if (d.getDay() === 0 && current.length > 0) {
      weeks.push(current)
      current = []
    }
    current.push({ date: d, count })
  }
  if (current.length > 0) weeks.push(current)

  const getColor = (count: number) => {
    if (count === 0) return "rgba(124,58,237,0.06)"
    if (count === 1) return "rgba(124,58,237,0.25)"
    if (count === 2) return "rgba(124,58,237,0.45)"
    if (count <= 4) return "rgba(124,58,237,0.65)"
    return "rgba(124,58,237,0.9)"
  }

  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]

  return (
    <div style={{ overflowX: "auto", paddingBottom: "8px" }}>
      <div style={{ display: "flex", gap: "2px", minWidth: "fit-content" }}>
        {weeks.map((week, wi) => (
          <div key={wi} style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            {week.map(({ date, count }, di) => (
              <div
                key={di}
                className="tooltip"
                data-tip={`${date.toDateString()}: ${count} AC`}
                style={{
                  width: 11,
                  height: 11,
                  borderRadius: "2px",
                  background: getColor(count),
                  border: count > 0 ? "1px solid rgba(124,58,237,0.15)" : "1px solid rgba(124,58,237,0.04)",
                  transition: "transform 0.1s ease",
                  cursor: "default",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.3)" }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)" }}
              />
            ))}
          </div>
        ))}
      </div>
      <div style={{
        display: "flex", alignItems: "center", gap: "4px",
        marginTop: "8px", fontSize: "11px", color: "var(--text-disabled)",
      }}>
        <span>Less</span>
        {[0, 1, 2, 3, 4].map((v) => (
          <div key={v} style={{ width: 10, height: 10, borderRadius: "2px", background: v === 0 ? "rgba(124,58,237,0.06)" : `rgba(124,58,237,${0.2 + v * 0.18})` }} />
        ))}
        <span>More</span>
      </div>
    </div>
  )
}

function TagRadar({ data }: { data: Record<string, number> }) {
  const topTags = Object.entries(data)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([tag, count]) => ({ tag: tag.replace(/-/g, " "), count }))

  if (topTags.length === 0) return null

  return (
    <ResponsiveContainer width="100%" height={260}>
      <RadarChart data={topTags}>
        <PolarGrid stroke="rgba(124,58,237,0.15)" />
        <PolarAngleAxis dataKey="tag" tick={{ fill: "var(--text-muted)", fontSize: 10 }} />
        <Radar name="Solved" dataKey="count" stroke="#7C3AED" fill="#7C3AED" fillOpacity={0.2} strokeWidth={2} />
        <Tooltip
          contentStyle={{
            background: "var(--bg-elevated)", border: "1px solid var(--border-default)",
            borderRadius: "8px", color: "var(--text-primary)", fontSize: "12px",
            fontFamily: "var(--font-sans)",
          }}
        />
      </RadarChart>
    </ResponsiveContainer>
  )
}

export default function AnalyticsPage() {
  const { data: session } = useSession()
  const [cfHandle, setCfHandle] = useState<string | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem("cp_os_profile")
    if (saved) {
      try {
        const p = JSON.parse(saved)
        if (p.cf_handle) setCfHandle(p.cf_handle)
      } catch {}
    }
  }, [])

  const { data: analytics, isLoading } = useQuery({
    queryKey: ["analytics", cfHandle],
    queryFn: () => fetch(`/api/cf/${cfHandle}`).then((r) => r.json()),
    enabled: !!cfHandle,
    staleTime: 15 * 60 * 1000,
  })

  const ratingBuckets = Object.entries(analytics?.problem_stats?.by_rating || {})
    .sort((a, b) => Number(a[0]) - Number(b[0]))
    .map(([rating, count]) => ({ rating: `${rating}`, count }))

  const ratingColors = (r: string) => {
    const n = Number(r)
    if (n >= 2400) return "#FF0000"
    if (n >= 2100) return "#FF8C00"
    if (n >= 1900) return "#AA00AA"
    if (n >= 1600) return "#0000FF"
    if (n >= 1400) return "#03A89E"
    if (n >= 1200) return "#008000"
    return "#808080"
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: "28px" }}
        >
          <h1 style={{
            fontSize: "26px", fontWeight: 800, letterSpacing: "-0.03em",
            background: "var(--gradient-primary)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            marginBottom: "6px",
          }}>
            Analytics
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
            {cfHandle ? `Performance analysis for @${cfHandle}` : "Connect your Codeforces handle to see analytics"}
          </p>
        </motion.div>

        {!cfHandle ? (
          <GlassCard animate delay={0.2}>
            <div className="empty-state" style={{ padding: "60px" }}>
              <BarChart3 size={40} />
              <p style={{ fontSize: "16px", fontWeight: 600, color: "var(--text-secondary)" }}>
                No handle connected
              </p>
              <p>Go to Profile to add your Codeforces handle.</p>
              <a href="/profile" style={{ textDecoration: "none", marginTop: "12px" }}>
                <button className="btn-gradient">Set Up Profile →</button>
              </a>
            </div>
          </GlassCard>
        ) : isLoading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 250, borderRadius: "var(--radius-lg)" }} />
            ))}
          </div>
        ) : (
          <>
            {/* Stats Row */}
            <div className="stats-grid" style={{ marginBottom: "24px" }}>
              <StatCard title="CF Rating" value={analytics?.rating || 0} subtitle={analytics?.rank} icon={<TrendingUp size={18} />} color="purple" delay={0.1} />
              <StatCard title="Max Rating" value={analytics?.max_rating || 0} icon={<Star size={18} />} color="orange" delay={0.15} />
              <StatCard title="Solved" value={analytics?.solved_count || 0} subtitle="unique problems" icon={<Target size={18} />} color="green" delay={0.2} />
              <StatCard title="Contests" value={analytics?.contest_count || 0} subtitle="participated" icon={<Zap size={18} />} color="blue" delay={0.25} />
            </div>

            {/* Rating History */}
            <GlassCard
              title="Rating History"
              titleIcon={<TrendingUp size={14} color="white" />}
              delay={0.3}
              style={{ marginBottom: "20px" }}
            >
              {analytics?.rating_chart?.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={analytics.rating_chart}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="date" tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ background: "var(--bg-elevated)", border: "1px solid var(--border-default)", borderRadius: "10px", color: "var(--text-primary)", fontSize: "12px", fontFamily: "var(--font-sans)" }}
                      formatter={(v: any, _: any, p: any) => [`${v} (${p.payload.change >= 0 ? "+" : ""}${p.payload.change})`, "Rating"]}
                    />
                    <Line type="monotone" dataKey="rating" stroke="var(--teal-500)" strokeWidth={1.8} dot={false} activeDot={{ r: 4, fill: "var(--teal-500)", stroke: "var(--text-primary)", strokeWidth: 1.5 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="empty-state"><TrendingUp size={28} /><p>No contest history yet.</p></div>
              )}
            </GlassCard>

            {/* Problem Heatmap */}
            <GlassCard
              title="Activity Heatmap"
              titleIcon={<Calendar size={14} color="white" />}
              delay={0.4}
              style={{ marginBottom: "20px" }}
            >
              <Heatmap data={analytics?.heatmap || {}} />
            </GlassCard>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              {/* Problems by Rating */}
              <GlassCard
                title="Problems by Rating"
                titleIcon={<BarChart3 size={14} color="white" />}
                delay={0.5}
              >
                {ratingBuckets.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={ratingBuckets} barSize={20}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(124,58,237,0.08)" />
                      <XAxis dataKey="rating" tick={{ fill: "var(--text-muted)", fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: "var(--text-muted)", fontSize: 10 }} axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{ background: "var(--bg-elevated)", border: "1px solid var(--border-default)", borderRadius: "8px", color: "var(--text-primary)", fontSize: "12px", fontFamily: "var(--font-sans)" }}
                        formatter={(v: any) => [v, "Solved"]}
                      />
                      <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                        {ratingBuckets.map((entry, i) => (
                          <Cell key={i} fill={ratingColors(entry.rating)} fillOpacity={0.85} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="empty-state"><BarChart3 size={28} /><p>No data yet.</p></div>
                )}
              </GlassCard>

              {/* Topics Radar */}
              <GlassCard
                title="Topic Distribution"
                titleIcon={<Target size={14} color="white" />}
                delay={0.55}
              >
                {Object.keys(analytics?.problem_stats?.by_tag || {}).length > 0 ? (
                  <TagRadar data={analytics.problem_stats.by_tag} />
                ) : (
                  <div className="empty-state"><Target size={28} /><p>No topic data yet.</p></div>
                )}
              </GlassCard>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
