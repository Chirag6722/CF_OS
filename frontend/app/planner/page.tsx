"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useSession } from "next-auth/react"
import { motion, AnimatePresence } from "framer-motion"
import axios from "axios"
import { useState, useEffect } from "react"
import Sidebar from "@/components/layout/Sidebar"
import GlassCard from "@/components/ui/GlassCard"
import {
  CalendarDays, Sun, Sunset, Moon, CloudSun,
  Plus, Check, Trash2, Brain, Flame, ChevronRight,
} from "lucide-react"

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

type Block = "morning" | "afternoon" | "evening" | "night"
interface Task {
  id: string
  title: string
  type: string
  completed: boolean
  block?: Block
}

const blockConfig: Record<Block, { icon: typeof Sun; label: string; color: string; bg: string; border: string; time: string }> = {
  morning:   { icon: Sun,      label: "Morning",   color: "var(--yellow-400)", bg: "rgba(250,204,21,0.08)",  border: "rgba(250,204,21,0.2)",  time: "6 AM – 12 PM" },
  afternoon: { icon: CloudSun, label: "Afternoon",  color: "var(--orange-400)", bg: "rgba(251,146,60,0.08)",  border: "rgba(251,146,60,0.2)",  time: "12 PM – 5 PM" },
  evening:   { icon: Sunset,   label: "Evening",   color: "var(--purple-300)", bg: "rgba(124,58,237,0.08)",  border: "rgba(124,58,237,0.2)",  time: "5 PM – 9 PM" },
  night:     { icon: Moon,     label: "Night",     color: "var(--blue-400)",   bg: "rgba(59,130,246,0.08)",  border: "rgba(59,130,246,0.2)",  time: "9 PM – 12 AM" },
}

const typeColors: Record<string, string> = {
  practice:    "var(--purple-300)",
  learning:    "var(--blue-400)",
  upsolve:     "var(--cyan-400)",
  editorial:   "var(--green-400)",
  planning:    "var(--yellow-400)",
  review:      "var(--orange-400)",
  custom:      "var(--text-muted)",
}

function TaskItem({ task, onToggle, onDelete }: { task: Task; onToggle: () => void; onDelete: () => void }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      transition={{ duration: 0.2 }}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "10px 12px",
        borderRadius: "10px",
        background: task.completed ? "rgba(74,222,128,0.04)" : "rgba(13,13,26,0.4)",
        border: `1px solid ${task.completed ? "rgba(74,222,128,0.15)" : "var(--border-subtle)"}`,
        marginBottom: "6px",
        cursor: "default",
        transition: "all 0.2s ease",
      }}
    >
      <button
        onClick={onToggle}
        style={{
          width: 20,
          height: 20,
          borderRadius: "6px",
          border: `2px solid ${task.completed ? "var(--green-500)" : "var(--border-default)"}`,
          background: task.completed ? "var(--green-500)" : "transparent",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          transition: "all 0.15s ease",
        }}
      >
        {task.completed && <Check size={11} color="white" strokeWidth={3} />}
      </button>
      <span
        style={{
          flex: 1,
          fontSize: "13px",
          color: task.completed ? "var(--text-muted)" : "var(--text-primary)",
          textDecoration: task.completed ? "line-through" : "none",
          transition: "all 0.2s ease",
        }}
      >
        {task.title}
      </span>
      {task.type && (
        <span
          style={{
            fontSize: "10px",
            fontWeight: 600,
            color: typeColors[task.type] || "var(--text-muted)",
            background: "rgba(0,0,0,0.2)",
            padding: "2px 7px",
            borderRadius: "999px",
            textTransform: "uppercase",
            letterSpacing: "0.04em",
            flexShrink: 0,
          }}
        >
          {task.type}
        </span>
      )}
      <button
        onClick={onDelete}
        style={{
          background: "transparent",
          border: "none",
          cursor: "pointer",
          color: "var(--text-disabled)",
          padding: "2px",
          borderRadius: "4px",
          display: "flex",
          alignItems: "center",
          flexShrink: 0,
          transition: "color 0.15s ease",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "var(--red-400)")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-disabled)")}
      >
        <Trash2 size={12} />
      </button>
    </motion.div>
  )
}

