"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { motion } from "framer-motion"
import Sidebar from "@/components/layout/Sidebar"
import GlassCard from "@/components/ui/GlassCard"
import {
  User, Edit3, Save, X, Check, AlertCircle, Loader2, ExternalLink
} from "lucide-react"

const CF_API = "/api/cf"

export default function ProfilePage() {
  const { data: session } = useSession()
  const [editing, setEditing] = useState(false)
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle")
  const [errorMsg, setErrorMsg] = useState("")

  const [form, setForm] = useState({
    cf_handle: "",
    lc_username: "",
    gh_username: "",
    country: "",
    institute: "",
    bio: "",
  })

  // Load saved profile from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("cp_os_profile")
    if (saved) {
      try {
        setForm(JSON.parse(saved))
      } catch {}
    }
  }, [])

  const saveProfile = async () => {
    setSaveStatus("saving")
    setErrorMsg("")

    // Validate CF handle by calling our Next.js API route (no backend needed)
    if (form.cf_handle.trim()) {
      try {
        const res = await fetch(`${CF_API}/${form.cf_handle.trim()}`)
        if (!res.ok) {
          setSaveStatus("error")
          setErrorMsg(`Codeforces handle "${form.cf_handle}" not found. Check your handle and try again.`)
          setTimeout(() => setSaveStatus("idle"), 5000)
          return
        }
      } catch {
        setSaveStatus("error")
        setErrorMsg("Could not connect to Codeforces. Check your internet and try again.")
        setTimeout(() => setSaveStatus("idle"), 5000)
        return
      }
    }

    // Save to localStorage
    localStorage.setItem("cp_os_profile", JSON.stringify(form))
    setSaveStatus("success")
    setEditing(false)
    setTimeout(() => setSaveStatus("idle"), 3000)
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: "28px" }}
        >
          <h1 style={{
            fontSize: "26px", fontWeight: 800, letterSpacing: "-0.03em",
            background: "var(--gradient-primary)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            marginBottom: "4px",
          }}>
            Profile
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
            Add your Codeforces handle to unlock live stats, charts, and your personalized planner
          </p>
        </motion.div>

        <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: "24px", alignItems: "start" }}>
          {/* Avatar Card */}
          <GlassCard delay={0.1}>
            <div style={{ textAlign: "center", padding: "8px 0" }}>
              {session?.user?.image ? (
                <img
                  src={session.user.image}
                  alt="Avatar"
                  style={{
                    width: 80, height: 80, borderRadius: "50%",
                    border: "3px solid rgba(124,58,237,0.4)",
                    margin: "0 auto 12px", display: "block",
                  }}
                />
              ) : (
                <div style={{
                  width: 80, height: 80, borderRadius: "50%",
                  background: "var(--gradient-primary)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 12px",
                }}>
                  <User size={36} color="white" />
                </div>
              )}
              <div style={{ fontSize: "17px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "4px" }}>
                {session?.user?.name}
              </div>
              <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "16px" }}>
                {session?.user?.email}
              </div>

              {form.cf_handle && (
                <a href={`https://codeforces.com/profile/${form.cf_handle}`} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                  <div style={{
                    padding: "8px 12px", borderRadius: "8px",
                    background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.25)",
                    fontSize: "13px", color: "var(--blue-400)", marginBottom: "6px",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
                    cursor: "pointer",
                  }}>
                    🔵 @{form.cf_handle}
                    <ExternalLink size={11} />
                  </div>
                </a>
              )}
              {form.gh_username && (
                <a href={`https://github.com/${form.gh_username}`} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                  <div style={{
                    padding: "8px 12px", borderRadius: "8px",
                    background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.2)",
                    fontSize: "13px", color: "var(--purple-300)", marginBottom: "6px",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
                  }}>
                    ⚫ @{form.gh_username}
                  </div>
                </a>
              )}
              {form.institute && (
                <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "8px" }}>
                  🏫 {form.institute}
                </div>
              )}
              {form.country && (
                <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>
                  🌍 {form.country}
                </div>
              )}
            </div>
          </GlassCard>

          {/* Edit Form */}
          <GlassCard
            delay={0.15}
            title="Edit Profile"
            titleIcon={<Edit3 size={14} color="white" />}
            action={
              <div style={{ display: "flex", gap: "8px" }}>
                {editing ? (
                  <>
                    <button
                      onClick={() => { setEditing(false); setSaveStatus("idle") }}
                      style={{
                        display: "flex", alignItems: "center", gap: "4px",
                        padding: "5px 12px", borderRadius: "8px",
                        background: "transparent", border: "1px solid var(--border-default)",
                        color: "var(--text-muted)", cursor: "pointer", fontSize: "12px",
                        fontFamily: "var(--font-sans)",
                      }}
                    >
                      <X size={12} /> Cancel
                    </button>
                    <button
                      onClick={saveProfile}
                      disabled={saveStatus === "saving"}
                      className="btn-gradient"
                      style={{ display: "flex", alignItems: "center", gap: "4px", padding: "5px 14px", fontSize: "12px" }}
                    >
                      {saveStatus === "saving"
                        ? <Loader2 size={12} style={{ animation: "spin 1s linear infinite" }} />
                        : <Save size={12} />}
                      {saveStatus === "saving" ? "Validating..." : "Save"}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setEditing(true)}
                    className="btn-ghost"
                    style={{ display: "flex", alignItems: "center", gap: "4px", padding: "5px 12px", fontSize: "12px" }}
                  >
                    <Edit3 size={12} /> Edit
                  </button>
                )}
              </div>
            }
          >
            {/* Status Messages */}
            {saveStatus === "success" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{
                display: "flex", alignItems: "center", gap: "8px",
                padding: "10px 14px", borderRadius: "8px", marginBottom: "16px",
                background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.2)",
              }}>
                <Check size={14} style={{ color: "var(--green-400)" }} />
                <span style={{ fontSize: "13px", color: "var(--green-400)" }}>
                  Profile saved! Go to Dashboard to see your stats.
                </span>
              </motion.div>
            )}
            {saveStatus === "error" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{
                display: "flex", alignItems: "flex-start", gap: "8px",
                padding: "10px 14px", borderRadius: "8px", marginBottom: "16px",
                background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)",
              }}>
                <AlertCircle size={14} style={{ color: "var(--red-400)", flexShrink: 0, marginTop: 1 }} />
                <span style={{ fontSize: "13px", color: "var(--red-400)", lineHeight: 1.5 }}>{errorMsg}</span>
              </motion.div>
            )}

            {/* CF Handle — most important field */}
            <div style={{ marginBottom: "16px" }}>
              <label style={{
                fontSize: "11px", fontWeight: 600, color: "var(--purple-300)",
                textTransform: "uppercase", letterSpacing: "0.06em",
                display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px",
              }}>
                🔵 Codeforces Handle
                <span style={{ color: "var(--red-400)", fontWeight: 700 }}>*</span>
                <span style={{
                  fontSize: "10px", color: "var(--text-disabled)", fontWeight: 400,
                  textTransform: "none", letterSpacing: "0",
                }}>
                  (your username on codeforces.com)
                </span>
              </label>
              <input
                className="input-glass"
                value={form.cf_handle}
                onChange={(e) => setForm((f) => ({ ...f, cf_handle: e.target.value.trim() }))}
                placeholder={editing ? "e.g. tourist, jiangly, your_handle" : form.cf_handle || "Not set"}
                disabled={!editing}
                style={{ opacity: editing ? 1 : 0.7, cursor: editing ? "text" : "default", fontSize: "14px" }}
              />
              {editing && (
                <p style={{ fontSize: "11px", color: "var(--text-disabled)", marginTop: "5px" }}>
                  Find it at: codeforces.com/profile/<strong style={{ color: "var(--text-muted)" }}>your-handle</strong>
                </p>
              )}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              {[
                { label: "LeetCode Username", key: "lc_username", placeholder: "your LeetCode username", icon: "🟡" },
                { label: "GitHub Username", key: "gh_username", placeholder: "your GitHub username", icon: "⚫" },
                { label: "Country", key: "country", placeholder: "e.g. India", icon: "🌍" },
                { label: "Institute / University", key: "institute", placeholder: "e.g. IIT Delhi", icon: "🏫" },
              ].map((field) => (
                <div key={field.key}>
                  <label style={{
                    fontSize: "11px", fontWeight: 600, color: "var(--text-muted)",
                    textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: "6px",
                  }}>
                    {field.icon} {field.label}
                  </label>
                  <input
                    className="input-glass"
                    value={(form as any)[field.key]}
                    onChange={(e) => setForm((f) => ({ ...f, [field.key]: e.target.value }))}
                    placeholder={editing ? field.placeholder : (form as any)[field.key] || "—"}
                    disabled={!editing}
                    style={{ opacity: editing ? 1 : 0.65, cursor: editing ? "text" : "default" }}
                  />
                </div>
              ))}

              <div style={{ gridColumn: "span 2" }}>
                <label style={{
                  fontSize: "11px", fontWeight: 600, color: "var(--text-muted)",
                  textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: "6px",
                }}>
                  ✏️ Bio
                </label>
                <textarea
                  className="input-glass"
                  value={form.bio}
                  onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                  placeholder={editing ? "Tell the world about your CP journey..." : form.bio || "—"}
                  disabled={!editing}
                  rows={3}
                  style={{
                    resize: "vertical", opacity: editing ? 1 : 0.65,
                    cursor: editing ? "text" : "default", fontFamily: "var(--font-sans)",
                  }}
                />
              </div>
            </div>
          </GlassCard>
        </div>
      </main>
    </div>
  )
}
