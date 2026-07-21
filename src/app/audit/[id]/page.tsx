"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { CheckIcon, ChevronRightIcon, CircleDashedIcon, Clock3Icon, LoaderCircleIcon, SearchIcon } from "lucide-react"

import { EngineMark, GeoPageHeader, GeoStatusBadge } from "@/components/geo-page"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useLanguage } from "@/lib/i18n"

const steps = [
  { label: "读取品牌与竞品信息", threshold: 8 }, { label: "生成检测任务矩阵", threshold: 18 },
  { label: "调用三个 AI 搜索引擎", threshold: 72 }, { label: "提取品牌、竞品与引用", threshold: 88 },
  { label: "计算指标并生成建议", threshold: 100 },
]
const engines = [
  { id: "chatgpt" as const, name: "ChatGPT Search", offset: 0 },
  { id: "perplexity" as const, name: "Perplexity", offset: 7 },
  { id: "gemini" as const, name: "Gemini", offset: 13 },
]

export default function AuditProgressPage() {
  const [progress, setProgress] = useState(6)
  const { locale, t } = useLanguage()
  useEffect(() => { const timer = window.setInterval(() => setProgress((current) => { if (current >= 100) { window.clearInterval(timer); return 100 } return Math.min(100, current + (current < 72 ? 7 : 4)) }), 700); return () => window.clearInterval(timer) }, [])
  const elapsed = useMemo(() => Math.max(1, Math.floor(progress / 12)), [progress])

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-5 p-4 md:p-6">
      <GeoPageHeader eyebrow={`${t("检测任务")} · AUD-0719-001`} title={t(progress === 100 ? "检测已完成" : "正在分析 AI 可见度")} description={`Acme Cloud · ${t("美国")} · 10 Prompt · 3 ${t("引擎")}`} actions={<Button variant={progress === 100 ? "default" : "outline"} render={<Link href="/report/demo-report" />}>{t(progress === 100 ? "查看完整报告" : "查看演示报告")}<ChevronRightIcon data-icon="inline-end" /></Button>} />
      <Card className="rounded-lg shadow-none"><CardContent className="grid items-center gap-6 py-4 md:grid-cols-[140px_1fr] md:px-8"><div className="mx-auto flex size-28 items-center justify-center rounded-full border-8 border-emerald-100 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-600 ring-offset-2">{progress === 100 ? <CheckIcon className="size-9" /> : <span className="text-2xl font-semibold tabular-nums">{progress}%</span>}</div><div><div className="flex items-center gap-2"><GeoStatusBadge status={progress === 100 ? "completed" : "running"} /><span className="text-xs text-muted-foreground">{locale === "en" ? `${elapsed} sec` : `约 ${elapsed} 秒`}</span></div><h2 className="mt-3 text-lg font-semibold">{t(progress === 100 ? "报告已准备完成" : "正在收集并分析 AI 回答")}</h2><p className="mt-1 text-sm text-muted-foreground">{t(progress === 100 ? "共分析 60 条回答并识别 38 个引用来源。" : "任务会在后台继续运行，页面可以安全关闭。")}</p><div className="mt-5 h-2 overflow-hidden rounded-full bg-muted"><span className="block h-full rounded-full bg-emerald-600 transition-[width] duration-500" style={{ width: `${progress}%` }} /></div></div></CardContent></Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="rounded-lg shadow-none"><CardHeader><CardTitle>{t("处理步骤")}</CardTitle><CardDescription>{t("任务失败时会自动重试，不会重复计费")}</CardDescription></CardHeader><CardContent className="divide-y">{steps.map((step, index) => { const complete = progress >= step.threshold; const active = !complete && (index === 0 || progress >= steps[index - 1].threshold); return <div key={step.label} className="grid min-h-14 grid-cols-[32px_1fr_24px] items-center gap-3 py-2"><span className={`flex size-7 items-center justify-center rounded-full ${complete || active ? "bg-emerald-50 text-emerald-700" : "bg-muted text-muted-foreground"}`}>{complete ? <CheckIcon className="size-4" /> : active ? <LoaderCircleIcon className="size-4 animate-spin" /> : <CircleDashedIcon className="size-4" />}</span><div><p className={`text-sm font-medium ${active ? "text-emerald-700" : ""}`}>{t(step.label)}</p><p className="text-xs text-muted-foreground">{t(complete ? "已完成" : active ? "处理中" : "等待中")}</p></div><span className="text-xs tabular-nums text-muted-foreground">0{index + 1}</span></div> })}</CardContent></Card>
        <Card className="rounded-lg shadow-none"><CardHeader><CardTitle>{t("引擎运行状态")}</CardTitle><CardDescription>{t("每个平台执行 10 个 Prompt，每题重复 2 次")}</CardDescription></CardHeader><CardContent className="grid gap-3">{engines.map((engine) => { const engineProgress = Math.max(0, Math.min(100, progress - engine.offset)); const completed = Math.min(20, Math.floor(engineProgress / 5)); return <div key={engine.id} className="grid grid-cols-[32px_1fr] items-center gap-3 rounded-lg border p-3"><EngineMark engine={engine.id} /><div><div className="flex items-center justify-between"><span className="text-sm font-medium">{engine.name}</span><span className="text-xs tabular-nums text-muted-foreground">{completed} / 20</span></div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted"><span className="block h-full rounded-full bg-emerald-600 transition-[width] duration-500" style={{ width: `${engineProgress}%` }} /></div></div></div> })}</CardContent></Card>
      </div>

      <Card className="rounded-lg shadow-none"><CardHeader><CardTitle>{t("实时活动")}</CardTitle><CardDescription>{t("最近处理的检测任务")}</CardDescription></CardHeader><CardContent className="divide-y"><Activity icon={<SearchIcon className="size-4 text-blue-700" />} label={t("正在分析")} text="Best Notion alternatives for managing company knowledge" time={t("刚刚")} /><Activity icon={<CheckIcon className="size-4 text-emerald-700" />} label={t("提取引用")} text={locale === "en" ? "Found 4 sources including g2.com and zapier.com" : "识别到 g2.com、zapier.com 等 4 个来源"} time={locale === "en" ? "3 sec ago" : "3 秒前"} /><Activity icon={<Clock3Icon className="size-4 text-amber-700" />} label={t("品牌识别")} text={locale === "en" ? "Acme Cloud ranked #3 in the recommendation list" : "发现 Acme Cloud 位于推荐列表第 3 位"} time={locale === "en" ? "6 sec ago" : "6 秒前"} /></CardContent></Card>
    </div>
  )
}

function Activity({ icon, label, text, time }: { icon: React.ReactNode; label: string; text: string; time: string }) {
  return <div className="grid grid-cols-[20px_64px_1fr_auto] items-center gap-3 py-3 text-xs">{icon}<span className="text-muted-foreground">{label}</span><strong className="truncate font-medium">{text}</strong><time className="text-muted-foreground">{time}</time></div>
}
