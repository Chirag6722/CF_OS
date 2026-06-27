"use client"

import { motion } from "framer-motion"
import { ReactNode } from "react"

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: ReactNode
  trend?: { value: number; label: string }
  color?: "purple" | "blue" | "green" | "orange" | "red" | "cyan"
  delay?: number
  badge?: string
}

const colorMap = {
  purple: { bg: "rgba(210, 126, 100, 0.12)", border: "rgba(210, 126, 100, 0.3)", icon: "rgba(210, 126, 100, 0.2)", glow: "rgba(210, 126, 100, 0.18)", text: "#D27E64" },
  blue:   { bg: "rgba(6, 182, 212, 0.1)",  border: "rgba(6, 182, 212, 0.25)", icon: "rgba(6, 182, 212, 0.2)", glow: "rgba(6, 182, 212, 0.12)", text: "var(--blue-400)" },
  green:  { bg: "rgba(16, 185, 129, 0.08)", border: "rgba(16, 185, 129, 0.2)", icon: "rgba(16, 185, 129, 0.15)", glow: "rgba(16, 185, 129, 0.1)", text: "var(--green-400)" },
  orange: { bg: "rgba(251, 146, 60, 0.08)", border: "rgba(251, 146, 60, 0.2)", icon: "rgba(251, 146, 60, 0.15)", glow: "rgba(251, 146, 60, 0.1)", text: "var(--orange-400)" },
  red:    { bg: "rgba(248, 113, 113, 0.08)",border: "rgba(248, 113, 113, 0.2)",icon: "rgba(248, 113, 113, 0.15)",glow: "rgba(248, 113, 113, 0.1)", text: "var(--red-400)" },
  cyan:   { bg: "rgba(34, 211, 238, 0.08)", border: "rgba(34, 211, 238, 0.2)", icon: "rgba(34, 211, 238, 0.15)", glow: "rgba(34, 211, 238, 0.1)", text: "var(--cyan-400)" },
}

export default function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  color = "purple",
  delay = 0,
  badge,
}: StatCardProps) {
  const c = colorMap[color]

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay, ease: "easeOut" }}
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border-default)",
        borderRadius: "var(--radius-md)",
        padding: "20px",
        cursor: "default",
        position: "relative",
        overflow: "hidden",
      }}
      data-stat-card
    >

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "12px" }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: "10px",
            background: c.icon,
            border: `1px solid ${c.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: c.text,
          }}
        >
          {icon}
        </div>
        {badge && (
          <span
            style={{
              fontSize: "11px",
              fontWeight: 600,
              padding: "3px 8px",
              borderRadius: "999px",
              background: c.bg,
              color: c.text,
              border: `1px solid ${c.border}`,
              letterSpacing: "0.03em",
            }}
          >
            {badge}
          </span>
        )}
      </div>

      {/* Value */}
      <div style={{ marginBottom: "4px" }}>
        <span
          style={{
            fontSize: "26px",
            fontWeight: 700,
            color: "var(--text-primary)",
            fontFamily: "var(--font-mono)",
            letterSpacing: "-0.02em",
            lineHeight: 1,
          }}
        >
          {value}
        </span>
      </div>

      {/* Title */}
      <div
        style={{
          fontSize: "12px",
          color: "var(--text-muted)",
          fontWeight: 500,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          marginBottom: subtitle ? "8px" : "0",
        }}
      >
        {title}
      </div>

      {/* Subtitle / Trend */}
      {(subtitle || trend) && (
        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "8px" }}>
          {trend && (
            <span
              style={{
                fontSize: "12px",
                fontWeight: 600,
                color: trend.value >= 0 ? "var(--green-400)" : "var(--red-400)",
                display: "flex",
                alignItems: "center",
                gap: "2px",
              }}
            >
              {trend.value >= 0 ? "▲" : "▼"} {Math.abs(trend.value)}
            </span>
          )}
          {subtitle && (
            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
              {subtitle}
            </span>
          )}
        </div>
      )}
    </motion.div>
  )
}
