"use client"

import type React from "react"
import { useState, useCallback, useMemo, memo } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useData } from "@/components/local-data-provider"

interface PlantAIAssistantProps {
  isOpen: boolean
  // accept both names for backwards compatibility: parent might pass `onClose`
  onClose?: () => void
  onCloseAction?: () => void
}

interface ChatMessage {
  role: "user" | "assistant"
  content: string
  timestamp: Date
  taskSuggestions?: Array<{
    title: string
    duration: number
    time: string
    priority: "low" | "medium" | "high"
    category: "work" | "personal" | "learning" | "health"
  }>
}

interface UserContext {
  today: string
  todayTasks: number
  todayPomodoros: number
  overdueTasks: number
  pendingTasks: number
  completionRate: number
  totalTasks: number
  totalPomodoros: number
  streak: number
}
const ChatMessageComponent = memo(
  ({ message, onAddSuggestedTask }: { message: ChatMessage; onAddSuggestedTask: (suggestion: any) => void }) => {
    const isUserMessage = message.role === "user"

    return (
      <div className={`flex ${isUserMessage ? "justify-end" : "justify-start"}`}>
        <div
          className={`relative max-w-[85%] sm:max-w-[75%] ${
            isUserMessage
              ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg"
              : "bg-gradient-to-r from-white to-slate-50 border border-emerald-200 shadow-md text-emerald-900 dark:from-slate-800 dark:to-slate-900 dark:border-emerald-700 dark:shadow-none dark:text-emerald-100"
          } p-5 rounded-2xl ${isUserMessage ? "rounded-tr-sm" : "rounded-tl-sm"}`}
        >
          {/* Avatar/Icon */}
          <div
            className={`absolute ${
              isUserMessage ? "-right-3 -top-3" : "-left-3 -top-3"
            } w-8 h-8 rounded-full shadow-lg flex items-center justify-center ${
              isUserMessage
                ? "bg-gradient-to-br from-emerald-500 to-teal-600"
                : "bg-gradient-to-br from-emerald-100 to-teal-200 border-2 border-white"
            }`}
          >
            {isUserMessage ? (
              <span className="text-white text-sm">👤</span>
            ) : (
              <span className="text-emerald-700 text-sm">🌱</span>
            )}
          </div>

          {/* Message Content */}
          <div className={`prose max-w-none ${isUserMessage ? "text-white" : "text-emerald-900 dark:text-emerald-100"} ${!isUserMessage ? "prose-emerald" : ""}`}>
            <div className="whitespace-pre-wrap text-sm leading-relaxed break-words">{message.content}</div>
          </div>

          {/* Timestamp */}
          <div
            className={`text-xs mt-3 flex items-center ${
              isUserMessage ? "text-emerald-100 justify-end" : "text-emerald-600 dark:text-emerald-300 justify-start"
            }`}
          >
            <svg
              className={`w-3 h-3 mr-1 ${isUserMessage ? "text-emerald-100" : "text-emerald-600 dark:text-emerald-300"}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>

          {/* Task Suggestions */}
          {message.taskSuggestions && message.taskSuggestions.length > 0 && (
            <div className="mt-4 pt-4 border-t border-emerald-200/20 space-y-3">
              <p className="text-xs font-semibold opacity-90 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                Growth Suggestions
              </p>
              <div className="space-y-2">
                {message.taskSuggestions.map((task, idx) => (
                  <button
                    key={idx}
                    onClick={() => onAddSuggestedTask(task)}
                    className={`group w-full text-left p-3 rounded-xl transition-all duration-200 ${
                      isUserMessage
                        ? "bg-emerald-500/20 hover:bg-emerald-500/30"
                        : "bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 dark:bg-slate-800 dark:border-emerald-700 dark:hover:bg-slate-700 dark:text-emerald-100"
                    }`}
                    type="button"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className={`font-medium ${isUserMessage ? "text-white" : "text-emerald-900"}`}>
                          {task.title}
                        </div>
                        <div className="mt-1 flex items-center space-x-3 text-xs opacity-85">
                          <span>⏱️ {task.duration}min</span>
                          <span>📅 {task.time}</span>
                          <span className={`capitalize px-2 py-0.5 rounded ${
                            task.priority === 'high'
                              ? 'bg-red-100 text-red-700'
                              : task.priority === 'medium'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {task.priority}
                          </span>
                        </div>
                      </div>
                      <div className={`ml-2 flex items-center justify-center w-6 h-6 rounded-full ${
                        isUserMessage
                          ? "bg-emerald-500/30 group-hover:bg-emerald-500/40"
                          : "bg-emerald-100 group-hover:bg-emerald-200"
                      }`}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                        </svg>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }
)

ChatMessageComponent.displayName = "ChatMessage"

export function PlantAIAssistant({ isOpen, onClose, onCloseAction }: PlantAIAssistantProps) {
  const [prompt, setPrompt] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([])
  const { tasks, pomodoros, stats, addTask } = useData()

  const userContext = useMemo((): UserContext => {
    const today = new Date().toISOString().split("T")[0]
    const todayTasks = tasks.filter((task) => task.completedAt?.split("T")[0] === today).length
    const todayPomodoros = pomodoros.filter(
      (session) => session.completed && session.startTime.split("T")[0] === today,
    ).length
    const overdueTasks = tasks.filter((task) => task.dueDate && task.dueDate < today && !task.completed).length
    const pendingTasks = tasks.filter((task) => !task.completed).length
    const completionRate = stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0

    return {
      today,
      todayTasks,
      todayPomodoros,
      overdueTasks,
      pendingTasks,
      completionRate,
      totalTasks: stats.totalTasks,
      totalPomodoros: stats.totalPomodoros,
      streak: stats.streak,
    }
  }, [tasks, pomodoros, stats])

  const handleAddSuggestedTask = useCallback(
    (suggestion: any) => {
      if (!suggestion) return

      const dueDate = new Date()
      dueDate.setDate(dueDate.getDate() + 1)

      addTask({
        title: suggestion.title,
        description: `Suggested duration: ${suggestion.duration} minutes | Time: ${suggestion.time}`,
        priority: suggestion.priority,
        category: suggestion.category,
        completed: false,
        dueDate: dueDate.toISOString().split("T")[0],
      })
    },
    [addTask],
  )

  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      if (e) e.preventDefault()
      if (!prompt.trim()) return

      const userMessage: ChatMessage = {
        role: "user",
        content: prompt,
        timestamp: new Date(),
      }

      setChatHistory((prev) => [...prev, userMessage])
      setIsLoading(true)
      setPrompt("")

      try {
        const response = await fetch("/api/growth-ai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: prompt, context: userContext }),
        })

        if (!response.ok) {
          let errorDetails: string | undefined

          try {
            const errorBody = await response.json()
            if (errorBody && typeof errorBody === "object") {
              if (typeof errorBody.details === "string") {
                errorDetails = errorBody.details
              } else if (typeof errorBody.error === "string") {
                errorDetails = errorBody.error
              }
            }
          } catch (parseError) {
            console.error("Failed to parse error response:", parseError)
          }

          throw new Error(errorDetails ?? `HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        
        // Handle potential error responses
        if (data.error) {
          throw new Error(data.details || data.error)
        }

        // Validate and clean the response content
        let assistantResponseContent = ""
        if (typeof data.response === "string" && data.response.trim()) {
          assistantResponseContent = data.response
        } else {
          console.warn("[Plant AI] Received empty or invalid response content")
          assistantResponseContent = "I apologize, but I received an empty response. Please try again."
        }

        // Validate task suggestions
            const taskSuggestions = Array.isArray(data.taskSuggestions)
              ? data.taskSuggestions.filter((task: any) =>
                  task &&
                  typeof task.title === "string" &&
                  typeof task.duration === "number" &&
                  typeof task.time === "string" &&
                  ["low", "medium", "high"].includes(task.priority) &&
                  ["work", "personal", "learning", "health"].includes(task.category)
                )
              : undefined

        const assistantMessage: ChatMessage = {
          role: "assistant",
          content: assistantResponseContent,
          timestamp: new Date(),
          taskSuggestions
        }

        setChatHistory((prev) => [...prev, assistantMessage])
      } catch (error) {
        console.error("API Error:", error)
        const content =
          error instanceof Error && error.message
            ? error.message
            : "I apologize, but I had trouble connecting. Please try again."
        const errorMessage: ChatMessage = {
          role: "assistant",
          content,
          timestamp: new Date(),
        }
        setChatHistory((prev) => [...prev, errorMessage])
      } finally {
        setIsLoading(false)
      }
    },
    [prompt, userContext],
  )

  const clearChat = useCallback(() => {
    setChatHistory([])
  }, [])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault()
        handleSubmit()
      }
    },
    [handleSubmit],
  )

  // Choose whichever close handler the parent provided (support both prop names).
  const handleClose = useCallback(() => {
    if (typeof onCloseAction === "function") return onCloseAction()
    if (typeof onClose === "function") return onClose()
  }, [onClose, onCloseAction])

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleClose() }}>
  <DialogContent className="max-w-2xl h-[90vh] flex flex-col p-0 bg-gradient-to-br from-white via-green-50 to-emerald-50 border-2 border-emerald-200 overflow-hidden">
        <DialogHeader className="flex flex-row items-center justify-between gap-4 pb-4 px-6 pt-6 border-b-2 border-emerald-100 flex-shrink-0 bg-gradient-to-r from-emerald-50 to-teal-50">
          <DialogTitle className="flex items-center gap-4 flex-1 min-w-0">
                <div className="relative flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 via-teal-500 to-green-600 rounded-full flex items-center justify-center shadow-lg border-[3px] border-white">
                    <svg className="w-6 h-6 text-white transform -rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                        d="M12 19c-2.8 2-5 2.5-7 2.5.5-3 1-5.5 3-7.5-2-3.5-2-7.5-2-9.5 4.5 2 6 4 7 7 1-3 2.5-5 7-7 0 2-.5 6-2 9.5 2 2 2.5 4.5 3 7.5-2 0-4.2-.5-7-2.5"/>
                    </svg>
                  </div>
                  {/* Decorative elements - positioned relative to the parent div */}
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-emerald-300 to-green-400 rounded-full animate-pulse shadow-sm border-2 border-white"></div>
                  <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-gradient-to-br from-teal-300 to-emerald-400 rounded-full animate-pulse shadow-sm border-2 border-white" style={{ animationDelay: '0.5s' }}></div>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 via-teal-500 to-green-500 bg-clip-text text-transparent">BloomMind</span>
                    <div className="px-2 py-0.5 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-full text-[10px] font-semibold text-emerald-700 border border-emerald-200/50">AI</div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-emerald-600">
                    <span className="font-medium">🌿 Your personal growth companion</span>
                    <span className="w-1 h-1 rounded-full bg-emerald-300"></span>
                    <span className="text-emerald-500 font-medium">Gemini Flash 2.0</span>
                  </div>
                </div>
          </DialogTitle>
          <DialogDescription className="sr-only">BloomMind - Your intelligent plant-themed AI companion</DialogDescription>
          {chatHistory.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearChat}
              className="border-emerald-200 hover:bg-emerald-50 bg-transparent flex-shrink-0 text-emerald-600 ml-2"
            >
              Clear
            </Button>
          )}
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col px-6">
          {chatHistory.length === 0 ? (
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="text-center space-y-4 max-w-sm">
                <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center mx-auto">
                  <svg className="w-10 h-10 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                  </svg>
                </div>
                <div className="relative">
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 via-teal-500 to-green-500 bg-clip-text text-transparent">
                    Welcome to BloomMind
                  </h3>
                  <div className="mt-1 text-xs text-emerald-600 font-medium">Where wisdom grows and productivity flourishes 🌱</div>
                  
                  <div className="mt-4 space-y-3">
                    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-100">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white">
                          {userContext.todayTasks > 0 ? '🌟' : '✨'}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-emerald-900">
                            Today's Growth
                          </div>
                          <div className="text-xs text-emerald-600">
                            {userContext.todayTasks} tasks completed • {userContext.todayPomodoros} focus sessions
                          </div>
                        </div>
                      </div>
                    </div>

                    {userContext.streak > 0 && (
                      <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-100">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white">
                            🔥
                          </div>
                          <div>
                            <div className="text-sm font-medium text-amber-900">
                              Growth Streak
                            </div>
                            <div className="text-xs text-amber-600">
                              {userContext.streak} days of continuous progress!
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {userContext.pendingTasks > 0 && (
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white">
                            📋
                          </div>
                          <div>
                            <div className="text-sm font-medium text-blue-900">
                              Growth Opportunities
                            </div>
                            <div className="text-xs text-blue-600">
                              {userContext.pendingTasks} tasks awaiting your attention
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="pt-2 space-y-2">
                  <div className="text-xs text-emerald-600 font-medium">How can I help you grow today?</div>
                  <div className="space-y-3">
                    {userContext.overdueTasks > 0 ? (
                      <button onClick={() => setPrompt("Help me prioritize my overdue tasks")} className="group w-full bg-gradient-to-r from-rose-50 to-pink-50 p-3 rounded-xl border border-rose-200 hover:border-rose-300 transition-all duration-200 text-left">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                            ⚡
                          </div>
                          <div>
                            <div className="text-sm font-medium text-rose-900">Prioritize Tasks</div>
                            <div className="text-xs text-rose-600">{userContext.overdueTasks} tasks need attention</div>
                          </div>
                        </div>
                      </button>
                    ) : (
                      <button onClick={() => setPrompt("What should I focus on today?")} className="group w-full bg-gradient-to-r from-emerald-50 to-teal-50 p-3 rounded-xl border border-emerald-200 hover:border-emerald-300 transition-all duration-200 text-left">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                            🌱
                          </div>
                          <div>
                            <div className="text-sm font-medium text-emerald-900">Daily Focus</div>
                            <div className="text-xs text-emerald-600">Plan your growth journey</div>
                          </div>
                        </div>
                      </button>
                    )}
                    {userContext.todayPomodoros < 4 ? (
                      <button onClick={() => setPrompt("Plan my focus sessions for today")} className="group w-full bg-gradient-to-r from-purple-50 to-indigo-50 p-3 rounded-xl border border-purple-200 hover:border-purple-300 transition-all duration-200 text-left">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                            ⏱️
                          </div>
                          <div>
                            <div className="text-sm font-medium text-purple-900">Focus Time</div>
                            <div className="text-xs text-purple-600">Schedule your sessions</div>
                          </div>
                        </div>
                      </button>
                    ) : (
                      <button onClick={() => setPrompt("Suggest a break activity")} className="group w-full bg-gradient-to-r from-blue-50 to-sky-50 p-3 rounded-xl border border-blue-200 hover:border-blue-300 transition-all duration-200 text-left">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400 to-sky-500 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                            🎯
                          </div>
                          <div>
                            <div className="text-sm font-medium text-blue-900">Break Time</div>
                            <div className="text-xs text-blue-600">Refresh & recharge</div>
                          </div>
                        </div>
                      </button>
                    )}
                    <button onClick={() => setPrompt(`Help me maintain my ${userContext.completionRate}% completion rate`)} className="group w-full bg-gradient-to-r from-amber-50 to-orange-50 p-3 rounded-xl border border-amber-200 hover:border-amber-300 transition-all duration-200 text-left">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                          {userContext.completionRate >= 70 ? '🌟' : '📈'}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-amber-900">Progress Check</div>
                          <div className="text-xs text-amber-600">{userContext.completionRate}% completion rate</div>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <ScrollArea className="flex-1 w-full">
              <div className="space-y-6 p-6">
                {chatHistory.map((message, index) => (
                  <ChatMessageComponent key={index} message={message} onAddSuggestedTask={handleAddSuggestedTask} />
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="relative max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg bg-gradient-to-br from-emerald-50 via-white to-emerald-50 p-6 rounded-2xl rounded-tl-sm border border-emerald-200 shadow-lg">
                      <div className="absolute -left-3 -top-3 w-8 h-8 rounded-full shadow-lg flex items-center justify-center bg-gradient-to-br from-emerald-100 to-teal-200 border-2 border-white">
                        <span className="text-emerald-700 text-sm">🌱</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse [animation-delay:150ms]"></div>
                          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse [animation-delay:300ms]"></div>
                        </div>
                        <span className="text-sm text-emerald-700 font-medium">Growing wisdom for you...</span>
                      </div>
                      <div className="mt-3 flex items-center justify-start space-x-2 text-xs text-emerald-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <span>AI Assistant is processing your request</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </div>

        <form
          onSubmit={handleSubmit}
          className="border-t border-slate-200 bg-gradient-to-b from-white to-slate-50/80 flex-shrink-0 p-6"
        >
          <div className="relative max-w-[95%] mx-auto space-y-4">
            <div className="relative">
            <Textarea
              placeholder="Share your thoughts and I'll help you grow..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[100px] w-full resize-none rounded-xl border-2 border-emerald-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 bg-white shadow-sm transition-all duration-200 pr-12 text-emerald-900 placeholder:text-emerald-500/60"
              onKeyDown={handleKeyDown}
            />
            <div className="absolute right-3 top-3 flex flex-col items-end space-y-2">
              <Badge 
                className="text-xs bg-gradient-to-r from-emerald-100/80 to-teal-100/80 text-emerald-700 border-emerald-200 backdrop-blur-sm"
              >
                ✨ Gemini Flash 2.0
              </Badge>
              {prompt.length > 0 && (
                <div className="text-xs text-emerald-600/80">
                  {prompt.length} characters
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center space-x-2 text-xs text-emerald-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Press Enter to send, Shift+Enter for new line</span>
            </div>
            <Button
              onClick={() => handleSubmit()}
              disabled={!prompt.trim() || isLoading}
              className={`relative px-6 py-2 ${
                !prompt.trim() || isLoading
                  ? "bg-emerald-100 text-emerald-400"
                  : "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white"
              } rounded-xl font-semibold shadow-lg transition-all duration-200 flex items-center space-x-2`}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Growing...
                </>
              ) : (
                <>
                  <span>Send</span>
                  <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </>
              )}
            </Button>
          </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

