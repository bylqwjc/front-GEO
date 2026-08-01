"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { FormEvent, useMemo, useState } from "react"
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon, Globe2Icon, InfoIcon, PlusIcon, SparklesIcon, Trash2Icon } from "lucide-react"

import { EngineMark, GeoPageHeader } from "@/components/geo-page"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { apiRequest } from "@/lib/api-client"
import { useLanguage } from "@/lib/i18n"
import type { EngineId } from "@/lib/types"

const defaultPrompts = [
  "What are the best knowledge base tools for remote SaaS teams?",
  "Best Notion alternatives for managing company knowledge",
  "Acme Cloud vs Confluence for a 100-person startup",
  "Which knowledge base has the best AI search?",
  "Secure internal wiki for SOC 2 compliant companies",
  "Affordable Confluence alternative for small teams",
  "Knowledge base software with Slack integration",
  "Is Acme Cloud suitable for distributed product teams?",
  "Best company wiki for product and engineering teams",
  "How much does an internal knowledge base cost for 100 users?",
]

const engines: { id: EngineId; label: string; description: string }[] = [
  { id: "chatgpt", label: "ChatGPT", description: "官方能力可用时自动采集" },
  { id: "perplexity", label: "Perplexity", description: "答案与正式引用来源" },
  { id: "gemini", label: "Gemini", description: "搜索增强回答" },
  { id: "deepseek", label: "DeepSeek", description: "国内模型与联网状态" },
  { id: "doubao", label: "豆包", description: "首发支持人工采集" },
  { id: "yuanbao", label: "腾讯元宝", description: "首发支持人工采集" },
]

