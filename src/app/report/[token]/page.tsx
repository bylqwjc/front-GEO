"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { ArrowRightIcon, CheckIcon, CircleAlertIcon, DownloadIcon, ExternalLinkIcon, FileCheck2Icon, Link2Icon, MessageSquareTextIcon, RefreshCwIcon, SparklesIcon, XIcon } from "lucide-react"

import { EngineMark, GeoMetricCard, GeoPageHeader, GeoStatusBadge } from "@/components/geo-page"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useLanguage } from "@/lib/i18n"
import { citationOpportunities, engineLabels, journeyStages, promptResults, voiceShare } from "@/lib/mock-data"
import type { EngineId } from "@/lib/types"

type EngineFilter = "all" | EngineId
const voiceColors = ["bg-emerald-600", "bg-blue-600", "bg-amber-500", "bg-rose-500"]
const englishFindings: Record<string, string> = {
  p1: "Included for remote teams, but permission-management details are missing.",
  p2: "Appears as an alternative, while Slite and Confluence receive stronger recommendations.",
  p3: "Fast onboarding is recognized, but the enterprise SSO scope is described incorrectly.",
  p4: "The answer focuses on Notion, Guru, and Glean; the brand is absent.",
  p5: "Security capabilities are recognized through a third-party software directory.",
  p6: "Public pricing comparisons are insufficient for retrieval.",
  p7: "The brand is cited but ranks low; competitors provide clearer integration details.",
  p8: "The answer accurately cites remote collaboration and async review capabilities.",
}

