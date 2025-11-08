"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Icons } from "@/components/icons"
import { Button } from "@/components/ui/button"

const navigation = [
  { name: "Growth Hub", href: "/dashboard", icon: Icons.seedling, description: "Your productivity overview" },
  { name: "Tasks Garden", href: "/dashboard/tasks", icon: Icons.leaf, description: "Manage your task ecosystem" },
  { name: "Time Planner", href: "/dashboard/calendar", icon: Icons.sun, description: "Schedule your growth" },
  { name: "Focus Grove", href: "/dashboard/pomodoro", icon: Icons.tree, description: "Deep work sessions" },
  { name: "Growth Insights", href: "/dashboard/insights", icon: Icons.sprout, description: "Track your progress" },
]

interface SidebarProps {
  onClose?: () => void
}

export function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname()

  return (
    <div className="w-72 bg-gradient-to-b from-slate-50/95 via-blue-50/90 to-indigo-50/85 dark:from-slate-900/95 dark:via-slate-800/90 dark:to-slate-900/85 backdrop-blur-xl border-r border-slate-200/50 dark:border-slate-700/50 h-screen sticky top-0 z-40 overflow-y-auto">
      {/* Mobile Close Button */}
      {onClose && (
        <div className="lg:hidden flex justify-end p-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="w-10 h-10 rounded-full"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        </div>
      )}
      {/* Header */}
      <div className="p-4 lg:p-8">
        <div className="flex items-center space-x-3 lg:space-x-4 animate-grow-in">
          <div className="relative">
            <div className="w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-emerald-500 via-blue-500 to-indigo-600 rounded-2xl lg:rounded-3xl flex items-center justify-center shadow-lg animate-leaf-float">
              <Icons.leaf className="w-6 h-6 lg:w-7 lg:h-7 text-white drop-shadow-sm" />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 lg:w-4 lg:h-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full animate-pulse"></div>
          </div>
          <div>
            <h1 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-slate-800 to-blue-600 dark:from-slate-200 dark:to-blue-400 bg-clip-text text-transparent">
              Planthesia
            </h1>
            <p className="text-xs lg:text-sm text-slate-600 dark:text-slate-400 font-medium">Grow Your Productivity</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="px-3 lg:px-6 space-y-2 lg:space-y-3 pb-6">
        {navigation.map((item, index) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onClose}
              className={cn(
                "group flex items-center space-x-3 lg:space-x-4 px-4 lg:px-5 py-3 lg:py-4 rounded-2xl lg:rounded-3xl text-sm font-medium transition-all duration-300 relative overflow-hidden",
                isActive
                  ? "bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm text-slate-700 dark:text-slate-200 shadow-lg scale-105 border border-blue-200/50 dark:border-blue-700/50"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white/40 dark:hover:bg-slate-800/40 hover:shadow-md",
              )}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Background gradient for active state */}
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 via-indigo-50/30 to-purple-50/20 rounded-3xl"></div>
              )}

              {/* Icon container */}
              <div
                className={cn(
                  "relative z-10 w-9 h-9 lg:w-10 lg:h-10 rounded-xl lg:rounded-2xl flex items-center justify-center transition-all duration-300 flex-shrink-0",
                  isActive
                    ? "bg-gradient-to-br from-emerald-500 to-blue-600 shadow-md text-white"
                    : "bg-slate-100/50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 group-hover:bg-slate-200/60 dark:group-hover:bg-slate-700/60 group-hover:scale-110",
                )}
              >
                <item.icon className="w-4 h-4 lg:w-5 lg:h-5" />
              </div>

              {/* Text content */}
              <div className="relative z-10 flex-1 min-w-0">
                <div className="font-semibold text-sm lg:text-base truncate">{item.name}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors hidden lg:block">
                  {item.description}
                </div>
              </div>

              {/* Active indicator */}
              {isActive && <div className="relative z-10 w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>}
            </Link>
          )
        })}
      </nav>

      {/* Floating decorative elements */}
      <div className="absolute top-32 right-8 w-2 h-2 bg-blue-300/30 rounded-full float-element"></div>
      <div className="absolute top-64 right-12 w-1 h-1 bg-indigo-400/40 rounded-full float-element"></div>
      <div className="absolute top-96 right-6 w-1.5 h-1.5 bg-purple-300/35 rounded-full float-element"></div>
    </div>
  )
}
