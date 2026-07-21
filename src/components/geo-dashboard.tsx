"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { ArrowRightIcon, BotIcon, CalendarDaysIcon, CheckCircle2Icon, ChevronRightIcon, CircleAlertIcon, ExternalLinkIcon, Link2Icon, MessageSquareTextIcon, PlusIcon, SparklesIcon, TrendingUpIcon } from "lucide-react"
import { CartesianGrid, Line, LineChart, Tooltip, XAxis, YAxis } from "recharts"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useLanguage } from "@/lib/i18n"
import { citationOpportunities, journeyStages, recentAudits, voiceShare } from "@/lib/mock-data"

const trendData = [
  { date: "4/27", mention: 35, recommend: 18 }, { date: "5/4", mention: 38, recommend: 20 },
  { date: "5/11", mention: 41, recommend: 21 }, { date: "5/18", mention: 40, recommend: 23 },
  { date: "5/25", mention: 44, recommend: 25 }, { date: "6/1", mention: 43, recommend: 24 },
  { date: "6/8", mention: 47, recommend: 27 }, { date: "6/15", mention: 49, recommend: 28 },
  { date: "6/22", mention: 51, recommend: 29 }, { date: "6/29", mention: 52, recommend: 30 },
  { date: "7/6", mention: 55, recommend: 32 }, { date: "7/13", mention: 58, recommend: 34 },
]

const metrics = [
  { label: "品牌提及率", value: "58%", change: "+8.4%", detail: "120 条回答中出现 70 次", icon: MessageSquareTextIcon, color: "text-emerald-700", bg: "bg-emerald-50" },
  { label: "AI 推荐率", value: "34%", change: "+5.1%", detail: "明确推荐品牌 41 次", icon: SparklesIcon, color: "text-blue-700", bg: "bg-blue-50" },
  { label: "官网引用率", value: "22%", change: "+1.7%", detail: "26 条回答引用品牌官网", icon: Link2Icon, color: "text-amber-700", bg: "bg-amber-50" },
  { label: "品牌声量", value: "31%", change: "+2.3%", detail: "4 个追踪品牌中排名第 1", icon: BotIcon, color: "text-rose-700", bg: "bg-rose-50" },
]

