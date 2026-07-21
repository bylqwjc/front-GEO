"use client"

import Link from "next/link"
import { ArrowRightIcon, CalendarCheck2Icon, CheckIcon, FileCheck2Icon, Link2Icon, MessageSquareTextIcon, SparklesIcon, TrendingUpIcon } from "lucide-react"

import { GeoMetricCard, GeoPageHeader, GeoStatusBadge } from "@/components/geo-page"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useLanguage } from "@/lib/i18n"

const changes = [{ label: "品牌提及率", before: 42, after: 58 }, { label: "AI 推荐率", before: 24, after: 34 }, { label: "官网引用率", before: 15, after: 22 }, { label: "购买阶段覆盖", before: 18, after: 29 }]

export default function ComparePage() {
  const { locale, t } = useLanguage()
  return (
    <div className="flex flex-1 flex-col gap-5 p-4 md:p-6">
      <GeoPageHeader eyebrow={`${t("复测对比")} · EXP-001`} title={t("优化前后对比")} description={`Acme Cloud · ${locale === "en" ? "Jul 5–Jul 19" : "7月5日—7月19日"} · 20 Prompt`} actions={<Button render={<Link href="/new" />}>{t("开始新一轮检测")}<ArrowRightIcon data-icon="inline-end" /></Button>} />
      <div className="grid min-h-16 grid-cols-[40px_1fr_auto] items-center gap-3 rounded-lg border bg-card p-3"><span className="flex size-9 items-center justify-center rounded-md bg-emerald-50 text-emerald-700"><CalendarCheck2Icon className="size-5" /></span><div><p className="text-sm font-medium">{t("14 天 GEO 优化实验已完成")}</p><p className="text-xs text-muted-foreground">{t("已完成 4 项行动，其中 3 项指标出现可重复提升。")}</p></div><GeoStatusBadge status="completed" /></div>
      <section className="grid grid-cols-2 gap-3 @4xl/main:grid-cols-4"><GeoMetricCard label={t("品牌提及率")} value="58%" change="16.0%" detail="42% → 58%" icon={<MessageSquareTextIcon className="size-4" />} /><GeoMetricCard label={t("AI 推荐率")} value="34%" change="10.0%" detail="24% → 34%" tone="blue" icon={<SparklesIcon className="size-4" />} /><GeoMetricCard label={t("官网引用率")} value="22%" change="7.0%" detail="15% → 22%" tone="amber" icon={<Link2Icon className="size-4" />} /><GeoMetricCard label={t("新增覆盖 Prompt")} value="6" change={t("新增")} detail={t("20 个问题中新增覆盖 6 个")} tone="coral" icon={<FileCheck2Icon className="size-4" />} /></section>
      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="rounded-lg shadow-none"><CardHeader><CardTitle>{t("核心指标变化")}</CardTitle><CardDescription>{t("绿色为复测结果，灰色为优化前基线")}</CardDescription></CardHeader><CardContent className="grid gap-5">{changes.map((change) => <div key={change.label} className="grid grid-cols-[88px_1fr_42px] items-center gap-3"><span className="text-xs font-medium">{t(change.label)}</span><div className="grid gap-1.5"><ChangeBar value={change.before} /><ChangeBar value={change.after} active /></div><span className="text-right text-xs font-medium tabular-nums text-emerald-700">+{change.after - change.before}%</span></div>)}</CardContent></Card>
        <Card className="rounded-lg shadow-none"><CardHeader><CardTitle>{t("实验结论")}</CardTitle><CardDescription>{t("使用相同地区、引擎和 Prompt 设置")}</CardDescription></CardHeader><CardContent className="grid gap-4"><div className="flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-emerald-900"><TrendingUpIcon className="size-5" /><div><p className="text-sm font-medium">{t("有效提升")}</p><p className="text-xs text-emerald-800/80">{t("3 / 4 项核心指标改善")}</p></div></div><ul className="grid gap-3 text-xs text-muted-foreground"><Result text={t("竞品比较页带来 4 个新增品牌提及")} /><Result text={t("安全事实更新修正了 Gemini 错误描述")} /><Result text={t("Zapier 信源引用在本周期尚未变化")} /></ul></CardContent></Card>
      </div>
      <Card className="rounded-lg shadow-none"><CardHeader><CardTitle>{t("Prompt 变化明细")}</CardTitle><CardDescription>{t("本周期表现变化最大的客户问题")}</CardDescription></CardHeader><CardContent className="overflow-x-auto px-0"><Table className="min-w-[820px]"><TableHeader><TableRow><TableHead className="pl-4">Prompt</TableHead><TableHead>{t("优化前")}</TableHead><TableHead>{t("复测结果")}</TableHead><TableHead>{t("变化")}</TableHead><TableHead>{t("主要原因")}</TableHead></TableRow></TableHeader><TableBody><PromptChange prompt="Acme Cloud vs Confluence for a 100-person startup" before={t("未推荐")} after={`${t("推荐")} #2`} change={t("明显提升")} reason={t("新增结构化对比页")} /><PromptChange prompt="Secure internal wiki for SOC 2 compliant companies" before={`${t("提及")} #6`} after={`${t("推荐")} #4`} change={t("提升")} reason={t("补充安全认证事实")} /><PromptChange prompt="Affordable Confluence alternative for small teams" before={locale === "en" ? "Not mentioned" : "未提及"} after={`${t("提及")} #5`} change={t("新增覆盖")} reason={t("增加价格计算示例")} /></TableBody></Table></CardContent></Card>
    </div>
  )
}

function ChangeBar({ value, active = false }: { value: number; active?: boolean }) { return <div className="grid grid-cols-[1fr_32px] items-center gap-2"><div className="h-2 overflow-hidden rounded-full bg-muted"><span className={`block h-full rounded-full ${active ? "bg-emerald-600" : "bg-muted-foreground/35"}`} style={{ width: `${value}%` }} /></div><span className="text-xs tabular-nums">{value}%</span></div> }
function Result({ text }: { text: string }) { return <li className="flex gap-2"><CheckIcon className="size-4 shrink-0 text-emerald-700" />{text}</li> }
function PromptChange({ prompt, before, after, change, reason }: { prompt: string; before: string; after: string; change: string; reason: string }) { return <TableRow><TableCell className="pl-4 font-medium">{prompt}</TableCell><TableCell>{before}</TableCell><TableCell>{after}</TableCell><TableCell><span className="text-xs font-medium text-emerald-700">{change}</span></TableCell><TableCell className="text-muted-foreground">{reason}</TableCell></TableRow> }
