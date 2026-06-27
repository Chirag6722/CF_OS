"use client"

import { motion } from "framer-motion"
import { useSession } from "next-auth/react"
import { Sun, Moon, CloudSun, Sunset } from "lucide-react"

function getGreeting(): { text: string; icon: typeof Sun; subtext: string } {
  const hour = new Date().getHours()
  if (hour < 12) return { text: "Good Morning", icon: Sun, subtext: "Start your day with a solve! ☀️" }
  if (hour < 17) return { text: "Good Afternoon", icon: CloudSun, subtext: "Keep up the momentum! 💪" }
  if (hour < 20) return { text: "Good Evening", icon: Sunset, subtext: "Time to upsolve and review! 📚" }
  return { text: "Good Night", icon: Moon, subtext: "One more problem before sleep? 🌙" }
}

export default function GreetingHeader() {
  const { data: session } = useSession()
  const greeting = getGreeting()
  const Icon = greeting.icon
  const firstName = session?.user?.name?.split(" ")[0] || "Coder"
  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{ marginBottom: "28px" }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
        <motion.div
          animate={{ rotate: [0, 15, -10, 0] }}
          transition={{ duration: 1, delay: 0.5, ease: "easeInOut" }}
        >
          <Icon size={28} style={{ color: "var(--yellow-400)" }} />
        </motion.div>
        <h1
          style={{
            fontSize: "26px",
            fontWeight: 800,
            letterSpacing: "-0.03em",
          }}
        >
          <span style={{ color: "var(--text-secondary)", fontWeight: 500 }}>
            {greeting.text},{" "}
          </span>
          <span
            style={{
              background: "var(--gradient-primary)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {firstName}
          </span>
          <span style={{ color: "var(--text-primary)" }}>!</span>
        </h1>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", paddingLeft: "2px" }}>
        <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>
          {greeting.subtext}
        </p>
        <span style={{ color: "var(--border-default)" }}>·</span>
        <span style={{ fontSize: "13px", color: "var(--text-disabled)" }}>
          {today}
        </span>
      </div>
    </motion.div>
  )
}
