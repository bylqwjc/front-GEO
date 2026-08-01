import type { ComponentPropsWithoutRef } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

import { cn } from "@/lib/utils"

export function MarkdownContent({
  content,
  className,
}: {
  content: string
  className?: string
}) {
  return (
    <div
      className={cn(
        "space-y-4 text-sm leading-7 text-foreground",
        className,
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: (props) => (
            <h1 className="mt-6 text-xl font-semibold first:mt-0" {...props} />
          ),
          h2: (props) => (
            <h2 className="mt-6 text-lg font-semibold first:mt-0" {...props} />
          ),
          h3: (props) => (
            <h3 className="mt-5 text-base font-semibold first:mt-0" {...props} />
          ),
          p: (props) => <p className="leading-7" {...props} />,
          ul: (props) => (
            <ul className="list-disc space-y-1 pl-5" {...props} />
          ),
          ol: (props) => (
            <ol className="list-decimal space-y-1 pl-5" {...props} />
          ),
          li: (props) => <li className="pl-1 leading-7" {...props} />,
          a: (props) => (
            <a
              className="break-words text-primary underline underline-offset-4"
              target="_blank"
              rel="noreferrer"
              {...props}
            />
          ),
          blockquote: (props) => (
            <blockquote
              className="border-l-2 border-primary/30 pl-4 text-muted-foreground"
              {...props}
            />
          ),
          code: ({ className: codeClassName, ...props }) => (
            <code
              className={cn(
                "rounded bg-muted px-1.5 py-0.5 font-mono text-[0.85em] [pre_&]:bg-transparent [pre_&]:p-0",
                codeClassName,
              )}
              {...props}
            />
          ),
          pre: (props) => (
            <pre
              className="overflow-x-auto rounded-md border bg-muted/50 p-3 text-xs leading-6"
              {...props}
            />
          ),
          table: (props) => (
            <div className="overflow-x-auto rounded-md border">
              <table className="w-full border-collapse text-left" {...props} />
            </div>
          ),
          thead: (props) => <thead className="bg-muted/70" {...props} />,
          th: (props) => (
            <th
              className="border-b px-3 py-2 text-xs font-semibold"
              {...props}
            />
          ),
          td: (props) => (
            <td className="border-b px-3 py-2 align-top text-xs" {...props} />
          ),
          hr: (props) => <hr className="my-6 border-border" {...props} />,
          img: ({
            alt,
          }: ComponentPropsWithoutRef<"img">) => (
            <span className="text-sm text-muted-foreground">
              {alt ? "\u56fe\u7247\uff1a" + alt : "\u56fe\u7247"}
            </span>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
