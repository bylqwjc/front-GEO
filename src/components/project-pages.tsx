"use client"

import { type FormEvent, useCallback, useEffect, useState } from "react"
import { CheckCircle2Icon, ChevronDownIcon, CircleXIcon, ExternalLinkIcon, FileInputIcon, HistoryIcon, LoaderCircleIcon, PlusIcon, RadarIcon, RefreshCwIcon, TriangleAlertIcon } from "lucide-react"
import { toast } from "sonner"

import { ErrorState, LoadingState, ProjectHeader } from "@/components/project-shared"
import { SnapshotHistoryRow } from "@/components/snapshot-history-row"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createManualPage, getProject, listCrawls, listPages, startCrawl, type CrawlRun, type Project, type SourcePage } from "@/lib/project-api"

const textareaClass = "min-h-28 w-full resize-y rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"

function crawlPath(url: string) {
  try {
    const parsed = new URL(url)
    return `${parsed.pathname || "/"}${parsed.search}`
  } catch {
    return url
  }
}

export function ProjectPages({ projectId }: { projectId: string }) {
  const [project, setProject] = useState<Project | null>(null)
  const [pages, setPages] = useState<SourcePage[]>([])
  const [crawls, setCrawls] = useState<CrawlRun[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [showManual, setShowManual] = useState(false)
  const [expandedPageId, setExpandedPageId] = useState<string | null>(null)
  const [expandedCrawlId, setExpandedCrawlId] = useState<string | null | undefined>(undefined)
  const [form, setForm] = useState({ url: "", title: "", description: "", h1: "", body: "", language: "zh" })

  const load = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true)
    setError("")
    try {
      const [projectResponse, pagesResponse, crawlsResponse] = await Promise.all([getProject(projectId), listPages(projectId), listCrawls(projectId)])
      setProject(projectResponse.data)
      setPages(pagesResponse.data)
      setCrawls(crawlsResponse.data)
      setExpandedCrawlId((current) => current === undefined ? (crawlsResponse.data[0]?.id ?? null) : current)
      setForm((current) => ({ ...current, url: current.url || projectResponse.data.domain }))
    } catch (loadError) { setError(loadError instanceof Error ? loadError.message : "页面数据加载失败。") } finally { setLoading(false) }
  }, [projectId])

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0)
    return () => window.clearTimeout(timer)
  }, [load])
  useEffect(() => {
    if (!crawls.some((item) => item.status === "QUEUED" || item.status === "RUNNING")) return
    const timer = window.setInterval(() => void load(true), 5000)
    return () => window.clearInterval(timer)
  }, [crawls, load])

  async function handleCrawl() {
    setBusy(true)
    setError("")
    try { await startCrawl(projectId); toast.success("抓取任务已进入队列") } catch (crawlError) { setError(crawlError instanceof Error ? crawlError.message : "抓取启动失败。"); setShowManual(true) } finally { await load(true); setBusy(false) }
  }

  async function handleManual(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setError("")
    try {
      await createManualPage(projectId, {
        ...form,
        title: form.title || undefined,
        description: form.description || undefined,
        h1: form.h1 || undefined,
      })
      setForm((current) => ({
        ...current,
        url: project ? `${project.domain.replace(/\/$/, "")}/` : current.url,
        title: "",
        description: "",
        h1: "",
        body: "",
      }))
      await load(true)
      toast.success("页面已保存，可以继续添加")
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "页面快照保存失败。")
    } finally {
      setBusy(false)
    }
  }

  if (loading) return <LoadingState label="正在加载页面快照..." />
  if (!project) return <div className="p-4 md:p-6"><ErrorState message={error || "项目不存在。"} retry={() => void load()} /></div>

  return (
    <div className="@container/main flex flex-1 flex-col gap-5 p-4 md:p-6">
      <ProjectHeader project={project} />
      <div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="font-medium">官网页面</h3><p className="text-sm text-muted-foreground">{pages.length} 个规范页面 · 每次读取保留独立快照</p></div><div className="flex gap-2"><Button variant="outline" size="icon" title="刷新" onClick={() => void load()}><RefreshCwIcon /></Button><Button variant="outline" onClick={() => setShowManual((current) => !current)}><PlusIcon data-icon="inline-start" />手工页面</Button><Button onClick={() => void handleCrawl()} disabled={busy}>{busy ? <LoaderCircleIcon className="animate-spin" /> : <RadarIcon data-icon="inline-start" />}重新抓取</Button></div></div>
      {error ? <div role="alert" className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900"><TriangleAlertIcon className="mt-0.5 size-4 shrink-0" />{error}</div> : null}
      {showManual ? <form onSubmit={handleManual}><Card className="rounded-lg shadow-none"><CardHeader><CardTitle>手工补充页面</CardTitle><CardDescription>可连续录入产品页、价格页、案例页等页面</CardDescription></CardHeader><CardContent className="grid gap-4"><div className="grid gap-2"><Label htmlFor="manual-url">页面 URL</Label><Input id="manual-url" type="url" required value={form.url} onChange={(event) => setForm({ ...form, url: event.target.value })} /></div><div className="grid gap-4 md:grid-cols-3"><div className="grid gap-2"><Label htmlFor="manual-title">Title</Label><Input id="manual-title" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /></div><div className="grid gap-2"><Label htmlFor="manual-description">Description</Label><Input id="manual-description" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></div><div className="grid gap-2"><Label htmlFor="manual-h1">H1</Label><Input id="manual-h1" value={form.h1} onChange={(event) => setForm({ ...form, h1: event.target.value })} /></div></div><div className="grid gap-2"><Label htmlFor="manual-body">正文</Label><textarea id="manual-body" required className={textareaClass} value={form.body} onChange={(event) => setForm({ ...form, body: event.target.value })} /></div><div className="flex justify-end"><Button type="submit" disabled={busy}>{busy ? <LoaderCircleIcon className="animate-spin" /> : <FileInputIcon data-icon="inline-start" />}保存并继续添加</Button></div></CardContent></Card></form> : null}
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <Card className="rounded-lg shadow-none"><CardHeader><CardTitle>页面与快照</CardTitle><CardDescription>按页面类型与更新时间排序</CardDescription></CardHeader><CardContent className="px-0">{pages.length === 0 ? <p className="p-8 text-center text-sm text-muted-foreground">暂无页面快照</p> : <div className="divide-y">{pages.map((page) => { const latest = page.snapshots[0]; const snapshotCount = page._count?.snapshots ?? page.snapshots.length; const expanded = expandedPageId === page.id; return <div key={page.id} className="p-4"><div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><p className="truncate text-sm font-medium">{latest?.title || latest?.h1 || page.canonicalUrl}</p><Badge variant="outline">{page.pageType || "OTHER"}</Badge>{latest?.errorCode ? <Badge variant="outline" className={latest.errorCode === "MANUAL_ENTRY" ? "bg-muted text-muted-foreground" : "border-amber-200 bg-amber-50 text-amber-800"}>{latest.errorCode}</Badge> : null}</div><p className="mt-1 truncate text-xs text-muted-foreground">{page.canonicalUrl}</p><p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{latest?.description || latest?.body || latest?.errorMessage || "暂无正文"}</p></div><div className="flex flex-wrap items-center gap-2 sm:justify-end"><span className="text-xs text-muted-foreground">{latest ? `最新 ${new Date(latest.crawledAt).toLocaleString("zh-CN")}` : "无快照"}</span><Button variant="outline" size="sm" aria-expanded={expanded} onClick={() => setExpandedPageId(expanded ? null : page.id)} disabled={snapshotCount === 0}><HistoryIcon data-icon="inline-start" />{snapshotCount} 个快照</Button><Button variant="ghost" size="icon-sm" title="打开官网" render={<a href={page.canonicalUrl} target="_blank" rel="noreferrer" />}><ExternalLinkIcon /></Button></div></div>{expanded ? <div className="mt-4 border-t pt-3"><div className="flex items-center justify-between gap-3"><p className="text-xs font-medium">快照历史</p><p className="text-xs text-muted-foreground">显示最近 {page.snapshots.length} 次</p></div><div className="mt-2 divide-y rounded-lg border">{page.snapshots.map((snapshot, index) => <SnapshotHistoryRow key={snapshot.id} snapshot={snapshot} index={index} snapshotCount={snapshotCount} />)}</div></div> : null}</div> })}</div>}</CardContent></Card>
        <Card className="h-fit rounded-lg shadow-none">
          <CardHeader><CardTitle>抓取批次</CardTitle><CardDescription>每次目标最多 20 页</CardDescription></CardHeader>
          <CardContent className="grid gap-3">
            {crawls.length === 0 ? <p className="text-sm text-muted-foreground">暂无抓取记录</p> : crawls.map((crawl) => {
              const processed = crawl.completedPages + crawl.failedPages
              const progress = Math.min(100, Math.round((processed / crawl.maxPages) * 100))
              const finished = !["QUEUED", "RUNNING"].includes(crawl.status)
              const shortfall = finished && processed < crawl.maxPages
              const pathsExpanded = expandedCrawlId === crawl.id
              return (
                <div key={crawl.id} className="rounded-lg border p-3">
                  <div className="flex items-center justify-between gap-2">
                    <Badge
                      variant="outline"
                      className={
                        crawl.status === "COMPLETED"
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : crawl.status === "FAILED"
                            ? "border-rose-200 bg-rose-50 text-rose-700"
                            : crawl.status === "PARTIAL"
                              ? "border-amber-200 bg-amber-50 text-amber-800"
                              : "bg-muted"
                      }
                    >
                      {crawl.status === "COMPLETED" ? "已完成" : crawl.status === "RUNNING" ? "读取中" : crawl.status === "QUEUED" ? "等待中" : crawl.status === "PARTIAL" ? "部分完成" : crawl.status === "FAILED" ? "失败" : "已取消"}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{new Date(crawl.createdAt).toLocaleDateString("zh-CN")}</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs">
                    <span>已处理 {processed} / 目标 {crawl.maxPages}</span>
                    <span className="tabular-nums text-muted-foreground">{progress}%</span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                    <span className="block h-full rounded-full bg-emerald-600" style={{ width: `${progress}%` }} />
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    发现 {crawl.discoveredPages} · 成功 {crawl.completedPages} · 失败 {crawl.failedPages}
                  </p>
                  {shortfall ? (
                    <p className="mt-2 rounded-md border border-amber-200 bg-amber-50 p-2 text-xs text-amber-800">
                      未达到目标 {crawl.maxPages} 页。
                      {crawl.discoveredPages < crawl.maxPages ? `仅发现 ${crawl.discoveredPages} 个可抓取页面。` : "抓取提前结束，请重新抓取。"}
                    </p>
                  ) : null}
                  <div className="mt-2 border-t pt-2">
                    <button
                      type="button"
                      className="flex h-8 w-full items-center justify-between gap-2 text-xs font-medium"
                      aria-expanded={pathsExpanded}
                      onClick={() => setExpandedCrawlId(pathsExpanded ? null : crawl.id)}
                    >
                      <span className="flex items-center gap-1.5">
                        {"\u6293\u53d6\u8def\u5f84"} <span className="tabular-nums text-muted-foreground">({crawl.pages.length})</span>
                      </span>
                      <ChevronDownIcon className={`size-4 text-muted-foreground transition-transform ${pathsExpanded ? "rotate-180" : ""}`} />
                    </button>
                    {pathsExpanded ? (
                      crawl.pages.length > 0 ? (
                        <ol className="max-h-56 space-y-1 overflow-y-auto py-1">
                          {crawl.pages.map((page, index) => (
                            <li key={`${page.url}-${index}`} className="flex min-w-0 items-center gap-1.5 text-xs">
                              <span className="w-4 shrink-0 text-right tabular-nums text-muted-foreground">{index + 1}</span>
                              {page.success ? (
                                <CheckCircle2Icon className="size-3.5 shrink-0 text-emerald-600" aria-label={"\u6210\u529f"} />
                              ) : (
                                <CircleXIcon className="size-3.5 shrink-0 text-rose-600" aria-label={"\u5931\u8d25"} />
                              )}
                              <a className="min-w-0 flex-1 truncate font-mono text-foreground hover:underline" href={page.url} target="_blank" rel="noreferrer" title={page.url}>
                                {crawlPath(page.url)}
                              </a>
                              <span className="shrink-0 tabular-nums text-muted-foreground">
                                {page.statusCode ? page.statusCode : page.errorCode || "\u5931\u8d25"}
                              </span>
                            </li>
                          ))}
                        </ol>
                      ) : (
                        <p className="py-2 text-xs text-muted-foreground">{"\u672c\u6279\u6b21\u6682\u65e0\u8def\u5f84\u8bb0\u5f55"}</p>
                      )
                    ) : null}
                  </div>
                  {crawl.errorMessage ? <p className="mt-2 text-xs text-rose-700">{crawl.errorMessage}</p> : null}
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
