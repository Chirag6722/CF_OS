"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { motion } from "framer-motion"
import Sidebar from "@/components/layout/Sidebar"
import GreetingHeader from "@/components/ui/GreetingHeader"
import GlassCard from "@/components/ui/GlassCard"
import {
  Calendar as CalendarIcon, ChevronLeft, ChevronRight, Download,
  ExternalLink, Share2, Plus, Info, Globe, AlertCircle
} from "lucide-react"

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [platformFilter, setPlatformFilter] = useState("all")

  // Fetch upcoming contests
  const { data: contestsData, isLoading } = useQuery({
    queryKey: ["upcoming-contests-calendar"],
    queryFn: () => fetch("/api/contests?platform=all").then((r) => r.json()),
    staleTime: 5 * 60 * 1000,
  })

  const contests = contestsData?.contests || []
  const filteredContests = contests.filter((c: any) => {
    if (platformFilter === "all") return true
    return (c.platform || "").toLowerCase().includes(platformFilter)
  })

  // Month navigation helpers
  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  // Get start day of month and total days
  const firstDayIndex = new Date(year, month, 1).getDay()
  const totalDays = new Date(year, month + 1, 0).getDate()
  const prevMonthTotalDays = new Date(year, month, 0).getDate()

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]

  // Generate Google Calendar Link for a single contest
  const makeGoogleCalendarLink = (contest: any) => {
    const start = new Date(contest.start_time)
    const durationSecs = contest.duration_secs || 7200
    const end = new Date(start.getTime() + durationSecs * 1000)

    const formatGCalDate = (date: Date) => {
      return date.toISOString().replace(/-|:|\.\d\d\d/g, "")
    }

    const title = encodeURIComponent(contest.name)
    const dates = `${formatGCalDate(start)}/${formatGCalDate(end)}`
    const details = encodeURIComponent(`Contest details tracked via CP OS.\nLink: ${contest.url || ""}`)
    const location = encodeURIComponent(contest.platform || "Competitive Programming Platform")

    return `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=${location}&sf=true&output=xml`
  }

  // Generate ICS file for download
  const handleDownloadICS = () => {
    if (contests.length === 0) return

    let icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//CP OS//Contest Calendar//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH"
    ]

    contests.forEach((c: any, i: number) => {
      const start = new Date(c.start_time)
      const durationSecs = c.duration_secs || 7200
      const end = new Date(start.getTime() + durationSecs * 1000)

      const formatICSDate = (date: Date) => {
        return date.toISOString().replace(/-|:|\.\d\d\d/g, "")
      }

      icsContent.push(
        "BEGIN:VEVENT",
        `UID:cpos-contest-${c.platform}-${i}@sys`,
        `DTSTART:${formatICSDate(start)}`,
        `DTEND:${formatICSDate(end)}`,
        `SUMMARY:${c.name}`,
        `DESCRIPTION:Platform: ${c.platform}\\nLink: ${c.url || ""}`,
        `LOCATION:${c.platform}`,
        "END:VEVENT"
      )
    })

    icsContent.push("END:VCALENDAR")
    
    const blob = new Blob([icsContent.join("\r\n")], { type: "text/calendar;charset=utf-8" })
    const link = document.createElement("a")
    link.href = window.URL.createObjectURL(blob)
    link.setAttribute("download", "cp-os-contests.ics")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Create grid cells (previous month overlap + current month + next month overlap)
  const cells: { day: number; currentMonth: boolean; date: Date }[] = []

  // Prev month cells
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const day = prevMonthTotalDays - i
    const date = new Date(year, month - 1, day)
    cells.push({ day, currentMonth: false, date })
  }

  // Current month cells
  for (let i = 1; i <= totalDays; i++) {
    const date = new Date(year, month, i)
    cells.push({ day: i, currentMonth: true, date })
  }

  // Next month cells (fill up grid to multiples of 7)
  const remaining = 42 - cells.length
  for (let i = 1; i <= remaining; i++) {
    const date = new Date(year, month + 1, i)
    cells.push({ day: i, currentMonth: false, date })
  }

  // Filter contests starting on a given date
  const getContestsForDate = (date: Date) => {
    return filteredContests.filter((c: any) => {
      const cStart = new Date(c.start_time)
      return (
        cStart.getFullYear() === date.getFullYear() &&
        cStart.getMonth() === date.getMonth() &&
        cStart.getDate() === date.getDate()
      )
    })
  }

  const getPlatformColor = (platform: string) => {
    const p = platform.toLowerCase()
    if (p.includes("codeforces")) return "var(--teal-500)"
    if (p.includes("leetcode")) return "var(--yellow-400)"
    if (p.includes("atcoder")) return "#ef4444"
    return "var(--blue-400)"
  }

  // Loading skeletons
  const renderLoading = () => (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <GreetingHeader />
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
          <div className="skeleton" style={{ width: 150, height: 28 }} />
          <div className="skeleton" style={{ width: 220, height: 16 }} />
        </div>
        <div className="skeleton" style={{ height: 450, borderRadius: "var(--radius-lg)" }} />
      </main>
    </div>
  )

  if (isLoading) return renderLoading()

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <GreetingHeader />

        {/* Header Navigation */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
          <div>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "8px" }}>
              <CalendarIcon size={22} style={{ color: "var(--teal-500)" }} /> Contest Calendar
            </h1>
            <p style={{ fontSize: "13.5px", color: "var(--text-muted)", marginTop: "4px" }}>
              Stay on top of contest schedules. Click calendar nodes to sync to Google Calendar.
            </p>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={handleDownloadICS}
              disabled={contests.length === 0}
              className="btn-ghost"
              style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", padding: "8px 16px" }}
            >
              <Download size={14} /> Export ICS File
            </button>
            
            <div style={{ display: "flex", alignItems: "center", background: "var(--bg-surface)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-md)" }}>
              <button onClick={handlePrevMonth} style={{ background: "none", border: "none", color: "var(--text-primary)", padding: "8px", cursor: "pointer" }}>
                <ChevronLeft size={16} />
              </button>
              <span style={{ fontSize: "13.5px", fontWeight: 700, padding: "0 12px", minWidth: "120px", textAlign: "center", color: "var(--text-primary)" }}>
                {monthNames[month]} {year}
              </span>
              <button onClick={handleNextMonth} style={{ background: "none", border: "none", color: "var(--text-primary)", padding: "8px", cursor: "pointer" }}>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Platform Filters */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
          {[
            { id: "all", label: "All Platforms" },
            { id: "codeforces", label: "Codeforces" },
            { id: "leetcode", label: "LeetCode" },
            { id: "atcoder", label: "AtCoder" }
          ].map((tab) => {
            const isActive = platformFilter === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setPlatformFilter(tab.id)}
                style={{
                  fontSize: "12px",
                  padding: "6px 14px",
                  borderRadius: "999px",
                  background: isActive ? "rgba(245, 124, 6, 0.08)" : "transparent",
                  border: `1px solid ${isActive ? "var(--teal-500)" : "var(--border-default)"}`,
                  color: isActive ? "var(--teal-500)" : "var(--text-secondary)",
                  cursor: "pointer",
                  fontWeight: isActive ? 600 : 500,
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.borderColor = "var(--text-muted)"
                    e.currentTarget.style.color = "var(--text-primary)"
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.borderColor = "var(--border-default)"
                    e.currentTarget.style.color = "var(--text-secondary)"
                  }
                }}
              >
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* ── Monthly Grid ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            border: "1px solid var(--border-default)",
            borderRadius: "var(--radius-lg)",
            overflow: "hidden",
            background: "var(--bg-surface)",
          }}
        >
          {/* Day Names */}
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((dayName) => (
            <div
              key={dayName}
              style={{
                padding: "10px",
                textAlign: "center",
                fontWeight: 600,
                fontSize: "12px",
                color: "var(--text-muted)",
                background: "var(--bg-elevated)",
                borderBottom: "1px solid var(--border-default)",
              }}
            >
              {dayName}
            </div>
          ))}

          {/* Calendar Cells */}
          {cells.map((cell, idx) => {
            const dateContests = getContestsForDate(cell.date)
            const isToday =
              new Date().getFullYear() === cell.date.getFullYear() &&
              new Date().getMonth() === cell.date.getMonth() &&
              new Date().getDate() === cell.date.getDate()

            return (
              <div
                key={idx}
                style={{
                  minHeight: "100px",
                  padding: "6px 8px",
                  background: isToday
                    ? "rgba(245, 124, 6, 0.02)"
                    : cell.currentMonth
                    ? "transparent"
                    : "rgba(255, 255, 255, 0.01)",
                  borderRight: (idx + 1) % 7 === 0 ? "none" : "1px solid var(--border-subtle)",
                  borderBottom: idx >= 35 ? "none" : "1px solid var(--border-subtle)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px",
                }}
              >
                {/* Day Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: isToday ? 800 : 500,
                      color: isToday
                        ? "var(--teal-500)"
                        : cell.currentMonth
                        ? "var(--text-primary)"
                        : "var(--text-disabled)",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    {cell.day}
                  </span>
                  {isToday && (
                    <span style={{ fontSize: "9px", background: "var(--teal-500)", color: "var(--bg-base)", padding: "1px 4px", borderRadius: "3px", fontWeight: 700 }}>
                      today
                    </span>
                  )}
                </div>

                {/* Contests List */}
                <div style={{ display: "flex", flexDirection: "column", gap: "3px", overflow: "hidden", marginTop: "2px" }}>
                  {dateContests.map((c: any, cIdx: number) => {
                    const localTime = new Date(c.start_time).toLocaleTimeString("en-IN", {
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true
                    })
                    const gcalLink = makeGoogleCalendarLink(c)

                    return (
                      <div
                        key={cIdx}
                        style={{
                          background: "var(--bg-elevated)",
                          border: "1px solid var(--border-default)",
                          borderRadius: "var(--radius-sm)",
                          padding: "3px 6px",
                          fontSize: "10.5px",
                          display: "flex",
                          flexDirection: "column",
                          gap: "1px",
                          position: "relative",
                          borderLeft: `2.5px solid ${getPlatformColor(c.platform)}`,
                        }}
                      >
                        <div style={{ fontWeight: 600, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {c.name}
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: "var(--text-muted)" }}>
                          <span>{localTime}</span>
                          <a
                            href={gcalLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              color: "var(--text-muted)",
                              cursor: "pointer",
                              textDecoration: "none"
                            }}
                            title="Add to Google Calendar"
                            onMouseEnter={(e) => e.currentTarget.style.color = "var(--teal-500)"}
                            onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-muted)"}
                          >
                            <Plus size={11} />
                          </a>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}
