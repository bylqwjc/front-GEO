"use client"

import { type FormEvent, useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { CheckIcon, ExternalLinkIcon, LoaderCircleIcon, PlusIcon, QuoteIcon } from "lucide-react"
import { toast } from "sonner"

import { ErrorState, LoadingState, ProjectHeader, stringList } from "@/components/project-shared"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { confirmEntity, getEntityWorkspace, getProject, type ConfirmEntityPayload, type EntityWorkspace, type Project } from "@/lib/project-api"

const textareaClass = "min-h-24 w-full resize-y rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
function lines(value: string) { return [...new Set(value.split(/\r?\n|,/).map((item) => item.trim()).filter(Boolean))] }
function records(value: unknown) { return Array.isArray(value) ? value.filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object" && !Array.isArray(item)) : [] }

export function ProjectEntity({ projectId }: { projectId: string }) {
  const router = useRouter()
  const [project, setProject] = useState<Project | null>(null)
  const [workspace, setWorkspace] = useState<EntityWorkspace | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState({ officialName: "", companyName: "", aliases: "", definition: "", audiences: "", useCases: "", features: "" })

  const load = useCallback(async () => {
    setLoading(true); setError("")
    try {
      const [projectResponse, workspaceResponse] = await Promise.all([getProject(projectId), getEntityWorkspace(projectId)])
      setProject(projectResponse.data); setWorkspace(workspaceResponse.data)
      const source = workspaceResponse.data.latest ?? workspaceResponse.data.candidate
      setForm({ officialName: source.officialName, companyName: source.companyName ?? "", aliases: stringList(source.aliases).join("\n"), definition: source.definition ?? "", audiences: stringList(source.audiences).join("\n"), useCases: stringList(source.useCases).join("\n"), features: stringList(source.features).join("\n") })
    } catch (loadError) { setError(loadError instanceof Error ? loadError.message : "实体画像加载失败。") } finally { setLoading(false) }
  }, [projectId])
  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0)
    return () => window.clearTimeout(timer)
  }, [load])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!workspace) return
    setBusy(true); setError("")
    try {
      const payload: ConfirmEntityPayload = { officialName: form.officialName, ...(form.companyName ? { companyName: form.companyName } : {}), aliases: lines(form.aliases), definition: form.definition || undefined, audiences: lines(form.audiences), useCases: lines(form.useCases), features: lines(form.features), supported: workspace.latest ? records(workspace.latest.supported) : workspace.candidate.supported, pricing: workspace.latest ? records(workspace.latest.pricing) : workspace.candidate.pricing, verifiedFacts: workspace.latest ? records(workspace.latest.verifiedFacts) : workspace.candidate.verifiedFacts, evidence: workspace.latest ? records(workspace.latest.evidence) : workspace.candidate.evidence }
      await confirmEntity(projectId, payload); await load(); toast.success("新的实体画像版本已确认")
      router.push(`/projects/${projectId}/queries`)
    } catch (saveError) { setError(saveError instanceof Error ? saveError.message : "实体画像确认失败。") } finally { setBusy(false) }
  }

  if (loading) return <LoadingState label="正在加载实体画像..." />
  if (!project || !workspace) return <div className="p-4 md:p-6"><ErrorState message={error || "项目不存在。"} retry={() => void load()} /></div>
  const evidence = workspace.latest ? records(workspace.latest.evidence) : workspace.candidate.evidence

  return (
    <div className="@container/main flex flex-1 flex-col gap-5 p-4 md:p-6">
      <ProjectHeader project={project} />
      <div className="flex items-center justify-between gap-3"><div><h3 className="font-medium">实体事实</h3><p className="text-sm text-muted-foreground">来源页面 {workspace.sourcePageCount} · 当前版本 {workspace.latest?.version ?? 0}</p></div>{workspace.latest ? <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700"><CheckIcon />已确认 v{workspace.latest.version}</Badge> : <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-800">待确认</Badge>}</div>
      <form onSubmit={handleSubmit} className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card className="rounded-lg shadow-none"><CardHeader><CardTitle>画像字段</CardTitle><CardDescription>提交会创建新版本，不覆盖历史报告引用的事实</CardDescription></CardHeader><CardContent className="grid gap-4"><div className="grid gap-4 sm:grid-cols-2"><div className="grid gap-2"><Label htmlFor="entity-name">正式名称</Label><Input id="entity-name" required value={form.officialName} onChange={(event) => setForm({ ...form, officialName: event.target.value })} /></div><div className="grid gap-2"><Label htmlFor="entity-company">公司名称</Label><Input id="entity-company" value={form.companyName} onChange={(event) => setForm({ ...form, companyName: event.target.value })} /></div></div><div className="grid gap-2"><Label htmlFor="entity-definition">产品定义</Label><textarea id="entity-definition" className={textareaClass} value={form.definition} onChange={(event) => setForm({ ...form, definition: event.target.value })} /></div><div className="grid gap-4 md:grid-cols-2"><div className="grid gap-2"><Label htmlFor="entity-aliases">别名</Label><textarea id="entity-aliases" className={textareaClass} value={form.aliases} onChange={(event) => setForm({ ...form, aliases: event.target.value })} /></div><div className="grid gap-2"><Label htmlFor="entity-audiences">目标用户</Label><textarea id="entity-audiences" className={textareaClass} value={form.audiences} onChange={(event) => setForm({ ...form, audiences: event.target.value })} /></div><div className="grid gap-2"><Label htmlFor="entity-use-cases">使用场景</Label><textarea id="entity-use-cases" className={textareaClass} value={form.useCases} onChange={(event) => setForm({ ...form, useCases: event.target.value })} /></div><div className="grid gap-2"><Label htmlFor="entity-features">核心功能</Label><textarea id="entity-features" className={textareaClass} value={form.features} onChange={(event) => setForm({ ...form, features: event.target.value })} /></div></div>{error ? <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">{error}</p> : null}<div className="flex justify-end"><Button type="submit" disabled={busy}>{busy ? <LoaderCircleIcon className="animate-spin" /> : workspace.latest ? <PlusIcon data-icon="inline-start" /> : <CheckIcon data-icon="inline-start" />}{workspace.latest ? "确认新版本" : "确认画像"}</Button></div></CardContent></Card>
        <Card className="rounded-lg shadow-none"><CardHeader><CardTitle>来源证据</CardTitle><CardDescription>自动候选保留原页面与引文</CardDescription></CardHeader><CardContent className="grid gap-3">{evidence.length === 0 ? <p className="rounded-lg border border-dashed p-5 text-center text-sm text-muted-foreground">暂无页面证据，当前字段来自项目手工输入</p> : evidence.map((item, index) => <div key={index} className="rounded-lg border p-3"><div className="flex items-start gap-2"><QuoteIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" /><p className="line-clamp-4 text-xs">{String(item.quote ?? "")}</p></div>{typeof item.sourceUrl === "string" ? <Button variant="ghost" size="sm" className="mt-2 max-w-full" render={<a href={item.sourceUrl} target="_blank" rel="noreferrer" />}><ExternalLinkIcon data-icon="inline-start" /><span className="truncate">查看来源</span></Button> : null}</div>)}</CardContent></Card>
      </form>
    </div>
  )
}
