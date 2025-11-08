"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useCallback } from "react"

export interface Task {
  id: string
  title: string
  description?: string
  completed: boolean
  priority: "low" | "medium" | "high"
  category: "work" | "personal" | "learning" | "health"
  createdAt: string
  completedAt?: string
  dueDate?: string
  recurrence?: "none" | "daily" | "weekly" | "monthly"
}

export interface PomodoroSession {
  id: string
  startTime: string
  endTime?: string
  duration: number // in minutes
  taskId?: string
  completed: boolean
}

export interface UserStats {
  totalTasks: number
  completedTasks: number
  totalPomodoros: number
  totalFocusTime: number // in minutes
  streak: number
  lastActiveDate: string
}

interface DataContextType {
  tasks: Task[]
  pomodoros: PomodoroSession[]
  stats: UserStats
  loading: boolean
  userName: string | null
  setUserName: (name: string | null) => void
  userTone: string | null
  setUserTone: (tone: string | null) => void
  addTask: (task: Omit<Task, "id" | "createdAt">) => void
  updateTask: (id: string, updates: Partial<Task>) => void
  deleteTask: (id: string) => void
  addPomodoro: (pomodoro: Omit<PomodoroSession, "id">) => void
  refreshData: () => void
}

const DataContext = createContext<DataContextType | undefined>(undefined)

// Generate a simple ID
const generateId = () => Math.random().toString(36).substr(2, 9)

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [pomodoros, setPomodoros] = useState<PomodoroSession[]>([])
  const [stats, setStats] = useState<UserStats>({
    totalTasks: 0,
    completedTasks: 0,
    totalPomodoros: 0,
    totalFocusTime: 0,
    streak: 0,
    lastActiveDate: new Date().toISOString().split("T")[0],
  })
  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState<string | null>(null)
  const [userTone, setUserTone] = useState<string | null>(null)

  // Load data from localStorage on mount (client-side only)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      loadLocalData()
      setLoading(false)
    }
  }, [])

  // Save data to localStorage whenever state changes
  useEffect(() => {
    if (!loading) {
      saveLocalData()
      updateStats()
    }
  }, [tasks, pomodoros, loading])

  const loadLocalData = useCallback(() => {
    if (typeof window === 'undefined') return
    
    try {
      const savedTasks = localStorage.getItem("planthesia_tasks")
      const savedPomodoros = localStorage.getItem("planthesia_pomodoros")
      const savedStats = localStorage.getItem("planthesia_stats")

      if (savedTasks) {
        const parsedTasks = JSON.parse(savedTasks)
        setTasks(Array.isArray(parsedTasks) ? parsedTasks : [])
      }
      if (savedPomodoros) {
        const parsedPomodoros = JSON.parse(savedPomodoros)
        setPomodoros(Array.isArray(parsedPomodoros) ? parsedPomodoros : [])
      }
      if (savedStats) {
        setStats(JSON.parse(savedStats))
      }
      // Prefer consolidated appSettings if available
      const appSettings = localStorage.getItem("appSettings")
      if (appSettings) {
        try {
          const parsed = JSON.parse(appSettings)
          if (parsed.userName) setUserName(parsed.userName)
          if (parsed.tone) setUserTone(parsed.tone)
        } catch (e) {
          // ignore parse errors
        }
      } else {
        const savedUser = localStorage.getItem("planthesia_user")
        if (savedUser) setUserName(savedUser)
        const savedTone = localStorage.getItem("planthesia_userTone")
        if (savedTone) setUserTone(savedTone)
      }
    } catch (error) {
      console.error("Error loading local data:", error)
      // Reset to empty arrays if there's an error
      setTasks([])
      setPomodoros([])
    }
  }, [])

  const saveLocalData = useCallback(() => {
    if (typeof window === 'undefined') return
    
    try {
      localStorage.setItem("planthesia_tasks", JSON.stringify(tasks))
      localStorage.setItem("planthesia_pomodoros", JSON.stringify(pomodoros))
      localStorage.setItem("planthesia_stats", JSON.stringify(stats))
      if (userName) {
        localStorage.setItem("planthesia_user", userName)
      } else {
        localStorage.removeItem("planthesia_user")
      }
      if (userTone) {
        localStorage.setItem("planthesia_userTone", userTone)
      } else {
        localStorage.removeItem("planthesia_userTone")
      }
    } catch (error) {
      console.error("Error saving local data:", error)
    }
  }, [tasks, pomodoros, stats])

  const addTask = useCallback((taskData: Omit<Task, "id" | "createdAt">) => {
    const newTask: Task = {
      ...taskData,
      id: generateId(),
      createdAt: new Date().toISOString(),
    }
    setTasks((prev) => [newTask, ...prev])
  }, [])

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id === id) {
          const updatedTask = { ...task, ...updates }
          if (updates.completed && !task.completed) {
            updatedTask.completedAt = new Date().toISOString()
          } else if (updates.completed === false && task.completed) {
            updatedTask.completedAt = undefined
          }
          return updatedTask
        }
        return task
      }),
    )
  }, [])

  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id))
  }, [])

  const addPomodoro = useCallback((pomodoroData: Omit<PomodoroSession, "id">) => {
    const newPomodoro: PomodoroSession = {
      ...pomodoroData,
      id: generateId(),
    }
    setPomodoros((prev) => [newPomodoro, ...prev])
  }, [])

  const updateStats = useCallback(() => {
    const totalTasks = tasks.length
    const completedTasks = tasks.filter((task) => task.completed).length
    const totalPomodoros = pomodoros.filter((p) => p.completed).length
    const totalFocusTime = pomodoros.reduce((sum, p) => sum + (p.completed ? p.duration : 0), 0)

    const today = new Date().toISOString().split("T")[0]
    const todayTasks = tasks.filter((task) => task.completedAt && task.completedAt.split("T")[0] === today).length
    const todayPomodoros = pomodoros.filter((p) => p.completed && p.startTime.split("T")[0] === today).length

    // Calculate streak
    let currentStreak = 0
    const currentDate = new Date()

    for (let i = 0; i < 30; i++) {
      // Check last 30 days
      const checkDate = new Date(currentDate)
      checkDate.setDate(currentDate.getDate() - i)
      const dateString = checkDate.toISOString().split("T")[0]

      const dayTasks = tasks.filter((t) => t.completedAt && t.completedAt.split("T")[0] === dateString).length
      const dayPomodoros = pomodoros.filter((p) => p.completed && p.startTime.split("T")[0] === dateString).length

      if (dayTasks > 0 || dayPomodoros > 0) {
        currentStreak++
      } else {
        break
      }
    }

    const newStats: UserStats = {
      totalTasks,
      completedTasks,
      totalPomodoros,
      totalFocusTime,
      streak: currentStreak,
      lastActiveDate: today,
    }

    setStats(newStats)
  }, [tasks, pomodoros])

  const refreshData = useCallback(() => {
    loadLocalData()
  }, [loadLocalData])

  return (
    <DataContext.Provider
      value={{
        tasks,
        pomodoros,
        stats,
        loading,
        userName,
        setUserName,
        userTone,
        setUserTone,
        addTask,
        updateTask,
        deleteTask,
        addPomodoro,
        refreshData,
      }}
    >
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const context = useContext(DataContext)
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider")
  }
  return context
}
