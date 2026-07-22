"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ActivityIcon, BarChart3Icon, CircleHelpIcon, FileSearchIcon, GaugeIcon, LibraryBigIcon, ListChecksIcon, PlusIcon, Settings2Icon, SparklesIcon } from "lucide-react"

import { NavUser } from "@/components/nav-user"
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
import { useLanguage } from "@/lib/i18n"

const navMain = [
  { title: "概览", url: "/", icon: GaugeIcon },
  { title: "检测任务", url: "/audit/audit-demo-001", icon: FileSearchIcon },
  { title: "可见度报告", url: "/report/demo-report", icon: BarChart3Icon },
  { title: "优化任务", url: "/tasks/audit-2026-0719", icon: ListChecksIcon },
  { title: "复测对比", url: "/compare/experiment-001", icon: ActivityIcon },
]

const navData = [
  { title: "Prompt 库", url: "/new#prompts", icon: LibraryBigIcon },
  { title: "品牌设置", url: "/settings", icon: Settings2Icon },
]

function isRouteActive(pathname: string, url: string) {
  if (url === "/") return pathname === "/" || pathname === "/dashboard"
  const routeRoot = url.split("#")[0].split("/").slice(0, 2).join("/")
  return pathname.startsWith(routeRoot)
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const { t } = useLanguage()

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu><SidebarMenuItem><SidebarMenuButton className="data-[slot=sidebar-menu-button]:p-1.5!" render={<Link href="/" />}><span className="flex size-7 items-center justify-center rounded-lg bg-foreground text-background"><SparklesIcon className="size-4!" /></span><span className="text-base font-semibold">GEO Pulse</span></SidebarMenuButton></SidebarMenuItem></SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent className="flex flex-col gap-2">
            <SidebarMenu><SidebarMenuItem><SidebarMenuButton className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground" render={<Link href="/new" />}><PlusIcon /><span>{t("新建检测")}</span></SidebarMenuButton></SidebarMenuItem></SidebarMenu>
            <SidebarMenu>
              {navMain.map((item) => <SidebarMenuItem key={item.title}><SidebarMenuButton tooltip={t(item.title)} isActive={isRouteActive(pathname, item.url)} render={<Link href={item.url} />}><item.icon /><span>{t(item.title)}</span></SidebarMenuButton></SidebarMenuItem>)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>{t("数据与设置")}</SidebarGroupLabel>
          <SidebarMenu>{navData.map((item) => <SidebarMenuItem key={item.title}><SidebarMenuButton tooltip={t(item.title)} isActive={isRouteActive(pathname, item.url)} render={<Link href={item.url} />}><item.icon /><span>{t(item.title)}</span></SidebarMenuButton></SidebarMenuItem>)}</SidebarMenu>
        </SidebarGroup>
        <SidebarGroup className="mt-auto"><SidebarMenu><SidebarMenuItem><SidebarMenuButton tooltip={t("帮助中心")}><CircleHelpIcon /><span>{t("帮助中心")}</span></SidebarMenuButton></SidebarMenuItem></SidebarMenu></SidebarGroup>
      </SidebarContent>
      <SidebarFooter><NavUser /></SidebarFooter>
    </Sidebar>
  )
}
