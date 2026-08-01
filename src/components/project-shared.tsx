"use client"

import Link from "next/link"
import { useEffect } from "react"
import { usePathname } from "next/navigation"
import { ActivityIcon, AlertCircleIcon, ArrowLeftIcon, BarChart3Icon, DatabaseIcon, FileSearchIcon, FileTextIcon, FingerprintIcon, ListChecksIcon, ListFilterIcon, LoaderCircleIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Project } from "@/lib/project-api"
import { cn } from "@/lib/utils"

const statusConfig: Record<Project["status"], { label: string; className: string }> = {
  CONFIGURING: { label: "配置中", className: "border-amber-200 bg-amber-50 text-amber-800" },
  READY: { label: "已就绪", className: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  RUNNING: { label: "检测中", className: "border-blue-200 bg-blue-50 text-blue-700" },
  OPTIMIZING: { label: "优化中", className: "border-cyan-200 bg-cyan-50 text-cyan-700" },
  RETEST_READY: { label: "可复测", className: "border-teal-200 bg-teal-50 text-teal-700" },
  ARCHIVED: { label: "已归档", className: "bg-muted text-muted-foreground" },
}

export function ProjectStatusBadge({ status }: { status: Project["status"] }) {
  const config = statusConfig[status]
  return <Badge variant="outline" className={config.className}>{config.label}</Badge>
}

const tabs = [
  { segment: "", label: "项目概览", icon: DatabaseIcon },
  { segment: "pages", label: "页面快照", icon: FileTextIcon },
  { segment: "entity", label: "品牌设置", icon: FingerprintIcon },
  { segment: "queries", label: "Prompt 库", icon: ListFilterIcon },
  { segment: "tasks", label: "优化任务", icon: ListChecksIcon },
  { segment: "compare", label: "复测对比", icon: ActivityIcon },
  { segment: "audits", label: "\u4eba\u5de5 AI \u68c0\u6d4b", icon: FileSearchIcon },
  { segment: "reports", label: "\u53ef\u89c1\u5ea6\u62a5\u544a", icon: BarChart3Icon },
]

export const ACTIVE_PROJECT_STORAGE_KEY = "geo.activeProjectId"
export const ACTIVE_PROJECT_CHANGE_EVENT = "geo:active-project-change"

export function ProjectHeader({ project }: { project: Project }) {
  const pathname = usePathname()
  useEffect(() => {
    window.localStorage.setItem(ACTIVE_PROJECT_STORAGE_KEY, project.id)
    window.dispatchEvent(new CustomEvent(ACTIVE_PROJECT_CHANGE_EVENT, { detail: project.id }))
  }, [project.id])

  return (
    <div className="grid gap-4">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div className="min-w-0">
          <Button variant="ghost" size="sm" className="mb-2 -ml-2" render={<Link href="/projects" />}>
            <ArrowLeftIcon data-icon="inline-start" />返回项目
          </Button>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="truncate text-xl font-semibold">{project.name}</h2>
            <ProjectStatusBadge status={project.status} />
          </div>
          <p className="mt-1 truncate text-sm text-muted-foreground">{project.domain}</p>
        </div>
        <Button render={<Link href={`/projects/${project.id}/queries`} />}>
          <ListFilterIcon data-icon="inline-start" />管理问题机会
        </Button>
      </div>
      <nav className="flex gap-1 overflow-x-auto border-b" aria-label="项目工作区">
        {tabs.map((tab) => {
          const href = `/projects/${project.id}${tab.segment ? `/${tab.segment}` : ""}`
          const active = tab.segment ? pathname.startsWith(href) : pathname === href
          return (
            <Link
              key={tab.segment}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex h-10 shrink-0 items-center gap-2 border-b-2 px-3 text-sm transition-colors",
                active ? "border-foreground font-medium text-foreground" : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              <tab.icon className="size-4" />{tab.label}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

export function LoadingState({ label = "正在加载..." }: { label?: string }) {
  return <div className="flex min-h-48 items-center justify-center gap-2 text-sm text-muted-foreground"><LoaderCircleIcon className="size-4 animate-spin" />{label}</div>
}

export function ErrorState({ message, retry }: { message: string; retry?: () => void }) {
  return (
    <div role="alert" className="flex min-h-40 flex-col items-center justify-center gap-3 rounded-lg border border-rose-200 bg-rose-50 p-6 text-center text-rose-800">
      <AlertCircleIcon className="size-5" />
      <p className="max-w-xl text-sm">{message}</p>
      {retry ? <Button variant="outline" size="sm" onClick={retry}>重新加载</Button> : null}
    </div>
  )
}

export function stringList(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : []
}
