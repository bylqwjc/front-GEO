"use client"

import { ChevronDownIcon } from "lucide-react"
import { useState } from "react"

import { Badge } from "@/components/ui/badge"
import type { SourcePage } from "@/lib/project-api"

type Snapshot = SourcePage["snapshots"][number]

export function SnapshotHistoryRow({ snapshot, index, snapshotCount }: { snapshot: Snapshot; index: number; snapshotCount: number }) {
  const [open, setOpen] = useState(false)
  const internalLinkCount = Array.isArray(snapshot.internalLinks) ? snapshot.internalLinks.length : 0

  return (
    <div>
      <button type="button" className="grid w-full gap-2 p-3 text-left transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset sm:grid-cols-[132px_100px_minmax(0,1fr)_24px] sm:items-start" aria-expanded={open} onClick={() => setOpen((current) => !current)}>
        <time className="text-xs tabular-nums text-muted-foreground">{new Date(snapshot.crawledAt).toLocaleString("zh-CN")}</time>
        <Badge variant="outline" className="w-fit">{snapshot.statusCode ? `HTTP ${snapshot.statusCode}` : snapshot.errorCode || "无状态码"}</Badge>
        <div className="min-w-0">
          <p className="truncate text-xs font-medium">{snapshot.title || snapshot.h1 || `快照 ${snapshotCount - index}`}</p>
          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{snapshot.description || snapshot.body || snapshot.errorMessage || "暂无正文"}</p>
        </div>
        <ChevronDownIcon className={`size-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open ? (
        <div className="border-t bg-muted/20 p-4">
          <dl className="grid gap-4 text-xs sm:grid-cols-2">
            <SnapshotField label="最终 URL" value={snapshot.finalUrl} />
            <SnapshotField label="Content-Type" value={snapshot.contentType} />
            <SnapshotField label="Title" value={snapshot.title} />
            <SnapshotField label="H1" value={snapshot.h1} />
            <SnapshotField label="正文字符" value={snapshot.body ? snapshot.body.length.toLocaleString("zh-CN") : null} />
            <SnapshotField label="站内链接" value={internalLinkCount.toLocaleString("zh-CN")} />
            <SnapshotField label="Description" value={snapshot.description} wide />
            <SnapshotField label="错误信息" value={snapshot.errorMessage} wide />
          </dl>
          <div className="mt-4 border-t pt-4">
            <p className="text-xs font-medium">正文快照</p>
            <p className="mt-2 max-h-72 overflow-auto whitespace-pre-wrap break-words rounded-md bg-background p-3 text-xs leading-5 text-muted-foreground ring-1 ring-border">{snapshot.body || "暂无正文"}</p>
          </div>
        </div>
      ) : null}
    </div>
  )
}

function SnapshotField({ label, value, wide = false }: { label: string; value: string | null; wide?: boolean }) {
  return <div className={wide ? "sm:col-span-2" : ""}><dt className="text-muted-foreground">{label}</dt><dd className="mt-1 break-words font-medium text-foreground">{value || "-"}</dd></div>
}
