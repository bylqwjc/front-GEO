"use client"

import { BarChart3Icon } from "lucide-react"

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

type ScoreDimension = {
  key:
    | "MENTION"
    | "RECOMMENDATION"
    | "PROMINENCE"
    | "DESCRIPTION"
    | "SENTIMENT"
    | "CITATION"
  label: string
  score: number
  maxScore: number
  reason: string
}

type VisibilityScoreBadgeProps = {
  score: number | null
  level: string | null
  breakdown: ScoreDimension[] | null
  version: string | null
}

const levelNames: Record<string, string> = {
  NO_VISIBILITY: "\u65e0\u66dd\u5149",
  WEAK: "\u5f31\u66dd\u5149",
  LIMITED: "\u6709\u9650\u66dd\u5149",
  GOOD: "\u826f\u597d\u66dd\u5149",
  STRONG: "\u5f3a\u66dd\u5149",
  EXCELLENT: "\u4f18\u8d28\u66dd\u5149",
}

const dimensionNames: Record<ScoreDimension["key"], string> = {
  MENTION: "\u54c1\u724c\u63d0\u53ca",
  RECOMMENDATION: "\u63a8\u8350\u7a0b\u5ea6",
  PROMINENCE: "\u51fa\u73b0\u4f4d\u7f6e",
  DESCRIPTION: "\u54c1\u724c\u63cf\u8ff0",
  SENTIMENT: "\u6001\u5ea6\u4e0e\u4fe1\u4efb",
  CITATION: "\u5f15\u7528\u8bc1\u636e",
}

function scoreTone(score: number) {
  if (score <= 24) {
    return "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/50 dark:text-rose-300"
  }
  if (score <= 49) {
    return "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-300"
  }
  if (score <= 74) {
    return "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900 dark:bg-sky-950/50 dark:text-sky-300"
  }
  return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300"
}

export function VisibilityScoreBadge({
  score,
  level,
  breakdown,
  version,
}: VisibilityScoreBadgeProps) {
  if (score === null) return null

  const levelName = level ? (levelNames[level] ?? level) : "\u5df2\u8bc4\u5206"

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <button
            type="button"
            aria-label={`\u54c1\u724c\u53ef\u89c1\u5ea6 ${score} \u5206\uff0c${levelName}\uff0c\u67e5\u770b\u8bc4\u5206\u660e\u7ec6`}
            className={`inline-flex h-6 shrink-0 items-center gap-1 rounded-md border px-2 text-xs font-medium tabular-nums outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 ${scoreTone(score)}`}
          >
            <BarChart3Icon className="size-3.5" aria-hidden="true" />
            <span>{score}/100</span>
            <span className="font-normal opacity-75">{levelName}</span>
          </button>
        }
      />
      <TooltipContent
        side="bottom"
        align="start"
        sideOffset={6}
        className="block max-h-[min(34rem,calc(100vh-2rem))] w-[min(30rem,calc(100vw-2rem))] max-w-[calc(100vw-2rem)] overflow-y-auto p-0 text-left"
      >
        <div className="flex items-start justify-between gap-4 border-b border-background/15 px-4 py-3">
          <div>
            <p className="text-sm font-medium">{"\u54c1\u724c\u53ef\u89c1\u5ea6\u8bc4\u5206"}</p>
            <p className="mt-0.5 text-background/65">
              {levelName}
              {version ? ` \u00b7 ${version}` : ""}
            </p>
          </div>
          <p className="shrink-0 text-xl font-semibold tabular-nums">
            {score}
            <span className="text-xs font-normal text-background/60">/100</span>
          </p>
        </div>

        {breakdown?.length ? (
          <div>
            {breakdown.map((item) => (
              <div
                key={item.key}
                className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-1 border-b border-background/10 px-4 py-3 last:border-b-0"
              >
                <p className="font-medium">{dimensionNames[item.key]}</p>
                <p className="font-semibold tabular-nums">
                  {item.score}/{item.maxScore}
                </p>
                <p className="col-span-2 leading-5 text-background/70">
                  {item.reason}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="px-4 py-3 text-background/70">
            {"\u8be5\u6761\u5386\u53f2\u7ed3\u679c\u6ca1\u6709\u4fdd\u5b58\u5206\u9879\u660e\u7ec6\u3002"}
          </p>
        )}

        <p className="border-t border-background/15 px-4 py-3 leading-5 text-background/65">
          {"\u603b\u5206 = \u54c1\u724c\u63d0\u53ca 20 + \u63a8\u8350\u7a0b\u5ea6 25 + \u51fa\u73b0\u4f4d\u7f6e 15 + \u54c1\u724c\u63cf\u8ff0 15 + \u6001\u5ea6\u4e0e\u4fe1\u4efb 15 + \u5f15\u7528\u8bc1\u636e 10\u3002"}
        </p>
      </TooltipContent>
    </Tooltip>
  )
}
