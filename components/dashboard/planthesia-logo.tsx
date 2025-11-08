"use client"

import { Icons } from "@/components/icons"

interface PlanthesiaLogoProps {
  size?: "sm" | "md" | "lg"
  showText?: boolean
  className?: string
}

export function PlanthesiaLogo({ size = "md", showText = true, className = "" }: PlanthesiaLogoProps) {
  const sizeClasses = {
    sm: { icon: "w-6 h-6", text: "text-lg", container: "w-8 h-8" },
    md: { icon: "w-8 h-8", text: "text-xl", container: "w-10 h-10" },
    lg: { icon: "w-10 h-10", text: "text-2xl", container: "w-12 h-12" },
  }

  const sizes = sizeClasses[size]

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div className={`${sizes.container} bg-emerald-500 dark:bg-emerald-600 rounded-xl flex items-center justify-center shadow-sm`}>
        <Icons.leaf className={`${sizes.icon} text-white`} />
      </div>
      
      {showText && (
        <div className="flex flex-col">
          <h1 className={`${sizes.text} font-semibold text-gray-900 dark:text-gray-100 leading-tight`}>
            Planthesia
          </h1>
          <p className="text-[10px] text-gray-500 dark:text-gray-400 -mt-0.5">
            Grow Your Productivity
          </p>
        </div>
      )}
    </div>
  )
}
