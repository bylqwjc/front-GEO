"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { type FormEvent, useEffect, useMemo, useState } from "react"
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon, FileInputIcon, Globe2Icon, LoaderCircleIcon, PlusIcon, RadarIcon, SparklesIcon } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  confirmEntity,
  createManualPage,
  createProject,
  generateQueries,
  listCrawls,
  getEntityWorkspace,
  startCrawl,
  type CrawlRun,
  type ConfirmEntityPayload,
  type Project,
  type QueryOpportunity,
} from "@/lib/project-api"
import { cn } from "@/lib/utils"

const steps = ["项目", "官网", "画像", "问题"]
const textareaClass = "min-h-24 w-full resize-y rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"

function lines(value: string) {
  return [...new Set(value.split(/\r?\n|,/).map((item) => item.trim()).filter(Boolean))]
}

const activeCrawlStatuses = new Set<CrawlRun["status"]>(["QUEUED", "RUNNING"])
const crawlStatusLabels: Record<CrawlRun["status"], string> = {
  QUEUED: "等待开始",
  RUNNING: "正在读取",
  COMPLETED: "读取完成",
  PARTIAL: "部分完成",
  FAILED: "读取失败",
  CANCELLED: "已取消",
}

function isCrawlActive(crawl: CrawlRun | null) {
  return Boolean(crawl && activeCrawlStatuses.has(crawl.status))
}

function isCrawlFinished(crawl: CrawlRun | null) {
  return Boolean(crawl && !activeCrawlStatuses.has(crawl.status))
}

