"use client"

import { useEffect, useRef, useState, useCallback } from "react"

// ─── Particle Network (data mesh / neural network) ───────────────
function ParticleNetwork() {
  const canvasRef = useRef<HTMLCanvasElement>(null!)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    const c = ctx // stable non-null ref for closures

    let w = 0, h = 0
    const resize = () => {
      const rect = canvas.parentElement!.getBoundingClientRect()
      w = canvas.width = rect.width * devicePixelRatio
      h = canvas.height = rect.height * devicePixelRatio
      canvas.style.width = rect.width + "px"
      canvas.style.height = rect.height + "px"
      c.scale(devicePixelRatio, devicePixelRatio)
      w = rect.width; h = rect.height
    }
    resize()
    window.addEventListener("resize", resize)

    const PARTICLE_COUNT = 60
    const CONNECTION_DIST = 140
    const MOUSE_RADIUS = 160

    interface Particle {
      x: number; y: number; vx: number; vy: number; r: number
    }

    const particles: Particle[] = []
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 2 + 1.2,
      })
    }

    let mouse = { x: -1e3, y: -1e3 }
    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouse = { x: e.clientX - rect.left, y: e.clientY - rect.top }
    }
    window.addEventListener("mousemove", onMove)

    let raf: number
    function animate() {
      c.clearRect(0, 0, w, h)

      const isDark = document.documentElement.classList.contains("dark")
      const lineColor = isDark ? "18, 184, 134" : "16, 185, 129"
      const nodeColor = isDark ? "rgba(52,211,153,0.55)" : "rgba(16,185,129,0.45)"
      const nodeGlow = isDark ? "rgba(52,211,153,0.25)" : "rgba(16,185,129,0.18)"

      // Update
      for (const p of particles) {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0) p.x = w
        if (p.x > w) p.x = 0
        if (p.y < 0) p.y = h
        if (p.y > h) p.y = 0

        // Micro attract to mouse
        const dxm = mouse.x - p.x
        const dym = mouse.y - p.y
        const dm = Math.sqrt(dxm * dxm + dym * dym)
        if (dm < MOUSE_RADIUS && dm > 1) {
          const force = (MOUSE_RADIUS - dm) / MOUSE_RADIUS * 0.15
          p.vx += (dxm / dm) * force
          p.vy += (dym / dm) * force
        }

        // Dampen
        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy)
        const maxSpeed = 0.7
        if (speed > maxSpeed) {
          p.vx = (p.vx / speed) * maxSpeed
          p.vy = (p.vy / speed) * maxSpeed
        }
      }

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < CONNECTION_DIST) {
            const alpha = (1 - dist / CONNECTION_DIST) * 0.25
            c.beginPath()
            c.moveTo(particles[i].x, particles[i].y)
            c.lineTo(particles[j].x, particles[j].y)
            c.strokeStyle = `rgba(${lineColor},${alpha})`
            c.lineWidth = 0.6
            c.stroke()
          }
        }
      }

      // Draw nodes
      for (const p of particles) {
        c.beginPath()
        c.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        c.fillStyle = nodeColor
        c.fill()

        c.beginPath()
        c.arc(p.x, p.y, p.r * 2.5, 0, Math.PI * 2)
        c.fillStyle = nodeGlow
        c.fill()
      }

      raf = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      window.removeEventListener("resize", resize)
      window.removeEventListener("mousemove", onMove)
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
  return null
}

export function HeroBackground() {
  return <ParticleNetwork />
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

export function GridPattern() {
  return (
    <div
      className="absolute inset-0 -z-0 opacity-[0.03] dark:opacity-[0.05]"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        maskImage: "radial-gradient(ellipse at center, black 30%, transparent 70%)",
        WebkitMaskImage: "radial-gradient(ellipse at center, black 30%, transparent 70%)",
      }}
    />
  )
}

export function GradientOrb({ className }: { className?: string }) {
  return (
    <div
      className={`absolute -z-0 rounded-full blur-3xl animate-pulse ${className || ""}`}
      style={{ animationDuration: "8s" }}
    />
  )
}
