"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartTooltip } from "@/components/ui/chart"
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, CartesianGrid } from "recharts"
import { useData } from "@/components/local-data-provider"
import { Icons } from "@/components/icons"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

export function ProductivityCharts() {
  const { tasks, pomodoros } = useData()

  // Calculate weekly data with real insights
  const getWeeklyData = () => {
    const today = new Date()
    const weekData = []

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(today.getDate() - i)
      const dateString = date.toISOString().split("T")[0]

      const dayTasks = tasks.filter((task) => task.completedAt && task.completedAt.split("T")[0] === dateString).length

      const dayPomodoros = pomodoros.filter(
        (session) => session.completed && session.startTime.split("T")[0] === dateString,
      ).length

      const dayFocusTime =
        pomodoros
          .filter((session) => session.completed && session.startTime.split("T")[0] === dateString)
          .reduce((sum, session) => sum + session.duration, 0) / 60

      weekData.push({
        day: date.toLocaleDateString("en", { weekday: "short" }),
        date: dateString,
        tasks: dayTasks,
        pomodoros: dayPomodoros,
        hours: Number.parseFloat(dayFocusTime.toFixed(1)),
      })
    }

    return weekData
  }

  // Calculate task distribution with insights
  const getTaskDistribution = () => {
    const categories = {
      work: tasks.filter((t) => t.category === "work").length,
      personal: tasks.filter((t) => t.category === "personal").length,
      learning: tasks.filter((t) => t.category === "learning").length,
      health: tasks.filter((t) => t.category === "health").length,
    }

    const total = Object.values(categories).reduce((sum, count) => sum + count, 0)

    if (total === 0) {
      return [{ name: "No tasks yet", value: 100, color: "#E5E7EB", count: 0 }]
    }

    return [
      { name: "Work", value: Math.round((categories.work / total) * 100), color: "#3B82F6", count: categories.work },
      {
        name: "Personal",
        value: Math.round((categories.personal / total) * 100),
        color: "#10B981",
        count: categories.personal,
      },
      {
        name: "Learning",
        value: Math.round((categories.learning / total) * 100),
        color: "#8B5CF6",
        count: categories.learning,
      },
      {
        name: "Health",
        value: Math.round((categories.health / total) * 100),
        color: "#F59E0B",
        count: categories.health,
      },
    ].filter((item) => item.value > 0)
  }

  // Calculate priority distribution
  const getPriorityDistribution = () => {
    const priorities = {
      high: tasks.filter((t) => t.priority === "high").length,
      medium: tasks.filter((t) => t.priority === "medium").length,
      low: tasks.filter((t) => t.priority === "low").length,
    }

    const total = Object.values(priorities).reduce((sum, count) => sum + count, 0)

    if (total === 0) {
      return [{ name: "No tasks yet", value: 100, color: "#E5E7EB", count: 0 }]
    }

    return [
      { name: "High", value: Math.round((priorities.high / total) * 100), color: "#EF4444", count: priorities.high },
      {
        name: "Medium",
        value: Math.round((priorities.medium / total) * 100),
        color: "#F59E0B",
        count: priorities.medium,
      },
      { name: "Low", value: Math.round((priorities.low / total) * 100), color: "#10B981", count: priorities.low },
    ].filter((item) => item.value > 0)
  }

  // Calculate focus time by task category
  const getFocusTimeByCategory = () => {
    const categoryFocus = {
      work: 0,
      personal: 0,
      learning: 0,
      health: 0,
      general: 0,
    }

    pomodoros.forEach((session) => {
      if (session.completed) {
        if (session.taskId) {
          const task = tasks.find((t) => t.id === session.taskId)
          if (task) {
            categoryFocus[task.category] += session.duration
          } else {
            // Task was deleted, count as general
            categoryFocus.general += session.duration
          }
        } else {
          categoryFocus.general += session.duration
        }
      }
    })

    const total = Object.values(categoryFocus).reduce((sum, time) => sum + time, 0)

    if (total === 0) {
      return [{ name: "No focus time yet", value: 100, color: "#E5E7EB", hours: 0 }]
    }

    return [
      {
        name: "Work",
        value: Math.round((categoryFocus.work / total) * 100),
        color: "#3B82F6",
        hours: Number.parseFloat((categoryFocus.work / 60).toFixed(1)),
      },
      {
        name: "Personal",
        value: Math.round((categoryFocus.personal / total) * 100),
        color: "#10B981",
        hours: Number.parseFloat((categoryFocus.personal / 60).toFixed(1)),
      },
      {
        name: "Learning",
        value: Math.round((categoryFocus.learning / total) * 100),
        color: "#8B5CF6",
        hours: Number.parseFloat((categoryFocus.learning / 60).toFixed(1)),
      },
      {
        name: "Health",
        value: Math.round((categoryFocus.health / total) * 100),
        color: "#F59E0B",
        hours: Number.parseFloat((categoryFocus.health / 60).toFixed(1)),
      },
      {
        name: "General",
        value: Math.round((categoryFocus.general / total) * 100),
        color: "#6B7280",
        hours: Number.parseFloat((categoryFocus.general / 60).toFixed(1)),
      },
    ].filter((item) => item.value > 0)
  }

  const weeklyData = getWeeklyData()
  const taskDistribution = getTaskDistribution()
  const priorityDistribution = getPriorityDistribution()
  const focusTimeByCategory = getFocusTimeByCategory()

  // Calculate insights
  const totalTasks = tasks.length
  const completedTasks = tasks.filter((t) => t.completed).length
  const overallCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
  const avgFocusPerDay = weeklyData.reduce((sum, day) => sum + day.hours, 0) / 7
  const mostProductiveDay = weeklyData.reduce((max, day) => (day.tasks > max.tasks ? day : max), weeklyData[0])
  
  // Calculate trends
  const totalFocusThisWeek = weeklyData.reduce((sum, day) => sum + day.hours, 0)
  const totalPomodorosThisWeek = weeklyData.reduce((sum, day) => sum + day.pomodoros, 0)
  const totalTasksThisWeek = weeklyData.reduce((sum, day) => sum + day.tasks, 0)
  
  // Week-over-week comparison (if we had last week's data, but for now use first vs last 3 days)
  const firstHalf = weeklyData.slice(0, 3).reduce((sum, day) => sum + day.hours, 0)
  const secondHalf = weeklyData.slice(4).reduce((sum, day) => sum + day.hours, 0)
  const focusTrend = secondHalf > firstHalf ? "up" : secondHalf < firstHalf ? "down" : "stable"
  
  // Best performing day
  const bestDay = weeklyData.reduce((max, day) => {
    const dayScore = day.tasks * 2 + day.pomodoros * 1.5 + day.hours
    const maxScore = max.tasks * 2 + max.pomodoros * 1.5 + max.hours
    return dayScore > maxScore ? day : max
  }, weeklyData[0])
  
  // Calculate category insights
  const topCategory = focusTimeByCategory.length > 0 
    ? focusTimeByCategory.reduce((max, cat) => cat.hours > max.hours ? cat : max, focusTimeByCategory[0])
    : null

  return (
    <div className="space-y-6">
      {/* Enhanced Insights Summary */}
      <Card className="bg-gradient-to-br from-emerald-50 via-blue-50 to-violet-50 dark:from-slate-800 dark:via-slate-800/90 dark:to-slate-900/90 border border-emerald-100 dark:border-emerald-800/50 shadow-lg rounded-3xl">
        <CardHeader>
          <CardTitle className="flex items-center text-gray-900 dark:text-gray-100">
            <Icons.sparkles className="w-5 h-5 mr-2 text-emerald-600 dark:text-emerald-400" />
            Productivity Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-white/80 dark:bg-slate-700/50 rounded-2xl border border-emerald-100 dark:border-emerald-800/50 hover:shadow-md transition-all">
              <div className="flex items-center justify-center mb-2">
                <Icons.target className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mr-1" />
                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{overallCompletionRate}%</div>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Completion Rate</div>
              <Progress value={overallCompletionRate} className="mt-2 h-1.5" />
            </div>
            <div className="text-center p-4 bg-white/80 dark:bg-slate-700/50 rounded-2xl border border-blue-100 dark:border-blue-800/50 hover:shadow-md transition-all">
              <div className="flex items-center justify-center mb-2">
                <Icons.clock className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-1" />
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{avgFocusPerDay.toFixed(1)}h</div>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Avg Focus/Day</div>
              <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">{totalFocusThisWeek.toFixed(1)}h this week</div>
            </div>
            <div className="text-center p-4 bg-white/80 dark:bg-slate-700/50 rounded-2xl border border-purple-100 dark:border-purple-800/50 hover:shadow-md transition-all">
              <div className="flex items-center justify-center mb-2">
                <Icons.timer className="w-5 h-5 text-purple-600 dark:text-purple-400 mr-1" />
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{totalPomodorosThisWeek}</div>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Sessions This Week</div>
              <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">{(totalPomodorosThisWeek / 7).toFixed(1)}/day avg</div>
            </div>
            <div className="text-center p-4 bg-white/80 dark:bg-slate-700/50 rounded-2xl border border-orange-100 dark:border-orange-800/50 hover:shadow-md transition-all">
              <div className="flex items-center justify-center mb-2">
                <Icons.trendingUp className={`w-5 h-5 mr-1 ${
                  focusTrend === "up" ? "text-green-600 dark:text-green-400" : 
                  focusTrend === "down" ? "text-red-600 dark:text-red-400" : 
                  "text-gray-600 dark:text-gray-400"
                }`} />
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{bestDay?.day || "N/A"}</div>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Best Day</div>
              <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">{bestDay?.tasks || 0} tasks, {bestDay?.pomodoros || 0} sessions</div>
            </div>
          </div>
          
          {/* Additional Insights */}
          {topCategory && (
            <div className="mt-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Top Focus Category</p>
                  <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400 mt-1">{topCategory.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{topCategory.hours}h</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{topCategory.value}% of total</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Weekly Focus Hours - Enhanced */}
  <Card className="bg-gradient-to-br from-white/90 to-blue-50/50 dark:from-slate-800/90 dark:to-blue-900/10 backdrop-blur-sm border border-blue-100 dark:border-blue-800/50 shadow-lg hover:shadow-lg transition-all duration-200 rounded-2xl min-h-[370px] flex flex-col">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center text-gray-900 dark:text-gray-100">
                <Icons.clock className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
                Weekly Focus Hours
              </CardTitle>
              <Badge className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                {totalFocusThisWeek.toFixed(1)}h total
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyData}>
                  <defs>
                    <linearGradient id="colorFocus" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" className="dark:stroke-slate-700" />
                  <XAxis dataKey="day" stroke="#6B7280" className="dark:stroke-slate-400" />
                  <YAxis stroke="#6B7280" className="dark:stroke-slate-400" />
                  <ChartTooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload[0]) {
                        const data = payload[0].payload
                        return (
                          <div className="bg-white dark:bg-slate-800 p-3 border dark:border-slate-700 rounded-2xl shadow-lg">
                            <p className="font-medium text-gray-900 dark:text-gray-100">{label}</p>
                            <p className="text-blue-600 dark:text-blue-400 font-semibold">Focus: {data.hours}h</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                              {data.pomodoros} sessions • {data.tasks} tasks
                            </p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="hours"
                    stroke="#3B82F6"
                    strokeWidth={3}
                    fill="url(#colorFocus)"
                    dot={{ fill: "#3B82F6", strokeWidth: 2, r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Daily Pomodoros - Enhanced */}
  <Card className="bg-gradient-to-br from-white/90 to-emerald-50/50 dark:from-slate-800/90 dark:to-emerald-900/10 backdrop-blur-sm border border-emerald-100 dark:border-emerald-800/50 shadow-lg hover:shadow-lg transition-all duration-200 rounded-2xl min-h-[370px] flex flex-col">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center text-gray-900 dark:text-gray-100">
                <Icons.timer className="w-5 h-5 mr-2 text-green-600 dark:text-green-400" />
                Daily Pomodoros
              </CardTitle>
              <Badge className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">
                {totalPomodorosThisWeek} this week
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData}>
                  <defs>
                    <linearGradient id="colorPomodoros" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0.3} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" className="dark:stroke-slate-700" />
                  <XAxis dataKey="day" stroke="#6B7280" className="dark:stroke-slate-400" />
                  <YAxis stroke="#6B7280" className="dark:stroke-slate-400" />
                  <ChartTooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload[0]) {
                        const data = payload[0].payload
                        return (
                          <div className="bg-white dark:bg-slate-800 p-3 border dark:border-slate-700 rounded-2xl shadow-lg">
                            <p className="font-medium text-gray-900 dark:text-gray-100">{label}</p>
                            <p className="text-green-600 dark:text-green-400 font-semibold">Sessions: {data.pomodoros}</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                              {data.hours.toFixed(1)}h focus • {data.tasks} tasks
                            </p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Bar 
                    dataKey="pomodoros" 
                    fill="url(#colorPomodoros)" 
                    radius={[8, 8, 0, 0]}
                    stroke="#10B981"
                    strokeWidth={1}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Focus Time by Category - Enhanced */}
  <Card className="bg-gradient-to-br from-white/90 to-purple-50/50 dark:from-slate-800/90 dark:to-purple-900/10 backdrop-blur-sm border border-purple-100 dark:border-purple-800/50 shadow-lg hover:shadow-lg transition-all duration-200 rounded-2xl min-h-[370px] flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center text-gray-900 dark:text-gray-100">
              <Icons.target className="w-5 h-5 mr-2 text-purple-600 dark:text-purple-400" />
              Focus Time by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={focusTimeByCategory}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={3}
                    dataKey="value"
                    animationBegin={0}
                    animationDuration={800}
                  >
                    {focusTimeByCategory.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color}
                        stroke={entry.color}
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <ChartTooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload[0]) {
                        const data = payload[0].payload
                        return (
                          <div className="bg-white dark:bg-slate-800 p-3 border dark:border-slate-700 rounded-2xl shadow-lg">
                            <p className="font-medium text-gray-900 dark:text-gray-100">{data.name}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold">
                              {data.hours}h ({data.value}%)
                            </p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {focusTimeByCategory.map((item, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between p-2 bg-white/50 dark:bg-slate-700/50 rounded-lg border border-purple-100/50 dark:border-purple-800/50"
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">{item.name}</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{item.hours}h</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Task Priority Distribution - Enhanced */}
  <Card className="bg-gradient-to-br from-white/90 to-orange-50/50 dark:from-slate-800/90 dark:to-orange-900/10 backdrop-blur-sm border border-orange-100 dark:border-orange-800/50 shadow-lg hover:shadow-lg transition-all duration-200 rounded-2xl min-h-[370px] flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center text-gray-900 dark:text-gray-100">
              <Icons.zap className="w-5 h-5 mr-2 text-orange-600 dark:text-orange-400" />
              Priority Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={priorityDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={3}
                    dataKey="value"
                    animationBegin={0}
                    animationDuration={800}
                  >
                    {priorityDistribution.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color}
                        stroke={entry.color}
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <ChartTooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload[0]) {
                        const data = payload[0].payload
                        return (
                          <div className="bg-white dark:bg-slate-800 p-3 border dark:border-slate-700 rounded-2xl shadow-lg">
                            <p className="font-medium text-gray-900 dark:text-gray-100">{data.name} Priority</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold">
                              {data.count} tasks ({data.value}%)
                            </p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {priorityDistribution.map((item, index) => (
                <div 
                  key={index} 
                  className="flex flex-col items-center p-2 bg-white/50 dark:bg-slate-700/50 rounded-lg border border-orange-100/50 dark:border-orange-800/50"
                >
                  <div className="flex items-center space-x-1 mb-1">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-xs text-gray-700 dark:text-gray-300 font-medium">{item.name}</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{item.value}%</span>
                  <span className="text-xs text-gray-500 dark:text-gray-500">{item.count} tasks</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
