"use client"

import { useEffect, useRef, useState, useCallback } from "react"

// ─── Floating Shapes ────────────────────────────────────────────
function FloatingShapes() {
  const canvasRef = useRef<HTMLCanvasElement>(null!)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resize = () => {
      const rect = canvas.parentElement!.getBoundingClientRect()
      canvas.width = rect.width
      canvas.height = rect.height
    }
    resize()
    window.addEventListener("resize", resize)

    const shapes = Array.from({ length: 12 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 40 + 10,
      dx: (Math.random() - 0.5) * 0.3,
      dy: (Math.random() - 0.5) * 0.3,
      opacity: Math.random() * 0.04 + 0.02,
    }))

    let raf: number
    function animate() {
      if (!ctx) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const isDark = document.documentElement.classList.contains("dark")

      for (const s of shapes) {
        s.x += s.dx
        s.y += s.dy
        if (s.x < -50) s.x = canvas.width + 50
        if (s.x > canvas.width + 50) s.x = -50
        if (s.y < -50) s.y = canvas.height + 50
        if (s.y > canvas.height + 50) s.y = -50

        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fillStyle = isDark
          ? `rgba(255,255,255,${s.opacity * 1.5})`
          : `rgba(15,23,42,${s.opacity})`
        ctx.fill()
      }

      raf = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      window.removeEventListener("resize", resize)
      cancelAnimationFrame(raf)
    }
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />
}

// ─── Typewriter ──────────────────────────────────────────────────
function Typewriter({
  phases,
  className,
}: {
  phases: string[]
  className?: string
}) {
  const [text, setText] = useState("")
  const [phaseIndex, setPhaseIndex] = useState(0)
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => {
    const current = phases[phaseIndex]
    let i = 0

    function type() {
      if (i <= current.length) {
        setText(current.slice(0, i))
        i++
        timeoutRef.current = setTimeout(type, 35 + Math.random() * 25)
      } else {
        timeoutRef.current = setTimeout(() => {
          setPhaseIndex((p) => (p + 1) % phases.length)
        }, 2500)
      }
    }
    timeoutRef.current = setTimeout(() => {
      setText("")
      type()
    }, 0)

    return () => clearTimeout(timeoutRef.current)
  }, [phaseIndex, phases])

  return (
    <span className={className}>
      {text}
      <span className="inline-block w-[2px] h-[1em] bg-emerald-500 ml-0.5 align-middle animate-pulse" />
    </span>
  )
}

// ─── Shine sweep on headline ────────────────────────────────────
function ShineHeadline({ children }: { children: React.ReactNode }) {
  return (
    <span className="relative inline-block overflow-hidden group">
      {children}
      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 dark:via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-[1.5s] ease-in-out pointer-events-none" />
    </span>
  )
}

// ─── Magnetic CTA ────────────────────────────────────────────────
function MagneticButton({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null!)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [hover, setHover] = useState(false)

  const handleMove = useCallback((e: React.MouseEvent) => {
    const rect = ref.current.getBoundingClientRect()
    const x = (e.clientX - rect.left - rect.width / 2) * 0.25
    const y = (e.clientY - rect.top - rect.height / 2) * 0.25
    setPos({ x, y })
  }, [])

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => {
        setHover(false)
        setPos({ x: 0, y: 0 })
      }}
      className={`transition-transform duration-200 ${className || ""}`}
      style={{ transform: `translate(${pos.x}px, ${pos.y}px)` }}
    >
      <div
        className={`absolute inset-0 rounded-xl transition-all duration-500 ${
          hover
            ? "opacity-100 scale-110"
            : "opacity-0 scale-90"
        } bg-emerald-500/20 dark:bg-emerald-500/15 blur-xl pointer-events-none`}
      />
      {children}
    </div>
  )
}

// ─── Exported combo ──────────────────────────────────────────────
export function HeroEffects() {
  return null // rendered via separate component hooks below
}

export function HeroBackground() {
  return <FloatingShapes />
}

export function HeroTypewriter({ phases, className }: { phases: string[]; className?: string }) {
  return <Typewriter phases={phases} className={className} />
}

export function HeroShine({ children }: { children: React.ReactNode }) {
  return <ShineHeadline>{children}</ShineHeadline>
}

export function HeroCTA({ children, className }: { children: React.ReactNode; className?: string }) {
  return <MagneticButton className={className}>{children}</MagneticButton>
}
