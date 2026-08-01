"use client"

import Link from "next/link"
import { type FormEvent, useCallback, useEffect, useMemo, useState } from "react"
import { CheckIcon, FileSearchIcon, LoaderCircleIcon, PlusIcon, SaveIcon, SparklesIcon, Trash2Icon } from "lucide-react"
import { toast } from "sonner"

import { ErrorState, LoadingState, ProjectHeader } from "@/components/project-shared"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { createQuery, deleteQuery, generateQueries, getProject, listQueries, updateQuery, type Project, type QueryOpportunity } from "@/lib/project-api"

const intentLabels: Record<QueryOpportunity["intent"], string> = { CATEGORY_DISCOVERY: "品类发现", SCENARIO_SOLUTION: "场景解决", PAIN_SOLUTION: "痛点解决", PRODUCT_COMPARISON: "产品比较", PURCHASE_DECISION: "购买决策", BRAND_VERIFICATION: "品牌核验" }
const selectClass = "h-9 rounded-lg border border-input bg-background px-3 text-sm"

export function ProjectQueries({ projectId }: { projectId: string }) {
  const [project, setProject] = useState<Project | null>(null)
  const [queries, setQueries] = useState<QueryOpportunity[]>([])
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [intentFilter, setIntentFilter] = useState<"ALL" | QueryOpportunity["intent"]>("ALL")
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ENABLED" | "DISABLED">("ALL")
  const [showAdd, setShowAdd] = useState(false)
  const [newQuery, setNewQuery] = useState({ text: "", intent: "CATEGORY_DISCOVERY" as QueryOpportunity["intent"], funnelStage: "AWARENESS" as QueryOpportunity["funnelStage"], businessValue: "HIGH" as QueryOpportunity["businessValue"], isBranded: false })

  const load = useCallback(async () => {
    setLoading(true); setError("")
    try { const [projectResponse, queryResponse] = await Promise.all([getProject(projectId), listQueries(projectId)]); setProject(projectResponse.data); setQueries(queryResponse.data); setDrafts(Object.fromEntries(queryResponse.data.map((item) => [item.id, item.text]))) } catch (loadError) { setError(loadError instanceof Error ? loadError.message : "问题库加载失败。") } finally { setLoading(false) }
  }, [projectId])
  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0)
    return () => window.clearTimeout(timer)
  }, [load])

  const filtered = useMemo(() => queries.filter((item) => (intentFilter === "ALL" || item.intent === intentFilter) && (statusFilter === "ALL" || (statusFilter === "ENABLED" ? item.enabled : !item.enabled))), [intentFilter, queries, statusFilter])

  async function handleGenerate() { setBusyId("generate"); setError(""); try { const response = await generateQueries(projectId, 24); setQueries(response.data.data); setDrafts(Object.fromEntries(response.data.data.map((item) => [item.id, item.text]))); toast.success(response.data.createdCount ? `新增 ${response.data.createdCount} 条问题` : "问题库已是最新") } catch (generateError) { setError(generateError instanceof Error ? generateError.message : "问题生成失败。") } finally { setBusyId(null) } }
  async function handleSave(query: QueryOpportunity) { const text = drafts[query.id]?.trim(); if (!text || text === query.text) return; setBusyId(query.id); try { const response = await updateQuery(projectId, query.id, { text }); await load(); toast.success(response.data.version > query.version ? "已创建问题新版本" : "问题已更新") } catch (saveError) { toast.error(saveError instanceof Error ? saveError.message : "问题更新失败。") } finally { setBusyId(null) } }
  async function handleToggle(query: QueryOpportunity) { setBusyId(query.id); try { const response = await updateQuery(projectId, query.id, { enabled: !query.enabled }); setQueries((current) => current.map((item) => item.id === query.id ? { ...item, enabled: response.data.enabled } : item)) } catch (toggleError) { toast.error(toggleError instanceof Error ? toggleError.message : "状态更新失败。") } finally { setBusyId(null) } }
  async function handleDelete(query: QueryOpportunity) { if (!window.confirm("确认删除这条问题？已用于检测的问题会被停用并保留历史。")) return; setBusyId(query.id); try { await deleteQuery(projectId, query.id); await load(); toast.success("问题已处理") } catch (deleteError) { toast.error(deleteError instanceof Error ? deleteError.message : "问题删除失败。") } finally { setBusyId(null) } }
  async function handleCreate(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setBusyId("create"); try { const response = await createQuery(projectId, { ...newQuery, language: "zh", country: "cn", enabled: true }); setQueries((current) => [...current, response.data]); setDrafts((current) => ({ ...current, [response.data.id]: response.data.text })); setNewQuery((current) => ({ ...current, text: "" })); setShowAdd(false); toast.success("问题已添加") } catch (createError) { toast.error(createError instanceof Error ? createError.message : "问题添加失败。") } finally { setBusyId(null) } }

  if (loading) return <LoadingState label="正在加载问题机会..." />
  if (!project) return <div className="p-4 md:p-6"><ErrorState message={error || "项目不存在。"} retry={() => void load()} /></div>
  const nonBranded = queries.filter((item) => !item.isBranded).length

  return (
    <div className="@container/main flex flex-1 flex-col gap-5 p-4 md:p-6">
      <ProjectHeader project={project} />
      <div className="grid grid-cols-3 gap-3"><div className="rounded-lg border p-3"><p className="text-xs text-muted-foreground">全部问题</p><p className="mt-1 text-xl font-semibold">{queries.length}</p></div><div className="rounded-lg border p-3"><p className="text-xs text-muted-foreground">非品牌占比</p><p className="mt-1 text-xl font-semibold">{queries.length ? Math.round(nonBranded / queries.length * 100) : 0}%</p></div><div className="rounded-lg border p-3"><p className="text-xs text-muted-foreground">启用问题</p><p className="mt-1 text-xl font-semibold">{queries.filter((item) => item.enabled).length}</p></div></div>
      {error ? <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</p> : null}
      {queries.some((item) => item.enabled) ? (
        <div className="flex justify-end">
          <Button render={<Link href={`/projects/${projectId}/audits`} />}><FileSearchIcon data-icon="inline-start" />{"\u5f00\u59cb AI \u68c0\u6d4b"}</Button>
        </div>
      ) : null}
      <div className="flex flex-wrap items-center justify-between gap-3"><div className="flex flex-wrap gap-2"><select aria-label="意图筛选" className={selectClass} value={intentFilter} onChange={(event) => setIntentFilter(event.target.value as typeof intentFilter)}><option value="ALL">全部意图</option>{Object.entries(intentLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select><select aria-label="状态筛选" className={selectClass} value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)}><option value="ALL">全部状态</option><option value="ENABLED">已启用</option><option value="DISABLED">已停用</option></select></div><div className="flex gap-2"><Button variant="outline" onClick={() => setShowAdd((current) => !current)}><PlusIcon data-icon="inline-start" />添加问题</Button><Button onClick={() => void handleGenerate()} disabled={busyId === "generate"}>{busyId === "generate" ? <LoaderCircleIcon className="animate-spin" /> : <SparklesIcon data-icon="inline-start" />}生成 24 条</Button></div></div>
      {showAdd ? <form onSubmit={handleCreate}><Card className="rounded-lg shadow-none"><CardContent className="grid gap-3 pt-6 md:grid-cols-[minmax(0,1fr)_160px_140px_auto]"><Input required minLength={5} placeholder="输入客户会向 AI 提出的问题" value={newQuery.text} onChange={(event) => setNewQuery({ ...newQuery, text: event.target.value })} /><select aria-label="问题意图" className={selectClass} value={newQuery.intent} onChange={(event) => setNewQuery({ ...newQuery, intent: event.target.value as QueryOpportunity["intent"] })}>{Object.entries(intentLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select><select aria-label="商业价值" className={selectClass} value={newQuery.businessValue} onChange={(event) => setNewQuery({ ...newQuery, businessValue: event.target.value as QueryOpportunity["businessValue"] })}><option value="HIGH">高价值</option><option value="MEDIUM">中价值</option><option value="LOW">低价值</option></select><Button type="submit" disabled={busyId === "create"}>{busyId === "create" ? <LoaderCircleIcon className="animate-spin" /> : <PlusIcon data-icon="inline-start" />}添加</Button></CardContent></Card></form> : null}
      <Card className="rounded-lg shadow-none"><CardHeader><CardTitle>问题机会库</CardTitle><CardDescription>{filtered.length} 条结果 · 修改已用于检测的问题会创建新版本</CardDescription></CardHeader><CardContent className="px-0">{filtered.length === 0 ? <p className="p-8 text-center text-sm text-muted-foreground">没有符合条件的问题</p> : <div className="divide-y">{filtered.map((query) => <div key={query.id} className="grid gap-3 p-3 md:grid-cols-[minmax(0,1fr)_120px_88px_auto] md:items-start"><div className="min-w-0"><Input aria-label="问题文本" value={drafts[query.id] ?? query.text} onChange={(event) => setDrafts((current) => ({ ...current, [query.id]: event.target.value }))} /><p className="mt-1 truncate px-1 text-xs text-muted-foreground">{query.valueReason || "手工问题"}</p></div><div className="flex h-9 items-center"><Badge variant="outline">{intentLabels[query.intent]}</Badge></div><button type="button" role="switch" aria-checked={query.enabled} disabled={busyId === query.id} onClick={() => void handleToggle(query)} className={`flex h-9 items-center justify-center gap-1 rounded-md border px-2 text-xs ${query.enabled ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "bg-muted text-muted-foreground"}`}>{query.enabled ? <CheckIcon className="size-3.5" /> : null}{query.enabled ? "启用" : "停用"}</button><div className="flex h-9 items-center justify-end gap-1"><Button variant="ghost" size="icon-sm" title="保存问题" disabled={busyId === query.id || drafts[query.id] === query.text} onClick={() => void handleSave(query)}>{busyId === query.id ? <LoaderCircleIcon className="animate-spin" /> : <SaveIcon />}</Button><Button variant="ghost" size="icon-sm" title="删除问题" disabled={busyId === query.id} onClick={() => void handleDelete(query)}><Trash2Icon /></Button></div></div>)}</div>}</CardContent></Card>
    </div>
  )
}