export function GeoDashboard() {
  const [range, setRange] = useState<"30d" | "90d">("90d")
  const visibleTrend = useMemo(() => range === "30d" ? trendData.slice(-5) : trendData, [range])
  const { t } = useLanguage()

  return (
    <div className="@container/main flex flex-1 flex-col gap-5 p-4 md:p-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div><h2 className="text-xl font-semibold">Acme Cloud</h2><p className="mt-1 text-sm text-muted-foreground">{t("AI 可见度概览")} · {t("最近检测于今天 10:32")}</p></div>
        <div className="flex items-center gap-2"><Button variant="outline"><CalendarDaysIcon data-icon="inline-start" />{t("过去 30 天")}</Button><Button render={<Link href="/new" />}><PlusIcon data-icon="inline-start" />{t("新建检测")}</Button></div>
      </div>

      <section className="grid grid-cols-2 gap-3 @4xl/main:grid-cols-4" aria-label={t("核心指标变化")}>
        {metrics.map((metric) => <Card key={metric.label} className="gap-3 rounded-lg shadow-none"><CardHeader><CardDescription>{t(metric.label)}</CardDescription><CardAction><span className={`flex size-8 items-center justify-center rounded-md ${metric.bg} ${metric.color}`}><metric.icon className="size-4" /></span></CardAction><CardTitle className="text-2xl font-semibold tabular-nums">{metric.value}</CardTitle></CardHeader><CardContent className="flex items-center justify-between gap-2"><span className="truncate text-xs text-muted-foreground">{t(metric.detail)}</span><Badge variant="outline" className="shrink-0 border-emerald-200 bg-emerald-50 text-emerald-700"><TrendingUpIcon />{metric.change}</Badge></CardContent></Card>)}
      </section>

      <div className="flex flex-col gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-950 sm:flex-row sm:items-center"><span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-amber-100 text-amber-700"><CircleAlertIcon className="size-4" /></span><div className="min-w-0 flex-1"><p className="text-sm font-medium">{t("购买决策阶段存在明显流失")}</p><p className="text-xs text-amber-800/80">{t("品牌在发现阶段的提及率为 63%，到购买决策阶段降至 29%。")}</p></div><Button variant="outline" size="sm" className="border-amber-300 bg-white/70" render={<Link href="/tasks/audit-2026-0719" />}>{t("查看 4 项建议")}<ArrowRightIcon data-icon="inline-end" /></Button></div>

      <div className="grid gap-4 @5xl/main:grid-cols-7">
        <Card className="rounded-lg shadow-none @5xl/main:col-span-4">
          <CardHeader><CardTitle>{t("可见度趋势")}</CardTitle><CardDescription>{t("相同 Prompt 集合的提及率与推荐率变化")}</CardDescription><CardAction className="flex rounded-md border p-0.5">{(["30d", "90d"] as const).map((item) => <button key={item} type="button" onClick={() => setRange(item)} className={`h-6 rounded px-2 text-xs ${range === item ? "bg-foreground text-background" : "text-muted-foreground"}`}>{t(item === "30d" ? "30 天" : "90 天")}</button>)}</CardAction></CardHeader>
          <CardContent><div className="h-64 min-w-0"><LineChart responsive style={{ width: "100%", height: "100%" }} data={visibleTrend} margin={{ left: -18, right: 8, top: 6, bottom: 0 }}><CartesianGrid vertical={false} stroke="var(--border)" /><XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} /><YAxis domain={[0, 70]} tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} /><Tooltip contentStyle={{ borderRadius: 8, borderColor: "var(--border)", fontSize: 12 }} formatter={(value, name) => [`${value}%`, t(name === "mention" ? "提及率" : "推荐率")]} /><Line type="monotone" dataKey="mention" stroke="var(--chart-1)" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} /><Line type="monotone" dataKey="recommend" stroke="var(--chart-2)" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} /></LineChart></div><div className="mt-3 flex gap-4 border-t pt-3 text-xs text-muted-foreground"><span className="flex items-center gap-1.5"><i className="size-2 rounded-full bg-[var(--chart-1)]" />{t("提及率")} 58%</span><span className="flex items-center gap-1.5"><i className="size-2 rounded-full bg-[var(--chart-2)]" />{t("推荐率")} 34%</span></div></CardContent>
        </Card>

        <Card className="rounded-lg shadow-none @5xl/main:col-span-3"><CardHeader><CardTitle>{t("购买旅程表现")}</CardTitle><CardDescription>{t("品牌在客户决策不同阶段的覆盖情况")}</CardDescription></CardHeader><CardContent className="space-y-5">{journeyStages.map((stage, index) => <div key={stage.stage} className="grid grid-cols-[24px_88px_1fr_36px] items-center gap-2"><span className="text-xs text-muted-foreground">0{index + 1}</span><div><p className="text-xs font-medium">{t(stage.stage)}</p><p className="text-[10px] text-muted-foreground">{stage.prompts} Prompt</p></div><div className="space-y-1"><div className="h-1.5 overflow-hidden rounded-full bg-muted"><span className="block h-full rounded-full bg-[var(--chart-1)]" style={{ width: `${stage.mention}%` }} /></div><div className="h-1.5 overflow-hidden rounded-full bg-muted"><span className="block h-full rounded-full bg-[var(--chart-2)]" style={{ width: `${stage.recommendation}%` }} /></div></div><span className="text-right text-xs font-medium tabular-nums">{stage.mention}%</span></div>)}<div className="flex gap-4 border-t pt-3 text-xs text-muted-foreground"><span className="flex items-center gap-1.5"><i className="size-2 rounded-full bg-[var(--chart-1)]" />{t("提及率")}</span><span className="flex items-center gap-1.5"><i className="size-2 rounded-full bg-[var(--chart-2)]" />{t("推荐率")}</span></div></CardContent></Card>
      </div>

      <div className="grid gap-4 @5xl/main:grid-cols-7">
        <Card className="rounded-lg shadow-none @5xl/main:col-span-4"><CardHeader><CardTitle>{t("最近检测")}</CardTitle><CardDescription>{t("品牌在不同市场和 Prompt 集合中的可见度")}</CardDescription><CardAction><Button variant="ghost" size="sm" render={<Link href="/new" />}>{t("新建")}<PlusIcon data-icon="inline-end" /></Button></CardAction></CardHeader><CardContent className="px-0"><Table><TableHeader><TableRow><TableHead className="pl-4">{t("检测")}</TableHead><TableHead>{t("范围")}</TableHead><TableHead>{t("状态")}</TableHead><TableHead>{t("声量")}</TableHead><TableHead className="w-10" /></TableRow></TableHeader><TableBody>{recentAudits.map((audit) => <TableRow key={audit.id}><TableCell className="pl-4"><p className="font-medium">{t(audit.name)}</p><p className="text-xs text-muted-foreground">{t(audit.date)}</p></TableCell><TableCell className="text-xs text-muted-foreground">{audit.prompts} Prompt · {audit.engines} {t("引擎")}</TableCell><TableCell><Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700"><CheckCircle2Icon />{t("已完成")}</Badge></TableCell><TableCell className="font-medium tabular-nums">{audit.score}</TableCell><TableCell><Button variant="ghost" size="icon-sm" aria-label={t("完整报告")} render={<Link href="/report/demo-report" />}><ChevronRightIcon /></Button></TableCell></TableRow>)}</TableBody></Table></CardContent></Card>

        <Card className="rounded-lg shadow-none @5xl/main:col-span-3"><CardHeader><CardTitle>{t("竞品声量")}</CardTitle><CardDescription>{t("同一组高意图 Prompt 中的提及占比")}</CardDescription></CardHeader><CardContent className="space-y-4">{voiceShare.map((item, index) => <div key={item.brand} className="grid grid-cols-[20px_92px_1fr_36px] items-center gap-2 text-xs"><span className="text-muted-foreground">{index + 1}</span><span className="truncate font-medium">{item.brand}</span><div className="h-2 overflow-hidden rounded-full bg-muted"><span className="block h-full rounded-full" style={{ width: `${item.value * 2.7}%`, background: item.color }} /></div><span className="text-right font-medium tabular-nums">{item.value}%</span></div>)}</CardContent></Card>
      </div>

      <Card className="rounded-lg shadow-none"><CardHeader><CardTitle>{t("信源机会")}</CardTitle><CardDescription>{t("竞品经常被引用、但品牌覆盖不足的站点")}</CardDescription><CardAction><Button variant="ghost" size="sm" render={<Link href="/report/demo-report" />}>{t("完整报告")}<ArrowRightIcon data-icon="inline-end" /></Button></CardAction></CardHeader><CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{citationOpportunities.map((item) => <div key={item.domain} className="flex min-w-0 items-center gap-3 rounded-lg border p-3"><span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-semibold">{item.domain.charAt(0).toUpperCase()}</span><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{item.domain}</p><p className="truncate text-xs text-muted-foreground">{t(item.category)} · {t("变化")} {item.competitorCitations - item.brandCitations}</p></div><Button variant="ghost" size="icon-sm" aria-label={item.domain}><ExternalLinkIcon /></Button></div>)}</CardContent></Card>
    </div>
  )
}
