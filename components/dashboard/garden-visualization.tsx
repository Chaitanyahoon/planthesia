"use client"

import { useEffect, useState, useMemo } from "react"
import { useData } from "@/components/local-data-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Icons } from "@/components/icons"

interface Flower {
  id: string
  x: number
  y: number
  color: string
  size: number
  bloomedAt: string
  taskTitle: string
}

export function GardenVisualization() {
  const { tasks, pomodoros } = useData()
  const [flowers, setFlowers] = useState<Flower[]>([])
  const [recentBlooms, setRecentBlooms] = useState<string[]>([])

  // Get completed tasks from today
  const todayCompletedTasks = useMemo(() => {
    const today = new Date().toISOString().split("T")[0]
    return tasks.filter(
      (task) => task.completed && task.completedAt && task.completedAt.split("T")[0] === today
    )
  }, [tasks])

  // Get completed pomodoros from today
  const todayCompletedPomodoros = useMemo(() => {
    const today = new Date().toISOString().split("T")[0]
    return pomodoros.filter((p) => p.completed && p.startTime.split("T")[0] === today)
  }, [pomodoros])

  // Generate flowers from completed tasks
  useEffect(() => {
    const newFlowers: Flower[] = []
    const colorOptions = ["emerald", "blue", "purple", "orange", "yellow"]
    const sizeOptions = [45, 55, 65, 75]
    const today = new Date().toISOString().split("T")[0]

    setFlowers((prev) => {
      // Get existing flower IDs for today
      const existingFlowerIds = new Set(
        prev.filter((f) => f.bloomedAt.split("T")[0] === today).map((f) => f.id)
      )

      // Create flowers for completed tasks
      todayCompletedTasks.forEach((task, index) => {
        if (!existingFlowerIds.has(task.id) && task.completedAt) {
          newFlowers.push({
            id: task.id,
            x: 15 + (index % 6) * 14 + Math.random() * 4,
            y: 25 + Math.floor(index / 6) * 20 + Math.random() * 3,
            color: colorOptions[index % colorOptions.length],
            size: sizeOptions[index % sizeOptions.length],
            bloomedAt: task.completedAt,
            taskTitle: task.title,
          })
        }
      })

      // Create flowers for completed pomodoros (smaller, different style)
      todayCompletedPomodoros.forEach((pomodoro, index) => {
        const flowerId = `pomodoro-${pomodoro.id}`
        if (!existingFlowerIds.has(flowerId)) {
          newFlowers.push({
            id: flowerId,
            x: 12 + (index % 7) * 12 + Math.random() * 2,
            y: 65 + Math.floor(index / 7) * 15 + Math.random() * 2,
            color: "blue",
            size: 35,
            bloomedAt: pomodoro.startTime,
            taskTitle: "Focus Session",
          })
        }
      })

      if (newFlowers.length > 0) {
        const combined = [...prev, ...newFlowers]
        // Keep only today's flowers
        const filtered = combined.filter((f) => f.bloomedAt.split("T")[0] === today)
        
        // Track recent blooms for animation
        setRecentBlooms(newFlowers.map((f) => f.id))
        setTimeout(() => setRecentBlooms([]), 2000)
        
        return filtered
      }
      
      // Clean up old flowers (not from today)
      return prev.filter((f) => f.bloomedAt.split("T")[0] === today)
    })
  }, [todayCompletedTasks, todayCompletedPomodoros])

  const FlowerSVG = ({ flower, isNew }: { flower: Flower; isNew: boolean }) => {
    const colorMap = {
      emerald: { 
        petal: "#34d399", 
        petalLight: "#6ee7b7",
        center: "#fbbf24",
        centerDark: "#f59e0b",
        stem: "#22c55e"
      },
      blue: { 
        petal: "#60a5fa", 
        petalLight: "#93c5fd",
        center: "#fbbf24",
        centerDark: "#f59e0b",
        stem: "#3b82f6"
      },
      purple: { 
        petal: "#a78bfa", 
        petalLight: "#c4b5fd",
        center: "#fbbf24",
        centerDark: "#f59e0b",
        stem: "#8b5cf6"
      },
      orange: { 
        petal: "#fb923c", 
        petalLight: "#fdba74",
        center: "#fbbf24",
        centerDark: "#f59e0b",
        stem: "#f97316"
      },
      yellow: { 
        petal: "#fbbf24", 
        petalLight: "#fcd34d",
        center: "#f59e0b",
        centerDark: "#d97706",
        stem: "#eab308"
      },
    }

    const colors = colorMap[flower.color as keyof typeof colorMap] || colorMap.emerald
    const stemHeight = flower.size * 0.4
    const groundY = 85

    return (
      <g
        className={isNew ? "animate-bloom-in" : ""}
        style={{
          transform: `translate(${flower.x}%, ${flower.y}%)`,
          transformOrigin: "center bottom",
        }}
      >
        {/* Stem with leaves */}
        <line
          x1={0}
          y1={0}
          x2={0}
          y2={stemHeight}
          stroke={colors.stem}
          strokeWidth={flower.size * 0.08}
          strokeLinecap="round"
          className="animate-stem-grow"
        />
        {/* Left leaf */}
        <ellipse
          cx={-flower.size * 0.15}
          cy={stemHeight * 0.4}
          rx={flower.size * 0.1}
          ry={flower.size * 0.15}
          fill={colors.stem}
          opacity={0.7}
          transform={`rotate(-30 ${-flower.size * 0.15} ${stemHeight * 0.4})`}
        />
        {/* Right leaf */}
        <ellipse
          cx={flower.size * 0.15}
          cy={stemHeight * 0.5}
          rx={flower.size * 0.1}
          ry={flower.size * 0.15}
          fill={colors.stem}
          opacity={0.7}
          transform={`rotate(30 ${flower.size * 0.15} ${stemHeight * 0.5})`}
        />
        
        {/* Outer petals (larger, lighter) */}
        {[...Array(6)].map((_, i) => (
          <ellipse
            key={`outer-${i}`}
            cx={0}
            cy={-flower.size * 0.25}
            rx={flower.size * 0.18}
            ry={flower.size * 0.25}
            fill={colors.petalLight}
            opacity={0.6}
            transform={`rotate(${i * 60})`}
            className={isNew ? "animate-petal-bloom-outer" : ""}
            style={{
              animationDelay: `${i * 0.08}s`,
            }}
          />
        ))}
        
        {/* Main petals */}
        {[...Array(6)].map((_, i) => (
          <ellipse
            key={`main-${i}`}
            cx={0}
            cy={-flower.size * 0.3}
            rx={flower.size * 0.16}
            ry={flower.size * 0.22}
            fill={colors.petal}
            opacity={0.95}
            transform={`rotate(${i * 60})`}
            className={isNew ? "animate-petal-bloom" : ""}
            style={{
              animationDelay: `${i * 0.1}s`,
            }}
          />
        ))}
        
        {/* Center with gradient effect */}
        <circle 
          cx={0} 
          cy={0} 
          r={flower.size * 0.18} 
          fill={colors.centerDark}
          opacity={0.9}
          className={isNew ? "animate-center-bloom" : ""}
        />
        <circle 
          cx={0} 
          cy={0} 
          r={flower.size * 0.12} 
          fill={colors.center}
          opacity={1}
          className={isNew ? "animate-center-bloom" : ""}
          style={{
            animationDelay: "0.3s",
          }}
        />
        
        {/* Sparkle effect for new flowers */}
        {isNew && (
          <>
            {[...Array(8)].map((_, i) => (
              <circle
                key={`sparkle-${i}`}
                cx={0}
                cy={0}
                r={flower.size * 0.03}
                fill="#ffffff"
                opacity={0.8}
                transform={`rotate(${i * 45}) translate(0, -${flower.size * 0.5})`}
                className="animate-sparkle"
                style={{
                  animationDelay: `${i * 0.1}s`,
                }}
              />
            ))}
          </>
        )}
      </g>
    )
  }

  const totalBlooms = flowers.length

  return (
    <Card className="bg-gradient-to-br from-green-50/80 via-emerald-50/60 to-teal-50/80 dark:from-slate-800/90 dark:via-emerald-900/20 dark:to-teal-900/20 border-2 border-emerald-200/50 dark:border-emerald-800/50 shadow-xl rounded-3xl overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icons.flower className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            <CardTitle className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
              Your Blooming Garden
            </CardTitle>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-full border border-emerald-200 dark:border-emerald-700">
            <span className="text-2xl animate-pulse">🌸</span>
            <span className="text-lg font-bold text-emerald-700 dark:text-emerald-300">{totalBlooms}</span>
          </div>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          {totalBlooms === 0
            ? "Complete tasks to watch beautiful flowers bloom in your garden! 🌱"
            : `Your garden is thriving with ${totalBlooms} beautiful ${totalBlooms === 1 ? "flower" : "flowers"} blooming today!`}
        </p>
      </CardHeader>

      <CardContent className="relative">
        <div className="relative w-full h-72 bg-gradient-to-b from-sky-200/40 via-blue-100/30 to-green-100/40 dark:from-slate-900/60 dark:via-blue-950/30 dark:to-green-950/30 rounded-2xl overflow-hidden border border-emerald-200/30 dark:border-emerald-800/30">
          {/* Animated Sky Background */}
          <div className="absolute inset-0 bg-gradient-to-b from-sky-300/20 via-blue-200/15 to-transparent dark:from-sky-950/20 dark:via-blue-950/15">
            {/* Clouds */}
            <div className="absolute top-4 left-10 w-16 h-8 bg-white/30 dark:bg-white/10 rounded-full animate-cloud-float" />
            <div className="absolute top-8 right-16 w-12 h-6 bg-white/25 dark:bg-white/8 rounded-full animate-cloud-float-delayed" />
          </div>

          {/* Animated Soil/Ground Layer */}
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-amber-800/70 via-amber-700/60 to-amber-600/50 dark:from-amber-950/70 dark:via-amber-900/60 dark:to-amber-800/50">
            {/* Soil texture with animated particles */}
            <div className="absolute inset-0 overflow-hidden">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1 h-1 bg-amber-900/30 dark:bg-amber-800/20 rounded-full"
                  style={{
                    left: `${(i * 5) % 100}%`,
                    bottom: `${10 + (i % 3) * 5}%`,
                    animation: `soil-particle ${3 + (i % 3)}s ease-in-out infinite`,
                    animationDelay: `${i * 0.2}s`,
                  }}
                />
              ))}
            </div>
            
            {/* Grass blades */}
            {[...Array(15)].map((_, i) => (
              <div
                key={i}
                className="absolute bottom-0 w-0.5 bg-green-600/60 dark:bg-green-700/40"
                style={{
                  left: `${(i * 7) % 100}%`,
                  height: `${8 + (i % 4) * 2}px`,
                  transform: `rotate(${-5 + (i % 10)}deg)`,
                  transformOrigin: "bottom",
                  animation: `grass-sway ${2 + (i % 2)}s ease-in-out infinite`,
                  animationDelay: `${i * 0.15}s`,
                }}
              />
            ))}
            
            {/* Ground shadow for depth */}
            <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-t from-black/10 to-transparent dark:from-black/20" />
          </div>

          {/* Flowers */}
          {flowers.length > 0 ? (
            <svg
              viewBox="0 0 100 100"
              className="absolute inset-0 w-full h-full z-10"
              preserveAspectRatio="none"
            >
              {flowers.map((flower) => (
                <FlowerSVG key={flower.id} flower={flower} isNew={recentBlooms.includes(flower.id)} />
              ))}
            </svg>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <div className="text-center">
                <div className="text-7xl mb-3 animate-bounce">🌱</div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Your garden awaits! Complete tasks to see flowers bloom
                </p>
              </div>
            </div>
          )}

          {/* Floating pollen particles */}
          {flowers.length > 0 && (
            <>
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1.5 h-1.5 bg-yellow-200/50 dark:bg-yellow-300/30 rounded-full z-5"
                  style={{
                    left: `${15 + i * 12}%`,
                    top: `${20 + (i % 3) * 15}%`,
                    animation: `pollen-float ${4 + i * 0.5}s ease-in-out infinite`,
                    animationDelay: `${i * 0.6}s`,
                  }}
                />
              ))}
            </>
          )}
        </div>

        {/* Enhanced Stats */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="p-4 bg-gradient-to-br from-white/70 to-emerald-50/50 dark:from-slate-800/70 dark:to-emerald-900/20 rounded-xl border border-emerald-200/50 dark:border-emerald-800/50 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full flex items-center justify-center text-xl">
                ✅
              </div>
              <div>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Tasks Completed</p>
                <p className="text-xl font-bold text-emerald-700 dark:text-emerald-300">
                  {todayCompletedTasks.length}
                </p>
              </div>
            </div>
          </div>
          <div className="p-4 bg-gradient-to-br from-white/70 to-blue-50/50 dark:from-slate-800/70 dark:to-blue-900/20 rounded-xl border border-blue-200/50 dark:border-blue-800/50 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full flex items-center justify-center text-xl">
                ⏱️
              </div>
              <div>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Focus Sessions</p>
                <p className="text-xl font-bold text-blue-700 dark:text-blue-300">
                  {todayCompletedPomodoros.length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>

      <style jsx>{`
        @keyframes bloom-in {
          0% {
            transform: translate(var(--x), var(--y)) scale(0) rotate(0deg);
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: translate(var(--x), var(--y)) scale(1) rotate(360deg);
            opacity: 1;
          }
        }
        @keyframes petal-bloom {
          0% {
            transform: rotate(var(--rotation, 0deg)) translateY(0) scale(0);
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: rotate(var(--rotation, 0deg)) translateY(-30%) scale(1);
            opacity: 0.95;
          }
        }
        @keyframes petal-bloom-outer {
          0% {
            transform: rotate(var(--rotation, 0deg)) translateY(0) scale(0);
            opacity: 0;
          }
          50% {
            opacity: 0.6;
          }
          100% {
            transform: rotate(var(--rotation, 0deg)) translateY(-25%) scale(1);
            opacity: 0.6;
          }
        }
        @keyframes center-bloom {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        @keyframes stem-grow {
          0% {
            stroke-dasharray: 0 100;
            opacity: 0;
          }
          100% {
            stroke-dasharray: 100 0;
            opacity: 1;
          }
        }
        @keyframes sparkle {
          0%, 100% {
            opacity: 0;
            transform: rotate(var(--rotation, 0deg)) translateY(0) scale(0);
          }
          50% {
            opacity: 1;
            transform: rotate(var(--rotation, 0deg)) translateY(-50%) scale(1);
          }
        }
        @keyframes cloud-float {
          0%, 100% {
            transform: translateX(0);
          }
          50% {
            transform: translateX(10px);
          }
        }
        @keyframes cloud-float-delayed {
          0%, 100% {
            transform: translateX(0);
          }
          50% {
            transform: translateX(-8px);
          }
        }
        @keyframes soil-particle {
          0%, 100% {
            transform: translateY(0) translateX(0);
            opacity: 0.3;
          }
          50% {
            transform: translateY(-2px) translateX(1px);
            opacity: 0.5;
          }
        }
        @keyframes grass-sway {
          0%, 100% {
            transform: rotate(var(--rotation, 0deg));
          }
          50% {
            transform: rotate(calc(var(--rotation, 0deg) + 3deg));
          }
        }
        @keyframes pollen-float {
          0%, 100% {
            transform: translateY(0) translateX(0);
            opacity: 0.5;
          }
          50% {
            transform: translateY(-15px) translateX(8px);
            opacity: 0.8;
          }
        }
        .animate-bloom-in {
          animation: bloom-in 1.5s ease-out both;
        }
        .animate-petal-bloom {
          animation: petal-bloom 1.5s ease-out both;
        }
        .animate-petal-bloom-outer {
          animation: petal-bloom-outer 1.5s ease-out both;
        }
        .animate-center-bloom {
          animation: center-bloom 1.5s ease-out both;
        }
        .animate-stem-grow {
          animation: stem-grow 1s ease-out both;
        }
        .animate-sparkle {
          animation: sparkle 1.5s ease-out both;
        }
        .animate-cloud-float {
          animation: cloud-float 8s ease-in-out infinite;
        }
        .animate-cloud-float-delayed {
          animation: cloud-float-delayed 10s ease-in-out infinite;
        }
      `}</style>
    </Card>
  )
}
