"use client"

import { useCallback, useEffect, useState } from "react"
import { CalendarDaysIcon, CoinsIcon, HistoryIcon, WalletCardsIcon } from "lucide-react"

import { ErrorState, LoadingState } from "@/components/project-shared"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getBilling, type BillingSummary } from "@/lib/project-api"

export function BillingSummaryPage() {
  const [summary, setSummary] = useState<BillingSummary | null>(null)
  const [error, setError] = useState("")
  const load = useCallback(async () => { setError(""); try { setSummary((await getBilling()).data) } catch (loadError) { setError(loadError instanceof Error ? loadError.message : "额度信息加载失败。") } }, [])
  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0)
    return () => window.clearTimeout(timer)
  }, [load])
  if (error) return <div className="p-4 md:p-6"><ErrorState message={error} retry={() => void load()} /></div>
  if (!summary) return <LoadingState label="正在加载套餐与额度..." />

  return (
    <div className="@container/main flex flex-1 flex-col gap-5 p-4 md:p-6">
      <div><h2 className="text-xl font-semibold">套餐与额度</h2><p className="mt-1 text-sm text-muted-foreground">检测额度、有效期与不可变流水</p></div>
      <section className="grid gap-3 md:grid-cols-3"><Card className="rounded-lg shadow-none"><CardHeader><CardDescription>当前余额</CardDescription><CardTitle className="text-2xl tabular-nums">{summary.balance}</CardTitle></CardHeader><CardContent><CoinsIcon className="size-5 text-emerald-700" /></CardContent></Card><Card className="rounded-lg shadow-none"><CardHeader><CardDescription>当前套餐</CardDescription><CardTitle className="text-lg">{summary.subscription?.name ?? "尚未开通"}</CardTitle></CardHeader><CardContent><WalletCardsIcon className="size-5 text-blue-700" /></CardContent></Card><Card className="rounded-lg shadow-none"><CardHeader><CardDescription>有效期</CardDescription><CardTitle className="text-sm">{summary.subscription ? `${new Date(summary.subscription.startsAt).toLocaleDateString("zh-CN")} – ${new Date(summary.subscription.expiresAt).toLocaleDateString("zh-CN")}` : "—"}</CardTitle></CardHeader><CardContent><CalendarDaysIcon className="size-5 text-amber-700" /></CardContent></Card></section>
      <Card className="rounded-lg shadow-none"><CardHeader><CardTitle className="flex items-center gap-2"><HistoryIcon className="size-4" />额度流水</CardTitle><CardDescription>发放、预占、消耗、释放与人工调整</CardDescription></CardHeader><CardContent className="px-0">{summary.ledger.length === 0 ? <p className="p-8 text-center text-sm text-muted-foreground">暂无额度流水</p> : <Table><TableHeader><TableRow><TableHead className="pl-4">时间</TableHead><TableHead>类型</TableHead><TableHead>变动</TableHead><TableHead>余额</TableHead><TableHead>原因</TableHead></TableRow></TableHeader><TableBody>{summary.ledger.map((item) => <TableRow key={item.id}><TableCell className="pl-4 text-xs text-muted-foreground">{new Date(item.createdAt).toLocaleString("zh-CN")}</TableCell><TableCell><Badge variant="outline">{item.type}</Badge></TableCell><TableCell className={item.amount >= 0 ? "text-emerald-700" : "text-rose-700"}>{item.amount >= 0 ? "+" : ""}{item.amount}</TableCell><TableCell className="font-medium tabular-nums">{item.balanceAfter}</TableCell><TableCell className="text-sm text-muted-foreground">{item.reason || "—"}</TableCell></TableRow>)}</TableBody></Table>}</CardContent></Card>
    </div>
  )
}
