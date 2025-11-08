"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Icons } from "@/components/icons"
import { useData } from "@/components/local-data-provider"

export function RecentActivity() {
  const { tasks, pomodoros } = useData()

  // Get recent activities (last 10 items)
  const recentTasks = tasks
    .filter((task) => task.completedAt)
    .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())
    .slice(0, 5)

  const recentPomodoros = pomodoros
    .filter((session) => session.completed)
    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
    .slice(0, 5)

  // Combine and sort all activities
  const activities = [
    ...recentTasks.map((task) => ({
      id: task.id,
      type: "task" as const,
      title: `Completed: ${task.title}`,
      time: task.completedAt!,
      category: task.category,
      priority: task.priority,
    })),
    ...recentPomodoros.map((session) => ({
      id: session.id,
      type: "pomodoro" as const,
      title: `Completed ${session.duration}min focus session`,
      time: session.startTime,
      category: "focus" as const,
      priority: "medium" as const,
    })),
  ]
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    .slice(0, 8)

  const getActivityIcon = (type: string) => {
    return type === "task" ? Icons.target : Icons.timer
  }

  const getActivityColor = (type: string) => {
    return type === "task" ? "text-green-600" : "text-blue-600"
  }

  const formatTime = (timeString: string) => {
    const date = new Date(timeString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60)
      return `${diffInMinutes}m ago`
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`
    } else {
      const diffInDays = Math.floor(diffInHours / 24)
      return `${diffInDays}d ago`
    }
  }

  return (
    <Card className="bg-gradient-to-br from-white/90 to-emerald-50/50 backdrop-blur-sm border border-emerald-100 shadow-lg rounded-3xl">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl font-semibold flex items-center">
          <Icons.clock className="w-5 h-5 mr-2 text-emerald-600" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icons.clock className="w-8 h-8 text-emerald-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No activity yet</h3>
            <p className="text-gray-600 text-sm">Complete tasks or pomodoro sessions to see your activity here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activities.map((activity) => {
              const ActivityIcon = getActivityIcon(activity.type)
              return (
                <div
                  key={activity.id}
                  className="flex items-start space-x-3 p-4 bg-white/60 hover:bg-white/80 rounded-2xl border border-emerald-100/50 transition-all duration-200 hover:shadow-md cursor-pointer"
                >
                  <div
                    className={`w-10 h-10 rounded-full bg-gradient-to-br ${
                      activity.type === "task"
                        ? "from-green-500 to-emerald-600"
                        : "from-blue-500 to-cyan-600"
                    } flex items-center justify-center shadow-sm`}
                  >
                    <ActivityIcon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{activity.title}</p>
                    <div className="flex items-center space-x-2 mt-1.5">
                      <span className="text-xs text-gray-500 font-medium">{formatTime(activity.time)}</span>
                      {activity.type === "task" && (
                        <Badge className="text-xs bg-emerald-100 text-emerald-700 border-0">
                          {activity.category}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
