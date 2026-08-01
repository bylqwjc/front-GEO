"use client"

import Link from "next/link"
import { useCallback, useEffect, useMemo, useState } from "react"
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  BarChart3Icon,
  CheckCircle2Icon,
  ChevronDownIcon,
  CircleAlertIcon,
  ClipboardIcon,
  EyeIcon,
  ExternalLinkIcon,
  FileSearchIcon,
  LoaderCircleIcon,
  PlayIcon,
  SendIcon,
  ThumbsUpIcon,
} from "lucide-react"
import { toast } from "sonner"

import { MarkdownContent } from "@/components/markdown-content"
import { ErrorState, LoadingState, ProjectHeader } from "@/components/project-shared"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  createManualAudit,
  getProject,
  listProjectAudits,
  startDoubaoAutomaticCollection,
  submitManualAuditAnswer,
  type ManualAudit,
  type ManualAuditPlatform,
  type ManualAuditTask,
  type Project,
} from "@/lib/project-api"

const ui = {
  failed: '监测失败',
  autoMonitor: '自动监测豆包',
  autoMonitoring: '豆包监测中',
  autoStarted: '豆包自动监测已开始',
  autoFailed: '豆包自动监测启动失败。',
  autoComplete: '豆包监测已完成',
  title: "\u4eba\u5de5 AI \u68c0\u6d4b",
  subtitle: "ChatGPT \u00b7 DeepSeek \u00b7 Kimi \u00b7 \u8c46\u5305",
  start: "\u5f00\u59cb AI \u68c0\u6d4b",
  newRound: "\u65b0\u5efa\u4e00\u8f6e\u68c0\u6d4b",
  noAudit: "\u8fd8\u6ca1\u6709\u68c0\u6d4b\u8bb0\u5f55",
  noAuditDetail: "\u9009\u62e9\u5e73\u53f0\u548c\u95ee\u9898\u6570\uff0c\u7136\u540e\u5f00\u59cb\u4eba\u5de5\u91c7\u96c6\u3002",
  loading: "\u6b63\u5728\u52a0\u8f7d\u68c0\u6d4b\u4efb\u52a1...",
  loadFailed: "\u68c0\u6d4b\u4efb\u52a1\u52a0\u8f7d\u5931\u8d25\u3002",
  projectMissing: "\u9879\u76ee\u4e0d\u5b58\u5728\u3002",
  platforms: "\u68c0\u6d4b\u5e73\u53f0",
  platformsHint: "\u8c46\u5305\u53ef\u76f4\u63a5\u81ea\u52a8\u91c7\u96c6\uff0c\u5176\u4ed6\u5e73\u53f0\u53ef\u6309\u9700\u52a0\u5165\u5bf9\u6bd4\u3002",
  questionCount: "\u6bcf\u4e2a\u5e73\u53f0\u7684\u95ee\u9898\u6570",
  total: "\u603b\u4efb\u52a1\u6570",
  completed: "\u5df2\u63d0\u4ea4",
  mentioned: "\u54c1\u724c\u63d0\u53ca",
  recommended: "\u83b7\u5f97\u63a8\u8350",
  progress: "\u5f53\u524d\u8fdb\u5ea6",
  history: "\u68c0\u6d4b\u6279\u6b21",
  copy: "\u590d\u5236\u68c0\u6d4b\u63d0\u793a\u8bcd",
  copied: "\u68c0\u6d4b\u63d0\u793a\u8bcd\u5df2\u590d\u5236",
  submit: "\u63d0\u4ea4\u5e76\u5206\u6790",
  update: "\u66f4\u65b0\u5206\u6790",
  pending: "\u5f85\u63d0\u4ea4",
  apiCollecting: "API \u91c7\u96c6\u4e2d",
  apiAnswer: "\u76d1\u6d4b\u7ed3\u679c",
  viewFullResult: "\u67e5\u770b\u5b8c\u6574\u7ed3\u679c",
  analyzed: "\u5df2\u5206\u6790",
  mentionYes: "\u5df2\u63d0\u53ca\u54c1\u724c",
  mentionNo: "\u672a\u63d0\u53ca\u54c1\u724c",
  recommendYes: "\u6709\u63a8\u8350\u503e\u5411",
  factRisk: "\u53ef\u80fd\u5b58\u5728\u4e8b\u5b9e\u51b2\u7a81",
  factMatch: "\u5339\u914d\u54c1\u724c\u4e8b\u5b9e",
  sources: "\u5f15\u7528\u6765\u6e90",
  retryFailure:
    "\u672c\u6b21\u76d1\u6d4b\u672a\u8fd4\u56de\u53ef\u7528\u7b54\u6848\uff0c\u53ef\u70b9\u51fb\u201c\u81ea\u52a8\u76d1\u6d4b\u8c46\u5305\u201d\u91cd\u8bd5\u3002",
  createFailed: "\u68c0\u6d4b\u521b\u5efa\u5931\u8d25\u3002",
  submitFailed: "\u56de\u7b54\u63d0\u4ea4\u5931\u8d25\u3002",
  submitted: "\u56de\u7b54\u5df2\u4fdd\u5b58\u5e76\u5b8c\u6210\u5206\u6790",
}

