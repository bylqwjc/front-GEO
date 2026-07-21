"use client"

import type { ReactNode } from "react"
import { ArrowDownRightIcon, ArrowUpRightIcon, MinusIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { useLanguage } from "@/lib/i18n"
import { cn } from "@/lib/utils"

export function GeoPageHeader({ eyebrow, title, description, actions }: { eyebrow?: string; title: string; description: string; actions?: ReactNode }) {
  return <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div>{eyebrow ? <p className="mb-1 text-xs font-medium text-emerald-700">{eyebrow}</p> : null}<h2 className="text-xl font-semibold">{title}</h2><p className="mt-1 text-sm text-muted-foreground">{description}</p></div>{actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}</div>
}

const toneClasses = { green: "bg-emerald-50 text-emerald-700", blue: "bg-blue-50 text-blue-700", amber: "bg-amber-50 text-amber-700", coral: "bg-rose-50 text-rose-700" }

export function GeoMetricCard({ label, value, change, detail, trend = "up", tone = "green", icon }: { label: string; value: string; change: string; detail: string; trend?: "up" | "down" | "flat"; tone?: keyof typeof toneClasses; icon: ReactNode }) {
  const TrendIcon = trend === "up" ? ArrowUpRightIcon : trend === "down" ? ArrowDownRightIcon : MinusIcon
  return <Card className="gap-3 rounded-lg shadow-none"><CardHeader className="grid grid-cols-[1fr_auto] items-start gap-2"><div><p className="text-sm text-muted-foreground">{label}</p><p className="mt-2 text-2xl font-semibold tabular-nums">{value}</p></div><span className={cn("flex size-8 items-center justify-center rounded-md", toneClasses[tone])}>{icon}</span></CardHeader><CardContent className="flex items-center justify-between gap-2"><span className="truncate text-xs text-muted-foreground">{detail}</span><Badge variant="outline" className={cn("shrink-0", trend === "down" ? "border-rose-200 bg-rose-50 text-rose-700" : trend === "flat" ? "bg-muted text-muted-foreground" : "border-emerald-200 bg-emerald-50 text-emerald-700")}><TrendIcon />{change}</Badge></CardContent></Card>
}

export function GeoStatusBadge({ status }: { status: "completed" | "running" | "queued" | "high" | "medium" | "low" }) {
  const { t } = useLanguage()
  const config = {
    completed: { label: "已完成", className: "border-emerald-200 bg-emerald-50 text-emerald-700" },
    running: { label: "检测中", className: "border-blue-200 bg-blue-50 text-blue-700" },
    queued: { label: "等待中", className: "bg-muted text-muted-foreground" },
    high: { label: "高优先级", className: "border-rose-200 bg-rose-50 text-rose-700" },
    medium: { label: "中优先级", className: "border-amber-200 bg-amber-50 text-amber-700" },
    low: { label: "低优先级", className: "bg-muted text-muted-foreground" },
  }[status]
  return <Badge variant="outline" className={config.className}>{t(config.label)}</Badge>
}

export function EngineMark({ engine, className }: { engine: "chatgpt" | "perplexity" | "gemini"; className?: string }) {
  const config = { chatgpt: { label: "C", className: "bg-emerald-50 text-emerald-700" }, perplexity: { label: "P", className: "bg-blue-50 text-blue-700" }, gemini: { label: "G", className: "bg-amber-50 text-amber-700" } }[engine]
  return <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-md text-xs font-semibold", config.className, className)}>{config.label}</span>
}
