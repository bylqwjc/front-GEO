"use client"

import Link from "next/link"
import { useCallback, useEffect, useState } from "react"
import { ArchiveIcon, ArrowRightIcon, FileTextIcon, FolderKanbanIcon, ListFilterIcon, PinIcon, PlusIcon, RefreshCwIcon } from "lucide-react"
import { toast } from "sonner"

import { ACTIVE_PROJECT_CHANGE_EVENT, ACTIVE_PROJECT_STORAGE_KEY, ErrorState, LoadingState, ProjectStatusBadge } from "@/components/project-shared"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { archiveProject, listProjects, type Project } from "@/lib/project-api"

export function ProjectsList() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [archivingId, setArchivingId] = useState<string | null>(null)
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const response = await listProjects()
      setProjects(response.data)
      const storedProjectId = window.localStorage.getItem(ACTIVE_PROJECT_STORAGE_KEY)
      const activeProject = response.data.find((project) => project.id === storedProjectId) ?? response.data[0]
      setActiveProjectId(activeProject?.id ?? null)
      if (activeProject) window.localStorage.setItem(ACTIVE_PROJECT_STORAGE_KEY, activeProject.id)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "项目列表加载失败。")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0)
    return () => window.clearTimeout(timer)
  }, [load])

  function handleSetActive(project: Project) {
    setActiveProjectId(project.id)
    window.localStorage.setItem(ACTIVE_PROJECT_STORAGE_KEY, project.id)
    window.dispatchEvent(new CustomEvent(ACTIVE_PROJECT_CHANGE_EVENT, { detail: project.id }))
    toast.success(`已将“${project.name}”设为当前产品`)
  }
  async function handleArchive(project: Project) {
    if (!window.confirm(`确认归档“${project.name}”？历史检测和快照仍会保留。`)) return
    setArchivingId(project.id)
    try {
      await archiveProject(project.id)
      const remainingProjects = projects.filter((item) => item.id !== project.id)
      setProjects(remainingProjects)
      if (activeProjectId === project.id) {
        const nextProjectId = remainingProjects[0]?.id ?? null
        setActiveProjectId(nextProjectId)
        if (nextProjectId) window.localStorage.setItem(ACTIVE_PROJECT_STORAGE_KEY, nextProjectId)
        else window.localStorage.removeItem(ACTIVE_PROJECT_STORAGE_KEY)
        window.dispatchEvent(new CustomEvent(ACTIVE_PROJECT_CHANGE_EVENT, { detail: nextProjectId }))
      }
      toast.success("项目已归档")
    } catch (archiveError) {
      toast.error(archiveError instanceof Error ? archiveError.message : "项目归档失败。")
    } finally {
      setArchivingId(null)
    }
  }

  if (loading) return <LoadingState label="正在加载项目..." />
  if (error) return <ErrorState message={error} retry={() => void load()} />

  return (
    <div className="@container/main flex flex-1 flex-col gap-5 p-4 md:p-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div><h2 className="text-xl font-semibold">产品项目</h2><p className="mt-1 text-sm text-muted-foreground">每个产品独立保存官网快照、实体事实、问题机会和检测历史。</p></div>
        <div className="flex gap-2"><Button variant="outline" size="icon" title="刷新项目" onClick={() => void load()}><RefreshCwIcon /></Button><Button render={<Link href="/projects/new" />}><PlusIcon data-icon="inline-start" />新建项目</Button></div>
      </div>

      {projects.length === 0 ? (
        <div className="flex min-h-80 flex-col items-center justify-center gap-4 rounded-lg border border-dashed p-8 text-center">
          <span className="flex size-10 items-center justify-center rounded-md bg-muted"><FolderKanbanIcon className="size-5" /></span>
          <div><h3 className="font-medium">还没有产品项目</h3><p className="mt-1 text-sm text-muted-foreground">先创建产品并确认官网事实，再生成 AI 问题机会。</p></div>
          <Button render={<Link href="/projects/new" />}><PlusIcon data-icon="inline-start" />创建第一个项目</Button>
        </div>
      ) : (
        <Card className="rounded-lg shadow-none">
          <CardHeader><CardTitle>全部项目</CardTitle><CardDescription>项目之间的数据和权限完全隔离</CardDescription></CardHeader>
          <CardContent className="px-0">
            <Table>
              <TableHeader><TableRow><TableHead className="pl-4">项目</TableHead><TableHead>状态</TableHead><TableHead>页面</TableHead><TableHead>问题</TableHead><TableHead>最近更新</TableHead><TableHead className="w-24" /></TableRow></TableHeader>
              <TableBody>{projects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell className="pl-4"><Link href={`/projects/${project.id}`} className="font-medium hover:underline">{project.name}</Link><p className="max-w-64 truncate text-xs text-muted-foreground">{project.domain}</p></TableCell>
                  <TableCell><ProjectStatusBadge status={project.status} /></TableCell>
                  <TableCell><span className="inline-flex items-center gap-1 text-sm"><FileTextIcon className="size-3.5 text-muted-foreground" />{project._count.sourcePages}</span></TableCell>
                  <TableCell><span className="inline-flex items-center gap-1 text-sm"><ListFilterIcon className="size-3.5 text-muted-foreground" />{project._count.queryOpportunities}</span></TableCell>
                  <TableCell className="text-xs text-muted-foreground">{new Date(project.updatedAt).toLocaleString("zh-CN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</TableCell>
                  <TableCell><div className="flex justify-end gap-1"><Button variant={activeProjectId === project.id ? "secondary" : "ghost"} size="icon-sm" title={activeProjectId === project.id ? "当前产品" : "设为当前产品"} aria-pressed={activeProjectId === project.id} onClick={() => handleSetActive(project)}><PinIcon className={activeProjectId === project.id ? "fill-current" : undefined} /></Button><Button variant="ghost" size="icon-sm" title="归档项目" disabled={archivingId === project.id} onClick={() => void handleArchive(project)}><ArchiveIcon /></Button><Button variant="ghost" size="icon-sm" title="打开项目" render={<Link href={`/projects/${project.id}`} />}><ArrowRightIcon /></Button></div></TableCell>
                </TableRow>
              ))}</TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