type PlatformOption = {
  id: ManualAuditPlatform
  engine: ManualAuditTask["engine"]
  label: string
  url: string
}

const platformOptions: PlatformOption[] = [
  { id: "chatgpt", engine: "CHATGPT", label: "ChatGPT", url: "https://chatgpt.com/" },
  { id: "deepseek", engine: "DEEPSEEK", label: "DeepSeek", url: "https://chat.deepseek.com/" },
  { id: "kimi", engine: "KIMI", label: "Kimi", url: "https://www.kimi.com/" },
  { id: "doubao", engine: "DOUBAO", label: "\u8c46\u5305", url: "https://www.doubao.com/chat/" },
]

const platformByEngine = new Map(
  platformOptions.map((platform) => [platform.engine, platform]),
)

function platformForTask(task: ManualAuditTask) {
  return (
    platformByEngine.get(task.engine) ?? {
      id: "chatgpt" as const,
      engine: task.engine,
      label: task.platformProduct ?? task.engine,
      url: "",
    }
  )
}

const textareaClass =
  "min-h-36 w-full resize-y rounded-lg border border-input bg-background px-3 py-2 text-sm leading-6 outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"

function buildManualTestPrompt(question: string) {
   const isChinese = /[\u3400-\u9fff]/.test(question)
   const lines = isChinese
     ? [
         "\u8bf7\u72ec\u7acb\u56de\u7b54\u4e0b\u9762\u7684\u95ee\u9898\u3002",
         "",
         "\u8981\u6c42\uff1a",
         "1. \u76f4\u63a5\u7ed9\u51fa\u7ed3\u8bba\uff0c\u4e0d\u8981\u5411\u6211\u8ffd\u95ee\u3002",
         "2. \u5982\u6d89\u53ca\u4ea7\u54c1\u6216\u5de5\u5177\u63a8\u8350\uff0c\u8bf7\u7ed9\u51fa 3-5 \u4e2a\u5177\u4f53\u9009\u9879\u5e76\u5206\u522b\u8bf4\u660e\u7406\u7531\u3002",
         "3. \u8bf7\u533a\u5206\u786e\u5b9a\u4e8b\u5b9e\u548c\u63a8\u6d4b\uff1b\u4e0d\u786e\u5b9a\u7684\u4fe1\u606f\u8bf7\u660e\u786e\u8bf4\u660e\u3002",
         "4. \u5982\u679c\u80fd\u591f\u63d0\u4f9b\u6765\u6e90\uff0c\u8bf7\u9644\u4e0a\u53ef\u8bbf\u95ee\u7684\u94fe\u63a5\u3002",
         "",
         `\u95ee\u9898\uff1a${question}`,
       ]
     : [
         "Answer the following question independently.",
         "",
         "Requirements:",
         "1. Give a direct answer without asking follow-up questions.",
         "2. If products or tools are requested, list 3-5 specific options and explain each choice.",
         "3. Separate established facts from assumptions and state uncertainty clearly.",
         "4. Include accessible source links when available.",
         "",
         `Question: ${question}`,
       ]
   return lines.join("\n")
 }
 