function BlockSection({
  block,
  tasks,
  onToggle,
  onDelete,
  onAdd,
}: {
  block: Block
  tasks: Task[]
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  onAdd: (block: Block, title: string) => void
}) {
  const cfg = blockConfig[block]
  const Icon = cfg.icon
  const [inputOpen, setInputOpen] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState("")
  const completed = tasks.filter((t) => t.completed).length
  const progress = tasks.length > 0 ? (completed / tasks.length) * 100 : 0

  const handleAdd = () => {
    if (newTaskTitle.trim()) {
      onAdd(block, newTaskTitle.trim())
      setNewTaskTitle("")
      setInputOpen(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border-default)",
        borderRadius: "var(--radius-md)",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "14px 16px",
          background: "var(--bg-elevated)",
          borderBottom: "1px solid var(--border-default)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Icon size={16} style={{ color: cfg.color }} />
          <span style={{ fontWeight: 700, fontSize: "14px", color: cfg.color }}>{cfg.label}</span>
          <span style={{ fontSize: "11px", color: "var(--text-disabled)" }}>{cfg.time}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
            {completed}/{tasks.length}
          </span>
          <div
            style={{
              width: 60,
              height: 4,
              borderRadius: "999px",
              background: "rgba(0,0,0,0.2)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${progress}%`,
                height: "100%",
                background: cfg.color,
                borderRadius: "999px",
                transition: "width 0.3s ease",
              }}
            />
          </div>
        </div>
      </div>

      {/* Tasks */}
      <div style={{ padding: "12px" }}>
        <AnimatePresence>
          {tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={() => onToggle(task.id)}
              onDelete={() => onDelete(task.id)}
            />
          ))}
        </AnimatePresence>

        {/* Add Task */}
        {inputOpen ? (
          <div style={{ display: "flex", gap: "6px", marginTop: "6px" }}>
            <input
              className="input-glass"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="Task title..."
              autoFocus
              onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); if (e.key === "Escape") setInputOpen(false) }}
              style={{ fontSize: "13px", padding: "7px 12px" }}
            />
            <button
              onClick={handleAdd}
              className="btn-gradient"
              style={{ padding: "7px 12px", fontSize: "12px", flexShrink: 0 }}
            >
              Add
            </button>
          </div>
        ) : (
          <button
            onClick={() => setInputOpen(true)}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "7px 10px",
              borderRadius: "8px",
              background: "transparent",
              border: "1px dashed var(--border-subtle)",
              color: "var(--text-disabled)",
              fontSize: "12px",
              cursor: "pointer",
              fontFamily: "var(--font-sans)",
              marginTop: "6px",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = cfg.border
              e.currentTarget.style.color = cfg.color
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--border-subtle)"
              e.currentTarget.style.color = "var(--text-disabled)"
            }}
          >
            <Plus size={12} /> Add task
          </button>
        )}
      </div>
    </motion.div>
  )
}