export function ProjectCreateWizard() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [project, setProject] = useState<Project | null>(null)
  const [queries, setQueries] = useState<QueryOpportunity[]>([])
  const [crawlMessage, setCrawlMessage] = useState("")
  const [crawl, setCrawl] = useState<CrawlRun | null>(null)
  const [manualPageCount, setManualPageCount] = useState(0)
  const [projectForm, setProjectForm] = useState({ name: "", websiteUrl: "https://", description: "", category: "", audience: "", conversionGoal: "", competitors: "", market: "cn", country: "cn", language: "zh" })
  const [pageForm, setPageForm] = useState({ url: "", title: "", description: "", h1: "", body: "", language: "zh" })
  const [entityForm, setEntityForm] = useState({ officialName: "", companyName: "", aliases: "", definition: "", audiences: "", useCases: "", features: "" })

  const completed = useMemo(() => step / (steps.length - 1), [step])

  const projectId = project?.id
  const crawlId = crawl?.id
  const crawlStatus = crawl?.status
  const crawlActive = isCrawlActive(crawl)
  const crawlFinished = isCrawlFinished(crawl)
  const processedPages = crawl ? crawl.completedPages + crawl.failedPages : 0
  const crawlGoal = crawl?.maxPages ?? 20
  const crawlProgress = crawl
    ? Math.min(100, Math.round((processedPages / crawlGoal) * 100))
    : 0
  const availablePageCount = (crawl?.completedPages ?? 0) + manualPageCount
  const canContinueToEntity = !crawlActive && availablePageCount > 0

  useEffect(() => {
    if (!projectId || !crawlId || !crawlStatus || !activeCrawlStatuses.has(crawlStatus)) return

    let cancelled = false
    const targetProjectId = projectId
    const targetCrawlId = crawlId

    async function refreshCrawl() {
      try {
        const response = await listCrawls(targetProjectId)
        const current = response.data.find((item) => item.id === targetCrawlId)
        if (!cancelled && current) setCrawl(current)
      } catch (pollError) {
        if (!cancelled) {
          setCrawlMessage(
            pollError instanceof Error ? pollError.message : "暂时无法更新抓取进度。",
          )
        }
      }
    }

    const timer = window.setInterval(() => void refreshCrawl(), 2_000)
    void refreshCrawl()
    return () => {
      cancelled = true
      window.clearInterval(timer)
    }
  }, [projectId, crawlId, crawlStatus])

  async function handleCreateProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setError("")
    try {
      const response = await createProject({
        name: projectForm.name,
        websiteUrl: projectForm.websiteUrl,
        description: projectForm.description || undefined,
        category: projectForm.category || undefined,
        audience: projectForm.audience || undefined,
        conversionGoal: projectForm.conversionGoal || undefined,
        competitors: lines(projectForm.competitors),
        market: projectForm.market,
        countries: [projectForm.country],
        languages: [projectForm.language],
      })
      setProject(response.data)
      setPageForm((current) => ({ ...current, url: response.data.domain, language: projectForm.language }))
      setStep(1)
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "项目创建失败。")
    } finally {
      setBusy(false)
    }
  }

  async function handleCrawl() {
    if (!project) return
    setBusy(true)
    setError("")
    setCrawlMessage("")
    try {
      const response = await startCrawl(project.id)
      setCrawl(response.data)
      setCrawlMessage("正在发现 Sitemap 和站内页面。")
      toast.success("官网抓取已开始")
    } catch (crawlError) {
      setCrawlMessage(crawlError instanceof Error ? crawlError.message : "抓取队列暂不可用。")
    } finally {
      setBusy(false)
    }
  }

  async function handleManualPage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!project) return
    setBusy(true)
    setError("")
    try {
      await createManualPage(project.id, {
        ...pageForm,
        title: pageForm.title || undefined,
        description: pageForm.description || undefined,
        h1: pageForm.h1 || undefined,
      })
      setManualPageCount((current) => current + 1)
      setPageForm((current) => ({
        ...current,
        url: `${project.domain.replace(/\/$/, "")}/`,
        title: "",
        description: "",
        h1: "",
        body: "",
      }))
      toast.success("页面已保存，可以继续添加")
    } catch (pageError) {
      setError(pageError instanceof Error ? pageError.message : "页面快照保存失败。")
    } finally {
      setBusy(false)
    }
  }

  async function loadEntityStep(target: Project) {
    const response = await getEntityWorkspace(target.id)
    const candidate = response.data.candidate
    setEntityForm({
      officialName: candidate.officialName,
      companyName: candidate.companyName ?? "",
      aliases: candidate.aliases.join("\n"),
      definition: candidate.definition ?? "",
      audiences: candidate.audiences.join("\n"),
      useCases: candidate.useCases.join("\n"),
      features: candidate.features.join("\n"),
    })
    setStep(2)
  }

  async function handleContinueToEntity() {
    if (!project || !canContinueToEntity) return
    setBusy(true)
    setError("")
    try { await loadEntityStep(project) } catch (loadError) { setError(loadError instanceof Error ? loadError.message : "画像候选加载失败。") } finally { setBusy(false) }
  }

  async function handleConfirmEntity(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!project) return
    setBusy(true)
    setError("")
    try {
      const workspace = await getEntityWorkspace(project.id)
      const payload: ConfirmEntityPayload = {
        officialName: entityForm.officialName,
        ...(entityForm.companyName ? { companyName: entityForm.companyName } : {}),
        aliases: lines(entityForm.aliases),
        definition: entityForm.definition || undefined,
        audiences: lines(entityForm.audiences),
        useCases: lines(entityForm.useCases),
        features: lines(entityForm.features),
        supported: [],
        pricing: [],
        verifiedFacts: [],
        evidence: workspace.data.candidate.evidence,
      }
      await confirmEntity(project.id, payload)
      setStep(3)
      toast.success("实体画像版本已确认")
    } catch (entityError) {
      setError(entityError instanceof Error ? entityError.message : "实体画像确认失败。")
    } finally {
      setBusy(false)
    }
  }

  async function handleGenerateQueries() {
    if (!project) return
    setBusy(true)
    setError("")
    try {
      const response = await generateQueries(project.id, 24)
      setQueries(response.data.data)
      toast.success(`已生成 ${response.data.data.length} 条问题机会`)
    } catch (queryError) {
      setError(queryError instanceof Error ? queryError.message : "问题机会生成失败。")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="@container/main flex flex-1 flex-col gap-5 p-4 md:p-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div><Button variant="ghost" size="sm" className="mb-2 -ml-2" render={<Link href="/projects" />}><ArrowLeftIcon data-icon="inline-start" />返回项目</Button><h2 className="text-xl font-semibold">创建产品项目</h2><p className="mt-1 text-sm text-muted-foreground">项目 → 官网 → 画像 → 问题</p></div>
        <div className="min-w-64"><div className="mb-2 flex justify-between text-xs text-muted-foreground">{steps.map((item, index) => <span key={item} className={cn(index <= step && "font-medium text-foreground")}>{item}</span>)}</div><div className="h-1.5 overflow-hidden rounded-full bg-muted"><span className="block h-full rounded-full bg-foreground transition-[width]" style={{ width: `${completed * 100}%` }} /></div></div>
      </div>

      {step === 0 ? (
        <form className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]" onSubmit={handleCreateProject}>
          <Card className="rounded-lg shadow-none"><CardHeader><CardTitle>项目资料</CardTitle><CardDescription>用于项目隔离与官网事实识别</CardDescription></CardHeader><CardContent className="grid gap-4"><div className="grid gap-4 sm:grid-cols-2"><div className="grid gap-2"><Label htmlFor="name">产品名称</Label><Input id="name" required minLength={2} value={projectForm.name} onChange={(event) => setProjectForm({ ...projectForm, name: event.target.value })} /></div><div className="grid gap-2"><Label htmlFor="website">官网</Label><Input id="website" type="url" required value={projectForm.websiteUrl} onChange={(event) => setProjectForm({ ...projectForm, websiteUrl: event.target.value })} /></div></div><div className="grid gap-2"><Label htmlFor="description">产品描述</Label><textarea id="description" className={textareaClass} value={projectForm.description} onChange={(event) => setProjectForm({ ...projectForm, description: event.target.value })} /></div><div className="grid gap-4 sm:grid-cols-2"><div className="grid gap-2"><Label htmlFor="category">产品品类</Label><Input id="category" value={projectForm.category} onChange={(event) => setProjectForm({ ...projectForm, category: event.target.value })} /></div><div className="grid gap-2"><Label htmlFor="audience">目标用户</Label><Input id="audience" value={projectForm.audience} onChange={(event) => setProjectForm({ ...projectForm, audience: event.target.value })} /></div></div><div className="grid gap-4 sm:grid-cols-3"><div className="grid gap-2"><Label htmlFor="market">市场</Label><select id="market" className="h-9 rounded-lg border bg-background px-3 text-sm" value={projectForm.market} onChange={(event) => setProjectForm({ ...projectForm, market: event.target.value })}><option value="cn">中国</option><option value="global">全球</option><option value="us">美国</option></select></div><div className="grid gap-2"><Label htmlFor="country">国家</Label><select id="country" className="h-9 rounded-lg border bg-background px-3 text-sm" value={projectForm.country} onChange={(event) => setProjectForm({ ...projectForm, country: event.target.value })}><option value="cn">中国</option><option value="us">美国</option><option value="sg">新加坡</option></select></div><div className="grid gap-2"><Label htmlFor="language">语言</Label><select id="language" className="h-9 rounded-lg border bg-background px-3 text-sm" value={projectForm.language} onChange={(event) => setProjectForm({ ...projectForm, language: event.target.value })}><option value="zh">简体中文</option><option value="en">英语</option></select></div></div><div className="grid gap-4 sm:grid-cols-2"><div className="grid gap-2"><Label htmlFor="goal">转化目标</Label><Input id="goal" placeholder="预约演示" value={projectForm.conversionGoal} onChange={(event) => setProjectForm({ ...projectForm, conversionGoal: event.target.value })} /></div><div className="grid gap-2"><Label htmlFor="competitors">主要竞品</Label><Input id="competitors" placeholder="每项用逗号分隔" value={projectForm.competitors} onChange={(event) => setProjectForm({ ...projectForm, competitors: event.target.value })} /></div></div></CardContent></Card>
          <Card className="h-fit rounded-lg shadow-none"><CardHeader><CardTitle>创建项目</CardTitle><CardDescription>保存后进入官网读取</CardDescription></CardHeader><CardContent className="grid gap-4"><div className="flex items-start gap-3 rounded-lg border bg-muted/30 p-3"><Globe2Icon className="mt-0.5 size-4 shrink-0" /><div className="min-w-0"><p className="text-sm font-medium">{projectForm.name || "未命名产品"}</p><p className="truncate text-xs text-muted-foreground">{projectForm.websiteUrl}</p></div></div>{error ? <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">{error}</p> : null}<Button type="submit" disabled={busy}>{busy ? <LoaderCircleIcon className="animate-spin" /> : <PlusIcon data-icon="inline-start" />}保存并继续<ArrowRightIcon data-icon="inline-end" /></Button></CardContent></Card>
        </form>
      ) : null}

      {step === 1 && project ? (
        <div className="grid gap-5">
          <div className="grid gap-5 lg:grid-cols-2">
            <Card className="rounded-lg shadow-none">
              <CardHeader>
                <CardTitle>自动读取官网</CardTitle>
                <CardDescription>Sitemap 与站内导航 · 最多 20 个业务页面</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="flex items-center gap-3 rounded-lg border p-3">
                  <RadarIcon className="size-5 text-emerald-700" />
                  <p className="min-w-0 truncate text-sm">{project.domain}</p>
                </div>
                {crawl ? (
                  <div className="grid gap-3 rounded-lg border p-3">
                    <div className="flex items-center justify-between gap-3">
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
                        {crawlStatusLabels[crawl.status]}
                      </Badge>
                      <span className="text-xs tabular-nums text-muted-foreground">
                        {processedPages} / {crawlGoal}
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <span
                        className="block h-full rounded-full bg-emerald-600 transition-[width]"
                        style={{ width: `${crawlProgress}%` }}
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="rounded-md bg-muted/50 p-2"><p className="text-lg font-semibold tabular-nums">{crawl.discoveredPages}</p><p className="text-xs text-muted-foreground">发现</p></div>
                      <div className="rounded-md bg-muted/50 p-2"><p className="text-lg font-semibold tabular-nums">{crawl.completedPages}</p><p className="text-xs text-muted-foreground">成功</p></div>
                      <div className="rounded-md bg-muted/50 p-2"><p className="text-lg font-semibold tabular-nums">{crawl.failedPages}</p><p className="text-xs text-muted-foreground">失败</p></div>
                    </div>
                    {crawl.errorMessage ? <p className="text-xs text-rose-700">{crawl.errorMessage}</p> : null}
                    {crawlFinished && processedPages < crawl.maxPages ? (
                      <p className="rounded-md border border-amber-200 bg-amber-50 p-2 text-xs text-amber-800">
                        目标 {crawl.maxPages} 页，实际处理 {processedPages} 页。
                        {crawl.discoveredPages < crawl.maxPages ? ` 网站仅发现 ${crawl.discoveredPages} 个可抓取页面。` : " 抓取提前结束，请重新读取。"}
                      </p>
                    ) : null}
                  </div>
                ) : crawlMessage ? (
                  <p role="status" className="rounded-lg border bg-muted/30 p-3 text-xs">{crawlMessage}</p>
                ) : null}
                <Button
                  type="button"
                  variant="outline"
                  disabled={busy || crawlActive}
                  onClick={() => void handleCrawl()}
                >
                  {busy || crawlActive ? <LoaderCircleIcon className="animate-spin" /> : <RadarIcon data-icon="inline-start" />}
                  {crawlFinished ? "重新读取官网" : crawlActive ? "正在读取" : "开始读取"}
                </Button>
              </CardContent>
            </Card>

            <form onSubmit={handleManualPage}>
              <Card className="rounded-lg shadow-none">
                <CardHeader>
                  <CardTitle>手工补充页面</CardTitle>
                  <CardDescription>产品页、价格页、案例页等可连续添加</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                  {manualPageCount > 0 ? <Badge variant="outline" className="w-fit">已保存 {manualPageCount} 个手工页面</Badge> : null}
                  <div className="grid gap-2"><Label htmlFor="page-url">页面 URL</Label><Input id="page-url" type="url" required value={pageForm.url} onChange={(event) => setPageForm({ ...pageForm, url: event.target.value })} /></div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="grid gap-2"><Label htmlFor="page-title">Title</Label><Input id="page-title" value={pageForm.title} onChange={(event) => setPageForm({ ...pageForm, title: event.target.value })} /></div>
                    <div className="grid gap-2"><Label htmlFor="page-h1">H1</Label><Input id="page-h1" value={pageForm.h1} onChange={(event) => setPageForm({ ...pageForm, h1: event.target.value })} /></div>
                  </div>
                  <div className="grid gap-2"><Label htmlFor="page-description">Description</Label><Input id="page-description" value={pageForm.description} onChange={(event) => setPageForm({ ...pageForm, description: event.target.value })} /></div>
                  <div className="grid gap-2"><Label htmlFor="page-body">可验证正文</Label><textarea id="page-body" required className={textareaClass} value={pageForm.body} onChange={(event) => setPageForm({ ...pageForm, body: event.target.value })} /></div>
                  {error ? <p role="alert" className="text-xs text-rose-700">{error}</p> : null}
                  <Button type="submit" variant="outline" disabled={busy}>
                    {busy ? <LoaderCircleIcon className="animate-spin" /> : <FileInputIcon data-icon="inline-start" />}
                    保存页面
                  </Button>
                </CardContent>
              </Card>
            </form>
          </div>
          <div className="flex items-center justify-end gap-3 border-t pt-4">
            {crawlActive ? <p className="text-xs text-muted-foreground">官网读取完成后即可生成画像</p> : null}
            <Button type="button" disabled={busy || !canContinueToEntity} onClick={() => void handleContinueToEntity()}>
              使用 {availablePageCount} 个页面生成画像
              <ArrowRightIcon data-icon="inline-end" />
            </Button>
          </div>
        </div>
      ) : null}

      {step === 2 && project ? (
        <form onSubmit={handleConfirmEntity}><Card className="rounded-lg shadow-none"><CardHeader><CardTitle>确认实体画像</CardTitle><CardDescription>确认后创建不可变版本</CardDescription></CardHeader><CardContent className="grid gap-4"><div className="grid gap-4 sm:grid-cols-2"><div className="grid gap-2"><Label htmlFor="official-name">正式名称</Label><Input id="official-name" required value={entityForm.officialName} onChange={(event) => setEntityForm({ ...entityForm, officialName: event.target.value })} /></div><div className="grid gap-2"><Label htmlFor="company-name">公司名称</Label><Input id="company-name" value={entityForm.companyName} onChange={(event) => setEntityForm({ ...entityForm, companyName: event.target.value })} /></div></div><div className="grid gap-2"><Label htmlFor="definition">产品定义</Label><textarea id="definition" className={textareaClass} value={entityForm.definition} onChange={(event) => setEntityForm({ ...entityForm, definition: event.target.value })} /></div><div className="grid gap-4 md:grid-cols-2"><div className="grid gap-2"><Label htmlFor="aliases">别名</Label><textarea id="aliases" className={textareaClass} value={entityForm.aliases} onChange={(event) => setEntityForm({ ...entityForm, aliases: event.target.value })} /></div><div className="grid gap-2"><Label htmlFor="audiences">目标用户</Label><textarea id="audiences" className={textareaClass} value={entityForm.audiences} onChange={(event) => setEntityForm({ ...entityForm, audiences: event.target.value })} /></div><div className="grid gap-2"><Label htmlFor="use-cases">使用场景</Label><textarea id="use-cases" className={textareaClass} value={entityForm.useCases} onChange={(event) => setEntityForm({ ...entityForm, useCases: event.target.value })} /></div><div className="grid gap-2"><Label htmlFor="features">核心功能</Label><textarea id="features" className={textareaClass} value={entityForm.features} onChange={(event) => setEntityForm({ ...entityForm, features: event.target.value })} /></div></div>{error ? <p role="alert" className="text-xs text-rose-700">{error}</p> : null}<div className="flex justify-end"><Button type="submit" disabled={busy}>{busy ? <LoaderCircleIcon className="animate-spin" /> : <CheckIcon data-icon="inline-start" />}确认画像版本<ArrowRightIcon data-icon="inline-end" /></Button></div></CardContent></Card></form>
      ) : null}

      {step === 3 && project ? (
        <Card className="rounded-lg shadow-none"><CardHeader><CardTitle>AI 问题机会</CardTitle><CardDescription>六类意图 · 20–30 条 · 非品牌问题不少于 70%</CardDescription></CardHeader><CardContent className="grid gap-5">{queries.length === 0 ? <div className="flex min-h-56 flex-col items-center justify-center gap-4 rounded-lg border border-dashed text-center"><SparklesIcon className="size-6 text-emerald-700" /><Button onClick={() => void handleGenerateQueries()} disabled={busy}>{busy ? <LoaderCircleIcon className="animate-spin" /> : <SparklesIcon data-icon="inline-start" />}生成 24 条问题</Button></div> : <><div className="grid grid-cols-3 gap-3"><div className="rounded-lg border p-3"><p className="text-xs text-muted-foreground">全部问题</p><p className="mt-1 text-xl font-semibold">{queries.length}</p></div><div className="rounded-lg border p-3"><p className="text-xs text-muted-foreground">非品牌问题</p><p className="mt-1 text-xl font-semibold">{queries.filter((item) => !item.isBranded).length}</p></div><div className="rounded-lg border p-3"><p className="text-xs text-muted-foreground">六类意图</p><p className="mt-1 text-xl font-semibold">{new Set(queries.map((item) => item.intent)).size}</p></div></div><div className="divide-y rounded-lg border">{queries.slice(0, 8).map((query, index) => <div key={query.id} className="grid grid-cols-[32px_1fr_auto] items-center gap-3 p-3"><span className="text-xs tabular-nums text-muted-foreground">{String(index + 1).padStart(2, "0")}</span><p className="text-sm">{query.text}</p><span className="text-xs text-muted-foreground">{query.businessValue}</span></div>)}</div><div className="flex justify-end"><Button onClick={() => router.push(`/projects/${project.id}/queries`)}>打开问题库<ArrowRightIcon data-icon="inline-end" /></Button></div></>}{error ? <p role="alert" className="text-xs text-rose-700">{error}</p> : null}</CardContent></Card>
      ) : null}
    </div>
  )
}
