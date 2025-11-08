"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Icons } from "@/components/icons"
import { useData } from "@/components/local-data-provider"

export function TaskCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const { tasks } = useData()

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day)
    }

    return days
  }

  const getTasksForDate = (day?: number | null) => {
    if (!day) return []

    // Create date string in local timezone to avoid timezone shifts
    const selectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    const dateString =
      selectedDate.getFullYear() +
      "-" +
      String(selectedDate.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(selectedDate.getDate()).padStart(2, "0")

    return tasks.filter((task) => task.dueDate === dateString)
  }

  const getTodayTasks = () => {
    // Get today's date in local timezone
    const today = new Date()
    const todayString =
      today.getFullYear() +
      "-" +
      String(today.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(today.getDate()).padStart(2, "0")

    return tasks.filter((task) => task.dueDate === todayString)
  }

  const days = getDaysInMonth(currentDate)
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  const today = new Date()
  const isToday = (day?: number | null) => {
    if (!day) return false
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    )
  }

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  return (
    <Card className="bg-gradient-to-br from-white/90 to-emerald-50/50 backdrop-blur-sm border border-emerald-100 shadow-lg rounded-3xl">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 px-4 sm:px-6 pt-4 sm:pt-6">
        <CardTitle className="text-lg sm:text-xl font-semibold">Calendar</CardTitle>
        <div className="flex items-center space-x-1 sm:space-x-2">
          <Button variant="outline" size="sm" className="rounded-full h-8 w-8 p-0" onClick={() => navigateMonth("prev")}>
            <Icons.chevronRight className="w-3 h-3 sm:w-4 sm:h-4 rotate-180" />
          </Button>
          <span className="text-xs sm:text-sm font-medium px-2 sm:px-3">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </span>
          <Button variant="outline" size="sm" className="rounded-full h-8 w-8 p-0" onClick={() => navigateMonth("next")}>
            <Icons.chevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
        <div className="grid grid-cols-7 gap-1 mb-3 sm:mb-4">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="p-1 sm:p-2 text-center text-xs sm:text-sm font-medium text-gray-500">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1 max-h-[280px] sm:max-h-[320px] overflow-y-auto">
          {days.map((day, index) => {
            const dayTasks = getTasksForDate(day)
            return (
              <div
                key={index}
                className={`
                  min-h-[48px] sm:aspect-square p-1 sm:p-2 text-xs sm:text-sm rounded-xl sm:rounded-2xl transition-colors cursor-pointer
                  ${day ? "hover:bg-blue-50" : ""}
                  ${isToday(day) ? "bg-emerald-100 text-emerald-700 font-medium rounded-full" : ""}
                  ${day ? "text-gray-900" : ""}
                `}
              >
                {day && (
                  <div className="h-full flex flex-col items-center justify-center">
                    <span className="text-center leading-none">{day}</span>
                    {dayTasks.length > 0 && (
                      <div className="mt-0.5 sm:mt-1 space-y-0.5 w-full">
                        {dayTasks.slice(0, 2).map((task, i) => (
                          <div
                            key={i}
                            className={`w-full h-0.5 sm:h-1 rounded-full ${
                              task.priority === "high"
                                ? "bg-red-500"
                                : task.priority === "medium"
                                  ? "bg-yellow-500"
                                  : "bg-green-500"
                            }`}
                          />
                        ))}
                        {dayTasks.length > 2 && (
                          <div className="text-[10px] sm:text-xs text-center text-gray-500">+{dayTasks.length - 2}</div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div className="mt-4 sm:mt-6 space-y-2 max-h-[200px] sm:max-h-none overflow-y-auto">
          <h4 className="text-xs sm:text-sm font-medium text-gray-700">Today's Tasks</h4>
          {getTodayTasks().length === 0 ? (
            <p className="text-xs sm:text-sm text-gray-500">No tasks scheduled for today</p>
          ) : (
            getTodayTasks().map((task) => (
              <div key={task.id} className="flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 bg-white/60 rounded-xl sm:rounded-2xl border border-emerald-100/50 hover:bg-white/80 transition-all duration-200">
                <div
                  className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full flex-shrink-0 ${
                    task.priority === "high"
                      ? "bg-red-500"
                      : task.priority === "medium"
                        ? "bg-yellow-500"
                        : "bg-green-500"
                  }`}
                ></div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">{task.title}</p>
                  <div className="flex items-center space-x-1 sm:space-x-2 mt-1 flex-wrap gap-1">
                    <Badge variant="outline" className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5">
                      {task.category}
                    </Badge>
                    <Badge variant="outline" className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5">
                      {task.priority}
                    </Badge>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
