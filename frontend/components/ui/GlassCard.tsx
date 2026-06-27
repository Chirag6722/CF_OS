"use client"

import { motion } from "framer-motion"
import { ReactNode } from "react"

interface GlassCardProps {
  children: ReactNode
  className?: string
  style?: React.CSSProperties
  delay?: number
  animate?: boolean
  padding?: number | string
  title?: string
  titleIcon?: ReactNode
  action?: ReactNode
}

export default function GlassCard({
  children,
  style,
  delay = 0,
  animate = true,
  padding = "20px",
  title,
  titleIcon,
  action,
}: GlassCardProps) {
  const content = (
    <div
      style={{
        background: "var(--glass-bg)",
        border: "1px solid var(--border-subtle)",
        borderRadius: "var(--radius-lg)",
        backdropFilter: "blur(16px)",
        boxShadow: "var(--glass-shadow)",
        overflow: "hidden",
        ...style,
      }}
    >
      {title && (
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid var(--border-subtle)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {titleIcon && (
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "7px",
                  background: "var(--gradient-primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {titleIcon}
              </div>
            )}
            <h2 style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>
              {title}
            </h2>
          </div>
          {action}
        </div>
      )}
      <div style={{ padding: title ? padding : padding }}>{children}</div>
    </div>
  )

  if (!animate) return content

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
    >
      {content}
    </motion.div>
  )
}
