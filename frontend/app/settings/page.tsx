"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { motion } from "framer-motion"
import axios from "axios"
import Sidebar from "@/components/layout/Sidebar"
import GlassCard from "@/components/ui/GlassCard"
import {
  Bell, Webhook, Check, Send, Loader2, AlertCircle, Settings as SettingsIcon,
  Moon, Sun, Globe, Volume2
} from "lucide-react"

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export default function SettingsPage() {
  const { data: session } = useSession()
  const [discordWebhook, setDiscordWebhook] = useState("")
  const [testStatus, setTestStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [testError, setTestError] = useState("")

  const testDiscord = async () => {
    if (!discordWebhook) return
    setTestStatus("loading")
    try {
      await axios.post(`${API}/api/notifications/discord/test`, {
        webhook_url: discordWebhook,
        message: `Hello from CP OS! 🚀\nYour Discord integration is working perfectly, ${session?.user?.name?.split(" ")[0] || "Coder"}!`,
      })
      setTestStatus("success")
      setTimeout(() => setTestStatus("idle"), 4000)
    } catch (err: any) {
      setTestError(err?.response?.data?.detail || "Failed to send test notification")
      setTestStatus("error")
      setTimeout(() => setTestStatus("idle"), 5000)
    }
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: "28px" }}>
          <h1 style={{
            fontSize: "26px", fontWeight: 800, letterSpacing: "-0.03em",
            background: "var(--gradient-primary)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: "4px",
          }}>
            Settings
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
            Configure notifications, integrations, and preferences
          </p>
        </motion.div>

        <div style={{ maxWidth: 680, display: "flex", flexDirection: "column", gap: "20px" }}>

          {/* Discord Notifications */}
          <GlassCard
            title="Discord Notifications"
            titleIcon={<Bell size={14} color="white" />}
            delay={0.1}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{
                padding: "12px 14px",
                borderRadius: "10px",
                background: "rgba(88,101,242,0.08)",
                border: "1px solid rgba(88,101,242,0.2)",
                fontSize: "13px",
                color: "var(--text-secondary)",
                lineHeight: 1.6,
              }}>
                <strong style={{ color: "var(--purple-300)" }}>How to get a Discord Webhook URL:</strong>
                <ol style={{ margin: "8px 0 0 16px", display: "flex", flexDirection: "column", gap: "4px" }}>
                  <li>Open Discord → Server Settings → Integrations → Webhooks</li>
                  <li>Click "New Webhook" → Name it "CP OS" → Choose a channel</li>
                  <li>Copy the Webhook URL and paste it below</li>
                </ol>
              </div>

              <div>
                <label style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: "8px" }}>
                  Webhook URL
                </label>
                <input
                  className="input-glass"
                  value={discordWebhook}
                  onChange={(e) => setDiscordWebhook(e.target.value)}
                  placeholder="https://discord.com/api/webhooks/..."
                  style={{ fontFamily: "var(--font-mono)", fontSize: "12px" }}
                />
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  onClick={testDiscord}
                  disabled={!discordWebhook || testStatus === "loading"}
                  className="btn-gradient"
                  style={{
                    display: "flex", alignItems: "center", gap: "6px",
                    fontSize: "13px", padding: "10px 18px",
                    opacity: !discordWebhook ? 0.5 : 1,
                  }}
                >
                  {testStatus === "loading" ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <Send size={14} />}
                  {testStatus === "loading" ? "Sending..." : "Test Webhook"}
                </button>
              </div>

              {testStatus === "success" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{
                  display: "flex", alignItems: "center", gap: "8px",
                  padding: "10px 14px", borderRadius: "8px",
                  background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.2)",
                }}>
                  <Check size={14} style={{ color: "var(--green-400)" }} />
                  <span style={{ fontSize: "13px", color: "var(--green-400)" }}>
                    Test message sent! Check your Discord channel.
                  </span>
                </motion.div>
              )}

              {testStatus === "error" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{
                  display: "flex", alignItems: "center", gap: "8px",
                  padding: "10px 14px", borderRadius: "8px",
                  background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)",
                }}>
                  <AlertCircle size={14} style={{ color: "var(--red-400)" }} />
                  <span style={{ fontSize: "13px", color: "var(--red-400)" }}>{testError}</span>
                </motion.div>
              )}

              {/* Notification toggles */}
              {[
                { label: "Contest Reminders", desc: "Get notified 30 min before contests" },
                { label: "Rating Updates", desc: "When your CF rating changes" },
                { label: "Streak Alerts", desc: "Don't break your solving streak" },
              ].map((item, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "12px 0",
                  borderTop: "1px solid var(--border-subtle)",
                }}>
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: 500, color: "var(--text-primary)" }}>{item.label}</div>
                    <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>{item.desc}</div>
                  </div>
                  <Toggle defaultOn={i === 0} />
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Appearance */}
          <GlassCard
            title="Appearance"
            titleIcon={<Moon size={14} color="white" />}
            delay={0.2}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0" }}>
              <div>
                <div style={{ fontSize: "13px", fontWeight: 500, color: "var(--text-primary)" }}>Dark Mode</div>
                <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>Deep dark glassmorphic theme</div>
              </div>
              <Toggle defaultOn={true} />
            </div>
          </GlassCard>

          {/* About */}
          <GlassCard title="About CP OS" titleIcon={<SettingsIcon size={14} color="white" />} delay={0.3}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              {[
                { label: "Version", value: "1.0.0" },
                { label: "Backend", value: "FastAPI + Python" },
                { label: "Frontend", value: "Next.js 15" },
                { label: "Auth", value: "Auth.js v5" },
                { label: "Database", value: "PostgreSQL" },
                { label: "Cache", value: "Redis" },
              ].map((item, i) => (
                <div key={i} style={{
                  padding: "10px 12px",
                  borderRadius: "8px",
                  background: "rgba(124,58,237,0.04)",
                  border: "1px solid var(--border-subtle)",
                }}>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 500, marginBottom: "3px" }}>{item.label}</div>
                  <div style={{ fontSize: "13px", color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>{item.value}</div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </main>
    </div>
  )
}

function Toggle({ defaultOn = false }: { defaultOn?: boolean }) {
  const [on, setOn] = useState(defaultOn)
  return (
    <button
      onClick={() => setOn(!on)}
      style={{
        width: 42,
        height: 24,
        borderRadius: "999px",
        background: on ? "var(--gradient-primary)" : "rgba(124,58,237,0.1)",
        border: `1px solid ${on ? "transparent" : "var(--border-default)"}`,
        cursor: "pointer",
        position: "relative",
        transition: "all 0.2s ease",
        flexShrink: 0,
      }}
    >
      <motion.div
        animate={{ x: on ? 20 : 2 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        style={{
          position: "absolute",
          top: 3,
          left: 0,
          width: 16,
          height: 16,
          borderRadius: "50%",
          background: "white",
          boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
        }}
      />
    </button>
  )
}
