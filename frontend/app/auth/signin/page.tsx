"use client"

import { signIn } from "next-auth/react"
import { useState } from "react"
import { motion } from "framer-motion"
import { Code2, GitBranch, ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"

export default function SignInPage() {
  const [loading, setLoading] = useState<"google" | "github" | null>(null)

  const handleSignIn = async (provider: "google" | "github") => {
    setLoading(provider)
    await signIn(provider, { callbackUrl: "/dashboard" })
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg-base)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background glow effects */}
      <div style={{
        position: "absolute", top: "10%", left: "50%",
        transform: "translateX(-50%)",
        width: 600, height: 300,
        background: "radial-gradient(ellipse, rgba(124,58,237,0.15) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", bottom: "10%", right: "20%",
        width: 300, height: 300,
        background: "radial-gradient(ellipse, rgba(59,130,246,0.08) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      {/* Back to home */}
      <Link href="/" style={{
        position: "absolute", top: "24px", left: "24px",
        display: "flex", alignItems: "center", gap: "6px",
        fontSize: "13px", color: "var(--text-muted)",
        textDecoration: "none",
        transition: "color 0.2s ease",
      }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
      >
        <ArrowLeft size={14} /> Back to home
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          width: "100%",
          maxWidth: 400,
          background: "rgba(13,13,26,0.85)",
          border: "1px solid var(--border-default)",
          borderRadius: "var(--radius-xl)",
          padding: "40px",
          backdropFilter: "blur(24px)",
          boxShadow: "0 24px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(124,58,237,0.15)",
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{
            width: 56, height: 56,
            borderRadius: "16px",
            background: "var(--gradient-primary)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 16px",
            boxShadow: "0 8px 24px rgba(124,58,237,0.4)",
          }}>
            <Code2 size={28} color="white" strokeWidth={2.5} />
          </div>
          <h1 style={{
            fontSize: "22px", fontWeight: 800, letterSpacing: "-0.03em",
            background: "var(--gradient-primary)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            marginBottom: "8px",
          }}>
            Welcome to CP OS
          </h1>
          <p style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.6 }}>
            Your competitive programming operating system.<br />
            Sign in to start your journey.
          </p>
        </div>

        {/* Auth Buttons */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <motion.button
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => handleSignIn("google")}
            disabled={loading !== null}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
              padding: "13px",
              borderRadius: "12px",
              background: "white",
              border: "none",
              color: "#333",
              fontSize: "14px",
              fontWeight: 600,
              cursor: loading !== null ? "not-allowed" : "pointer",
              opacity: loading === "github" ? 0.5 : 1,
              fontFamily: "var(--font-sans)",
              transition: "all 0.2s ease",
              boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
            }}
          >
            {loading === "google" ? (
              <Loader2 size={18} style={{ animation: "spin 1s linear infinite", color: "#4285F4" }} />
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            Continue with Google
          </motion.button>

          <motion.button
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => handleSignIn("github")}
            disabled={loading !== null}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
              padding: "13px",
              borderRadius: "12px",
              background: "#24292e",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "white",
              fontSize: "14px",
              fontWeight: 600,
              cursor: loading !== null ? "not-allowed" : "pointer",
              opacity: loading === "google" ? 0.5 : 1,
              fontFamily: "var(--font-sans)",
              transition: "all 0.2s ease",
            }}
          >
            {loading === "github" ? (
              <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} />
            ) : (
              <GitBranch size={18} />
            )}
            Continue with GitHub
          </motion.button>
        </div>

        <div style={{
          marginTop: "24px",
          paddingTop: "24px",
          borderTop: "1px solid var(--border-subtle)",
          textAlign: "center",
          fontSize: "12px",
          color: "var(--text-disabled)",
          lineHeight: 1.6,
        }}>
          By signing in, you agree to our{" "}
          <span style={{ color: "var(--purple-300)", cursor: "pointer" }}>Terms of Service</span>
          {" "}and{" "}
          <span style={{ color: "var(--purple-300)", cursor: "pointer" }}>Privacy Policy</span>
        </div>
      </motion.div>

      {/* Floating particles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          animate={{
            y: [-10, 10, -10],
            x: [-5, 5, -5],
            opacity: [0.3, 0.7, 0.3],
          }}
          transition={{
            duration: 3 + i,
            repeat: Infinity,
            delay: i * 0.5,
            ease: "easeInOut",
          }}
          style={{
            position: "absolute",
            width: 4 + i * 2,
            height: 4 + i * 2,
            borderRadius: "50%",
            background: i % 2 === 0 ? "var(--purple-400)" : "var(--blue-400)",
            opacity: 0.4,
            top: `${15 + i * 12}%`,
            left: i < 3 ? `${5 + i * 5}%` : undefined,
            right: i >= 3 ? `${5 + (i - 3) * 5}%` : undefined,
            pointerEvents: "none",
          }}
        />
      ))}
    </div>
  )
}
