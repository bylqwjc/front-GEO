"use client"

import { useEffect, useState } from "react"

const metrics = [
  { label: "信号强度", left: "50.2%", top: "23.5%", target: 93 },
  { label: "可见度指数", left: "45.8%", top: "51.5%", target: 87 },
  { label: "实时覆盖", left: "38.1%", top: "75.8%", target: 91 },
]

export function SignalMetrics() {
  const [values, setValues] = useState(() => metrics.map(() => 0))

  useEffect(() => {
    const startedAt = performance.now()
    const duration = 850
    let frame = 0

    function animate(now: number) {
      const progress = Math.min(1, (now - startedAt) / duration)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValues(metrics.map((metric) => Math.round(metric.target * eased)))

      if (progress < 1) frame = window.requestAnimationFrame(animate)
    }

    frame = window.requestAnimationFrame(animate)
    return () => window.cancelAnimationFrame(frame)
  }, [])

  return (
    <div className="pointer-events-none absolute inset-0 z-[1] hidden min-[1181px]:block" aria-hidden="true">
      {metrics.map((metric, metricIndex) => {
        const value = values[metricIndex]
        const activeBars = Math.max(0, Math.ceil(value / (100 / 7)))

        return (
          <div
            key={metric.label}
            className="absolute w-32 text-xs font-semibold leading-tight text-[#161a24]"
            style={{ left: metric.left, top: metric.top }}
          >
            <span className="flex items-baseline gap-2">
              {metric.label}
              <span className="font-medium tabular-nums text-[#3641f5]">{value}</span>
            </span>
            <span className="mt-2 flex gap-[3px]">
              {Array.from({ length: 7 }, (_, index) => (
                <i
                  key={index}
                  className={[
                    "size-2 rounded-[1px] transition-all duration-300",
                    index < activeBars ? "scale-100 bg-[#3641f5] opacity-100" : "scale-90 bg-[#c3cad4] opacity-75",
                  ].join(" ")}
                />
              ))}
            </span>
          </div>
        )
      })}
    </div>
  )
}