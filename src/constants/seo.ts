export const DEFAULT_SEO = {
  title: "Next.js App",
  description: "A Next.js application",
  siteName: "Next.js App",
  locale: "en_US",
  type: "website",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://example.com",
  twitterHandle: "@example",
  keywords: ["nextjs", "react", "typescript"] as string[],
} as const;
