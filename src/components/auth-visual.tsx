"use client"

import { useEffect, useRef } from "react"

type NodeKind = "blue" | "red" | "core"
type NetworkNode = readonly [number, number, number, NodeKind]

const networkNodes: NetworkNode[] = [
  [0.485, 0.022, 3, "blue"],
  [0.585, 0.023, 3, "blue"],
  [0.389, 0.068, 2, "blue"],
  [0.52, 0.065, 4, "red"],
  [0.456, 0.121, 7, "core"],
  [0.402, 0.141, 4, "blue"],
  [0.341, 0.136, 3, "red"],
  [0.427, 0.186, 3, "blue"],
  [0.486, 0.245, 3, "blue"],
  [0.397, 0.269, 3, "red"],
  [0.394, 0.307, 7, "core"],
  [0.329, 0.357, 4, "blue"],
  [0.381, 0.369, 3, "blue"],
  [0.307, 0.391, 2, "blue"],
  [0.423, 0.35, 3, "red"],
  [0.318, 0.43, 7, "core"],
  [0.255, 0.465, 3, "red"],
  [0.222, 0.506, 5, "blue"],
  [0.168, 0.485, 3, "red"],
  [0.198, 0.52, 3, "blue"],
  [0.126, 0.56, 3, "blue"],
  [0.077, 0.514, 3, "red"],
  [0.207, 0.594, 3, "blue"],
  [0.23, 0.551, 3, "blue"],
  [0.353, 0.486, 2, "blue"],
  [0.373, 0.524, 3, "blue"],
  [0.438, 0.407, 2, "blue"],
  [0.473, 0.324, 2, "blue"],
  [0.505, 0.212, 2, "blue"],
  [0.548, 0.109, 2, "red"],
]

const links = [
  [0, 4],
  [1, 3],
  [3, 4],
  [2, 5],
  [4, 5],
  [4, 6],
  [4, 7],
  [5, 7],
  [7, 8],
  [7, 9],
  [7, 10],
  [9, 10],
  [10, 11],
  [10, 12],
  [10, 14],
  [11, 12],
  [11, 13],
  [11, 15],
  [12, 15],
  [14, 15],
  [15, 16],
  [15, 17],
  [16, 17],
  [17, 18],
  [17, 19],
  [18, 20],
  [19, 20],
  [20, 21],
  [20, 22],
  [20, 23],
  [13, 24],
  [24, 25],
  [12, 26],
  [8, 27],
  [3, 28],
  [28, 29],
] as const

const geoSignals = [
  { label: "AI 可见度", target: 93 },
  { label: "品牌提及率", target: 88 },
  { label: "答案引用率", target: 84 },
  { label: "竞争声量", target: 79 },
  { label: "实时覆盖", target: 91 },
  { label: "内容权威性", target: 86 },
]

