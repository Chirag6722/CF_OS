"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Clock, ExternalLink, Bell, BellOff, Calendar } from "lucide-react"

interface Contest {
  platform: "codeforces" | "leetcode" | "atcoder" | string
  contest_id: string
  name: string
  start_time: string
  duration_secs: number
  url: string
  phase: string
}

const platformConfig = {
  codeforces: {
    label: "Codeforces",
    emoji: "🔵",
    color: "var(--blue-400)",
    bg: "rgba(59,130,246,0.08)",
    border: "rgba(59,130,246,0.25)",
  },
  leetcode: {
    label: "LeetCode",
    emoji: "🟡",
    color: "var(--yellow-400)",
    bg: "rgba(250,204,21,0.08)",
    border: "rgba(250,204,21,0.25)",
  },
  atcoder: {
    label: "AtCoder",
    emoji: "🔴",
    color: "var(--red-400)",
    bg: "rgba(248,113,113,0.08)",
    border: "rgba(248,113,113,0.25)",
  },
}

function useCountdown(startTime: string) {
  const [timeLeft, setTimeLeft] = useState<string>("")
  const [isLive, setIsLive] = useState(false)

  useEffect(() => {
    const update = () => {
      const now = Date.now()
      const start = new Date(startTime).getTime()
      const diff = start - now

      if (diff <= 0) {
        setIsLive(true)
        setTimeLeft("LIVE")
        return
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h ${minutes}m`)
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`)
      } else {
        setTimeLeft(`${minutes}m ${seconds}s`)
      }
    }

    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [startTime])

  return { timeLeft, isLive }
}

function formatDuration(secs: number): string {
  const h = Math.floor(secs / 3600)
  const m = Math.floor((secs % 3600) / 60)
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

function formatStartTime(startTime: string): string {
  const date = new Date(startTime)
  return date.toLocaleString("en-IN", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
  }) + " IST"
}

interface ContestCardProps {
  contest: Contest
  delay?: number
}

export default function ContestCard({ contest, delay = 0 }: ContestCardProps) {
  const { timeLeft, isLive } = useCountdown(contest.start_time)
  const [reminderSet, setReminderSet] = useState(false)

  const platform = contest.platform.toLowerCase() as keyof typeof platformConfig
  const config = platformConfig[platform] || {
    label: contest.platform,
    emoji: "🏁",
    color: "var(--purple-300)",
    bg: "rgba(210, 126, 100, 0.08)",
    border: "rgba(210, 126, 100, 0.2)",
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: "easeOut" }}
      whileHover={{ y: -2 }}
      style={{
        background: "var(--glass-bg)",
        border: `1px solid ${isLive ? "rgba(74,222,128,0.4)" : config.border}`,
        borderRadius: "var(--radius-lg)",
        padding: "18px",
        backdropFilter: "blur(12px)",
        transition: "all 0.2s ease",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Live indicator */}
      {isLive && (
        <div
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: "rgba(74,222,128,0.15)",
            border: "1px solid rgba(74,222,128,0.4)",
            borderRadius: "999px",
            padding: "3px 10px",
            fontSize: "11px",
            fontWeight: 700,
            color: "var(--green-400)",
            letterSpacing: "0.05em",
          }}
        >
          <span className="pulse" style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--green-400)", display: "inline-block" }} />
          LIVE
        </div>
      )}

      {/* Platform Badge */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <span
          style={{
            fontSize: "11px",
            fontWeight: 600,
            padding: "3px 10px",
            borderRadius: "999px",
            background: config.bg,
            color: config.color,
            border: `1px solid ${config.border}`,
            letterSpacing: "0.04em",
            display: "flex",
            alignItems: "center",
            gap: 5,
          }}
        >
          {config.emoji} {config.label}
        </span>
      </div>

      {/* Contest Name */}
      <h3
        style={{
          fontSize: "14px",
          fontWeight: 600,
          color: "var(--text-primary)",
          marginBottom: 12,
          lineHeight: 1.4,
          paddingRight: isLive ? "60px" : "0",
        }}
      >
        {contest.name}
      </h3>

      {/* Info Row */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 14, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5, color: "var(--text-muted)", fontSize: "12px" }}>
          <Calendar size={12} />
          {formatStartTime(contest.start_time)}
        </div>
        {contest.duration_secs > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 5, color: "var(--text-muted)", fontSize: "12px" }}>
            <Clock size={12} />
            {formatDuration(contest.duration_secs)}
          </div>
        )}
      </div>

      {/* Countdown */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: isLive ? "rgba(74,222,128,0.08)" : "rgba(124,58,237,0.06)",
          border: `1px solid ${isLive ? "rgba(74,222,128,0.2)" : "rgba(124,58,237,0.15)"}`,
          borderRadius: "10px",
          padding: "10px 14px",
          marginBottom: 12,
        }}
      >
        <div>
          <div style={{ fontSize: "10px", color: "var(--text-muted)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>
            {isLive ? "Status" : "Starts in"}
          </div>
          <div
            style={{
              fontSize: "18px",
              fontWeight: 800,
              fontFamily: "var(--font-mono)",
              color: isLive ? "var(--green-400)" : config.color,
              letterSpacing: "-0.02em",
            }}
          >
            {timeLeft}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 8 }}>
        <a
          href={contest.url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            padding: "8px",
            borderRadius: "8px",
            background: "var(--gradient-primary)",
            color: "white",
            fontSize: "12px",
            fontWeight: 600,
            textDecoration: "none",
            transition: "opacity 0.2s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >
          <ExternalLink size={13} />
          Open Contest
        </a>
        <button
          onClick={() => setReminderSet(!reminderSet)}
          style={{
            padding: "8px 12px",
            borderRadius: "8px",
            background: reminderSet ? "rgba(74,222,128,0.12)" : "rgba(124,58,237,0.08)",
            border: `1px solid ${reminderSet ? "rgba(74,222,128,0.3)" : "rgba(124,58,237,0.2)"}`,
            color: reminderSet ? "var(--green-400)" : "var(--text-muted)",
            cursor: "pointer",
            transition: "all 0.2s ease",
            display: "flex",
            alignItems: "center",
            gap: 5,
            fontSize: "12px",
            fontFamily: "var(--font-sans)",
            fontWeight: 500,
          }}
        >
          {reminderSet ? <Bell size={13} /> : <BellOff size={13} />}
          {reminderSet ? "Remind" : "Remind"}
        </button>
      </div>
    </motion.div>
  )
}
