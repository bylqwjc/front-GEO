"use client"

import Link from "next/link"
import { type FormEvent, useCallback, useEffect, useMemo, useState } from "react"
import {
  ArrowRightIcon,
  CheckCircle2Icon,
  ChevronDownIcon,
  ClipboardIcon,
  ExternalLinkIcon,
  FileTextIcon,
  Link2Icon,
  ListChecksIcon,
  LoaderCircleIcon,
  RadarIcon,
} from "lucide-react"
import { toast } from "sonner"

import { ErrorState, LoadingState, ProjectHeader } from "@/components/project-shared"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  getProject,
  listOptimizationTasks,
  submitOptimizationTaskVerification,
  updateOptimizationTask,
  type OptimizationTask,
  type Project,
} from "@/lib/project-api"

type Filter = "all" | "open" | "verify" | "done"

const statusMeta: Record<
  OptimizationTask["status"],
  { label: string; className: string }
> = {
  TODO: {
    label: "\u5f85\u5904\u7406",
    className: "border-amber-200 bg-amber-50 text-amber-800",
  },
  IN_PROGRESS: {
    label: "\u5904\u7406\u4e2d",
    className: "border-sky-200 bg-sky-50 text-sky-700",
  },
  BLOCKED: {
    label: "\u53d7\u963b",
    className: "border-rose-200 bg-rose-50 text-rose-700",
  },
  READY_TO_VERIFY: {
    label: "\u5f85\u9a8c\u8bc1",
    className: "border-violet-200 bg-violet-50 text-violet-700",
  },
  VERIFIED: {
    label: "\u5df2\u9a8c\u8bc1",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  REJECTED: {
    label: "\u672a\u901a\u8fc7",
    className: "border-rose-200 bg-rose-50 text-rose-700",
  },
  DISMISSED: {
    label: "\u5df2\u5ffd\u7565",
    className: "bg-muted text-muted-foreground",
  },
}

const priorityMeta: Record<
  OptimizationTask["priority"],
  { label: string; className: string }
> = {
  BLOCKER: {
    label: "\u963b\u65ad",
    className: "border-rose-200 bg-rose-50 text-rose-700",
  },
  HIGH: {
    label: "\u9ad8\u4f18\u5148\u7ea7",
    className: "border-orange-200 bg-orange-50 text-orange-700",
  },
  MEDIUM: {
    label: "\u4e2d\u4f18\u5148\u7ea7",
    className: "border-sky-200 bg-sky-50 text-sky-700",
  },
  LOW: {
    label: "\u4f4e\u4f18\u5148\u7ea7",
    className: "bg-muted text-muted-foreground",
  },
}

const verificationMeta: Record<
  OptimizationTask["verifications"][number]["status"],
  { label: string; className: string }
> = {
  PENDING: {
    label: "\u68c0\u67e5\u4e2d",
    className: "border-sky-200 bg-sky-50 text-sky-700",
  },
  NEEDS_MANUAL: {
    label: "\u7b49\u5f85\u4eba\u5de5\u590d\u6d4b",
    className: "border-violet-200 bg-violet-50 text-violet-700",
  },
  VERIFIED: {
    label: "\u5df2\u9a8c\u8bc1\u6539\u5584",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  REJECTED: {
    label: "\u590d\u6d4b\u672a\u6539\u5584",
    className: "border-rose-200 bg-rose-50 text-rose-700",
  },
}

function stringList(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : []
}

function taskRequirements(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {
      question: "",
      suggestedDraft: "",
      draftNote: "",
      verifiedFacts: [] as string[],
    }
  }
  const record = value as Record<string, unknown>
  return {
    question: typeof record.question === "string" ? record.question : "",
    suggestedDraft:
      typeof record.suggestedDraft === "string" ? record.suggestedDraft : "",
    draftNote:
      typeof record.draftNote === "string" ? record.draftNote : "",
    verifiedFacts: stringList(record.verifiedFacts),
  }
}

function taskExpectedMetrics(value: unknown) {
  const empty = {
    expected: "",
    expectation: "",
    mechanism: "",
    measurement: "",
    timeframe: "",
  }
  if (!value || typeof value !== "object" || Array.isArray(value)) return empty

  const record = value as Record<string, unknown>
  return Object.fromEntries(
    Object.keys(empty).map((key) => [
      key,
      typeof record[key] === "string" ? record[key] : "",
    ]),
  ) as typeof empty
}

function isOpen(status: OptimizationTask["status"]) {
  return ["TODO", "IN_PROGRESS", "BLOCKED", "REJECTED"].includes(status)
}

function filterTask(task: OptimizationTask, filter: Filter) {
  if (filter === "open") return isOpen(task.status)
  if (filter === "verify") return task.status === "READY_TO_VERIFY"
  if (filter === "done") {
    return ["VERIFIED", "DISMISSED"].includes(task.status)
  }
  return true
}

export function ProjectOptimizationTasks({ projectId }: { projectId: string }) {
  const [project, setProject] = useState<Project | null>(null)
  const [tasks, setTasks] = useState<OptimizationTask[]>([])
  const [filter, setFilter] = useState<Filter>("all")
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [urlDrafts, setUrlDrafts] = useState<Record<string, string>>({})
  const [expandedTaskIds, setExpandedTaskIds] = useState<Set<string>>(
    () => new Set(),
  )
  const [error, setError] = useState("")

  const load = useCallback(async () => {
    setError("")
    try {
      const [projectResponse, taskResponse] = await Promise.all([
        getProject(projectId),
        listOptimizationTasks(projectId),
      ])
      setProject(projectResponse.data)
      setTasks(taskResponse.data)
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "\u4f18\u5316\u4efb\u52a1\u52a0\u8f7d\u5931\u8d25\u3002",
      )
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0)
    return () => window.clearTimeout(timer)
  }, [load])

  const visibleTasks = useMemo(
    () => tasks.filter((task) => filterTask(task, filter)),
    [filter, tasks],
  )
  const openCount = tasks.filter((task) => isOpen(task.status)).length
  const verifyCount = tasks.filter(
    (task) => task.status === "READY_TO_VERIFY",
  ).length
  const doneCount = tasks.filter((task) =>
    ["VERIFIED", "DISMISSED"].includes(task.status),
  ).length

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

  async function handleStatus(
    task: OptimizationTask,
    status: OptimizationTask["status"],
  ) {
    setBusyId(task.id)
    setError("")
    try {
      const response = await updateOptimizationTask(
        projectId,
        task.id,
        status,
      )
      setTasks((current) =>
        current.map((item) =>
          item.id === task.id ? response.data : item,
        ),
      )
      toast.success("\u4efb\u52a1\u72b6\u6001\u5df2\u66f4\u65b0")
    } catch (updateError) {
      setError(
        updateError instanceof Error
          ? updateError.message
          : "\u4efb\u52a1\u72b6\u6001\u66f4\u65b0\u5931\u8d25\u3002",
      )
    } finally {
      setBusyId(null)
    }
  }

  async function handleVerificationSubmit(
    event: FormEvent<HTMLFormElement>,
    task: OptimizationTask,
  ) {
    event.preventDefault()
    const submittedUrl = (urlDrafts[task.id] ?? "").trim()
    if (!submittedUrl) return

    setBusyId(task.id)
    setError("")
    try {
      const response = await submitOptimizationTaskVerification(
        projectId,
        task.id,
        submittedUrl,
      )
      setTasks((current) =>
        current.map((item) =>
          item.id === task.id ? response.data : item,
        ),
      )
      setUrlDrafts((current) => ({ ...current, [task.id]: "" }))
      toast.success(
        "\u9875\u9762\u5df2\u901a\u8fc7\u8bbf\u95ee\u68c0\u67e5\uff0c\u7b49\u5f85\u4eba\u5de5\u590d\u6d4b",
      )
    } catch (submitError) {
      const message =
        submitError instanceof Error
          ? submitError.message
          : "\u53d1\u5e03\u9875\u9762\u63d0\u4ea4\u5931\u8d25\u3002"
      setError(message)
      toast.error(message)
    } finally {
      setBusyId(null)
    }
  }

  async function handleCopy(content: string) {
    try {
      await navigator.clipboard.writeText(content)
      toast.success("\u5185\u5bb9\u521d\u7a3f\u5df2\u590d\u5236")
    } catch {
      toast.error("\u590d\u5236\u5931\u8d25")
    }
  }

  if (loading) return <LoadingState label={"\u6b63\u5728\u52a0\u8f7d\u4f18\u5316\u4efb\u52a1..."} />
  if (!project) {
    return (
      <div className="p-4 md:p-6">
        <ErrorState
          message={error || "\u9879\u76ee\u4e0d\u5b58\u5728\u3002"}
          retry={() => void load()}
        />
      </div>
    )
  }

  return (
    <div className="@container/main flex flex-1 flex-col gap-5 p-4 md:p-6">
      <ProjectHeader project={project} />

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="font-medium">{"\u4f18\u5316\u4efb\u52a1"}</h3>
          <p className="text-sm text-muted-foreground">
            {"\u6839\u636e AI \u68c0\u6d4b\u7ed3\u679c\u751f\u6210\u7684\u5185\u5bb9\u548c\u4e8b\u5b9e\u4fee\u6b63\u4efb\u52a1"}
          </p>
        </div>
        <Button
          variant="outline"
          render={<Link href={`/projects/${projectId}/reports`} />}
        >
          <FileTextIcon data-icon="inline-start" />
          {"\u8fd4\u56de\u62a5\u544a"}
        </Button>
      </div>

      {error ? (
        <p
          role="alert"
          className="border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700"
        >
          {error}
        </p>
      ) : null}

      {!tasks.length ? (
        <section className="flex min-h-72 flex-col items-center justify-center gap-4 border-t p-8 text-center">
          <ListChecksIcon className="size-7 text-muted-foreground" />
          <div>
            <h4 className="font-medium">{"\u8fd8\u6ca1\u6709\u4f18\u5316\u4efb\u52a1"}</h4>
            <p className="mt-1 text-sm text-muted-foreground">
              {"\u5148\u5728\u53ef\u89c1\u5ea6\u62a5\u544a\u4e2d\u521b\u5efa\u4f18\u5316\u4efb\u52a1\u3002"}
            </p>
          </div>
          <Button render={<Link href={`/projects/${projectId}/reports`} />}>
            {"\u67e5\u770b\u53ef\u89c1\u5ea6\u62a5\u544a"}
            <ArrowRightIcon data-icon="inline-end" />
          </Button>
        </section>
      ) : (
        <>
          <div className="grid grid-cols-2 border-y sm:grid-cols-4">
            {[
              ["\u5168\u90e8\u4efb\u52a1", tasks.length],
              ["\u5f85\u5904\u7406", openCount],
              ["\u5f85\u9a8c\u8bc1", verifyCount],
              ["\u5df2\u5b8c\u6210", doneCount],
            ].map(([label, value], index) => (
              <div
                key={String(label)}
                className={`p-3 ${index ? "border-l" : ""}`}
              >
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="mt-1 text-xl font-semibold tabular-nums">
                  {value}
                </p>
              </div>
            ))}
          </div>

          <div
            className="flex max-w-full gap-1 overflow-x-auto rounded-lg border bg-muted p-1"
            aria-label={"\u4efb\u52a1\u7b5b\u9009"}
          >
            {([
              ["all", "\u5168\u90e8", tasks.length],
              ["open", "\u5f85\u5904\u7406", openCount],
              ["verify", "\u5f85\u9a8c\u8bc1", verifyCount],
              ["done", "\u5df2\u5b8c\u6210", doneCount],
            ] as const).map(([value, label, count]) => (
              <button
                key={value}
                type="button"
                aria-pressed={filter === value}
                onClick={() => setFilter(value)}
                className={`h-8 shrink-0 rounded-md px-3 text-xs font-medium transition-colors ${
                  filter === value
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {label} {count}
              </button>
            ))}
          </div>

          {visibleTasks.length ? (
            <div className="grid gap-3">
              {visibleTasks.map((task) => {
                const requirements = taskRequirements(
                  task.contentRequirements,
                )
                const metrics = taskExpectedMetrics(task.expectedMetrics)
                const checklist = stringList(task.acceptanceChecklist)
                const latestVerification = task.verifications[0]
                const taskClosed = ["VERIFIED", "DISMISSED"].includes(task.status)
                const expanded = expandedTaskIds.has(task.id)
                return (
                  <Card key={task.id} className="rounded-lg shadow-none">
                    <CardHeader className="px-0">
                      <button
                        type="button"
                        className="flex w-full cursor-pointer flex-col justify-between gap-3 px-4 py-1 text-left outline-none transition-colors hover:bg-muted/50 focus-visible:ring-3 focus-visible:ring-ring/50 sm:flex-row sm:items-start"
                        aria-expanded={expanded}
                        aria-controls={`task-details-${task.id}`}
                        onClick={() => handleTaskToggle(task.id)}
                      >
                        <span className="min-w-0">
                          <span className="block text-sm font-medium leading-6">
                            {task.title}
                          </span>
                        </span>
                        <span className="flex shrink-0 flex-wrap items-center gap-2">
                          <Badge
                            variant="outline"
                            className={priorityMeta[task.priority].className}
                          >
                            {priorityMeta[task.priority].label}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={statusMeta[task.status].className}
                          >
                            {statusMeta[task.status].label}
                          </Badge>
                          <ChevronDownIcon
                            className={`size-4 text-muted-foreground transition-transform ${
                              expanded ? "rotate-180" : ""
                            }`}
                            aria-hidden="true"
                          />
                        </span>
                      </button>
                    </CardHeader>

                    <CardContent
                      id={`task-details-${task.id}`}
                      className="grid gap-4"
                      hidden={!expanded}
                    >
                      <div className="grid gap-4 border-y py-4 md:grid-cols-2">
                        <div>
                          <p className="text-xs font-medium">{"\u5f53\u524d\u95ee\u9898"}</p>
                          <p className="mt-1 text-sm leading-6 text-muted-foreground">
                            {task.currentProblem}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-medium">{"\u5efa\u8bae\u52a8\u4f5c"}</p>
                          <p className="mt-1 text-sm leading-6 text-muted-foreground">
                            {task.action}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                        {task.suggestedPosition ? (
                          <p>
                            <span className="text-muted-foreground">
                              {"\u5efa\u8bae\u4f4d\u7f6e\uff1a"}
                            </span>
                            {task.suggestedPosition}
                          </p>
                        ) : null}
                        {task.suggestedUrl ? (
                          <p className="min-w-0">
                            <span className="text-muted-foreground">
                              {"\u5efa\u8bae\u8def\u5f84\uff1a"}
                            </span>
                            <span className="break-all">{task.suggestedUrl}</span>
                          </p>
                        ) : null}
                      </div>

                      {metrics.expected ? (
                        <section className="grid gap-3 border-y bg-sky-50/60 p-4">
                          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
                            <div>
                              <p className="text-sm font-medium">
                                {"\u66dd\u5149\u6548\u679c\u9884\u671f"}
                              </p>
                              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                                {metrics.expectation}
                              </p>
                            </div>
                          </div>
                          <div className="grid gap-3 text-sm md:grid-cols-2">
                            <div>
                              <p className="text-xs text-muted-foreground">
                                {"\u671f\u671b\u6539\u5584\u6307\u6807"}
                              </p>
                              <p className="mt-1 leading-6">{metrics.expected}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">
                                {"\u4e3a\u4ec0\u4e48\u53ef\u80fd\u6709\u6548"}
                              </p>
                              <p className="mt-1 leading-6">{metrics.mechanism}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">
                                {"\u600e\u4e48\u5224\u65ad\u662f\u5426\u6539\u5584"}
                              </p>
                              <p className="mt-1 leading-6">{metrics.measurement}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">
                                {"\u5efa\u8bae\u590d\u6d4b\u65f6\u95f4"}
                              </p>
                              <p className="mt-1 leading-6">{metrics.timeframe}</p>
                            </div>
                          </div>
                        </section>
                      ) : null}

                      {requirements.suggestedDraft ? (
                        <div className="overflow-hidden rounded-lg border">
                          <div className="flex flex-col justify-between gap-3 border-b bg-muted px-3 py-2 sm:flex-row sm:items-center">
                            <div>
                              <p className="text-sm font-medium">
                                {"\u8be6\u7ec6\u5185\u5bb9\u521d\u7a3f"}
                              </p>
                              {requirements.draftNote ? (
                                <p className="mt-0.5 text-xs text-muted-foreground">
                                  {requirements.draftNote}
                                </p>
                              ) : null}
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              className="self-start sm:self-auto"
                              onClick={() =>
                                void handleCopy(requirements.suggestedDraft)
                              }
                            >
                              <ClipboardIcon data-icon="inline-start" />
                              {"\u590d\u5236\u521d\u7a3f"}
                            </Button>
                          </div>
                          <pre className="max-h-80 overflow-auto whitespace-pre-wrap p-4 font-sans text-sm leading-6">
                            {requirements.suggestedDraft}
                          </pre>
                        </div>
                      ) : null}

                      {checklist.length ? (
                        <div>
                          <p className="text-sm font-medium">{"\u5b8c\u6210\u6807\u51c6"}</p>
                          <ul className="mt-2 grid gap-2 md:grid-cols-2">
                            {checklist.map((item) => (
                              <li
                                key={item}
                                className="flex items-start gap-2 text-sm text-muted-foreground"
                              >
                                <CheckCircle2Icon className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : null}

                      <section className="grid gap-3 border-t pt-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-sm font-medium">
                            {"\u53d1\u5e03\u540e\u9a8c\u8bc1"}
                          </p>
                          {latestVerification ? (
                            <Badge
                              variant="outline"
                              className={
                                verificationMeta[latestVerification.status]
                                  .className
                              }
                            >
                              {verificationMeta[latestVerification.status].label}
                            </Badge>
                          ) : null}
                        </div>

                        {latestVerification ? (
                          <div className="flex flex-col gap-1 text-sm sm:flex-row sm:items-center sm:justify-between">
                            <a
                              href={latestVerification.submittedUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="flex min-w-0 items-center gap-2 text-sky-700 hover:underline"
                            >
                              <ExternalLinkIcon className="size-4 shrink-0" />
                              <span className="truncate">
                                {latestVerification.submittedUrl}
                              </span>
                            </a>
                            <span className="shrink-0 text-xs text-muted-foreground">
                              {new Date(
                                latestVerification.createdAt,
                              ).toLocaleString("zh-CN")}
                            </span>
                          </div>
                        ) : null}

                        {!taskClosed ? (
                          <form
                            className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end"
                            onSubmit={(event) =>
                              void handleVerificationSubmit(event, task)
                            }
                          >
                            <div className="grid min-w-0 gap-1.5">
                              <label
                                htmlFor={`published-url-${task.id}`}
                                className="text-xs text-muted-foreground"
                              >
                                {"\u5df2\u53d1\u5e03\u9875\u9762 URL"}
                              </label>
                              <Input
                                id={`published-url-${task.id}`}
                                type="url"
                                required
                                placeholder={project.domain}
                                value={urlDrafts[task.id] ?? ""}
                                disabled={busyId === task.id}
                                onChange={(event) =>
                                  setUrlDrafts((current) => ({
                                    ...current,
                                    [task.id]: event.target.value,
                                  }))
                                }
                              />
                            </div>
                            <Button
                              type="submit"
                              disabled={
                                busyId === task.id ||
                                !(urlDrafts[task.id] ?? "").trim()
                              }
                            >
                              {busyId === task.id ? (
                                <LoaderCircleIcon className="animate-spin" />
                              ) : (
                                <Link2Icon data-icon="inline-start" />
                              )}
                              {"\u63d0\u4ea4\u771f\u5b9e URL"}
                            </Button>
                          </form>
                        ) : null}

                        {latestVerification?.status === "NEEDS_MANUAL" ? (
                          <div className="flex justify-start">
                            <Button
                              variant="outline"
                              render={<Link href={`/projects/${projectId}/reports`} />}
                            >
                              <RadarIcon data-icon="inline-start" />
                              {"\u5f00\u59cb\u4eba\u5de5\u590d\u6d4b"}
                              <ArrowRightIcon data-icon="inline-end" />
                            </Button>
                          </div>
                        ) : null}
                      </section>

                      <div className="flex flex-wrap items-center justify-end gap-2 border-t pt-4">
                        <label className="flex items-center gap-2 text-xs text-muted-foreground">
                          {"\u4efb\u52a1\u72b6\u6001"}
                          <select
                            className="h-9 rounded-lg border border-input bg-background px-3 text-sm text-foreground"
                            value={task.status}
                            disabled={busyId === task.id}
                            onChange={(event) =>
                              void handleStatus(
                                task,
                                event.target
                                  .value as OptimizationTask["status"],
                              )
                            }
                          >
                            {Object.entries(statusMeta).map(
                              ([value, meta]) => (
                                <option key={value} value={value}>
                                  {meta.label}
                                </option>
                              ),
                            )}
                          </select>
                        </label>
                        {busyId === task.id ? (
                          <LoaderCircleIcon className="size-4 animate-spin text-muted-foreground" />
                        ) : null}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          ) : (
            <p className="border-y py-8 text-center text-sm text-muted-foreground">
              {"\u5f53\u524d\u7b5b\u9009\u4e2d\u6ca1\u6709\u4efb\u52a1\u3002"}
            </p>
          )}
        </>
      )}
    </div>
  )
}
