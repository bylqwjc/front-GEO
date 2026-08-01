"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { LoaderCircleIcon } from "lucide-react"

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { useAuth } from "@/lib/auth"

const authRoutes = new Set(["/login", "/register"])

export function AppFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, loading } = useAuth()
  const isAuthRoute = authRoutes.has(pathname)

  useEffect(() => {
    if (!loading && !user && !isAuthRoute) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`)
    }
  }, [isAuthRoute, loading, pathname, router, user])

  if (isAuthRoute) {
    return <main className="min-h-svh bg-muted/30">{children}</main>
  }

  if (loading || !user) {
    return (
      <main className="flex min-h-svh items-center justify-center bg-background">
        <LoaderCircleIcon className="size-5 animate-spin text-muted-foreground" aria-label="正在验证登录状态" />
      </main>
    )
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 64)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset className="overflow-hidden">
        <SiteHeader />
        <main className="flex min-h-0 flex-1 flex-col">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
