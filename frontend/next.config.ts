import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "codeforces.org" },
      { protocol: "https", hostname: "codeforces.com" },
      { protocol: "https", hostname: "userpic.codeforces.org" },
    ],
  },
};

export default nextConfig;
