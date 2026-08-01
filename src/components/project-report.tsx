"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useMemo, useState } from "react"
import {
  ArrowRightIcon,
  BarChart3Icon,
  CheckCircle2Icon,
  ChevronDownIcon,
  CircleAlertIcon,
  FileSearchIcon,
  ListPlusIcon,
  LoaderCircleIcon,
  ShieldAlertIcon,
  TargetIcon,
} from "lucide-react"
import { toast } from "sonner"

import { ErrorState, LoadingState, ProjectHeader } from "@/components/project-shared"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  generateOptimizationTasks,
  getProject,
  listProjectAudits,
  type ManualAudit,
  type ManualAuditTask,
  type Project,
} from "@/lib/project-api"

type Category = "missing" | "weak" | "risk" | "good"

const categoryMeta: Record<
  Category,
  { label: string; className: string; action: string }
> = {
  missing: {
    label: "\u672a\u63d0\u53ca\u54c1\u724c",
    className: "border-amber-200 bg-amber-50 text-amber-800",
    action:
      "\u8865\u5145\u80fd\u76f4\u63a5\u56de\u7b54\u8fd9\u4e9b\u95ee\u9898\u7684\u5b98\u7f51\u5185\u5bb9\uff0c\u5efa\u7acb\u54c1\u724c\u4e0e\u573a\u666f\u3001\u54c1\u7c7b\u7684\u660e\u786e\u5173\u8054\u3002",
  },
  weak: {
    label: "\u63d0\u53ca\u4f46\u672a\u63a8\u8350",
    className: "border-sky-200 bg-sky-50 text-sky-700",
    action:
      "\u8865\u5145\u53ef\u9a8c\u8bc1\u7684\u4ea7\u54c1\u4f18\u52bf\u3001\u9002\u7528\u4eba\u7fa4\u3001\u5ba2\u6237\u6848\u4f8b\u548c\u5bf9\u6bd4\u4fe1\u606f\u3002",
  },
  risk: {
    label: "\u53ef\u80fd\u4e8b\u5b9e\u51b2\u7a81",
    className: "border-rose-200 bg-rose-50 text-rose-700",
    action:
      "\u5148\u6838\u5bf9\u6807\u51fa\u7684\u4e8b\u5b9e\uff0c\u7edf\u4e00\u5b98\u7f51\u4e2d\u7684\u529f\u80fd\u3001\u4ef7\u683c\u548c\u652f\u6301\u8303\u56f4\u63cf\u8ff0\u3002",
  },
  good: {
    label: "\u8868\u73b0\u826f\u597d",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    action:
      "\u4fdd\u7559\u5f53\u524d\u5185\u5bb9\uff0c\u540e\u7eed\u590d\u6d4b\u65f6\u89c2\u5bdf\u8fd9\u4e9b\u95ee\u9898\u7684\u8868\u73b0\u662f\u5426\u7a33\u5b9a\u3002",
  },
}

const platformLabels: Partial<Record<ManualAuditTask["engine"], string>> = {
  CHATGPT: "ChatGPT",
  DEEPSEEK: "DeepSeek",
  KIMI: "Kimi",
  DOUBAO: "\u8c46\u5305",
}

const platformOrder: ManualAuditTask["engine"][] = [
  "CHATGPT",
  "DEEPSEEK",
  "KIMI",
  "DOUBAO",
]

function taskPlatformLabel(task: ManualAuditTask) {
  return platformLabels[task.engine] ?? task.platformProduct ?? task.engine
}

function latestAnswer(task: ManualAuditTask) {
  return task.answers[0]
}

function latestAnalysis(task: ManualAuditTask) {
  return latestAnswer(task)?.analysisVersions[0]
}

function factDetails(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { evidence: [] as string[], matchedCount: 0 }
  }
  const record = value as Record<string, unknown>
  const matchedFacts = Array.isArray(record.matchedFacts)
    ? record.matchedFacts.filter(
        (item): item is string => typeof item === "string",
      )
    : []
  const contradictions = Array.isArray(record.contradictions)
    ? record.contradictions.filter(
        (item): item is string => typeof item === "string",
      )
    : []
  return {
    evidence: contradictions.length ? contradictions : matchedFacts,
    matchedCount: matchedFacts.length,
  }
}

