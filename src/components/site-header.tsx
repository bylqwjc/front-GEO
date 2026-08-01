"use client"

import { usePathname } from "next/navigation"

import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { useLanguage, type Locale } from "@/lib/i18n"

const titles: Record<string, string> = {
  "/": "AI 可见度概览",
  "/dashboard": "AI 可见度概览",
  "/projects": "产品项目",
  "/billing": "套餐与额度",
  "/new": "新建检测",
  "/audit": "检测任务",
  "/report": "可见度报告",
  "/tasks": "优化任务",
  "/compare": "复测对比",
  "/settings": "工作区设置",
}

export function SiteHeader() {
  const pathname = usePathname()
  const { locale, setLocale, t } = useLanguage()
  const routeRoot = pathname === "/" ? "/" : `/${pathname.split("/")[1]}`

  return (
    <header className="flex h-(--header-height) shrink-0 items-center border-b bg-background transition-[width,height] ease-linear">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mx-2 h-4 data-vertical:self-auto" />
        <h1 className="text-sm font-medium sm:text-base">{t(titles[routeRoot] ?? "AI 可见度概览")}</h1>
        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <Badge variant="outline" className="hidden gap-1.5 font-normal md:inline-flex">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            {t("3 个引擎正常")}
          </Badge>
          <span className="hidden text-xs text-muted-foreground lg:inline">{t("美国市场 · 英语")}</span>
          <div className="flex h-7 items-center rounded-md border bg-muted/40 p-0.5" aria-label="Language">
            {(["zh", "en"] as Locale[]).map((item) => (
              <button key={item} type="button" aria-pressed={locale === item} onClick={() => setLocale(item)} className={`h-6 min-w-8 rounded px-1.5 text-xs font-medium transition-colors ${locale === item ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                {item === "zh" ? "中" : "EN"}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  )
}
