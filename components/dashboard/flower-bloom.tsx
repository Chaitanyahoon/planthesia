"use client"

import { useEffect, useState } from "react"

interface FlowerBloomProps {
  onComplete?: () => void
  color?: string
  size?: number
}

export function FlowerBloom({ onComplete, color = "emerald", size = 60 }: FlowerBloomProps) {
  const [isAnimating, setIsAnimating] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimating(false)
      onComplete?.()
    }, 2000)

    return () => clearTimeout(timer)
  }, [onComplete])

  const colorClasses = {
    emerald: "from-emerald-400 to-green-500",
    blue: "from-blue-400 to-cyan-500",
    purple: "from-purple-400 to-pink-500",
    orange: "from-orange-400 to-red-500",
    yellow: "from-yellow-400 to-amber-500",
  }

  const colorClass = colorClasses[color as keyof typeof colorClasses] || colorClasses.emerald

  if (!isAnimating) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
      <div
        className={`relative animate-bloom-${color}`}
        style={{
          width: `${size}px`,
          height: `${size}px`,
        }}
      >
        {/* Petals */}
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-full h-full bg-gradient-to-br ${colorClass} rounded-full opacity-90`}
            style={{
              transform: `rotate(${i * 60}deg) translateY(-${size * 0.3}px)`,
              transformOrigin: "50% 50%",
              animation: `petal-bloom 1.5s ease-out ${i * 0.1}s both`,
            }}
          />
        ))}
        {/* Center */}
        <div
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/3 h-1/3 bg-gradient-to-br from-yellow-300 to-orange-400 rounded-full shadow-lg`}
          style={{
            animation: "center-bloom 1.5s ease-out 0.3s both",
          }}
        />
        {/* Sparkles */}
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-yellow-300 rounded-full"
            style={{
              top: "50%",
              left: "50%",
              transform: `translate(-50%, -50%) rotate(${i * 45}deg) translateY(-${size * 0.6}px)`,
              animation: `sparkle 1.5s ease-out ${i * 0.1}s both`,
            }}
          />
        ))}
      </div>
      <style jsx>{`
        @keyframes petal-bloom {
          0% {
            transform: rotate(var(--rotation)) translateY(0) scale(0);
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: rotate(var(--rotation)) translateY(-${size * 0.3}px) scale(1);
            opacity: 0.9;
          }
        }
        @keyframes center-bloom {
          0% {
            transform: translate(-50%, -50%) scale(0);
            opacity: 0;
          }
          100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
          }
        }
        @keyframes sparkle {
          0% {
            transform: translate(-50%, -50%) rotate(var(--rotation)) translateY(0) scale(0);
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -50%) rotate(var(--rotation)) translateY(-${size * 0.6}px) scale(1);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
}

