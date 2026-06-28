"use client"

import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Suspense } from "react"
import { AlertCircle, ArrowLeft } from "lucide-react"

const errorMessages: Record<string, string> = {
  Configuration: "There is a problem with the server configuration.",
  AccessDenied: "You do not have permission to sign in.",
  Verification: "The sign in link is no longer valid.",
  OAuthSignin: "Could not sign in with this OAuth provider.",
  OAuthCallback: "Could not complete the OAuth sign in. Make sure the redirect URL is correctly configured.",
  OAuthCreateAccount: "Could not create an account for this OAuth user.",
  EmailCreateAccount: "Could not create an account for this email address.",
  Callback: "There was an error in the authentication callback.",
  Default: "An unexpected authentication error occurred.",
}

function AuthErrorContent() {
  const params = useSearchParams()
  const error = params.get("error") || "Default"
  const message = errorMessages[error] || errorMessages.Default

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--bg-primary, #111010)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'Poppins', sans-serif",
      padding: "24px",
    }}>
      <div style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(239,68,68,0.3)",
        borderRadius: "20px",
        padding: "48px",
        maxWidth: "480px",
        width: "100%",
        textAlign: "center",
      }}>
        <div style={{
          width: "64px", height: "64px",
          borderRadius: "50%",
          background: "rgba(239,68,68,0.15)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 24px",
        }}>
          <AlertCircle size={32} color="#ef4444" />
        </div>

        <h1 style={{
          fontSize: "22px", fontWeight: 700, color: "#fff",
          marginBottom: "12px", letterSpacing: "-0.02em",
        }}>
          Authentication Error
        </h1>

        <p style={{
          color: "rgba(255,255,255,0.55)", fontSize: "14px",
          lineHeight: 1.6, marginBottom: "8px",
        }}>
          {message}
        </p>

        <p style={{
          color: "rgba(255,255,255,0.3)", fontSize: "12px",
          marginBottom: "32px",
        }}>
          Error code: <code style={{ color: "#ef4444" }}>{error}</code>
        </p>

        <Link href="/auth/signin" style={{
          display: "inline-flex", alignItems: "center", gap: "8px",
          background: "linear-gradient(135deg, #f57c06, #e06600)",
          color: "#fff", padding: "12px 28px",
          borderRadius: "10px", textDecoration: "none",
          fontWeight: 600, fontSize: "14px",
        }}>
          <ArrowLeft size={16} /> Try Again
        </Link>
      </div>
    </div>
  )
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "#111010" }} />}>
      <AuthErrorContent />
    </Suspense>
  )
}
