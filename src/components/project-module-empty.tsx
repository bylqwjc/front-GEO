"use client"

import Link from "next/link"
import { useCallback, useEffect, useState } from "react"
import { ActivityIcon, ArrowRightIcon, BarChart3Icon, FileSearchIcon, ListChecksIcon, ListFilterIcon } from "lucide-react"

import { ErrorState, LoadingState, ProjectHeader } from "@/components/project-shared"
import { Button } from "@/components/ui/button"
import { getProject, type Project } from "@/lib/project-api"

type ModuleName = "audits" | "reports" | "tasks" | "compare"

const moduleConfig = {
  audits: {
    title: "检测任务",
    icon: FileSearchIcon,
    emptyTitle: "还没有检测任务",
    description: "当前产品尚未发起真实 AI 可见度检测。先准备 Prompt 库，再创建检测。",
    actionLabel: "查看 Prompt 库",
    actionSuffix: "/queries",
  },
  reports: {
    title: "可见度报告",
    icon: BarChart3Icon,
    emptyTitle: "还没有可见度报告",
    description: "当前产品完成真实检测后，这里会展示只属于该产品的可见度结果。",
    actionLabel: "查看项目概览",
    actionSuffix: "",
  },
  tasks: {
    title: "优化任务",
    icon: ListChecksIcon,
    emptyTitle: "还没有优化任务",
    description: "完成真实检测并生成问题后，这里会只显示当前产品对应的优化任务。",
    actionLabel: "查看 Prompt 库",
    actionSuffix: "/queries",
  },
  compare: {
    title: "复测对比",
    icon: ActivityIcon,
    emptyTitle: "还没有复测记录",
    description: "当前产品完成基线检测和复测后，这里会展示两次检测的真实变化。",
    actionLabel: "查看项目概览",
    actionSuffix: "",
  },
} satisfies Record<ModuleName, {
  title: string
  icon: typeof ListChecksIcon
  emptyTitle: string
  description: string
  actionLabel: string
  actionSuffix: string
}>

export function ProjectModuleEmpty({ projectId, module }: { projectId: string; module: ModuleName }) {
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const config = moduleConfig[module]

  const load = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const response = await getProject(projectId)
      setProject(response.data)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "项目加载失败。")
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0)
    return () => window.clearTimeout(timer)
  }, [load])

  if (loading) return <LoadingState label={`正在加载${config.title}...`} />
  if (!project) return <div className="p-4 md:p-6"><ErrorState message={error || "项目不存在。"} retry={() => void load()} /></div>

  const ModuleIcon = config.icon
  return (
    <div className="@container/main flex flex-1 flex-col gap-5 p-4 md:p-6">
      <ProjectHeader project={project} />
      <section className="flex min-h-80 flex-col items-center justify-center gap-4 border-t p-8 text-center">
        <span className="flex size-10 items-center justify-center rounded-md bg-muted"><ModuleIcon className="size-5" /></span>
        <div><h3 className="font-medium">{project.name}：{config.emptyTitle}</h3><p className="mt-1 max-w-lg text-sm text-muted-foreground">{config.description}</p></div>
        <Button render={<Link href={`/projects/${project.id}${config.actionSuffix}`} />}><ListFilterIcon data-icon="inline-start" />{config.actionLabel}<ArrowRightIcon data-icon="inline-end" /></Button>
      </section>
    </div>
  )
}
