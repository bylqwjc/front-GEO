"use client"

import Link from "next/link"
import { useCallback, useEffect, useState } from "react"
import { ArrowRightIcon, BotIcon, FileTextIcon, FingerprintIcon, ListFilterIcon, RadarIcon } from "lucide-react"

import { ErrorState, LoadingState, ProjectHeader } from "@/components/project-shared"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getProject, type Project } from "@/lib/project-api"

export function ProjectOverview({ projectId }: { projectId: string }) {
  const [project, setProject] = useState<Project | null>(null)
  const [error, setError] = useState("")

  const load = useCallback(async () => {
    setError("")
    try { setProject((await getProject(projectId)).data) } catch (loadError) { setError(loadError instanceof Error ? loadError.message : "项目加载失败。") }
  }, [projectId])

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0)
    return () => window.clearTimeout(timer)
  }, [load])
  if (error) return <div className="p-4 md:p-6"><ErrorState message={error} retry={() => void load()} /></div>
  if (!project) return <LoadingState label="正在加载项目..." />

  const latestCrawl = project.crawlRuns[0]
  const latestProfile = project.entityProfiles[0]
  const milestones = [
    { label: "页面快照", value: project._count.sourcePages, href: `/projects/${project.id}/pages`, icon: FileTextIcon, ready: project._count.sourcePages > 0 },
    { label: "画像版本", value: latestProfile?.version ?? 0, href: `/projects/${project.id}/entity`, icon: FingerprintIcon, ready: Boolean(latestProfile) },
    { label: "问题机会", value: project._count.queryOpportunities, href: `/projects/${project.id}/queries`, icon: ListFilterIcon, ready: project._count.queryOpportunities >= 20 },
    { label: "检测批次", value: project._count.audits, href: "/new", icon: BotIcon, ready: project._count.audits > 0 },
  ]

  return (
    <div className="@container/main flex flex-1 flex-col gap-5 p-4 md:p-6">
      <ProjectHeader project={project} />
      <section className="grid grid-cols-2 gap-3 @4xl/main:grid-cols-4" aria-label="项目进度">
        {milestones.map((item) => <Card key={item.label} className="gap-3 rounded-lg shadow-none"><CardHeader><CardDescription>{item.label}</CardDescription><CardTitle className="text-2xl tabular-nums">{item.value}</CardTitle></CardHeader><CardContent className="flex items-center justify-between"><Badge variant="outline" className={item.ready ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "bg-muted text-muted-foreground"}>{item.ready ? "已就绪" : "待完成"}</Badge><Button variant="ghost" size="icon-sm" render={<Link href={item.href} />}><ArrowRightIcon /></Button></CardContent></Card>)}
      </section>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="rounded-lg shadow-none"><CardHeader><CardTitle>项目资料</CardTitle><CardDescription>创建于 {new Date(project.createdAt).toLocaleDateString("zh-CN")}</CardDescription></CardHeader><CardContent><dl className="grid gap-0 text-sm"><div className="grid grid-cols-[88px_1fr] gap-3 border-b py-3"><dt className="text-muted-foreground">官网</dt><dd className="truncate">{project.domain}</dd></div><div className="grid grid-cols-[88px_1fr] gap-3 border-b py-3"><dt className="text-muted-foreground">品类</dt><dd>{project.category || "未填写"}</dd></div><div className="grid grid-cols-[88px_1fr] gap-3 border-b py-3"><dt className="text-muted-foreground">目标用户</dt><dd>{project.audience || "未填写"}</dd></div><div className="grid grid-cols-[88px_1fr] gap-3 py-3"><dt className="text-muted-foreground">转化目标</dt><dd>{project.conversionGoal || "未填写"}</dd></div></dl></CardContent></Card>
        <Card className="rounded-lg shadow-none"><CardHeader><CardTitle>官网读取</CardTitle><CardDescription>最近一次抓取批次</CardDescription></CardHeader><CardContent className="grid gap-4">{latestCrawl ? <><div className="flex items-center justify-between rounded-lg border p-3"><div className="flex items-center gap-3"><RadarIcon className="size-5 text-emerald-700" /><div><p className="text-sm font-medium">{latestCrawl.status}</p><p className="text-xs text-muted-foreground">成功 {latestCrawl.completedPages} · 失败 {latestCrawl.failedPages}</p></div></div><span className="text-xs text-muted-foreground">{new Date(latestCrawl.createdAt).toLocaleString("zh-CN")}</span></div>{latestCrawl.errorMessage ? <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">{latestCrawl.errorMessage}</p> : null}</> : <p className="rounded-lg border border-dashed p-5 text-center text-sm text-muted-foreground">尚未创建抓取批次</p>}<Button variant="outline" render={<Link href={`/projects/${project.id}/pages`} />}><FileTextIcon data-icon="inline-start" />查看页面与快照</Button></CardContent></Card>
      </div>
    </div>
  )
}