export default function ReportPage() {
  const [engine, setEngine] = useState<EngineFilter>("all")
  const { locale, t } = useLanguage()
  const filteredResults = useMemo(() => engine === "all" ? promptResults : promptResults.filter((result) => result.engine === engine), [engine])

  function downloadDemo() {
    const blob = new Blob(["GEO Pulse demo report\nAcme Cloud\nBrand share of voice: 31%"], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob); const anchor = document.createElement("a"); anchor.href = url; anchor.download = "acme-cloud-geo-report.txt"; anchor.click(); URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-1 flex-col gap-5 p-4 md:p-6">
      <GeoPageHeader eyebrow={`${t("检测报告")} · 2026-07-19`} title={`Acme Cloud ${t("可见度报告")}`} description={`${t("美国")} · ${t("英语")} · 3 ${t("引擎")} · 60 ${locale === "en" ? "answers" : "条回答"}`} actions={<><Button variant="outline" onClick={downloadDemo}><DownloadIcon data-icon="inline-start" />{t("导出摘要")}</Button><Button render={<Link href="/new" />}><RefreshCwIcon data-icon="inline-start" />{t("创建复测")}</Button></>} />
      <div className="grid min-h-16 grid-cols-[1fr_auto] items-center gap-4 rounded-lg border bg-card p-3 sm:grid-cols-[1fr_auto_auto]"><div className="flex min-w-0 items-center gap-3"><span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-foreground text-sm font-semibold text-background">A</span><div className="min-w-0"><p className="truncate text-sm font-medium">Acme Cloud</p><p className="truncate text-xs text-muted-foreground">acmecloud.example</p></div></div><div className="hidden gap-5 text-xs text-muted-foreground sm:flex"><span>{t("竞品")} <strong className="text-foreground">3</strong></span><span>Prompt <strong className="text-foreground">20</strong></span><span>{t("引用来源")} <strong className="text-foreground">38</strong></span></div><GeoStatusBadge status="completed" /></div>

      <section className="grid grid-cols-2 gap-3 @4xl/main:grid-cols-4"><GeoMetricCard label={t("品牌提及率")} value="58%" change="8.4%" detail={t("行业基准 46%")} icon={<MessageSquareTextIcon className="size-4" />} /><GeoMetricCard label={t("AI 推荐率")} value="34%" change="5.1%" detail={t("决策阶段仅 18%")} tone="blue" icon={<SparklesIcon className="size-4" />} /><GeoMetricCard label={t("官网引用率")} value="22%" change="1.7%" detail={t("第三方信源占 78%")} tone="amber" icon={<Link2Icon className="size-4" />} /><GeoMetricCard label={t("回答一致性")} value="76%" change={t("稳定")} trend="flat" detail={t("两次运行结果接近")} tone="coral" icon={<FileCheck2Icon className="size-4" />} /></section>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="rounded-lg shadow-none"><CardHeader><CardTitle>{t("品牌声量对比")}</CardTitle><CardDescription>{t("品牌与三个主要竞品的回答提及占比")}</CardDescription></CardHeader><CardContent className="grid grid-cols-4 gap-3 pt-2">{voiceShare.map((item, index) => <div key={item.brand} className="flex min-w-0 flex-col items-center"><div className="flex h-32 w-full flex-col items-center justify-end border-b"><span className="mb-1 text-xs font-medium tabular-nums">{item.value}%</span><span className={`w-10 rounded-t-md ${voiceColors[index]}`} style={{ height: `${item.value * 2.5}px` }} /></div><p className="mt-2 max-w-full truncate text-xs font-medium">{item.brand}</p><p className="text-[10px] text-muted-foreground">#{index + 1}</p></div>)}</CardContent></Card>
        <Card className="rounded-lg shadow-none"><CardHeader><CardTitle>{t("购买旅程缺口")}</CardTitle><CardDescription>{t("越接近购买，品牌推荐表现越弱")}</CardDescription></CardHeader><CardContent className="space-y-4">{journeyStages.map((stage) => <div key={stage.stage}><div className="flex justify-between text-xs"><span className="font-medium">{t(stage.stage)}</span><span className="tabular-nums text-muted-foreground">{stage.mention}%</span></div><div className="mt-2 space-y-1"><Bar value={stage.mention} color="bg-emerald-600" /><Bar value={stage.recommendation} color="bg-blue-600" /></div></div>)}<div className="flex gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-amber-900"><CircleAlertIcon className="mt-0.5 size-4 shrink-0" /><p className="text-xs"><strong>{t("最大机会：")}</strong>{t("补齐价格、企业安全和竞品比较内容，可覆盖 7 个高意图 Prompt。")}</p></div></CardContent></Card>
      </div>

      <Card className="rounded-lg shadow-none"><CardHeader><CardTitle>{t("Prompt 证据")}</CardTitle><CardDescription>{t("每条结论均保留原始回答摘要和引用来源")}</CardDescription></CardHeader><CardContent className="grid gap-4 px-0"><div className="flex gap-1 overflow-x-auto px-4">{(["all", "chatgpt", "perplexity", "gemini"] as EngineFilter[]).map((item) => <button key={item} type="button" onClick={() => setEngine(item)} className={`h-8 shrink-0 rounded-md px-3 text-xs font-medium ${engine === item ? "bg-foreground text-background" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}>{item === "all" ? t("全部引擎") : engineLabels[item]}</button>)}</div><div className="overflow-x-auto"><Table className="min-w-[1080px] table-fixed"><TableHeader><TableRow><TableHead className="w-72 pl-4">Prompt</TableHead><TableHead className="w-36">{t("引擎")}</TableHead><TableHead className="w-16">{t("提及")}</TableHead><TableHead className="w-16">{t("推荐")}</TableHead><TableHead className="w-16">{t("位置")}</TableHead><TableHead className="w-40">{t("主要引用")}</TableHead><TableHead className="w-72">{t("回答结论")}</TableHead></TableRow></TableHeader><TableBody>{filteredResults.map((result) => <TableRow key={result.id}><TableCell className="whitespace-normal break-words pl-4 align-top font-medium">{result.prompt}</TableCell><TableCell className="align-top"><div className="flex min-w-0 items-center gap-2"><EngineMark engine={result.engine} className="size-6 shrink-0" /><span className="truncate text-xs">{engineLabels[result.engine]}</span></div></TableCell><TableCell>{result.mentioned ? <CheckIcon className="size-4 text-emerald-700" /> : <XIcon className="size-4 text-muted-foreground" />}</TableCell><TableCell>{result.recommended ? <CheckIcon className="size-4 text-emerald-700" /> : <XIcon className="size-4 text-muted-foreground" />}</TableCell><TableCell>{result.position ? `#${result.position}` : "-"}</TableCell><TableCell>{result.citation ? <button type="button" className="inline-flex items-center gap-1 text-xs text-blue-700">{result.citation}<ExternalLinkIcon className="size-3" /></button> : "-"}</TableCell><TableCell className="whitespace-normal break-words align-top text-xs text-muted-foreground">{locale === "en" ? englishFindings[result.id] : result.summary}</TableCell></TableRow>)}</TableBody></Table></div></CardContent></Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="rounded-lg shadow-none"><CardHeader><CardTitle>{t("信源机会")}</CardTitle><CardDescription>{t("竞品高频引用但品牌覆盖不足的网站")}</CardDescription></CardHeader><CardContent className="divide-y">{citationOpportunities.map((item) => <div key={item.domain} className="grid grid-cols-[32px_1fr_auto_32px] items-center gap-3 py-3"><span className="flex size-8 items-center justify-center rounded-md bg-muted text-xs font-semibold">{item.domain.charAt(0).toUpperCase()}</span><div className="min-w-0"><p className="truncate text-sm font-medium">{item.domain}</p><p className="text-xs text-muted-foreground">{t(item.category)} · {t("权威度")}{t(item.authority)}</p></div><div className="hidden gap-1 sm:flex"><Badge variant="outline" className="border-rose-200 bg-rose-50 text-rose-700">{t("竞品")} {item.competitorCitations}</Badge><Badge variant="outline">{t("品牌")} {item.brandCitations}</Badge></div><Button variant="ghost" size="icon-sm" aria-label={item.domain}><ExternalLinkIcon /></Button></div>)}</CardContent></Card>
        <Card className="rounded-lg shadow-none"><CardHeader><CardTitle>{t("优先行动")}</CardTitle><CardDescription>{t("根据商业价值和竞品差距排序")}</CardDescription><CardAction><Badge variant="outline">3 {t("项")}</Badge></CardAction></CardHeader><CardContent className="grid gap-3">{[["01","发布 Confluence 对比页","预计覆盖 6 个高意图 Prompt","high"],["02","修正企业安全事实","Gemini 存在 2 条错误描述","high"],["03","更新 Zapier 产品资料","外部引用差距为 16 次","medium"]].map(([index,title,detail,priority]) => <div key={index} className="grid grid-cols-[24px_1fr_auto] items-center gap-3 rounded-lg border p-3"><span className="text-xs text-muted-foreground">{index}</span><div><p className="text-sm font-medium">{t(title)}</p><p className="text-xs text-muted-foreground">{t(detail)}</p></div><GeoStatusBadge status={priority as "high" | "medium"} /></div>)}<Button className="mt-1 w-full" render={<Link href="/tasks/audit-2026-0719" />}>{t("打开完整行动清单")}<ArrowRightIcon data-icon="inline-end" /></Button></CardContent></Card>
      </div>
    </div>
  )
}

function Bar({ value, color }: { value: number; color: string }) { return <div className="h-1.5 overflow-hidden rounded-full bg-muted"><span className={`block h-full rounded-full ${color}`} style={{ width: `${value}%` }} /></div> }
