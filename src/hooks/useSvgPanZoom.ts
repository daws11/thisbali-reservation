import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

export interface ViewBox {
  x: number
  y: number
  w: number
  h: number
}

interface Options {
  /** base canvas dimensions; the container must share this aspect ratio */
  width: number
  height: number
  enabled?: boolean
  /** smallest allowed zoom (1 = fit; <1 not allowed by default) */
  minScale?: number
  maxScale?: number
}

interface PanZoom {
  svgRef: React.RefObject<SVGSVGElement | null>
  viewBox: string
  scale: number
  isZoomed: boolean
  reset: () => void
  zoomBy: (factor: number) => void
}

const dist = (a: { x: number; y: number }, b: { x: number; y: number }) =>
  Math.hypot(a.x - b.x, a.y - b.y)
const mid = (a: { x: number; y: number }, b: { x: number; y: number }) => ({
  x: (a.x + b.x) / 2,
  y: (a.y + b.y) / 2,
})

export function useSvgPanZoom({
  width,
  height,
  enabled = true,
  minScale = 1,
  maxScale = 4,
}: Options): PanZoom {
  const svgRef = useRef<SVGSVGElement | null>(null)
  const [vb, setVb] = useState<ViewBox>({ x: 0, y: 0, w: width, h: height })
  const vbRef = useRef(vb)
  useEffect(() => {
    vbRef.current = vb
  }, [vb])

  const pointers = useRef(new Map<number, { x: number; y: number }>())
  const lastPan = useRef<{ x: number; y: number } | null>(null)
  const lastPinch = useRef<{ dist: number; mid: { x: number; y: number } } | null>(null)

  const clamp = useCallback(
    (v: ViewBox): ViewBox => {
      const minW = width / maxScale
      const maxW = width / minScale
      const w = Math.min(maxW, Math.max(minW, v.w))
      const h = w * (height / width)
      const x = Math.min(width - w, Math.max(0, v.x))
      const y = Math.min(height - h, Math.max(0, v.y))
      return { x, y, w, h }
    },
    [width, height, minScale, maxScale],
  )

  const reset = useCallback(() => setVb({ x: 0, y: 0, w: width, h: height }), [width, height])

  const rectOf = () => svgRef.current?.getBoundingClientRect() ?? null

  const zoomAtClient = useCallback(
    (factor: number, clientX: number, clientY: number) => {
      const rect = rectOf()
      if (!rect) return
      const v = vbRef.current
      const fx = (clientX - rect.left) / rect.width
      const fy = (clientY - rect.top) / rect.height
      const ux = v.x + fx * v.w
      const uy = v.y + fy * v.h
      const newW = v.w / factor
      const newH = v.h / factor
      setVb(clamp({ x: ux - fx * newW, y: uy - fy * newH, w: newW, h: newH }))
    },
    [clamp],
  )

  const zoomBy = useCallback(
    (factor: number) => {
      const rect = rectOf()
      if (!rect) return reset()
      zoomAtClient(factor, rect.left + rect.width / 2, rect.top + rect.height / 2)
    },
    [zoomAtClient, reset],
  )

  // wheel zoom (desktop / trackpad) — needs a non-passive listener to preventDefault
  useEffect(() => {
    const svg = svgRef.current
    if (!svg || !enabled) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      const factor = e.deltaY < 0 ? 1.12 : 1 / 1.12
      zoomAtClient(factor, e.clientX, e.clientY)
    }
    svg.addEventListener('wheel', onWheel, { passive: false })
    return () => svg.removeEventListener('wheel', onWheel)
  }, [enabled, zoomAtClient])

  // pointer pan + pinch
  useEffect(() => {
    const svg = svgRef.current
    if (!svg || !enabled) return

    const onDown = (e: PointerEvent) => {
      pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
      if (pointers.current.size === 1) {
        lastPan.current = { x: e.clientX, y: e.clientY }
        lastPinch.current = null
      } else if (pointers.current.size === 2) {
        const [a, b] = [...pointers.current.values()]
        lastPinch.current = { dist: dist(a, b), mid: mid(a, b) }
        lastPan.current = null
      }
    }

    const onMove = (e: PointerEvent) => {
      if (!pointers.current.has(e.pointerId)) return
      pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
      const rect = rectOf()
      if (!rect) return

      if (pointers.current.size >= 2 && lastPinch.current) {
        const [a, b] = [...pointers.current.values()]
        const d = dist(a, b)
        const m = mid(a, b)
        if (lastPinch.current.dist > 0) {
          zoomAtClient(d / lastPinch.current.dist, m.x, m.y)
        }
        lastPinch.current = { dist: d, mid: m }
        return
      }

      if (pointers.current.size === 1 && lastPan.current) {
        const v = vbRef.current
        const dx = ((e.clientX - lastPan.current.x) / rect.width) * v.w
        const dy = ((e.clientY - lastPan.current.y) / rect.height) * v.h
        if (dx !== 0 || dy !== 0) {
          setVb(clamp({ x: v.x - dx, y: v.y - dy, w: v.w, h: v.h }))
          lastPan.current = { x: e.clientX, y: e.clientY }
        }
      }
    }

    const onUp = (e: PointerEvent) => {
      pointers.current.delete(e.pointerId)
      if (pointers.current.size === 1) {
        const [only] = [...pointers.current.values()]
        lastPan.current = { ...only }
        lastPinch.current = null
      } else if (pointers.current.size === 0) {
        lastPan.current = null
        lastPinch.current = null
      }
    }

    svg.addEventListener('pointerdown', onDown)
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
    return () => {
      svg.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
    }
  }, [enabled, clamp, zoomAtClient])

  const scale = width / vb.w
  const viewBox = useMemo(() => `${vb.x} ${vb.y} ${vb.w} ${vb.h}`, [vb])

  return { svgRef, viewBox, scale, isZoomed: scale > 1.02, reset, zoomBy }
}
