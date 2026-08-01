"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { ActivityIcon, BarChart3Icon, CircleHelpIcon, FileSearchIcon, FolderKanbanIcon, GaugeIcon, LibraryBigIcon, ListChecksIcon, PlusIcon, Settings2Icon, WalletCardsIcon } from "lucide-react"

import { NavUser } from "@/components/nav-user"
import { ACTIVE_PROJECT_CHANGE_EVENT, ACTIVE_PROJECT_STORAGE_KEY } from "@/components/project-shared"
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
import { useLanguage } from "@/lib/i18n"
import { listProjects } from "@/lib/project-api"

function projectPath(projectId: string | null, suffix = "") {
  return projectId ? `/projects/${projectId}${suffix}` : "/projects"
}

const navMain = [
  { title: "产品项目", url: () => "/projects", icon: FolderKanbanIcon, exact: true },
  { title: "概览", url: (projectId: string | null) => projectPath(projectId), icon: GaugeIcon, exact: true },
  { title: "检测任务", url: (projectId: string | null) => projectPath(projectId, "/audits"), icon: FileSearchIcon, exact: true },
  { title: "可见度报告", url: (projectId: string | null) => projectPath(projectId, "/reports"), icon: BarChart3Icon, exact: true },
  { title: "优化任务", url: (projectId: string | null) => projectPath(projectId, "/tasks"), icon: ListChecksIcon, exact: true },
  { title: "复测对比", url: (projectId: string | null) => projectPath(projectId, "/compare"), icon: ActivityIcon, exact: true },
]

const navData = [
  { title: "Prompt 库", url: (projectId: string | null) => projectPath(projectId, "/queries"), icon: LibraryBigIcon, exact: true },
  { title: "套餐与额度", url: () => "/billing", icon: WalletCardsIcon },
  { title: "品牌设置", url: (projectId: string | null) => projectPath(projectId, "/entity"), icon: Settings2Icon, exact: true },
]

function isRouteActive(pathname: string, url: string, exact = false) {
  if (exact) return pathname === url
  const routeRoot = url.split("#")[0].split("/").slice(0, 2).join("/")
  return pathname.startsWith(routeRoot)
}

function projectIdFromPath(pathname: string) {
  const [, section, id] = pathname.split("/")
  if (section === "projects" && id && id !== "new") return id
  if ((section === "tasks" || section === "compare") && id) return id
  return null
}


export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const { t } = useLanguage()
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const timer = window.setTimeout(async () => {
      try {
        const response = await listProjects()
        if (cancelled) return
        const routeProjectId = projectIdFromPath(pathname)
        const storedProjectId = window.localStorage.getItem(ACTIVE_PROJECT_STORAGE_KEY)
        const activeProject =
          response.data.find((project) => project.id === routeProjectId) ??
          response.data.find((project) => project.id === storedProjectId) ??
          response.data[0]
        setActiveProjectId(activeProject?.id ?? null)
        if (activeProject) window.localStorage.setItem(ACTIVE_PROJECT_STORAGE_KEY, activeProject.id)
      } catch {
        if (!cancelled) setActiveProjectId(null)
      }
    }, 0)
    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [pathname])

  useEffect(() => {
    function handleActiveProjectChange(event: Event) {
      const projectId = (event as CustomEvent<string | null>).detail
      setActiveProjectId(typeof projectId === "string" ? projectId : null)
    }
    window.addEventListener(ACTIVE_PROJECT_CHANGE_EVENT, handleActiveProjectChange)
    return () => window.removeEventListener(ACTIVE_PROJECT_CHANGE_EVENT, handleActiveProjectChange)
  }, [])

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader className="p-1">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="h-12 data-[slot=sidebar-menu-button]:px-1!" render={<Link href="/" aria-label="SEEN home" />}>
              <Image
                src="/kejian-seen-logo-web.png"
                alt="SEEN"
                width={1911}
                height={396}
                priority
                className="h-auto w-[176px]"
              />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent className="flex flex-col gap-2">
            <SidebarMenu><SidebarMenuItem><SidebarMenuButton className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground" render={<Link href="/projects/new" />}><PlusIcon /><span>{t("新建项目")}</span></SidebarMenuButton></SidebarMenuItem></SidebarMenu>
            <SidebarMenu>
              {navMain.map((item) => {
                const url = item.url(activeProjectId)
                return (
                  <SidebarMenuItem key={item.title}><SidebarMenuButton tooltip={t(item.title)} isActive={isRouteActive(pathname, url, item.exact)} render={<Link href={url} />}><item.icon /><span>{t(item.title)}</span></SidebarMenuButton></SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>{t("数据与设置")}</SidebarGroupLabel>
          <SidebarMenu>{navData.map((item) => {
            const url = item.url(activeProjectId)
            return (
              <SidebarMenuItem key={item.title}><SidebarMenuButton tooltip={t(item.title)} isActive={isRouteActive(pathname, url, item.exact)} render={<Link href={url} />}><item.icon /><span>{t(item.title)}</span></SidebarMenuButton></SidebarMenuItem>
            )
          })}</SidebarMenu>
        </SidebarGroup>
        <SidebarGroup className="mt-auto"><SidebarMenu><SidebarMenuItem><SidebarMenuButton tooltip={t("帮助中心")}><CircleHelpIcon /><span>{t("帮助中心")}</span></SidebarMenuButton></SidebarMenuItem></SidebarMenu></SidebarGroup>
      </SidebarContent>
      <SidebarFooter><NavUser /></SidebarFooter>
    </Sidebar>
  )
}