function latestAnswer(task: ManualAuditTask) {
  return task.answers[0]
}

function latestAnalysis(task: ManualAuditTask) {
  return latestAnswer(task)?.analysisVersions[0]
}

function matchedFactCount(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return 0
  const facts = (value as { matchedFacts?: unknown }).matchedFacts
  return Array.isArray(facts) ? facts.length : 0
}

export function ProjectAudits({ projectId }: { projectId: string }) {
  const [project, setProject] = useState<Project | null>(null)
  const [audits, setAudits] = useState<ManualAudit[]>([])
  const [selectedAuditId, setSelectedAuditId] = useState<string | null>(null)
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const [expandedTaskIds, setExpandedTaskIds] = useState<Set<string>>(
    () => new Set(),
  )
  const [selectedPlatforms, setSelectedPlatforms] = useState<
    ManualAuditPlatform[]
  >(["doubao"])
  const [questionCount, setQuestionCount] = useState(5)
  const [selectedEngine, setSelectedEngine] = useState<
    ManualAuditTask["engine"]
  >("CHATGPT")
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [resultTaskId, setResultTaskId] = useState<string | null>(null)
  const [error, setError] = useState("")

  const load = useCallback(
    async (preferredAuditId?: string, auditsOnly = false) => {
      setError("")
      try {
        const [projectResponse, auditsResponse] = await Promise.all([
          auditsOnly ? Promise.resolve(null) : getProject(projectId),
          listProjectAudits(projectId),
        ])
        if (projectResponse) setProject(projectResponse.data)
        setAudits(auditsResponse.data)
        setSelectedAuditId((current) => {
          const preferred = preferredAuditId ?? current
          return preferred &&
            auditsResponse.data.some((audit) => audit.id === preferred)
            ? preferred
            : (auditsResponse.data[0]?.id ?? null)
        })
        setDrafts((current) => {
          const next = { ...current }
          for (const audit of auditsResponse.data) {
            for (const task of audit.detectionTasks) {
              next[task.id] = next[task.id] ?? latestAnswer(task)?.content ?? ""
            }
          }
          return next
        })
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : ui.loadFailed)
      } finally {
        setLoading(false)
      }
    },
    [projectId],
  )

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0)
    return () => window.clearTimeout(timer)
  }, [load])

  const selectedAudit = useMemo(
    () =>
      audits.find((audit) => audit.id === selectedAuditId) ?? audits[0] ?? null,
    [audits, selectedAuditId],
  )
  const tasks = selectedAudit?.detectionTasks ?? []
  const auditPlatforms = platformOptions.filter((platform) =>
    tasks.some((task) => task.engine === platform.engine),
  )
  const activeEngine = tasks.some((task) => task.engine === selectedEngine)
    ? selectedEngine
    : (tasks[0]?.engine ?? selectedEngine)
  const visibleTasks = tasks.filter((task) => task.engine === activeEngine)
  const resultTasks = visibleTasks.filter((task) => latestAnswer(task))
  const selectedResultIndex = resultTasks.findIndex(
    (task) => task.id === resultTaskId,
  )
  const selectedResultTask = resultTasks[selectedResultIndex]
  const selectedResultAnswer = selectedResultTask
    ? latestAnswer(selectedResultTask)
    : undefined
  const mentionedCount = tasks.filter(
    (task) => latestAnalysis(task)?.targetMentioned,
  ).length
  const recommendedCount = tasks.filter(
    (task) => latestAnalysis(task)?.targetRecommended,
  ).length
  const completedCount = tasks.filter((task) => latestAnswer(task)).length
  const failedCount = tasks.filter((task) => task.status === "FAILED").length
  const settledCount = completedCount + failedCount
  const progress = tasks.length
    ? Math.round((settledCount / tasks.length) * 100)
    : 0
  const hasPendingApiTasks = tasks.some(
    (task) =>
      task.collectionMethod === "API" &&
      (task.status === "QUEUED" || task.status === "RUNNING"),
  )
  const pendingDoubaoTasks = visibleTasks.filter(
    (task) =>
      task.engine === 'DOUBAO' &&
      !latestAnswer(task) &&
      (task.status === 'WAITING_MANUAL' || task.status === 'FAILED'),
  )
  const doubaoCollecting = visibleTasks.some(
    (task) =>
      task.engine === 'DOUBAO' &&
      task.collectionMethod === 'API' &&
      (task.status === 'QUEUED' ||
        task.status === 'RUNNING' ||
        task.status === 'RETRYING'),
  )

  useEffect(() => {
    if (!selectedAudit || !hasPendingApiTasks) return
    const timer = window.setTimeout(
      () => void load(selectedAudit.id, true),
      5_000,
    )
    return () => window.clearTimeout(timer)
  }, [hasPendingApiTasks, load, selectedAudit])

  function handlePlatformToggle(platform: ManualAuditPlatform) {
    setSelectedPlatforms((current) =>
      current.includes(platform)
        ? current.filter((item) => item !== platform)
        : [...current, platform],
    )
  }

  function handleTaskToggle(taskId: string) {
    setExpandedTaskIds((current) => {
      const next = new Set(current)
      if (next.has(taskId)) {
        next.delete(taskId)
      } else {
        next.add(taskId)
      }
      return next
    })
  }

  async function handleStart() {
    if (selectedPlatforms.length < 1) return
    setBusyId("start")
    setError("")
    try {
      const response = await createManualAudit(
        projectId,
        questionCount,
        selectedPlatforms,
      )
      const firstEngine = response.data.detectionTasks[0]?.engine
      if (firstEngine) setSelectedEngine(firstEngine)
      await load(response.data.id)
      toast.success(
        `\u5df2\u521b\u5efa ${questionCount} \u4e2a\u95ee\u9898 \u00d7 ${selectedPlatforms.length} \u4e2a\u5e73\u53f0\uff0c\u5171 ${questionCount * selectedPlatforms.length} \u6761\u4efb\u52a1`,
      )
    } catch (startError) {
      setError(startError instanceof Error ? startError.message : ui.createFailed)
    } finally {
      setBusyId(null)
    }
  }

  async function handleCopy(text: string) {
    try {
      await navigator.clipboard.writeText(text)
      toast.success(ui.copied)
    } catch {
      toast.error(ui.copy)
    }
  }

  async function handleSubmit(task: ManualAuditTask) {
    if (!selectedAudit) return
    const content = drafts[task.id]?.trim()
    if (!content || content.length < 10) return
    setBusyId(task.id)
    setError("")
    try {
      await submitManualAuditAnswer(
        projectId,
        selectedAudit.id,
        task.id,
        content,
      )
      await load(selectedAudit.id)
      toast.success(ui.submitted)
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : ui.submitFailed,
      )
    } finally {
      setBusyId(null)
    }
  }

  async function handleStartDoubaoAutomaticCollection() {
    if (!selectedAudit || pendingDoubaoTasks.length < 1) return
    setBusyId('auto-doubao')
    setError('')
    try {
      await startDoubaoAutomaticCollection(projectId, selectedAudit.id)
      await load(selectedAudit.id)
      toast.success(ui.autoStarted)
    } catch (collectError) {
      setError(
        collectError instanceof Error ? collectError.message : ui.autoFailed,
      )
    } finally {
      setBusyId(null)
    }
  }

  if (loading) return <LoadingState label={ui.loading} />
  if (!project) {
    return (
      <div className="p-4 md:p-6">
        <ErrorState message={error || ui.projectMissing} retry={() => void load()} />
      </div>
    )
  }

  return (
    <div className="@container/main flex flex-1 flex-col gap-5 p-4 md:p-6">
      <ProjectHeader project={project} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-medium">{ui.title}</h3>
          <p className="text-sm text-muted-foreground">{ui.subtitle}</p>
        </div>
        <div className="flex flex-wrap gap-2">
        {selectedAudit && completedCount > 0 ? (
          <Button
            variant="outline"
            render={
              <Link
                href={`/projects/${projectId}/reports?audit=${selectedAudit.id}`}
              />
            }
          >
            <BarChart3Icon data-icon="inline-start" />
            {"\u67e5\u770b\u62a5\u544a"}
          </Button>
        ) : null}
        <Button
          onClick={() => void handleStart()}
          disabled={
            busyId === "start" ||
            selectedPlatforms.length < 1
          }
        >
          {busyId === "start" ? (
            <LoaderCircleIcon className="animate-spin" />
          ) : audits.length ? (
            <PlayIcon data-icon="inline-start" />
          ) : (
            <FileSearchIcon data-icon="inline-start" />
          )}
          {audits.length ? ui.newRound : ui.start}
        </Button>
        </div>
      </div>

      <section className="grid gap-4 border-y py-4 md:grid-cols-[minmax(0,1fr)_180px] md:items-end">
        <div className="grid gap-3">
          <div>
            <p className="text-sm font-medium">{ui.platforms}</p>
            <p className="text-xs text-muted-foreground">
              {ui.platformsHint}{" "}
              <span className="tabular-nums text-foreground">
                {"\u5df2\u9009 "}{selectedPlatforms.length}{" \u4e2a"}
              </span>
            </p>
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-2" role="group">
            {platformOptions.map((platform) => {
              const checked = selectedPlatforms.includes(platform.id)
              return (
                <label
                  key={platform.id}
                  className="flex min-w-28 cursor-pointer items-center gap-2 text-sm"
                >
                  <input
                    type="checkbox"
                    className="size-4 accent-emerald-600"
                    checked={checked}
                    onChange={() => handlePlatformToggle(platform.id)}
                  />
                  <span>{platform.label}</span>
                </label>
              )
            })}
          </div>
        </div>
        <label className="grid gap-2 text-sm">
          <span className="font-medium">{ui.questionCount}</span>
          <select
            className="h-9 cursor-pointer rounded-lg border border-input bg-background px-3 text-sm text-foreground"
            value={questionCount}
            onChange={(event) => setQuestionCount(Number(event.target.value))}
          >
            {[3, 5, 10, 20].map((count) => (
              <option key={count} value={count}>
                {count} {"\u4e2a\u95ee\u9898"}
              </option>
            ))}
          </select>
        </label>
      </section>

      {error ? (
        <p
          role="alert"
          className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700"
        >
          {error}
        </p>
      ) : null}

      {!selectedAudit ? (
        <section className="flex min-h-72 flex-col items-center justify-center gap-4 border-t p-8 text-center">
          <FileSearchIcon className="size-7 text-muted-foreground" />
          <div>
            <h4 className="font-medium">{ui.noAudit}</h4>
            <p className="mt-1 text-sm text-muted-foreground">
              {ui.noAuditDetail}
            </p>
          </div>
          <Button
            onClick={() => void handleStart()}
            disabled={
              busyId === "start" || selectedPlatforms.length < 1
            }
          >
            {busyId === "start" ? (
              <LoaderCircleIcon className="animate-spin" />
            ) : (
              <PlayIcon data-icon="inline-start" />
            )}
            {ui.start}
          </Button>
        </section>
      ) : (
        <>
          <div className="grid grid-cols-2 border-y sm:grid-cols-4">
            {[
              [ui.total, tasks.length],
              [ui.completed, completedCount],
              [ui.mentioned, mentionedCount],
              [ui.recommended, recommendedCount],
            ].map(([label, value], index) => (
              <div
                key={String(label)}
                className={`p-3 ${index ? "border-l" : ""}`}
              >
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="mt-1 text-xl font-semibold tabular-nums">{value}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px] md:items-end">
            <div>
              <div className="flex items-center justify-between gap-3 text-sm">
                <span>{ui.progress}</span>
                <span className="tabular-nums text-muted-foreground">
                  {settledCount} / {tasks.length}
                  {failedCount > 0
                    ? " \u00b7 \u6210\u529f " +
                      completedCount +
                      " \u00b7 \u5931\u8d25 " +
                      failedCount
                    : ""}
                </span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                <span
                  className="block h-full rounded-full bg-emerald-600"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            {audits.length > 1 ? (
              <label className="grid gap-1 text-xs text-muted-foreground">
                {ui.history}
                <select
                  className="h-9 rounded-lg border border-input bg-background px-3 text-sm text-foreground"
                  value={selectedAudit.id}
                  onChange={(event) => setSelectedAuditId(event.target.value)}
                >
                  {audits.map((audit, index) => (
                    <option key={audit.id} value={audit.id}>
                      #{audits.length - index} {"\u00b7"}{" "}
                      {new Date(audit.createdAt).toLocaleDateString("zh-CN")}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
          </div>

          <nav
            className="flex gap-1 overflow-x-auto border-b"
            aria-label="\u68c0\u6d4b\u5e73\u53f0"
          >
            {auditPlatforms.map((platform) => {
              const platformTasks = tasks.filter(
                (task) => task.engine === platform.engine,
              )
              const platformCompleted = platformTasks.filter((task) =>
                latestAnswer(task),
              ).length
              const active = activeEngine === platform.engine
              return (
                <button
                  key={platform.engine}
                  type="button"
                  className={`h-10 shrink-0 border-b-2 px-4 text-sm transition-colors ${
                    active
                      ? "border-emerald-600 font-medium text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                  aria-current={active ? "page" : undefined}
                  onClick={() => setSelectedEngine(platform.engine)}
                >
                  {platform.label}{" "}
                  <span className="tabular-nums text-muted-foreground">
                    {platformCompleted}/{platformTasks.length}
                  </span>
                </button>
              )
            })}
          </nav>

          {activeEngine === 'DOUBAO' ? (
            <div className={'flex justify-end'}>
              <Button
                onClick={() => void handleStartDoubaoAutomaticCollection()}
                disabled={
                  busyId === 'auto-doubao' ||
                  doubaoCollecting ||
                  pendingDoubaoTasks.length < 1
                }
              >
                {busyId === 'auto-doubao' || doubaoCollecting ? (
                  <LoaderCircleIcon className={'animate-spin'} />
                ) : (
                  <PlayIcon data-icon={'inline-start'} />
                )}
                {busyId === 'auto-doubao' || doubaoCollecting
                  ? ui.autoMonitoring
                  : pendingDoubaoTasks.length > 0
                    ? `${ui.autoMonitor} (${pendingDoubaoTasks.length})`
                    : ui.autoComplete}
              </Button>
            </div>
          ) : null}

          <div className="grid gap-3">
            {visibleTasks.map((task, index) => {
              const platform = platformForTask(task)
              const answer = latestAnswer(task)
              const automated = task.collectionMethod === "API"
              const analysis = latestAnalysis(task)
              const matchedFacts = analysis
                ? matchedFactCount(analysis.evidenceQuotes)
                : 0
              const draft = automated
                ? (answer?.content ?? "")
                : (drafts[task.id] ?? answer?.content ?? "")
              const unchanged = Boolean(answer && draft.trim() === answer.content)
              const expanded = expandedTaskIds.has(task.id)
              return (
                <Card key={task.id} className="rounded-lg shadow-none">
                  <CardHeader className="gap-3 px-0">
                    <div className="flex flex-col gap-3 px-4 py-1 sm:flex-row sm:items-start">
                      <button
                        type="button"
                        className="flex min-w-0 flex-1 cursor-pointer gap-3 text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                        aria-expanded={expanded}
                        aria-controls={`audit-task-details-${task.id}`}
                        onClick={() => handleTaskToggle(task.id)}
                      >
                        <span className="mt-0.5 w-6 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <span className="text-sm font-medium leading-6">
                          {task.prompt.text}
                        </span>
                      </button>
                      <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
                        <Badge
                          variant="outline"
                          className={
                            platform.id === "doubao"
                              ? "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900 dark:bg-sky-950/50 dark:text-sky-300"
                              : undefined
                          }
                        >
                          {platform.label}
                        </Badge>
                        {answer ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setResultTaskId(task.id)}
                          >
                            <EyeIcon data-icon="inline-start" />
                            {ui.viewFullResult}
                          </Button>
                        ) : null}
                        <Badge
                          variant="outline"
                          className={
                            answer
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : "bg-muted text-muted-foreground"
                          }
                        >
                          {answer
                            ? ui.analyzed
                            : task.status === 'FAILED'
                              ? ui.failed
                              : automated
                              ? ui.apiCollecting
                              : ui.pending}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={expanded ? "收起监测结果" : "展开监测结果"}
                          aria-expanded={expanded}
                          aria-controls={`audit-task-details-${task.id}`}
                          onClick={() => handleTaskToggle(task.id)}
                        >
                          <ChevronDownIcon
                            className={`size-4 text-muted-foreground transition-transform ${
                              expanded ? "rotate-180" : ""
                            }`}
                            aria-hidden="true"
                          />
                        </Button>
                      </div>
                    </div>
                    <div
                      className="flex flex-wrap gap-2 px-4 sm:pl-13"
                      hidden={!expanded}
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => void handleCopy(buildManualTestPrompt(task.prompt.text))}
                      >
                        <ClipboardIcon data-icon="inline-start" />
                        {ui.copy}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        render={
                          <a
                            href={platform.url}
                            target="_blank"
                            rel="noreferrer"
                          />
                        }
                      >
                        <ExternalLinkIcon data-icon="inline-start" />
                        {"\u6253\u5f00 "}{platform.label}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent
                    id={`audit-task-details-${task.id}`}
                    className="grid gap-3"
                    hidden={!expanded}
                  >
                    {task.status === "FAILED" && !answer ? (
                      <p
                        role="alert"
                        className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800"
                      >
                        {task.errorCode === "DOUBAO_EMPTY_RESPONSE"
                          ? ui.retryFailure
                          : task.errorMessage || ui.retryFailure}
                      </p>
                    ) : null}
                    <div className="grid gap-2 text-sm">
                      <span className="font-medium">
                        {automated ? (
                          <>{ui.apiAnswer}</>
                        ) : (
                          <>{"\u7c98\u8d34 "}{platform.label}{" \u56de\u7b54"}</>
                        )}
                      </span>
                      {automated && answer ? (
                        <div
                          className="max-h-72 overflow-y-auto rounded-lg border px-4 py-3"
                          role="textbox"
                          aria-readonly="true"
                          aria-label={platform.label + " " + ui.apiAnswer}
                        >
                          <MarkdownContent content={answer.content} />
                        </div>
                      ) : (
                        <textarea
                          className={textareaClass}
                          value={draft}
                          readOnly={automated}
                          aria-label={
                            automated
                              ? platform.label + " " + ui.apiAnswer
                              : "\u7c98\u8d34 " + platform.label + " \u56de\u7b54"
                          }
                          onChange={(event) =>
                            setDrafts((current) => ({
                              ...current,
                              [task.id]: event.target.value,
                            }))
                          }
                        />
                      )}
                    </div>
                    {answer?.citations.length ? (
                      <div className="grid gap-2 text-sm">
                        <span className="font-medium">{ui.sources}</span>
                        <div className="grid gap-1">
                          {answer.citations.map((citation, citationIndex) => (
                            <a
                              key={citation.url + ":" + citationIndex}
                              href={citation.url}
                              target="_blank"
                              rel="noreferrer"
                              className="flex min-w-0 items-center gap-2 text-xs text-emerald-700 hover:underline"
                            >
                              <ExternalLinkIcon className="size-3.5 shrink-0" />
                              <span className="truncate">
                                {citation.title || citation.url}
                              </span>
                            </a>
                          ))}
                        </div>
                      </div>
                    ) : null}
                    {analysis ? (
                      <div className="flex flex-wrap gap-2">
                        <Badge
                          variant="outline"
                          className={
                            analysis.targetMentioned
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : "border-amber-200 bg-amber-50 text-amber-800"
                          }
                        >
                          {analysis.targetMentioned ? (
                            <CheckCircle2Icon />
                          ) : (
                            <CircleAlertIcon />
                          )}
                          {analysis.targetMentioned
                            ? ui.mentionYes
                            : ui.mentionNo}
                        </Badge>
                        {analysis.targetRecommended ? (
                          <Badge
                            variant="outline"
                            className="border-emerald-200 bg-emerald-50 text-emerald-700"
                          >
                            <ThumbsUpIcon />
                            {ui.recommendYes}
                          </Badge>
                        ) : null}
                        <Badge
                          variant="outline"
                          className={
                            analysis.factRisk
                              ? "border-rose-200 bg-rose-50 text-rose-700"
                              : "bg-muted text-muted-foreground"
                          }
                        >
                          {analysis.factRisk ? (
                            <CircleAlertIcon />
                          ) : (
                            <CheckCircle2Icon />
                          )}
                          {analysis.factRisk
                            ? ui.factRisk
                            : `${ui.factMatch} ${matchedFacts}`}
                        </Badge>
                      </div>
                    ) : null}
                    {!automated ? <div className="flex justify-end">
                      <Button
                        onClick={() => void handleSubmit(task)}
                        disabled={
                          busyId === task.id ||
                          draft.trim().length < 10 ||
                          unchanged
                        }
                      >
                        {busyId === task.id ? (
                          <LoaderCircleIcon className="animate-spin" />
                        ) : (
                          <SendIcon data-icon="inline-start" />
                        )}
                        {answer ? ui.update : ui.submit}
                      </Button>
                    </div> : null}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </>
      )}
      {selectedResultTask && selectedResultAnswer ? (
        <Dialog
          open
          onOpenChange={(open) => {
            if (!open) setResultTaskId(null)
          }}
        >
          <DialogContent className="h-[min(48rem,calc(100dvh-1.5rem))] sm:h-[min(48rem,calc(100dvh-3rem))] sm:max-w-4xl">
            <DialogHeader>
              <DialogTitle>
                {platformForTask(selectedResultTask).label} {ui.apiAnswer}
              </DialogTitle>
              <DialogDescription>
                {selectedResultTask.prompt.text}
              </DialogDescription>
            </DialogHeader>

            <div className="grid shrink-0 gap-2 border-b px-5 py-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
              <label>
                <span className="sr-only">选择监测结果</span>
                <select
                  className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground"
                  value={selectedResultTask.id}
                  onChange={(event) => setResultTaskId(event.target.value)}
                >
                  {resultTasks.map((task, index) => (
                    <option key={task.id} value={task.id}>
                      {String(index + 1).padStart(2, "0") +
                        " · " +
                        task.prompt.text}
                    </option>
                  ))}
                </select>
              </label>
              <div className="flex items-center justify-end gap-1">
                <span className="mr-2 text-xs tabular-nums text-muted-foreground">
                  {selectedResultIndex + 1} / {resultTasks.length}
                </span>
                <Button
                  variant="outline"
                  size="icon-sm"
                  aria-label="上一个结果"
                  title="上一个结果"
                  disabled={selectedResultIndex <= 0}
                  onClick={() =>
                    setResultTaskId(resultTasks[selectedResultIndex - 1].id)
                  }
                >
                  <ArrowLeftIcon />
                </Button>
                <Button
                  variant="outline"
                  size="icon-sm"
                  aria-label="下一个结果"
                  title="下一个结果"
                  disabled={selectedResultIndex >= resultTasks.length - 1}
                  onClick={() =>
                    setResultTaskId(resultTasks[selectedResultIndex + 1].id)
                  }
                >
                  <ArrowRightIcon />
                </Button>
              </div>
            </div>

            <div
              key={selectedResultTask.id}
              className="min-h-0 flex-1 overflow-y-auto px-5 py-5"
            >
              <MarkdownContent content={selectedResultAnswer.content} />
              {selectedResultAnswer.citations.length ? (
                <div className="mt-6 grid gap-2 border-t pt-4 text-sm">
                  <span className="font-medium">{ui.sources}</span>
                  <div className="grid gap-1">
                    {selectedResultAnswer.citations.map(
                      (citation, citationIndex) => (
                        <a
                          key={citation.url + ":" + citationIndex}
                          href={citation.url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex min-w-0 items-center gap-2 text-xs text-emerald-700 hover:underline"
                        >
                          <ExternalLinkIcon className="size-3.5 shrink-0" />
                          <span className="truncate">
                            {citation.title || citation.url}
                          </span>
                        </a>
                      ),
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          </DialogContent>
        </Dialog>
      ) : null}
    </div>
  )
}

