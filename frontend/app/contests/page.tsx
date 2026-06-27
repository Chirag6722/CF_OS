"use client"

import { useQuery } from "@tanstack/react-query"
import { useSession } from "next-auth/react"
import { motion } from "framer-motion"
import axios from "axios"
import { useState } from "react"
import Sidebar from "@/components/layout/Sidebar"
import ContestCard from "@/components/ui/ContestCard"
import GlassCard from "@/components/ui/GlassCard"
import { Trophy, Filter, RefreshCw, Bell } from "lucide-react"

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

const PLATFORMS = ["all", "codeforces", "leetcode", "atcoder"]

const platformLabels: Record<string, string> = {
  all: "🌐 All",
  codeforces: "🔵 Codeforces",
  leetcode: "🟡 LeetCode",
  atcoder: "🔴 AtCoder",
}

export default function ContestsPage() {
  const { data: session } = useSession()
  const [activePlatform, setActivePlatform] = useState("all")

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["contests", activePlatform],
    queryFn: () =>
      axios.get(`${API}/api/contests/upcoming?platform=${activePlatform}`).then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  })

  const contests = data?.contests || []

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
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <h1 style={{
                fontSize: "26px", fontWeight: 800, letterSpacing: "-0.03em",
                background: "var(--gradient-primary)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                marginBottom: "6px",
              }}>
                Contest Center
              </h1>
              <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
                Upcoming contests from Codeforces, LeetCode, and AtCoder
              </p>
            </div>
            <button
              onClick={() => refetch()}
              disabled={isRefetching}
              style={{
                display: "flex", alignItems: "center", gap: "6px",
                padding: "8px 16px", borderRadius: "var(--radius-md)",
                background: "var(--bg-surface)",
                border: "1px solid var(--border-default)",
                color: "var(--text-secondary)",
                fontSize: "13px", cursor: "pointer",
                fontFamily: "var(--font-sans)",
                transition: "all 0.15s ease",
                opacity: isRefetching ? 0.5 : 1,
              }}
            >
              <RefreshCw size={13} style={{ animation: isRefetching ? "spin 1s linear infinite" : "none" }} />
              Refresh
            </button>
          </div>
        </motion.div>

        {/* Platform Filter */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          style={{
            display: "flex", gap: "8px", marginBottom: "24px", flexWrap: "wrap",
          }}
        >
          {PLATFORMS.map((p) => (
            <button
              key={p}
              onClick={() => setActivePlatform(p)}
              style={{
                padding: "8px 16px",
                borderRadius: "var(--radius-md)",
                background: activePlatform === p
                  ? "var(--teal-500)"
                  : "var(--bg-surface)",
                border: activePlatform === p
                  ? "1px solid var(--teal-500)"
                  : "1px solid var(--border-default)",
                color: activePlatform === p ? "#111213" : "var(--text-secondary)",
                fontSize: "13px",
                fontWeight: activePlatform === p ? 600 : 400,
                cursor: "pointer",
                fontFamily: "var(--font-sans)",
                transition: "all 0.15s ease",
              }}
            >
              {platformLabels[p]}
            </button>
          ))}
        </motion.div>

        {/* Stats Banner */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          style={{
            display: "flex", gap: "16px", marginBottom: "24px", flexWrap: "wrap",
          }}
        >
          {[
            { label: "Upcoming Contests", value: contests.length, icon: Trophy, color: "var(--purple-300)" },
            {
              label: "Live Right Now",
              value: contests.filter((c: any) => c.phase === "CODING").length,
              icon: Bell,
              color: "var(--green-400)",
            },
          ].map((s, i) => {
            const Icon = s.icon
            return (
              <div
                key={i}
                style={{
                  display: "flex", alignItems: "center", gap: "10px",
                  padding: "10px 16px",
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border-default)",
                  borderRadius: "var(--radius-md)",
                }}
              >
                <Icon size={16} style={{ color: s.color }} />
                <span style={{ fontSize: "18px", fontWeight: 700, fontFamily: "var(--font-mono)", color: "var(--text-primary)" }}>{s.value}</span>
                <span style={{ fontSize: "12.5px", color: "var(--text-muted)" }}>{s.label}</span>
              </div>
            )
          })}
        </motion.div>

        {/* Contests Grid */}
        {isLoading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "16px" }}>
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 200, borderRadius: "var(--radius-lg)" }} />
            ))}
          </div>
        ) : contests.length === 0 ? (
          <GlassCard animate delay={0.3}>
            <div className="empty-state" style={{ padding: "60px" }}>
              <Trophy size={40} />
              <p style={{ fontSize: "16px", fontWeight: 600, color: "var(--text-secondary)" }}>
                No upcoming contests
              </p>
              <p>Check back later or try a different platform filter.</p>
            </div>
          </GlassCard>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: "16px",
            }}
          >
            {contests.map((contest: any, i: number) => (
              <ContestCard
                key={`${contest.platform}-${contest.contest_id}-${i}`}
                contest={contest}
                delay={i * 0.05}
              />
            ))}
          </div>
        )}

        {/* Discord Integration Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          style={{ marginTop: "32px" }}
        >
          <GlassCard
            title="Discord Notifications"
            titleIcon={<Bell size={14} color="white" />}
            animate={false}
          >
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              flexWrap: "wrap", gap: "16px",
            }}>
              <div>
                <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "4px" }}>
                  Get contest reminders directly in your Discord server.
                </p>
                <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                  Set up a webhook in Settings → Notifications
                </p>
              </div>
              <a href="/settings" style={{ textDecoration: "none" }}>
                <button className="btn-gradient" style={{ fontSize: "13px" }}>
                  Configure Webhook →
                </button>
              </a>
            </div>
          </GlassCard>
        </motion.div>
      </main>
    </div>
  )
}
