import type { Metadata } from "next"
import "./globals.css"
import Providers from "@/components/Providers"
import Footer from "@/components/layout/Footer"

export const metadata: Metadata = {
  title: "API Playground",
  description: "A lightweight API testing tool",
  openGraph: {
    title: "Tracie Ling Yan Ying API Playground",
    description: "JavaScript & Next.js engineer. View my projects and experience.",
    url: process.env.NEXT_PUBLIC_BASE_URL,
    siteName: "Tracie Ling Portfolio",
    type: "website",
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
        <Footer />
      </body>
    </html>
  )
}