export default function PlannerPage() {
  const { data: session } = useSession()
  const [cfHandle, setCfHandle] = useState<string | null>(null)
  const [tasks, setTasks] = useState<Record<Block, Task[]>>({
    morning: [],
    afternoon: [],
    evening: [],
    night: [],
  })

  const { data: userProfile } = useQuery({
    queryKey: ["user-profile-planner", session?.user?.email],
    queryFn: () => axios.get(`${API}/api/users/me?email=${session?.user?.email}`).then((r) => r.data),
    enabled: !!session?.user?.email,
  })

  const [rating, setRating] = useState(0)
  useEffect(() => {
    if (userProfile?.profile?.cf_handle) setCfHandle(userProfile.profile.cf_handle)
  }, [userProfile])

  // Fetch plan from backend
  const { data: planData, isLoading } = useQuery({
    queryKey: ["planner-today", rating],
    queryFn: () => axios.get(`${API}/api/planner/today?rating=${rating}`).then((r) => r.data),
    staleTime: 60 * 60 * 1000, // 1 hour
  })

  useEffect(() => {
    if (planData) {
      setTasks({
        morning:   (planData.morning   || []).map((t: Task) => ({ ...t, block: "morning" })),
        afternoon: (planData.afternoon || []).map((t: Task) => ({ ...t, block: "afternoon" })),
        evening:   (planData.evening   || []).map((t: Task) => ({ ...t, block: "evening" })),
        night:     (planData.night     || []).map((t: Task) => ({ ...t, block: "night" })),
      })
    }
  }, [planData])

  // Fetch CF rating
  useQuery({
    queryKey: ["cf-rating-planner", cfHandle],
    queryFn: async () => {
      const r = await axios.get(`${API}/api/codeforces/${cfHandle}/profile`)
      setRating(r.data.rating || 0)
      return r.data
    },
    enabled: !!cfHandle,
  })

  const toggleTask = (block: Block, id: string) => {
    setTasks((prev) => ({
      ...prev,
      [block]: prev[block].map((t) => t.id === id ? { ...t, completed: !t.completed } : t),
    }))
  }

  const deleteTask = (block: Block, id: string) => {
    setTasks((prev) => ({
      ...prev,
      [block]: prev[block].filter((t) => t.id !== id),
    }))
  }

  const addTask = (block: Block, title: string) => {
    const newTask: Task = {
      id: `custom-${Date.now()}`,
      title,
      type: "custom",
      completed: false,
      block,
    }
    setTasks((prev) => ({ ...prev, [block]: [...prev[block], newTask] }))
  }

  const allTasks = Object.values(tasks).flat()
  const totalCompleted = allTasks.filter((t) => t.completed).length
  const totalTasks = allTasks.length
  const overallProgress = totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long", year: "numeric"
  })

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: "24px" }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <h1 style={{
                fontSize: "26px", fontWeight: 800, letterSpacing: "-0.03em",
                background: "var(--gradient-primary)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                marginBottom: "4px",
              }}>
                Daily Planner
              </h1>
              <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>{today}</p>
            </div>

            {/* Progress Ring */}
            <div style={{
              display: "flex", alignItems: "center", gap: "12px",
              background: "rgba(13,13,26,0.7)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-md)",
              padding: "12px 20px",
              backdropFilter: "blur(12px)",
            }}>
              <div style={{ position: "relative", width: 48, height: 48 }}>
                <svg width="48" height="48" viewBox="0 0 48 48">
                  <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(124,58,237,0.1)" strokeWidth="4" />
                  <circle
                    cx="24" cy="24" r="20"
                    fill="none"
                    stroke="url(#progGrad)"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 20}`}
                    strokeDashoffset={`${2 * Math.PI * 20 * (1 - overallProgress / 100)}`}
                    transform="rotate(-90 24 24)"
                    style={{ transition: "stroke-dashoffset 0.5s ease" }}
                  />
                  <defs>
                    <linearGradient id="progGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#7C3AED" />
                      <stop offset="100%" stopColor="#3B82F6" />
                    </linearGradient>
                  </defs>
                </svg>
                <div style={{
                  position: "absolute", top: "50%", left: "50%",
                  transform: "translate(-50%, -50%)",
                  fontSize: "11px", fontWeight: 800, color: "var(--text-primary)",
                }}>
                  {overallProgress}%
                </div>
              </div>
              <div>
                <div style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>
                  {totalCompleted}/{totalTasks}
                </div>
                <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Tasks done</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* AI Coach Banner */}
        {planData && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            style={{
              padding: "14px 18px",
              background: "linear-gradient(135deg, rgba(124,58,237,0.12) 0%, rgba(59,130,246,0.08) 100%)",
              border: "1px solid rgba(124,58,237,0.25)",
              borderRadius: "var(--radius-md)",
              marginBottom: "20px",
              display: "flex",
              alignItems: "flex-start",
              gap: "12px",
            }}
          >
            <Brain size={18} style={{ color: "var(--purple-300)", flexShrink: 0, marginTop: 2 }} />
            <div>
              <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "2px" }}>
                {planData.motivation}
              </div>
              <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                Today's focus: <strong style={{ color: "var(--purple-300)" }}>{planData.focus}</strong> · Algorithm: {planData.algorithm_of_day}
              </div>
            </div>
          </motion.div>
        )}

        {/* Planner Grid */}
        {isLoading ? (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            {Array(4).fill(0).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 260, borderRadius: "var(--radius-lg)" }} />
            ))}
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            {(["morning", "afternoon", "evening", "night"] as Block[]).map((block) => (
              <BlockSection
                key={block}
                block={block}
                tasks={tasks[block]}
                onToggle={(id) => toggleTask(block, id)}
                onDelete={(id) => deleteTask(block, id)}
                onAdd={addTask}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