function categoryFor(task: ManualAuditTask): Category | null {
  const analysis = latestAnalysis(task)
  if (!analysis) return null
  if (analysis.factRisk) return "risk"
  if (!analysis.targetMentioned) return "missing"
  if (!analysis.targetRecommended) return "weak"
  return "good"
}

function percent(value: number, total: number) {
  return total ? Math.round((value / total) * 100) : 0
}

function excerpt(content: string) {
  const compact = content.replace(/\s+/g, " ").trim()
  return compact.length > 240 ? `${compact.slice(0, 240)}...` : compact
}

export function ProjectReport({
  projectId,
  initialAuditId,
}: {
  projectId: string
  initialAuditId?: string
}) {
  const router = useRouter()
  const [project, setProject] = useState<Project | null>(null)
  const [audits, setAudits] = useState<ManualAudit[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(
    initialAuditId ?? null,
  )
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState("")

  const load = useCallback(async () => {
    setError("")
    try {
      const [projectResponse, auditResponse] = await Promise.all([
        getProject(projectId),
        listProjectAudits(projectId),
      ])
      setProject(projectResponse.data)
      setAudits(auditResponse.data)
      setSelectedId((current) => {
        if (current && auditResponse.data.some((audit) => audit.id === current)) {
          return current
        }
        return (
          auditResponse.data.find((audit) =>
            audit.detectionTasks.some((task) => latestAnswer(task)),
          )?.id ??
          auditResponse.data[0]?.id ??
          null
        )
      })
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "\u62a5\u544a\u52a0\u8f7d\u5931\u8d25\u3002",
      )
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0)
    return () => window.clearTimeout(timer)
  }, [load])

  const audit = useMemo(
    () => audits.find((item) => item.id === selectedId) ?? audits[0] ?? null,
    [audits, selectedId],
  )

  const items = useMemo(() => {
    if (!audit) return []
    return audit.detectionTasks.flatMap((task) => {
      const answer = latestAnswer(task)
      const analysis = latestAnalysis(task)
      const category = categoryFor(task)
      if (!answer || !analysis || !category) return []
      return [{ task, answer, analysis, category, ...factDetails(analysis.evidenceQuotes) }]
    })
  }, [audit])

  const platformMetrics = useMemo(() => {
    if (!audit) return []
    const engines = [...new Set(audit.detectionTasks.map((task) => task.engine))]
      .sort((left, right) => {
        const leftIndex = platformOrder.indexOf(left)
        const rightIndex = platformOrder.indexOf(right)
        return (
          (leftIndex < 0 ? platformOrder.length : leftIndex) -
          (rightIndex < 0 ? platformOrder.length : rightIndex)
        )
      })

    return engines.map((engine) => {
      const platformTasks = audit.detectionTasks.filter(
        (task) => task.engine === engine,
      )
      const platformItems = items.filter((item) => item.task.engine === engine)
      const platformMentioned = platformItems.filter(
        (item) => item.analysis.targetMentioned,
      ).length
      const platformRecommended = platformItems.filter(
        (item) => item.analysis.targetRecommended,
      ).length
      const platformRisk = platformItems.filter(
        (item) => item.analysis.factRisk,
      ).length
      const mentionRate = percent(platformMentioned, platformItems.length)
      const recommendRate = percent(platformRecommended, platformItems.length)
      const safetyRate = percent(platformItems.length - platformRisk, platformItems.length)
      return {
        engine,
        label: taskPlatformLabel(platformTasks[0]),
        total: platformTasks.length,
        answered: platformItems.length,
        mentionRate,
        recommendRate,
        risk: platformRisk,
        score: platformItems.length
          ? Math.round(mentionRate * 0.5 + recommendRate * 0.35 + safetyRate * 0.15)
          : 0,
      }
    })
  }, [audit, items])

  const total = audit?.detectionTasks.length ?? 0
  const answered = audit
    ? audit.detectionTasks.filter((task) => latestAnswer(task)).length
    : 0
  const mentioned = items.filter((item) => item.analysis.targetMentioned).length
  const recommended = items.filter(
    (item) => item.analysis.targetRecommended,
  ).length
  const risk = items.filter((item) => item.category === "risk").length
  const matchedFacts = items.reduce(
    (sum, item) => sum + item.matchedCount,
    0,
  )
  const mentionRate = percent(mentioned, items.length)
  const recommendRate = percent(recommended, items.length)
  const safetyRate = percent(items.length - risk, items.length)
  const score = items.length
    ? Math.round(mentionRate * 0.5 + recommendRate * 0.35 + safetyRate * 0.15)
    : 0
  const counts = {
    missing: items.filter((item) => item.category === "missing").length,
    weak: items.filter((item) => item.category === "weak").length,
    risk,
    good: items.filter((item) => item.category === "good").length,
  }
  const issueCategories = (["risk", "missing", "weak"] as Category[]).filter(
    (category) => counts[category] > 0,
  )
  const actions = issueCategories.length ? issueCategories : (["good"] as Category[])
  const issueCount = items.filter((item) => item.category !== "good").length
  const auditHref = `/projects/${projectId}/audits`

  async function handleGenerateTasks() {
    if (!audit || !issueCount) return
    setGenerating(true)
    setError("")
    try {
      const response = await generateOptimizationTasks(projectId, audit.id)
      toast.success(
        response.data.createdCount
          ? `\u5df2\u521b\u5efa ${response.data.createdCount} \u4e2a\u4f18\u5316\u4efb\u52a1`
          : "\u4f18\u5316\u4efb\u52a1\u5df2\u5b58\u5728\uff0c\u5df2\u4e3a\u4f60\u6253\u5f00",
      )
      router.push(`/projects/${projectId}/tasks`)
    } catch (generateError) {
      setError(
        generateError instanceof Error
          ? generateError.message
          : "\u4f18\u5316\u4efb\u52a1\u521b\u5efa\u5931\u8d25\u3002",
      )
    } finally {
      setGenerating(false)
    }
  }

  if (loading) {
    return <LoadingState label="\u6b63\u5728\u751f\u6210\u62a5\u544a..." />
  }
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
          <h3 className="font-medium">{"AI \u53ef\u89c1\u5ea6\u62a5\u544a"}</h3>
          <p className="text-sm text-muted-foreground">
            {"\u57fa\u4e8e\u540c\u4e00\u6279\u95ee\u9898\u7684\u591a\u5e73\u53f0\u4eba\u5de5\u91c7\u96c6\u7ed3\u679c"}
          </p>
        </div>
        {audits.length > 1 ? (
          <label className="grid min-w-52 gap-1 text-xs text-muted-foreground">
            {"\u62a5\u544a\u6279\u6b21"}
            <select
              className="h-9 rounded-lg border border-input bg-background px-3 text-sm text-foreground"
              value={audit?.id ?? ""}
              onChange={(event) => setSelectedId(event.target.value)}
            >
              {audits.map((item, index) => (
                <option key={item.id} value={item.id}>
                  #{audits.length - index} {"\u00b7"}{" "}
                  {new Date(item.createdAt).toLocaleDateString("zh-CN")}{" \u00b7 "}
                  {item.completedTasks}/{item.totalTasks}
                </option>
              ))}
            </select>
          </label>
        ) : null}
      </div>

      {error ? (
        <p className="border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          {error}
        </p>
      ) : null}

      {!audit || !items.length ? (
        <section className="flex min-h-72 flex-col items-center justify-center gap-4 border-t p-8 text-center">
          <FileSearchIcon className="size-7 text-muted-foreground" />
          <div>
            <h4 className="font-medium">{"\u8fd8\u6ca1\u6709\u53ef\u5206\u6790\u7684\u68c0\u6d4b"}</h4>
            <p className="mt-1 max-w-lg text-sm text-muted-foreground">
              {"\u5148\u81f3\u5c11\u4fdd\u5b58 1 \u6761\u4efb\u610f\u5e73\u53f0\u7684\u56de\u7b54\uff0c\u8fd9\u91cc\u5c31\u4f1a\u751f\u6210\u62a5\u544a\u3002"}
            </p>
          </div>
          <Button render={<Link href={auditHref} />}>
            <FileSearchIcon data-icon="inline-start" />
            {"\u53bb\u4eba\u5de5\u68c0\u6d4b"}
            <ArrowRightIcon data-icon="inline-end" />
          </Button>
        </section>
      ) : (
        <>
          {answered < total ? (
            <div className="flex flex-col justify-between gap-3 border-y border-amber-200 bg-amber-50 px-4 py-3 text-amber-900 sm:flex-row sm:items-center">
              <p className="flex items-start gap-2 text-sm">
                <CircleAlertIcon className="mt-0.5 size-4 shrink-0" />
                {"\u5f53\u524d\u53ea\u7edf\u8ba1\u5df2\u4fdd\u5b58\u7684\u56de\u7b54\uff1a"}{answered}/{total}
              </p>
              <Button variant="outline" size="sm" render={<Link href={auditHref} />}>
                {"\u7ee7\u7eed\u4eba\u5de5\u91c7\u96c6"}
                <ArrowRightIcon data-icon="inline-end" />
              </Button>
            </div>
          ) : null}

          <section className="grid gap-5 border-y py-5 lg:grid-cols-[220px_minmax(0,1fr)] lg:items-center">
            <div className="flex items-center gap-4 lg:border-r">
              <span className="flex size-20 shrink-0 items-center justify-center rounded-full border-8 border-emerald-100 text-2xl font-semibold tabular-nums text-emerald-700">
                {score}
              </span>
              <div>
                <p className="text-sm text-muted-foreground">{"\u7efc\u5408\u5f97\u5206 / 100"}</p>
                <p className="mt-1 text-sm font-medium">
                  {score >= 80
                    ? "\u8868\u73b0\u7a33\u5b9a"
                    : score >= 60
                      ? "\u8fd8\u6709\u63d0\u5347\u7a7a\u95f4"
                      : "\u5efa\u8bae\u4f18\u5148\u4f18\u5316"}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border bg-border sm:grid-cols-4">
              {[
                { label: "\u54c1\u724c\u63d0\u53ca\u7387", value: `${mentionRate}%`, icon: TargetIcon },
                { label: "\u83b7\u5f97\u63a8\u8350\u7387", value: `${recommendRate}%`, icon: CheckCircle2Icon },
                { label: "\u4e8b\u5b9e\u98ce\u9669", value: String(risk), icon: ShieldAlertIcon },
                { label: "\u5339\u914d\u4e8b\u5b9e", value: String(matchedFacts), icon: BarChart3Icon },
              ].map((metric) => (
                <div key={metric.label} className="min-w-0 bg-background p-3">
                  <p className="flex items-center gap-2 text-xs text-muted-foreground">
                    <metric.icon className="size-3.5 shrink-0" />
                    <span className="truncate">{metric.label}</span>
                  </p>
                  <p className="mt-2 text-xl font-semibold tabular-nums">{metric.value}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="grid gap-3">
            <h4 className="font-medium">{"\u5e73\u53f0\u5bf9\u6bd4"}</h4>
            <div className="overflow-x-auto border-y">
              <table className="w-full min-w-[680px] text-left text-sm">
                <thead className="bg-muted/50 text-xs text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 font-medium">{"\u5e73\u53f0"}</th>
                    <th className="px-3 py-2 text-right font-medium">{"\u5df2\u56de\u7b54"}</th>
                    <th className="px-3 py-2 text-right font-medium">{"\u54c1\u724c\u63d0\u53ca\u7387"}</th>
                    <th className="px-3 py-2 text-right font-medium">{"\u83b7\u5f97\u63a8\u8350\u7387"}</th>
                    <th className="px-3 py-2 text-right font-medium">{"\u4e8b\u5b9e\u98ce\u9669"}</th>
                    <th className="px-3 py-2 text-right font-medium">{"\u5f97\u5206"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {platformMetrics.map((metric) => (
                    <tr key={metric.engine}>
                      <td className="px-3 py-3 font-medium">
                        {metric.label}
                      </td>
                      <td className="px-3 py-3 text-right tabular-nums">
                        {metric.answered}/{metric.total}
                      </td>
                      <td className="px-3 py-3 text-right tabular-nums">
                        {metric.mentionRate}%
                      </td>
                      <td className="px-3 py-3 text-right tabular-nums">
                        {metric.recommendRate}%
                      </td>
                      <td
                        className={`px-3 py-3 text-right tabular-nums ${
                          metric.risk ? "text-rose-700" : "text-muted-foreground"
                        }`}
                      >
                        {metric.risk}
                      </td>
                      <td className="px-3 py-3 text-right font-semibold tabular-nums">
                        {metric.score}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="grid gap-3">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h4 className="font-medium">{"\u4e0b\u4e00\u6b65\u4f18\u5316"}</h4>
                <p className="text-sm text-muted-foreground">
                  {"\u5df2\u91c7\u96c6 "}{answered}/{total}
                </p>
              </div>
              {issueCount ? (
                <Button
                  onClick={() => void handleGenerateTasks()}
                  disabled={generating}
                >
                  {generating ? (
                    <LoaderCircleIcon className="animate-spin" />
                  ) : (
                    <ListPlusIcon data-icon="inline-start" />
                  )}
                  {"\u521b\u5efa\u4f18\u5316\u4efb\u52a1"}
                </Button>
              ) : null}
            </div>
            <div
              className={`grid gap-px overflow-hidden rounded-lg border bg-border ${
                actions.length > 1 ? "md:grid-cols-2" : "grid-cols-1"
              }`}
            >
              {actions.map((category) => (
                <div key={category} className="bg-background p-4">
                  <div className="flex items-center justify-between gap-3">
                    <Badge
                      variant="outline"
                      className={categoryMeta[category].className}
                    >
                      {categoryMeta[category].label}
                    </Badge>
                    <strong className="text-sm tabular-nums">
                      {counts[category]} {"\u6761"}
                    </strong>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    {categoryMeta[category].action}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="grid gap-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h4 className="font-medium">{"\u9010\u9898\u7ed3\u679c"}</h4>
              <Button variant="outline" size="sm" render={<Link href={auditHref} />}>
                <FileSearchIcon data-icon="inline-start" />
                {"\u67e5\u770b\u68c0\u6d4b\u539f\u6587"}
              </Button>
            </div>
            <div className="grid gap-3">
              {items.map((item) => (
                <details key={item.task.id} className="group rounded-lg border">
                  <summary className="flex cursor-pointer list-none flex-col justify-between gap-3 p-4 sm:flex-row sm:items-start [&::-webkit-details-marker]:hidden">
                    <h5 className="text-sm font-medium leading-6">
                      {item.task.prompt.text}
                    </h5>
                    <div className="flex shrink-0 flex-wrap items-center gap-2 self-end sm:self-auto">
                      <Badge variant="outline">
                        {taskPlatformLabel(item.task)}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={categoryMeta[item.category].className}
                      >
                        {categoryMeta[item.category].label}
                      </Badge>
                      <ChevronDownIcon className="size-4 text-muted-foreground transition-transform group-open:rotate-180 motion-reduce:transition-none" />
                    </div>
                  </summary>
                  <div className="px-4 pb-4">
                    <div className="border-l-2 pl-3">
                      <p className="text-xs text-muted-foreground">{"AI \u56de\u7b54\u6458\u8981"}</p>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        {excerpt(item.answer.content)}
                      </p>
                    </div>
                    {item.evidence.length ? (
                      <p className="mt-3 text-xs leading-5 text-muted-foreground">
                        <span className="font-medium text-foreground">
                          {"\u76f8\u5173\u54c1\u724c\u4e8b\u5b9e\uff1a"}
                        </span>
                        {item.evidence.slice(0, 3).join("\uff1b")}
                      </p>
                    ) : null}
                  </div>
                </details>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  )
}
