"use client"

import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Settings, Sliders, Play, Pause, RefreshCw, X, Send } from "lucide-react"

interface Point3D {
  x: number
  y: number
  z: number
  color?: string
  size?: number
}

interface Arc3D {
  p1: Point3D
  p2: Point3D
  progress: number
  speed: number
}

export default function Globe() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  
  // Tweakable states
  const [rotationSpeed, setRotationSpeed] = useState(1.5)
  const [activeArcs, setActiveArcs] = useState(15)
  const [dotDensity, setDotDensity] = useState(280)
  const [glowIntensity, setGlowIntensity] = useState(0.8)
  const [arcColor, setArcColor] = useState("#2dd4bf") // Teal accent
  const [autoRotate, setAutoRotate] = useState(true)

  // Interactive control widgets
  const [showPromptModal, setShowPromptModal] = useState(false)
  const [showControlPanel, setShowControlPanel] = useState(false)
  const [promptInput, setPromptInput] = useState("Add controls for the globe")

  // Drag states
  const isDragging = useRef(false)
  const dragStart = useRef({ x: 0, y: 0 })
  const rotationRef = useRef({ x: 0.5, y: 0.5 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animationFrameId: number
    let width = 500
    let height = 500

    const resize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        width = rect.width || 500
        height = rect.height || 500
        canvas.width = width * window.devicePixelRatio
        canvas.height = height * window.devicePixelRatio
        canvas.style.width = `${width}px`
        canvas.style.height = `${height}px`
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
      }
    }
    resize()
    window.addEventListener("resize", resize)

    // Generate Globe Points dynamically based on density
    const points: Point3D[] = []
    const numPoints = dotDensity
    for (let i = 0; i < numPoints; i++) {
      const phi = Math.acos(-1 + (2 * i) / numPoints)
      const theta = Math.sqrt(numPoints * Math.PI) * phi
      const r = 150 // Radius of globe

      points.push({
        x: r * Math.sin(phi) * Math.cos(theta),
        y: r * Math.sin(phi) * Math.sin(theta),
        z: r * Math.cos(phi),
      })
    }

    // Generate telemetry connection arcs
    const arcs: Arc3D[] = []
    for (let i = 0; i < activeArcs; i++) {
      const idx1 = Math.floor(Math.random() * points.length)
      let idx2 = Math.floor(Math.random() * points.length)
      while (idx1 === idx2 && points.length > 1) {
        idx2 = Math.floor(Math.random() * points.length)
      }

      if (points[idx1] && points[idx2]) {
        arcs.push({
          p1: points[idx1],
          p2: points[idx2],
          progress: Math.random(),
          speed: (0.003 + Math.random() * 0.006) * (rotationSpeed / 1.5),
        })
      }
    }

    let rotX = rotationRef.current.x
    let rotY = rotationRef.current.y
    let targetRotX = rotX
    let targetRotY = rotY

    const handleMouseDown = (e: MouseEvent) => {
      isDragging.current = true
      dragStart.current = { x: e.clientX, y: e.clientY }
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return
      const dx = e.clientX - dragStart.current.x
      const dy = e.clientY - dragStart.current.y
      targetRotY += dx * 0.005
      targetRotX += dy * 0.005
      dragStart.current = { x: e.clientX, y: e.clientY }
      
      rotationRef.current.x = targetRotX
      rotationRef.current.y = targetRotY
    }

    const handleMouseUp = () => {
      isDragging.current = false
    }

    canvas.addEventListener("mousedown", handleMouseDown)
    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("mouseup", handleMouseUp)

    const render = () => {
      ctx.clearRect(0, 0, width, height)

      // Continuous self-rotation
      if (!isDragging.current && autoRotate) {
        targetRotY += 0.001 * rotationSpeed
      }
      rotX += (targetRotX - rotX) * 0.1
      rotY += (targetRotY - rotY) * 0.1

      const cosX = Math.cos(rotX)
      const sinX = Math.sin(rotX)
      const cosY = Math.cos(rotY)
      const sinY = Math.sin(rotY)

      const fov = 400
      const cx = width / 2
      const cy = height / 2

      // Draw Atmospheric Glow Ring (Behind Globe) with dynamic intensity
      const glowGrad = ctx.createRadialGradient(cx, cy, 80, cx, cy, 210)
      glowGrad.addColorStop(0, `rgba(20, 184, 166, ${0.04 * glowIntensity})`)
      glowGrad.addColorStop(0.5, `rgba(6, 182, 212, ${0.07 * glowIntensity})`)
      glowGrad.addColorStop(1, "rgba(8, 10, 16, 0)")
      ctx.fillStyle = glowGrad
      ctx.beginPath()
      ctx.arc(cx, cy, 230, 0, Math.PI * 2)
      ctx.fill()

      // Project points
      const projected = points.map((p) => {
        let x1 = p.x * cosY - p.z * sinY
        let z1 = p.x * sinY + p.z * cosY
        let y2 = p.y * cosX - z1 * sinX
        let z2 = p.y * sinX + z1 * cosX

        const scale = fov / (fov + z2)
        const sx = x1 * scale + cx
        const sy = y2 * scale + cy

        return { sx, sy, z: z2, scale }
      })

      // Draw wireframe grid arcs
      ctx.strokeStyle = "rgba(20, 184, 166, 0.03)"
      ctx.lineWidth = 0.8
      for (let lat = -4; lat <= 4; lat++) {
        ctx.beginPath()
        const latR = 150 * Math.cos((lat * Math.PI) / 10)
        const latY = 150 * Math.sin((lat * Math.PI) / 10)

        for (let lng = 0; lng <= 36; lng++) {
          const theta = (lng * Math.PI) / 18
          const px = latR * Math.cos(theta)
          const pz = latR * Math.sin(theta)

          let x1 = px * cosY - pz * sinY
          let z1 = px * sinY + pz * cosY
          let y2 = latY * cosX - z1 * sinX
          let z2 = latY * sinX + z1 * cosX

          if (z2 < 10) {
            const scale = fov / (fov + z2)
            const sx = x1 * scale + cx
            const sy = y2 * scale + cy
            if (lng === 0) ctx.moveTo(sx, sy)
            else ctx.lineTo(sx, sy)
          }
        }
        ctx.stroke()
      }

      // Draw front points
      projected.forEach((p, i) => {
        if (p.z < 15) {
          const alpha = Math.max(0.04, 1 - (p.z + 150) / 300)
          ctx.fillStyle = `rgba(45, 212, 191, ${alpha * 0.7})`
          ctx.beginPath()
          const dotSize = Math.max(1, (1.6 - (p.z / 150)) * p.scale)
          ctx.arc(p.sx, p.sy, dotSize, 0, Math.PI * 2)
          ctx.fill()

          if (i % 25 === 0) {
            ctx.shadowBlur = 8
            ctx.shadowColor = arcColor
            ctx.fillStyle = arcColor
            ctx.beginPath()
            ctx.arc(p.sx, p.sy, 2, 0, Math.PI * 2)
            ctx.fill()
            ctx.shadowBlur = 0
          }
        }
      })

      // Draw active telemetry arcs
      arcs.forEach((arc) => {
        arc.progress += arc.speed
        if (arc.progress > 1) {
          arc.progress = 0
        }

        const t = arc.progress
        const x_raw = arc.p1.x + (arc.p2.x - arc.p1.x) * t
        const y_raw = arc.p1.y + (arc.p2.y - arc.p1.y) * t
        const z_raw = arc.p1.z + (arc.p2.z - arc.p1.z) * t
        const dist = Math.sqrt(x_raw*x_raw + y_raw*y_raw + z_raw*z_raw)
        
        const heightMultiplier = 1.0 + Math.sin(t * Math.PI) * 0.22
        const px = (x_raw / dist) * 150 * heightMultiplier
        const py = (y_raw / dist) * 150 * heightMultiplier
        const pz = (z_raw / dist) * 150 * heightMultiplier

        let x1 = px * cosY - pz * sinY
        let z1 = px * sinY + pz * cosY
        let y2 = py * cosX - z1 * sinX
        let z2 = py * sinX + z1 * cosX

        if (z2 < 20) {
          const scale = fov / (fov + z2)
          const sx = x1 * scale + cx
          const sy = y2 * scale + cy

          ctx.shadowBlur = 10
          ctx.shadowColor = arcColor
          ctx.fillStyle = "#ffffff"
          ctx.beginPath()
          ctx.arc(sx, sy, 1.8 * scale, 0, Math.PI * 2)
          ctx.fill()
          ctx.shadowBlur = 0

          ctx.beginPath()
          ctx.strokeStyle = arcColor
          ctx.lineWidth = 1.3
          for (let step = 0; step < 8; step++) {
            const st = Math.max(0, t - step * 0.02)
            const sx_r = arc.p1.x + (arc.p2.x - arc.p1.x) * st
            const sy_r = arc.p1.y + (arc.p2.y - arc.p1.y) * st
            const sz_r = arc.p1.z + (arc.p2.z - arc.p1.z) * st
            const sdist = Math.sqrt(sx_r*sx_r + sy_r*sy_r + sz_r*sz_r)
            const shm = 1.0 + Math.sin(st * Math.PI) * 0.22
            const spx = (sx_r / sdist) * 150 * shm
            const spy = (sy_r / sdist) * 150 * shm
            const spz = (sz_r / sdist) * 150 * shm

            let sx1 = spx * cosY - spz * sinY
            let sz1 = spx * sinY + spz * cosY
            let sy2 = spy * cosX - sz1 * sinX
            let sz2 = spy * sinX + sz1 * cosX

            const sscale = fov / (fov + sz2)
            const ssx = sx1 * sscale + cx
            const ssy = sy2 * sscale + cy

            if (step === 0) ctx.moveTo(ssx, ssy)
            else ctx.lineTo(ssx, ssy)
          }
          ctx.stroke()
        }
      })

      // Outer thin atmosphere ring
      ctx.strokeStyle = "rgba(20, 184, 166, 0.12)"
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.arc(cx, cy, 151, 0, Math.PI * 2)
      ctx.stroke()

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener("resize", resize)
      canvas.removeEventListener("mousedown", handleMouseDown)
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
    }
  }, [rotationSpeed, activeArcs, dotDensity, glowIntensity, arcColor, autoRotate])

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          display: "block",
          filter: "drop-shadow(0 0 30px rgba(20, 184, 166, 0.1))",
          cursor: isDragging.current ? "grabbing" : "grab",
        }}
      />

      {/* Floating Controls Overlay (Inspired by user image design) */}
      <div style={{ position: "absolute", top: "10px", right: "10px", zIndex: 10, display: "flex", gap: "8px" }}>
        <button
          onClick={() => {
            setShowPromptModal(true)
            setShowControlPanel(false)
          }}
          style={{
            background: "#D27E64",
            color: "white",
            border: "none",
            borderRadius: "6px",
            padding: "6px 14px",
            fontSize: "12px",
            fontWeight: 600,
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(210, 126, 100, 0.3)",
            transition: "background 0.2s",
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = "#C36F55"}
          onMouseLeave={(e) => e.currentTarget.style.background = "#D27E64"}
        >
          Tweaks
        </button>

        {showControlPanel && (
          <button
            onClick={() => setShowControlPanel(false)}
            style={{
              background: "rgba(12, 16, 27, 0.8)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "6px",
              padding: "6px 10px",
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
              color: "var(--text-secondary)",
            }}
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Popover 1: Ask Claude to add controls (matches prompt screenshot) */}
      <AnimatePresence>
        {showPromptModal && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            style={{
              position: "absolute",
              bottom: "40px",
              left: "50%",
              transform: "translateX(-50%)",
              width: "90%",
              maxWidth: "360px",
              background: "#ffffff",
              borderRadius: "12px",
              padding: "16px",
              boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
              color: "#374151",
              fontFamily: "var(--font-sans)",
              zIndex: 100,
            }}
          >
            <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "8px", fontWeight: 500 }}>
              Ask Claude to add tweakable sliders or options
            </div>
            
            <input
              type="text"
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px",
                border: "1px solid #D27E64",
                borderRadius: "6px",
                fontSize: "13px",
                color: "#1f2937",
                outline: "none",
                marginBottom: "12px",
                background: "#f9fafb",
              }}
            />

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
              <button
                onClick={() => setShowPromptModal(false)}
                style={{
                  padding: "6px 14px",
                  borderRadius: "6px",
                  border: "1px solid #e5e7eb",
                  background: "#ffffff",
                  fontSize: "12px",
                  fontWeight: 500,
                  color: "#4b5563",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowPromptModal(false)
                  setShowControlPanel(true)
                }}
                style={{
                  padding: "6px 14px",
                  borderRadius: "6px",
                  border: "none",
                  background: "#D27E64",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "#ffffff",
                  cursor: "pointer",
                }}
              >
                Send
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Popover 2: The Real Control sliders (triggered after Send) */}
      <AnimatePresence>
        {showControlPanel && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            style={{
              position: "absolute",
              right: "10px",
              top: "50px",
              width: "240px",
              background: "rgba(12, 16, 27, 0.95)",
              border: "1px solid var(--border-default)",
              borderRadius: "10px",
              padding: "16px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
              color: "var(--text-primary)",
              fontFamily: "var(--font-sans)",
              zIndex: 90,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "14px", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "6px" }}>
              <Sliders size={14} style={{ color: "var(--teal-400)" }} />
              <span style={{ fontSize: "12.5px", fontWeight: 600, color: "var(--teal-400)", textTransform: "uppercase", letterSpacing: "0.04em" }}>Globe Tweaks</span>
            </div>

            {/* Slider 1: Speed */}
            <div style={{ marginBottom: "10px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "var(--text-secondary)", marginBottom: "4px" }}>
                <span>Speed</span>
                <span>{rotationSpeed.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0"
                max="5"
                step="0.2"
                value={rotationSpeed}
                onChange={(e) => setRotationSpeed(parseFloat(e.target.value))}
                style={{ width: "100%", accentColor: "var(--teal-500)", cursor: "pointer" }}
              />
            </div>

            {/* Slider 2: Arc count */}
            <div style={{ marginBottom: "10px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "var(--text-secondary)", marginBottom: "4px" }}>
                <span>Telemetry Arcs</span>
                <span>{activeArcs}</span>
              </div>
              <input
                type="range"
                min="2"
                max="40"
                step="1"
                value={activeArcs}
                onChange={(e) => setActiveArcs(parseInt(e.target.value))}
                style={{ width: "100%", accentColor: "var(--teal-500)", cursor: "pointer" }}
              />
            </div>

            {/* Slider 3: Dot Density */}
            <div style={{ marginBottom: "10px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "var(--text-secondary)", marginBottom: "4px" }}>
                <span>Point Density</span>
                <span>{dotDensity}</span>
              </div>
              <input
                type="range"
                min="50"
                max="500"
                step="10"
                value={dotDensity}
                onChange={(e) => setDotDensity(parseInt(e.target.value))}
                style={{ width: "100%", accentColor: "var(--teal-500)", cursor: "pointer" }}
              />
            </div>

            {/* Slider 4: Glow */}
            <div style={{ marginBottom: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "var(--text-secondary)", marginBottom: "4px" }}>
                <span>Atmospheric Glow</span>
                <span>{glowIntensity.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={glowIntensity}
                onChange={(e) => setGlowIntensity(parseFloat(e.target.value))}
                style={{ width: "100%", accentColor: "var(--teal-500)", cursor: "pointer" }}
              />
            </div>

            {/* Preset Colors */}
            <div style={{ marginBottom: "12px" }}>
              <div style={{ fontSize: "11px", color: "var(--text-secondary)", marginBottom: "6px" }}>Accent Color</div>
              <div style={{ display: "flex", gap: "6px" }}>
                {["#2dd4bf", "#3b82f6", "#f97316", "#ef4444", "#a855f7"].map((color) => (
                  <button
                    key={color}
                    onClick={() => setArcColor(color)}
                    style={{
                      width: "16px",
                      height: "16px",
                      borderRadius: "50%",
                      background: color,
                      border: arcColor === color ? "2px solid #ffffff" : "none",
                      cursor: "pointer",
                      padding: 0,
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Auto Rotate Toggle */}
            <button
              onClick={() => setAutoRotate(!autoRotate)}
              style={{
                width: "100%",
                background: autoRotate ? "rgba(20, 184, 166, 0.1)" : "transparent",
                border: "1px solid var(--border-subtle)",
                borderRadius: "6px",
                padding: "6px",
                fontSize: "11px",
                color: autoRotate ? "var(--teal-400)" : "var(--text-secondary)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "4px",
              }}
            >
              {autoRotate ? <Pause size={10} /> : <Play size={10} />}
              {autoRotate ? "Pause Rotation" : "Auto Rotate"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