export default function NewAuditPage() {
  const router = useRouter()
  const { t } = useLanguage()
  const [brand, setBrand] = useState("Acme Cloud")
  const [domain, setDomain] = useState("https://acmecloud.example")
  const [description, setDescription] = useState("Enterprise knowledge base and AI search for remote SaaS teams")
  const [competitors, setCompetitors] = useState(["Notion", "Confluence", "Slite"])
  const [selectedEngines, setSelectedEngines] = useState<EngineId[]>(["chatgpt", "perplexity", "gemini"])
  const [prompts, setPrompts] = useState(defaultPrompts)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const responseCount = useMemo(() => prompts.filter(Boolean).length * selectedEngines.length * 2, [prompts, selectedEngines])

  function toggleEngine(engine: EngineId) {
    setSelectedEngines((current) => current.includes(engine) ? current.filter((item) => item !== engine) : [...current, engine])
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setError("")
    try {
      const result = await apiRequest<{ id: string; status: string; responseCount: number }>("/audits", {
        method: "POST",
        body: JSON.stringify({ brand, domain, description, competitors, prompts, engines: selectedEngines }),
      })
      if (!result.id) throw new Error("创建检测失败，请稍后重试。")
      router.push(`/audit/${result.id}`)
    } catch (submissionError) {
      setError(t(submissionError instanceof Error ? submissionError.message : "创建检测失败，请稍后重试。"))
      setSubmitting(false)
    }
  }

  return (
    <form className="flex flex-1 flex-col gap-5 p-4 md:p-6" onSubmit={handleSubmit}>
      <GeoPageHeader eyebrow={t("新建检测")} title={t("配置 AI 可见度检测")} description={t("美国市场 · 英语 · 每个问题重复检测 2 次")} actions={<Button variant="outline" render={<Link href="/" />}><ArrowLeftIcon data-icon="inline-start" />{t("返回概览")}</Button>} />
      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="grid min-w-0 gap-5">
          <Card className="rounded-lg shadow-none"><CardHeader><CardTitle>{t("品牌信息")}</CardTitle><CardDescription>{t("用于识别回答中的品牌、别名和竞争关系")}</CardDescription></CardHeader><CardContent className="grid gap-4">
            <div className="grid gap-4 md:grid-cols-2"><div className="grid gap-2"><Label htmlFor="brand">{t("品牌名称")}</Label><Input id="brand" required value={brand} onChange={(event) => setBrand(event.target.value)} /></div><div className="grid gap-2"><Label htmlFor="domain">{t("官网域名")}</Label><Input id="domain" type="url" required value={domain} onChange={(event) => setDomain(event.target.value)} /></div></div>
            <div className="grid gap-2"><Label htmlFor="description">{t("产品描述")}</Label><textarea id="description" rows={3} value={description} onChange={(event) => setDescription(event.target.value)} className="min-h-20 w-full resize-y rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50" /><p className="text-xs text-muted-foreground">{t("这段信息仅用于生成和分类检测问题。")}</p></div>
            <div className="grid gap-2"><Label>{t("主要竞品")}</Label><div className="grid gap-3 md:grid-cols-3">{competitors.map((competitor, index) => <Input key={index} aria-label={`${t("竞品")} ${index + 1}`} value={competitor} onChange={(event) => setCompetitors((current) => current.map((item, itemIndex) => itemIndex === index ? event.target.value : item))} />)}</div></div>
          </CardContent></Card>

          <Card className="rounded-lg shadow-none"><CardHeader><CardTitle>{t("检测范围")}</CardTitle><CardDescription>{t("选择六个平台，按当前可用性自动或人工采集")}</CardDescription></CardHeader><CardContent className="grid gap-5">
            <div className="grid gap-3 md:grid-cols-3">{engines.map((engine) => { const selected = selectedEngines.includes(engine.id); return <button key={engine.id} type="button" aria-pressed={selected} onClick={() => toggleEngine(engine.id)} className={`grid min-h-16 grid-cols-[32px_1fr_18px] items-center gap-3 rounded-lg border p-3 text-left transition-colors ${selected ? "border-foreground bg-muted/60 ring-1 ring-foreground" : "hover:bg-muted/50"}`}><EngineMark engine={engine.id} /><span><strong className="block text-sm font-medium">{engine.label}</strong><small className="text-xs text-muted-foreground">{t(engine.description)}</small></span><span className={`flex size-4 items-center justify-center rounded border ${selected ? "border-foreground bg-foreground text-background" : "border-input"}`}>{selected ? <CheckIcon className="size-3" /> : null}</span></button> })}</div>
            <Separator />
            <div className="grid gap-4 md:grid-cols-2"><div className="grid gap-2"><Label htmlFor="country">{t("目标国家")}</Label><div className="relative"><Globe2Icon className="absolute left-3 top-2.5 size-4 text-muted-foreground" /><select id="country" defaultValue="us" className="h-9 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm"><option value="us">{t("美国")}</option><option value="uk">{t("英国")}</option><option value="sg">{t("新加坡")}</option></select></div></div><div className="grid gap-2"><Label htmlFor="language">{t("回答语言")}</Label><select id="language" defaultValue="en" className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm"><option value="en">{t("英语")}</option><option value="zh">{t("简体中文")}</option></select></div></div>
          </CardContent></Card>

          <Card id="prompts" className="scroll-mt-20 rounded-lg shadow-none"><CardHeader><CardTitle>{t("检测 Prompt")}</CardTitle><CardDescription>{t("按购买阶段整理的高意图客户问题")}</CardDescription><CardAction><Button variant="outline" size="sm" type="button"><SparklesIcon data-icon="inline-start" />{t("重新生成")}</Button></CardAction></CardHeader><CardContent className="grid gap-3"><div className="overflow-hidden rounded-lg border">{prompts.map((prompt, index) => <div key={index} className="grid grid-cols-[28px_1fr_32px] items-center gap-2 border-t p-2 first:border-t-0 hover:bg-muted/30"><span className="text-center text-xs tabular-nums text-muted-foreground">{String(index + 1).padStart(2, "0")}</span><Input aria-label={`Prompt ${index + 1}`} value={prompt} onChange={(event) => setPrompts((current) => current.map((item, itemIndex) => itemIndex === index ? event.target.value : item))} /><Button variant="ghost" size="icon" type="button" aria-label={`${t("删除")} Prompt ${index + 1}`} onClick={() => setPrompts((current) => current.filter((_, itemIndex) => itemIndex !== index))}><Trash2Icon /></Button></div>)}</div><Button variant="ghost" size="sm" type="button" className="w-fit" onClick={() => setPrompts((current) => [...current, ""])}><PlusIcon data-icon="inline-start" />{t("添加 Prompt")}</Button></CardContent></Card>
        </div>

        <Card className="sticky top-16 rounded-lg shadow-none"><CardHeader><CardTitle>{t("检测摘要")}</CardTitle><CardDescription>{t("创建后将进入异步检测队列")}</CardDescription></CardHeader><CardContent className="grid gap-4"><div className="flex min-w-0 items-center gap-3 rounded-lg border bg-muted/30 p-3"><span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-foreground text-xs font-semibold text-background">A</span><div className="min-w-0"><p className="truncate text-sm font-medium">{brand || t("未命名品牌")}</p><p className="truncate text-xs text-muted-foreground">{domain || t("尚未填写域名")}</p></div></div><dl className="grid text-sm"><div className="flex justify-between border-b py-2.5"><dt className="text-muted-foreground">{t("检测 Prompt")}</dt><dd className="font-medium">{prompts.filter(Boolean).length}</dd></div><div className="flex justify-between border-b py-2.5"><dt className="text-muted-foreground">{t("AI 搜索引擎")}</dt><dd className="font-medium">{selectedEngines.length}</dd></div><div className="flex justify-between border-b py-2.5"><dt className="text-muted-foreground">{t("每题重复次数")}</dt><dd className="font-medium">2</dd></div><div className="flex justify-between py-2.5"><dt className="text-muted-foreground">{t("预计生成回答")}</dt><dd className="text-lg font-semibold text-emerald-700">{responseCount}</dd></div></dl><div className="flex gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3 text-blue-900"><InfoIcon className="mt-0.5 size-4 shrink-0" /><p className="text-xs">{t("自动采集和人工采集会进入同一检测批次，报告将明确标注采集方式。")}</p></div>{error ? <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">{error}</p> : null}<Button type="submit" size="lg" disabled={submitting || responseCount === 0} className="w-full">{submitting ? t("正在创建...") : t("开始检测")}{!submitting ? <ArrowRightIcon data-icon="inline-end" /> : null}</Button></CardContent></Card>
      </div>
    </form>
  )
}
