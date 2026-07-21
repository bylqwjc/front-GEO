"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { CalendarDaysIcon, CheckCircle2Icon, CircleIcon, Clock3Icon, PlusIcon, SlidersHorizontalIcon } from "lucide-react"

import { GeoPageHeader, GeoStatusBadge } from "@/components/geo-page"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useLanguage } from "@/lib/i18n"
import { actionTasks as initialTasks } from "@/lib/mock-data"
import type { ActionTask, TaskStatus } from "@/lib/types"

const columns: { id: TaskStatus; label: string; icon: typeof CircleIcon }[] = [
  { id: "todo", label: "待处理", icon: CircleIcon }, { id: "doing", label: "进行中", icon: Clock3Icon }, { id: "done", label: "已完成任务", icon: CheckCircle2Icon },
]

const englishTasks: Record<string, Partial<ActionTask>> = {
  t1: { title: "Publish an Acme Cloud vs. Confluence page for 100-person teams", evidence: "Confluence's recommendation rate is 37% higher across 6 comparison prompts.", owner: "Content team", due: "Jul 23", category: "Content gap" },
  t2: { title: "Add accurate enterprise SSO and SOC 2 information", evidence: "Gemini described SSO plan limits incorrectly in 2 answers.", owner: "Product marketing", due: "Jul 24", category: "Brand facts" },
  t3: { title: "Update the product profile in Zapier's integration directory", evidence: "zapier.com cited competitors 18 times and the brand only twice.", owner: "Growth team", due: "Jul 26", category: "External sources" },
  t4: { title: "Add a small-team cost example to the pricing page", evidence: "Brand mention rate is only 20% for price-sensitive prompts.", owner: "Web team", due: "Jul 28", category: "Page optimization" },
  t5: { title: "Rewrite the Slack integration page summary", evidence: "AI can find the page but cannot extract specific automation capabilities.", owner: "Content team", due: "Jul 18", category: "Page optimization" },
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<ActionTask[]>(initialTasks)
  const [highOnly, setHighOnly] = useState(false)
  const { locale, t } = useLanguage()
  const visibleTasks = useMemo(() => highOnly ? tasks.filter((task) => task.impact === "高") : tasks, [highOnly, tasks])
  const completed = tasks.filter((task) => task.status === "done").length
  const localTask = (task: ActionTask) => locale === "en" && englishTasks[task.id] ? { ...task, ...englishTasks[task.id] } : task

  function updateStatus(id: string, status: TaskStatus) { setTasks((current) => current.map((task) => task.id === id ? { ...task, status } : task)) }
  function addTask() { setTasks((current) => [{ id: `manual-${Date.now()}`, title: locale === "en" ? "Review a new GEO opportunity" : "检查新的 GEO 优化机会", evidence: locale === "en" ? "Manually created task; add evidence and assign an owner." : "手动创建的任务，可继续补充检测证据和负责人。", impact: "中", status: "todo", owner: locale === "en" ? "Unassigned" : "待分配", due: locale === "en" ? "Jul 30" : "7月30日", category: locale === "en" ? "Manual task" : "手动任务" }, ...current]) }

  return (
    <div className="flex flex-1 flex-col gap-5 p-4 md:p-6">
      <GeoPageHeader eyebrow={`${t("优化任务")} · Acme Cloud`} title={t("GEO 行动清单")} description={t("将检测结论转成可执行任务，并在完成后安排复测")} actions={<><Button variant={highOnly ? "default" : "outline"} onClick={() => setHighOnly((current) => !current)}><SlidersHorizontalIcon data-icon="inline-start" />{t(highOnly ? "显示全部" : "仅高优先级")}</Button><Button onClick={addTask}><PlusIcon data-icon="inline-start" />{t("添加任务")}</Button></>} />
      <Card className="rounded-lg shadow-none"><CardContent className="grid gap-3 py-1"><div className="flex items-end justify-between"><div><p className="text-sm font-medium">{t("行动进度")}</p><p className="text-xs text-muted-foreground">{t("完成全部任务后建议使用相同 Prompt 复测")}</p></div><strong className="text-lg tabular-nums">{completed} / {tasks.length}</strong></div><div className="h-2 overflow-hidden rounded-full bg-muted"><span className="block h-full rounded-full bg-emerald-600 transition-[width]" style={{ width: `${tasks.length ? (completed / tasks.length) * 100 : 0}%` }} /></div><div className="flex flex-col gap-2 text-xs text-muted-foreground sm:flex-row sm:items-center sm:gap-5"><span className="flex items-center gap-1.5"><i className="size-2 rounded-full bg-rose-500" />{t("高优先级")} {tasks.filter((task) => task.impact === "高").length}</span><span className="flex items-center gap-1.5"><CalendarDaysIcon className="size-3.5" />{t("下次复测")} {locale === "en" ? "Aug 2" : "8月2日"}</span><Link href="/compare/experiment-001" className="font-medium text-foreground sm:ml-auto">{t("查看实验计划")}</Link></div></CardContent></Card>

      <div className="grid items-start gap-4 xl:grid-cols-3">{columns.map((column) => { const columnTasks = visibleTasks.filter((task) => task.status === column.id); return <section key={column.id} className="rounded-lg border bg-muted/35 p-2"><header className="flex h-9 items-center justify-between px-1.5"><span className="flex items-center gap-2 text-sm font-medium"><column.icon className="size-4" />{t(column.label)}</span><span className="flex size-5 items-center justify-center rounded bg-muted text-xs tabular-nums text-muted-foreground">{columnTasks.length}</span></header><div className="grid gap-2">{columnTasks.map((rawTask) => { const task = localTask(rawTask); return <Card key={task.id} className="gap-3 rounded-lg bg-background py-3 shadow-none"><CardHeader className="gap-3 px-3"><div className="flex items-center justify-between gap-2"><span className="text-xs font-medium text-emerald-700">{task.category}</span><GeoStatusBadge status={task.impact === "高" ? "high" : task.impact === "中" ? "medium" : "low"} /></div><CardTitle className="text-sm leading-5">{task.title}</CardTitle></CardHeader><CardContent className="grid gap-3 px-3"><p className="text-xs leading-5 text-muted-foreground">{task.evidence}</p><div className="flex justify-between border-t pt-3 text-xs text-muted-foreground"><span>{task.owner}</span><time>{task.due}</time></div><label className="flex items-center justify-between"><span className="text-xs text-muted-foreground">{t("状态")}</span><select value={task.status} onChange={(event) => updateStatus(task.id, event.target.value as TaskStatus)} className="h-7 rounded-md border border-input bg-background px-2 text-xs"><option value="todo">{t("待处理")}</option><option value="doing">{t("进行中")}</option><option value="done">{t("已完成任务")}</option></select></label></CardContent></Card> })}{columnTasks.length === 0 ? <div className="flex min-h-24 items-center justify-center rounded-lg border border-dashed text-xs text-muted-foreground">{t("暂无任务")}</div> : null}</div></section> })}</div>
    </div>
  )
}
