"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Icons } from "@/components/icons"
import { useData } from "@/components/local-data-provider"

export function QuickStats() {
  const { stats, tasks, pomodoros } = useData()

  const today = new Date().toISOString().split("T")[0]

  const todayTasks = tasks.filter((task) => {
    return task.completedAt && task.completedAt.split("T")[0] === today
  }).length

  const todayPomodoros = pomodoros.filter((session) => {
    return session.startTime.split("T")[0] === today && session.completed
  }).length

  const todayFocusTime =
    pomodoros
      .filter((session) => {
        return session.startTime.split("T")[0] === today && session.completed
      })
      .reduce((sum, session) => sum + session.duration, 0) / 60

  const completionRate = stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0

  const statsData = [
    {
      title: "Tasks Bloomed",
      value: todayTasks.toString(),
      total: `${stats.completedTasks} total`,
      icon: Icons.flower,
      color: "emerald",
      progress: Math.min((todayTasks / 5) * 100, 100),
    },
    {
      title: "Focus Sessions",
      value: todayPomodoros.toString(),
      total: `${stats.totalPomodoros} total`,
      icon: Icons.tree,
      color: "blue",
      progress: Math.min((todayPomodoros / 8) * 100, 100),
    },
    {
      title: "Growth Time",
      value: `${todayFocusTime.toFixed(1)}h`,
      total: `${(stats.totalFocusTime / 60).toFixed(1)}h total`,
      icon: Icons.sun,
      color: "purple",
      progress: Math.min((todayFocusTime / 4) * 100, 100),
    },
    {
      title: "Success Rate",
      value: `${completionRate}%`,
      total: `${stats.streak} day streak`,
      icon: Icons.sprout,
      color: "orange",
      progress: completionRate,
    },
  ]

  const colorClasses = {
    emerald: {
      bg: "bg-emerald-50 dark:bg-emerald-900/10",
      border: "border-emerald-200 dark:border-emerald-800",
      icon: "bg-emerald-500",
      text: "text-emerald-700 dark:text-emerald-400",
      progress: "bg-emerald-500",
    },
    blue: {
      bg: "bg-blue-50 dark:bg-blue-900/10",
      border: "border-blue-200 dark:border-blue-800",
      icon: "bg-blue-500",
      text: "text-blue-700 dark:text-blue-400",
      progress: "bg-blue-500",
    },
    purple: {
      bg: "bg-purple-50 dark:bg-purple-900/10",
      border: "border-purple-200 dark:border-purple-800",
      icon: "bg-purple-500",
      text: "text-purple-700 dark:text-purple-400",
      progress: "bg-purple-500",
    },
    orange: {
      bg: "bg-orange-50 dark:bg-orange-900/10",
      border: "border-orange-200 dark:border-orange-800",
      icon: "bg-orange-500",
      text: "text-orange-700 dark:text-orange-400",
      progress: "bg-orange-500",
    },
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statsData.map((stat, index) => {
        const colors = colorClasses[stat.color as keyof typeof colorClasses]
        return (
          <Card
            key={index}
            className={`${colors.bg} border ${colors.border} shadow-sm rounded-xl`}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                    {stat.title}
                  </p>
                  <p className={`text-2xl font-semibold ${colors.text} mb-1`}>
                    {stat.value}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {stat.total}
                  </p>
                </div>
                <div className={`w-10 h-10 ${colors.icon} rounded-lg flex items-center justify-center`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
              </div>
              <Progress value={stat.progress} className="h-1.5" />
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
