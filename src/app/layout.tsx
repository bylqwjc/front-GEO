import type { Metadata } from "next"
import { Geist } from "next/font/google"

import { AppFrame } from "@/components/app-frame"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { AuthProvider } from "@/lib/auth"
import { LanguageProvider } from "@/lib/i18n"
import { cn } from "@/lib/utils"

import "./globals.css"

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" })

export const metadata: Metadata = {
  title: "GEO Pulse · AI Visibility",
  description: "Monitor brand mentions, recommendations, and citations in AI search.",
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN" className={cn("font-sans", geist.variable)} suppressHydrationWarning>
      <body>
        <LanguageProvider>
          <AuthProvider>
            <TooltipProvider>
              <AppFrame>{children}</AppFrame>
            </TooltipProvider>
          </AuthProvider>
          <Toaster />
        </LanguageProvider>
      </body>
    </html>
  )
}
