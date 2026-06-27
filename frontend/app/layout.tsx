import type { Metadata } from "next"
import "./globals.css"
import { Providers } from "./providers"

export const metadata: Metadata = {
  title: "CP OS — Competitive Programming OS",
  description: "The all-in-one platform for competitive programmers. Track ratings, analyze performance, and stay consistent with AI-powered guidance.",
  keywords: ["competitive programming", "codeforces", "leetcode", "atcoder", "ICPC", "CP OS"],
  authors: [{ name: "CP OS Team" }],
  openGraph: {
    title: "CP OS — Competitive Programming OS",
    description: "The all-in-one platform for competitive programmers.",
    type: "website",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
