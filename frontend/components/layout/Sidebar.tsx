"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { motion } from "framer-motion"
import {
  LayoutDashboard,
  BarChart3,
  Trophy,
  Users,
  CalendarDays,
  Calendar,
  Settings,
  LogOut,
  User,
  Zap,
  Code2,
  Bell,
  ChevronRight,
} from "lucide-react"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/contests", label: "Contests", icon: Trophy },
  { href: "/leaderboard", label: "Leaderboard", icon: Users },
  { href: "/calendar", label: "Calendar", icon: Calendar },
  { href: "/planner", label: "Planner", icon: CalendarDays },
  { href: "/profile", label: "Profile", icon: User },
  { href: "/settings", label: "Settings", icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()

  return (
    <aside
      style={{
        position: "fixed",
        left: 0,
        top: 0,
        height: "100vh",
        width: "var(--sidebar-width)",
        background: "rgba(7, 7, 17, 0.95)",
        borderRight: "1px solid var(--border-subtle)",
        display: "flex",
        flexDirection: "column",
        padding: "0",
        zIndex: 100,
        backdropFilter: "blur(20px)",
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: "20px 20px 16px",
          borderBottom: "1px solid var(--border-subtle)",
        }}
      >
        <Link href="/dashboard" style={{ textDecoration: "none" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "10px",
                background: "var(--gradient-primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Code2 size={20} color="white" strokeWidth={2.5} />
            </div>
            <div>
              <div
                style={{
                  fontSize: "15px",
                  fontWeight: 800,
                  background: "var(--gradient-primary)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  letterSpacing: "-0.03em",
                }}
              >
                CP OS
              </div>
              <div style={{ fontSize: "10px", color: "var(--text-muted)", letterSpacing: "0.05em", fontWeight: 500 }}>
                COMPETITIVE OS
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: "12px 12px", overflowY: "auto" }}>
        <div style={{ fontSize: "10px", color: "var(--text-disabled)", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "8px", padding: "0 8px" }}>
          Main
        </div>
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")

          return (
            <Link key={item.href} href={item.href} style={{ textDecoration: "none" }}>
              <motion.div
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "9px 10px",
                  borderRadius: "10px",
                  marginBottom: "2px",
                  cursor: "pointer",
                  background: isActive
                    ? "var(--bg-elevated)"
                    : "transparent",
                  border: isActive
                    ? "1px solid var(--border-default)"
                    : "1px solid transparent",
                  transition: "all 0.15s ease",
                  position: "relative",
                }}
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-active"
                    style={{
                      position: "absolute",
                      left: 0,
                      top: "20%",
                      height: "60%",
                      width: 3,
                      borderRadius: "0 3px 3px 0",
                      background: "var(--teal-500)",
                    }}
                  />
                )}
                <Icon
                  size={17}
                  style={{
                    color: isActive ? "var(--teal-400)" : "var(--text-muted)",
                    flexShrink: 0,
                  }}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                <span
                  style={{
                    fontSize: "13.5px",
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
                  }}
                >
                  {item.label}
                </span>
              </motion.div>
            </Link>
          )
        })}

        {/* Notifications link */}
        <div style={{ marginTop: "16px", fontSize: "10px", color: "var(--text-disabled)", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "8px", padding: "0 8px" }}>
          More
        </div>
        <Link href="/notifications" style={{ textDecoration: "none" }}>
          <motion.div
            whileHover={{ x: 2 }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "9px 10px",
              borderRadius: "10px",
              cursor: "pointer",
              transition: "all 0.15s ease",
              border: "1px solid transparent",
            }}
          >
            <Bell size={17} style={{ color: "var(--text-muted)" }} strokeWidth={2} />
            <span style={{ fontSize: "13.5px", color: "var(--text-secondary)", fontWeight: 400 }}>Notifications</span>
            <span style={{
              marginLeft: "auto",
              background: "var(--gradient-primary)",
              color: "white",
              fontSize: "10px",
              fontWeight: 700,
              padding: "1px 6px",
              borderRadius: "999px",
            }}>3</span>
          </motion.div>
        </Link>
      </nav>

      {/* User Section */}
      <div
        style={{
          padding: "12px",
          borderTop: "1px solid var(--border-subtle)",
        }}
      >
        {session?.user && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "10px",
              borderRadius: "10px",
              background: "rgba(210, 126, 100, 0.06)",
              border: "1px solid var(--border-subtle)",
              marginBottom: "8px",
            }}
          >
            {session.user.image ? (
              <img
                src={session.user.image}
                alt={session.user.name || "User"}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  border: "2px solid rgba(210, 126, 100, 0.45)",
                  flexShrink: 0,
                }}
              />
            ) : (
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: "var(--gradient-primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <User size={16} color="white" />
              </div>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {session.user.name?.split(" ")[0] || "User"}
              </div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {session.user.email}
              </div>
            </div>
          </div>
        )}

        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "9px 10px",
            borderRadius: "10px",
            background: "transparent",
            border: "1px solid transparent",
            cursor: "pointer",
            color: "var(--text-muted)",
            fontSize: "13.5px",
            fontFamily: "var(--font-sans)",
            transition: "all 0.15s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(248,113,113,0.08)"
            e.currentTarget.style.borderColor = "rgba(248,113,113,0.2)"
            e.currentTarget.style.color = "var(--red-400)"
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent"
            e.currentTarget.style.borderColor = "transparent"
            e.currentTarget.style.color = "var(--text-muted)"
          }}
        >
          <LogOut size={16} strokeWidth={2} />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
