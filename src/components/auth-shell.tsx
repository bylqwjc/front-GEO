import Image from "next/image"
import Link from "next/link"

import { AuthVisual } from "@/components/auth-visual"
import { SignalMetrics } from "@/components/signal-metrics"
import { Card, CardContent, CardHeader } from "@/components/ui/card"


export function AuthShell({
  title,
  description,
  children,
  footer,
}: {
  title: string
  description: string
  children: React.ReactNode
  footer: React.ReactNode
}) {
  return (
    <main className="relative isolate min-h-svh overflow-x-hidden bg-[#f4f6f9] text-[#161a24] min-[981px]:grid min-[981px]:grid-cols-[minmax(520px,1.2fr)_minmax(430px,0.8fr)] min-[1181px]:grid-cols-[minmax(620px,1.5fr)_minmax(500px,1fr)]">
      <AuthVisual />

      <section
        className="relative z-10 flex min-h-[52svh] flex-col py-4 pl-5 pr-4 md:py-6 md:pr-6 min-[981px]:min-h-svh"
        aria-labelledby="product-name"
      >
        <Link href="/" className="w-fit" aria-label="可见 SEEN 首页">
          <Image
            src="/kejian-seen-logo-web.png"
            alt="可见 SEEN"
            width={1911}
            height={396}
            priority
            className="h-auto w-[clamp(178px,42vw,220px)] min-[981px]:w-[clamp(190px,15vw,236px)]"
          />
        </Link>

        <div className="mt-auto max-w-[610px] pt-20 min-[981px]:my-auto min-[981px]:translate-y-[4%] min-[981px]:pt-0 pl-[40px]">
          <h1
            id="product-name"
            className="text-[clamp(48px,12vw,68px)] font-[780] leading-[1.03] tracking-normal text-[#161a24] min-[981px]:text-[clamp(54px,4.35vw,76px)]"
          >
            可见 SEEN
          </h1>
          <p className="mt-4 flex items-center gap-3 text-[clamp(17px,4.8vw,22px)] font-bold leading-snug text-[#161a24] min-[981px]:text-[clamp(17px,1.45vw,24px)]">
            <span className="size-2 shrink-0 rounded-full bg-[#e32636] shadow-[0_0_0_5px_rgba(227,38,54,0.08)]" />
            全球 AI 信号 / 实时
          </p>
          <p className="mt-6 max-w-[560px] text-[clamp(17px,4.6vw,22px)] font-semibold leading-[1.65] text-[#161a24] min-[981px]:text-[clamp(19px,1.35vw,25px)]">
            让品牌在每一次 AI 回答中，
            <br className="hidden sm:block" />
            被看见、被理解、被选择。
          </p>
        </div>
      </section>

      <SignalMetrics />

      <section
        className="relative z-10 grid min-h-0 place-items-center p-4 md:p-6 min-[981px]:min-h-svh"
        aria-label={title}
      >
        <Card className="w-full max-w-md gap-0 rounded-lg border border-[#dfe3eb] bg-white py-6 shadow-[0_16px_45px_rgba(22,26,36,0.08)] ring-0 [--card-spacing:--spacing(6)]">
          <CardHeader className="gap-2">
            <h2 className="text-2xl font-semibold leading-tight tracking-normal text-[#161a24]">{title}</h2>
            <p className="text-sm leading-6 text-[#5f6878]">{description}</p>
          </CardHeader>

          <CardContent className="pt-6">
            {children}
            <div className="mt-6 border-t border-[#e4e8ee] pt-4 text-center text-sm leading-6 text-[#5f6878]">
              {footer}
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  )
}