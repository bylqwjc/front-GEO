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
      <div><h2 className="text-xl font-semibold">套餐与积分</h2><p className="mt-1 text-sm text-muted-foreground">每个用户初始 0 积分，由程序发放和扣减</p></div>
      <section className="grid gap-3 md:grid-cols-3"><Card className="rounded-lg shadow-none"><CardHeader><CardDescription>当前积分</CardDescription><CardTitle className="text-2xl tabular-nums">{summary.balance}</CardTitle></CardHeader><CardContent><CoinsIcon className="size-5 text-emerald-700" /></CardContent></Card><Card className="rounded-lg shadow-none"><CardHeader><CardDescription>当前套餐</CardDescription><CardTitle className="text-lg">{summary.subscription?.name ?? "免费版"}</CardTitle></CardHeader><CardContent><WalletCardsIcon className="size-5 text-blue-700" /></CardContent></Card><Card className="rounded-lg shadow-none"><CardHeader><CardDescription>有效期</CardDescription><CardTitle className="text-sm">{summary.subscription ? `${new Date(summary.subscription.startsAt).toLocaleDateString("zh-CN")} – ${new Date(summary.subscription.expiresAt).toLocaleDateString("zh-CN")}` : "长期有效"}</CardTitle></CardHeader><CardContent><CalendarDaysIcon className="size-5 text-amber-700" /></CardContent></Card></section>
      <Card className="rounded-lg shadow-none"><CardHeader><CardTitle>操作消耗</CardTitle><CardDescription>单价从后台积分规则表读取，修改数据库后立即生效</CardDescription></CardHeader><CardContent className="grid gap-2 sm:grid-cols-3">{summary.costs.map((cost) => <div key={cost.code} className="rounded-lg border p-3"><p className="text-sm font-medium">{cost.name}</p><p className="mt-1 text-xl font-semibold tabular-nums">{cost.amount} <span className="text-xs font-normal text-muted-foreground">积分/次</span></p>{cost.description ? <p className="mt-1 text-xs text-muted-foreground">{cost.description}</p> : null}</div>)}</CardContent></Card>
      <Card className="rounded-lg shadow-none"><CardHeader><CardTitle className="flex items-center gap-2"><HistoryIcon className="size-4" />积分流水</CardTitle><CardDescription>程序发放、检查/复查扣减、文章生成扣减与人工调整</CardDescription></CardHeader><CardContent className="px-0">{summary.ledger.length === 0 ? <p className="p-8 text-center text-sm text-muted-foreground">暂无积分流水</p> : <Table><TableHeader><TableRow><TableHead className="pl-4">时间</TableHead><TableHead>类型</TableHead><TableHead>变动</TableHead><TableHead>余额</TableHead><TableHead>原因</TableHead></TableRow></TableHeader><TableBody>{summary.ledger.map((item) => <TableRow key={item.id}><TableCell className="pl-4 text-xs text-muted-foreground">{new Date(item.createdAt).toLocaleString("zh-CN")}</TableCell><TableCell><Badge variant="outline">{item.type}</Badge></TableCell><TableCell className={item.amount >= 0 ? "text-emerald-700" : "text-rose-700"}>{item.amount >= 0 ? "+" : ""}{item.amount}</TableCell><TableCell className="font-medium tabular-nums">{item.balanceAfter}</TableCell><TableCell className="text-sm text-muted-foreground">{item.reason || "—"}</TableCell></TableRow>)}</TableBody></Table>}</CardContent></Card>
    </div>
  )
}
