"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import {
  Code2, BarChart3, Trophy, Brain, Zap, Star, ArrowRight,
  TrendingUp, Target, Calendar, Users, GitBranch, Terminal
} from "lucide-react"
import Globe from "@/components/ui/Globe"

const features = [
  {
    icon: BarChart3,
    title: "Rating Analytics",
    desc: "Track your CF rating history with beautiful charts, heatmaps, and problem distribution analysis.",
    color: "var(--teal-400)",
    bg: "rgba(20, 184, 166, 0.12)",
    border: "rgba(20, 184, 166, 0.25)",
  },
  {
    icon: Trophy,
    title: "Contest Center",
    desc: "Never miss a contest. Live countdowns for Codeforces, LeetCode, and AtCoder with Discord reminders.",
    color: "var(--blue-400)",
    bg: "rgba(6, 182, 212, 0.12)",
    border: "rgba(6, 182, 212, 0.25)",
  },
  {
    icon: Brain,
    title: "AI Coach",
    desc: "Personalized study plans, weak topic detection, and daily goals tailored to your current rating.",
    color: "var(--teal-400)",
    bg: "rgba(20, 184, 166, 0.08)",
    border: "rgba(20, 184, 166, 0.2)",
  },
  {
    icon: Calendar,
    title: "Daily Planner",
    desc: "Structured Morning/Afternoon/Evening/Night blocks. Stay consistent with your CP practice.",
    color: "var(--green-400)",
    bg: "rgba(16, 185, 129, 0.08)",
    border: "rgba(16, 185, 129, 0.2)",
  },
  {
    icon: Target,
    title: "Problem Archive",
    desc: "Save every solved problem with notes, editorial links, and personal code snippets.",
    color: "var(--orange-400)",
    bg: "rgba(249, 115, 22, 0.08)",
    border: "rgba(249, 115, 22, 0.2)",
  },
  {
    icon: Users,
    title: "Friends & Leaderboard",
    desc: "Compete with friends, track their progress, and climb institute and global leaderboards.",
    color: "var(--pink-500)",
    bg: "rgba(244, 63, 94, 0.08)",
    border: "rgba(244, 63, 94, 0.2)",
  },
]

const stats = [
  { value: "10K+", label: "Active Users" },
  { value: "500K+", label: "Problems Tracked" },
  { value: "50K+", label: "Contests Monitored" },
  { value: "99.9%", label: "Uptime" },
]