export function AuthVisual() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const context = canvas.getContext("2d")
    if (!context) return
    const activeCanvas: HTMLCanvasElement = canvas
    const drawingContext: CanvasRenderingContext2D = context

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const pointer = { x: -1000, y: -1000, active: false }
    const offsets = networkNodes.map(() => ({ x: 0, y: 0 }))
    let width = 0
    let height = 0
    let frame = 0
    let startedAt = performance.now()
    let activeSignal = 0
    let signalOpacity = 0
    let signalX = 0
    let signalY = 0
    let signalValue = 0
    let signalVisible = false
    let signalStartedAt = 0

    function resize() {
      const ratio = Math.min(window.devicePixelRatio || 1, 2)
      width = activeCanvas.clientWidth || window.innerWidth
      height = activeCanvas.clientHeight || window.innerHeight
      activeCanvas.width = Math.round(width * ratio)
      activeCanvas.height = Math.round(height * ratio)
      drawingContext.setTransform(ratio, 0, 0, ratio, 0, 0)
      startedAt = performance.now()
      if (reducedMotion) draw(startedAt)
    }

    function draw(now: number) {
      drawingContext.clearRect(0, 0, width, height)

      const mobile = width < 980
      const offsetX = mobile ? width * 0.22 : 0
      const scaleX = mobile ? 1.55 : 1
      const scaleY = mobile ? 0.82 : 1

      const points = networkNodes.map((node, index) => {
        const baseX = offsetX + node[0] * width * scaleX
        const baseY = node[1] * height * scaleY * 1.64
        const deltaX = pointer.x - baseX
        const deltaY = pointer.y - baseY
        const distance = Math.hypot(deltaX, deltaY)
        const influence = pointer.active ? Math.max(0, 1 - distance / 240) : 0
        const length = Math.max(distance, 1)
        const targetX = (deltaX / length) * influence * 24
        const targetY = (deltaY / length) * influence * 24

        offsets[index].x += (targetX - offsets[index].x) * (reducedMotion ? 1 : 0.09)
        offsets[index].y += (targetY - offsets[index].y) * (reducedMotion ? 1 : 0.09)

        const drift = reducedMotion ? 0 : Math.sin(now * 0.00055 + index * 0.8) * 1.8

        return {
          x: baseX + offsets[index].x + drift,
          y: baseY + offsets[index].y + drift * 0.55,
          radius: node[2],
          kind: node[3],
        }
      })

      const nearestSignal = pointer.active
        ? points.reduce<{ index: number; distance: number } | null>((nearest, point, index) => {
            const distance = Math.hypot(point.x - pointer.x, point.y - pointer.y)
            return !nearest || distance < nearest.distance ? { index, distance } : nearest
          }, null)
        : null
      const showSignal = Boolean(nearestSignal && nearestSignal.distance < 190)

      if (showSignal && nearestSignal) {
        if (!signalVisible) {
          activeSignal = nearestSignal.index % geoSignals.length
          signalValue = 0
          signalStartedAt = now
          signalX = pointer.x + 18
          signalY = pointer.y - 8
        }

        signalVisible = true
        signalX += (pointer.x + 18 - signalX) * (reducedMotion ? 1 : 0.34)
        signalY += (pointer.y - 8 - signalY) * (reducedMotion ? 1 : 0.34)

        const target = geoSignals[activeSignal].target
        const growthProgress = reducedMotion ? 1 : Math.min(1, (now - signalStartedAt) / 720)
        const easedGrowth = 1 - Math.pow(1 - growthProgress, 3)
        signalValue = target * easedGrowth
      } else {
        signalVisible = false
      }
      signalOpacity += ((showSignal ? 1 : 0) - signalOpacity) * (reducedMotion ? 1 : 0.18)

      drawingContext.lineWidth = 1
      for (const [from, to] of links) {
        const start = points[from]
        const end = points[to]
        drawingContext.beginPath()
        drawingContext.moveTo(start.x, start.y)
        drawingContext.lineTo(end.x, end.y)
        drawingContext.strokeStyle = "rgba(195, 202, 212, 0.78)"
        drawingContext.stroke()
      }

      if (pointer.active) {
        const nearby = points
          .map((point) => ({ point, distance: Math.hypot(point.x - pointer.x, point.y - pointer.y) }))
          .filter((item) => item.distance < 220)
          .sort((a, b) => a.distance - b.distance)
          .slice(0, 5)

        for (const { point, distance } of nearby) {
          drawingContext.beginPath()
          drawingContext.moveTo(pointer.x, pointer.y)
          drawingContext.lineTo(point.x, point.y)
          drawingContext.strokeStyle = `rgba(54, 65, 245, ${0.58 * (1 - distance / 220)})`
          drawingContext.lineWidth = 1.2
          drawingContext.stroke()
        }
      }

      const pulse = reducedMotion ? 0.5 : (Math.sin((now - startedAt) / 700) + 1) / 2
      points.forEach((point) => {
        if (point.x > width + 20 || point.y > height + 20) return

        if (point.kind === "core") {
          drawingContext.beginPath()
          drawingContext.arc(point.x, point.y, point.radius + 5 + pulse * 3, 0, Math.PI * 2)
          drawingContext.fillStyle = `rgba(54, 65, 245, ${0.07 + pulse * 0.04})`
          drawingContext.fill()

          drawingContext.beginPath()
          drawingContext.arc(point.x, point.y, point.radius + 2, 0, Math.PI * 2)
          drawingContext.strokeStyle = "rgba(195, 202, 212, 0.95)"
          drawingContext.lineWidth = 2
          drawingContext.stroke()
        }

        drawingContext.beginPath()
        drawingContext.arc(point.x, point.y, point.radius, 0, Math.PI * 2)
        drawingContext.fillStyle = point.kind === "red" ? "#e32636" : "#3641f5"
        drawingContext.fill()
      })

      if (signalOpacity > 0.02) {
        const signal = geoSignals[activeSignal]
        const value = Math.round(signalValue)
        const activeBars = Math.max(0, Math.ceil(signalValue / (signal.target / 7)))
        const labelX = Math.max(10, Math.min(width - 142, signalX))
        const labelY = Math.max(18, Math.min(height - 26, signalY))

        drawingContext.save()
        drawingContext.globalAlpha = signalOpacity
        drawingContext.fillStyle = "#161a24"
        drawingContext.font = '600 12px Inter, "Microsoft YaHei", sans-serif'
        drawingContext.fillText(signal.label, labelX, labelY)

        const labelWidth = drawingContext.measureText(signal.label).width
        drawingContext.fillStyle = "#3641f5"
        drawingContext.font = '500 12px Inter, "Microsoft YaHei", sans-serif'
        drawingContext.fillText(String(value), labelX + labelWidth + 8, labelY)

        for (let index = 0; index < 7; index += 1) {
          drawingContext.fillStyle = index < activeBars ? "#3641f5" : "#c3cad4"
          drawingContext.fillRect(labelX + index * 11, labelY + 9, 8, 8)
        }
        drawingContext.restore()
      }

      if (!reducedMotion) frame = window.requestAnimationFrame(draw)
    }

    function handlePointer(event: PointerEvent) {
      pointer.x = event.clientX
      pointer.y = event.clientY
      pointer.active = true
      if (reducedMotion) draw(performance.now())
    }

    function handlePointerLeave() {
      pointer.active = false
      if (reducedMotion) draw(performance.now())
    }

    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(activeCanvas)
    window.addEventListener("pointermove", handlePointer, { passive: true })
    window.addEventListener("blur", handlePointerLeave)
    document.documentElement.addEventListener("pointerleave", handlePointerLeave)

    resize()
    draw(performance.now())

    return () => {
      window.cancelAnimationFrame(frame)
      resizeObserver.disconnect()
      window.removeEventListener("pointermove", handlePointer)
      window.removeEventListener("blur", handlePointerLeave)
      document.documentElement.removeEventListener("pointerleave", handlePointerLeave)
    }
  }, [])

  return <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 z-0 size-full" aria-hidden="true" />
}