export default function LandingPage() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-base)", overflowX: "hidden" }}>
      {/* ── Navbar ── */}
      <nav style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "rgba(8, 10, 16, 0.85)",
        borderBottom: "1px solid var(--border-subtle)",
        backdropFilter: "blur(20px)",
        padding: "0 40px",
        height: 60,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: 32,
            height: 32,
            borderRadius: "8px",
            background: "var(--gradient-primary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            <Code2 size={18} color="white" strokeWidth={2.5} />
          </div>
          <span style={{
            fontSize: "16px",
            fontWeight: 800,
            letterSpacing: "-0.03em",
            background: "var(--gradient-primary)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}>
            CP OS
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "var(--text-secondary)", display: "flex", transition: "color 0.2s" }}
            onMouseEnter={(e) => e.currentTarget.style.color = "var(--teal-400)"}
            onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-secondary)"}
          >
            <GitBranch size={18} />
          </a>
          <Link href="/auth/signin" style={{ textDecoration: "none" }}>
            <button className="btn-gradient" style={{ fontSize: "13px", padding: "8px 18px" }}>
              Sign In
            </button>
          </Link>
        </div>
      </nav>

      {/* ── Hero Split Screen with Globe & Terminal ── */}
      <section style={{
        position: "relative",
        padding: "60px 40px 100px",
        maxWidth: 1300,
        margin: "0 auto",
        display: "grid",
        gridTemplateColumns: "1.1fr 0.9fr",
        gap: "40px",
        alignItems: "center",
      }}>
        {/* Left Column: Copy & Actions */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
          style={{ position: "relative", zIndex: 1 }}
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "5px 12px",
              borderRadius: "var(--radius-sm)",
              background: "var(--bg-surface)",
              border: "1px solid var(--border-default)",
              fontSize: "12px",
              color: "var(--teal-400)",
              fontWeight: 500,
              fontFamily: "var(--font-mono)",
              marginBottom: "24px",
            }}
          >
            cpos-node --active
          </motion.div>

          <h1 style={{
            fontSize: "clamp(38px, 5vw, 62px)",
            fontWeight: 800,
            letterSpacing: "-0.04em",
            lineHeight: 1.1,
            marginBottom: "24px",
            color: "var(--text-primary)",
          }}>
            The Terminal OS
            <br />
            for Competitive Programmers
          </h1>

          <p style={{
            fontSize: "16px",
            color: "var(--text-secondary)",
            marginBottom: "36px",
            lineHeight: 1.7,
            maxWidth: 540,
          }}>
            Unify your Codeforces profile, LeetCode submissions, and contest countdowns.
            Interactive global telemetry, custom study planner, and real-time dashboard updates wrapped in a fast, dark-terminal aesthetic.
          </p>

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "40px" }}>
            <Link href="/auth/signin" style={{ textDecoration: "none" }}>
              <motion.button
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
                className="btn-gradient"
                style={{ fontSize: "13px", padding: "10px 20px", display: "flex", alignItems: "center", gap: "8px" }}
              >
                Access Terminal <ArrowRight size={14} />
              </motion.button>
            </Link>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
              <motion.button
                whileHover={{ y: -1 }}
                className="btn-ghost"
                style={{ fontSize: "13px", padding: "10px 20px", display: "flex", alignItems: "center", gap: "8px" }}
              >
                <GitBranch size={14} /> Source Code
              </motion.button>
            </a>
          </div>

          {/* Mini Terminal Stats Output */}
          <div style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border-default)",
            borderRadius: "var(--radius-md)",
            padding: "16px",
            fontFamily: "var(--font-mono)",
            fontSize: "12.5px",
            color: "var(--text-secondary)",
            maxWidth: 500,
            boxShadow: "none",
          }}>
            <div style={{ display: "flex", gap: "6px", marginBottom: "12px" }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444" }} />
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#f59e0b" }} />
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981" }} />
              <span style={{ fontSize: "10px", color: "var(--text-muted)", marginLeft: "8px" }}>cpos-telemetry@sys</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <div><span style={{ color: "var(--teal-400)" }}>$</span> cpos --status</div>
              <div style={{ color: "var(--text-primary)" }}>[OK] Active telemetry node established.</div>
              <div><span style={{ color: "var(--teal-400)" }}>$</span> cpos --metrics</div>
              <div style={{ display: "flex", gap: "16px" }}>
                <span>CF ping: <strong style={{ color: "var(--teal-400)" }}>184ms</strong></span>
                <span>Active nodes: <strong style={{ color: "var(--teal-400)" }}>14,902</strong></span>
                <span>DB: <strong style={{ color: "var(--green-400)" }}>Online</strong></span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Column: 3D Globe with Atmospheric Glow */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          style={{
            height: 520,
            width: "100%",
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Globe />
        </motion.div>
      </section>

      {/* ── Stats Banner ── */}
      <section style={{
        padding: "40px 40px",
        borderTop: "1px solid var(--border-subtle)",
        borderBottom: "1px solid var(--border-subtle)",
        background: "rgba(20, 184, 166, 0.02)",
      }}>
        <div style={{
          maxWidth: 900,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "40px",
          textAlign: "center",
        }}>
          {stats.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
            >
              <div style={{
                fontSize: "26px",
                fontWeight: 700,
                fontFamily: "var(--font-mono)",
                color: "var(--teal-500)",
                letterSpacing: "-0.02em",
                marginBottom: "4px",
              }}>
                {s.value}
              </div>
              <div style={{ fontSize: "12.5px", color: "var(--text-muted)", fontWeight: 500 }}>
                {s.label}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section style={{ padding: "80px 40px", maxWidth: 1100, margin: "0 auto" }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ textAlign: "center", marginBottom: "60px" }}
        >
          <h2 style={{
            fontSize: "clamp(26px, 4vw, 40px)",
            fontWeight: 800,
            letterSpacing: "-0.03em",
            color: "var(--text-primary)",
            marginBottom: "12px",
          }}>
            Engineered for speed & consistency
          </h2>
          <p style={{ fontSize: "15px", color: "var(--text-muted)", maxWidth: 520, margin: "0 auto", lineHeight: 1.6 }}>
            Every module is designed to streamline your daily programming workflow.
          </p>
        </motion.div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "20px",
        }}>
          {features.map((f, i) => {
            const Icon = f.icon
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                style={{
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border-default)",
                  borderRadius: "var(--radius-md)",
                  padding: "24px",
                  transition: "border-color 0.15s ease",
                  cursor: "default",
                }}
                whileHover={{ borderColor: "var(--border-strong)" }}
              >
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: "var(--radius-md)",
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--border-default)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "16px",
                  color: "var(--teal-500)",
                }}>
                  <Icon size={18} />
                </div>
                <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "8px" }}>
                  {f.title}
                </h3>
                <p style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.65 }}>
                  {f.desc}
                </p>
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* ── Platforms Telemetry ── */}
      <section style={{
        padding: "60px 40px",
        background: "rgba(20, 184, 166, 0.02)",
        borderTop: "1px solid var(--border-subtle)",
        textAlign: "center",
      }}>
        <p style={{
          fontSize: "12px",
          color: "var(--text-disabled)",
          fontWeight: 600,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          marginBottom: "24px",
        }}>
          Global Telemetry Integrations
        </p>
        <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
          {[
            { name: "Codeforces API", emoji: "🔵" },
            { name: "LeetCode GraphQL", emoji: "🟡" },
            { name: "AtCoder Kenkoooo", emoji: "🔴" },
            { name: "GitHub Telemetry", emoji: "⚫" },
            { name: "Discord Webhooks", emoji: "🟣" },
          ].map((p, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 16px",
                borderRadius: "999px",
                background: "rgba(12, 16, 27, 0.75)",
                border: "1px solid var(--border-subtle)",
                fontSize: "13px",
                color: "var(--text-secondary)",
                fontWeight: 500,
                backdropFilter: "blur(12px)",
              }}
            >
              <span>{p.emoji}</span> {p.name}
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Call To Action ── */}
      <section style={{ padding: "100px 40px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ position: "relative", zIndex: 1 }}
        >
          <h2 style={{
            fontSize: "clamp(26px, 5vw, 44px)",
            fontWeight: 800,
            letterSpacing: "-0.03em",
            marginBottom: "16px",
            color: "var(--text-primary)",
          }}>
            Ready to track your progress?
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "15px", marginBottom: "32px" }}>
            Create an account in seconds and sync your profile info.
          </p>
          <Link href="/auth/signin" style={{ textDecoration: "none" }}>
            <motion.button
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
              className="btn-gradient"
              style={{ fontSize: "14px", padding: "12px 28px", display: "inline-flex", alignItems: "center", gap: "8px" }}
            >
              Sign Up / Sign In <ArrowRight size={16} />
            </motion.button>
          </Link>
        </motion.div>
      </section>

      {/* ── Footer ── */}
      <footer style={{
        borderTop: "1px solid var(--border-subtle)",
        padding: "24px 40px",
        textAlign: "center",
        fontSize: "12px",
        color: "var(--text-disabled)",
      }}>
        <span>
          © {new Date().getFullYear()} CP OS · Crafted for competitive programmers.
        </span>
      </footer>
    </div>
  )
}
