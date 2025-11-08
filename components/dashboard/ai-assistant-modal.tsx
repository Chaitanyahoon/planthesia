"use client"

import type React from "react"
import { useState, useCallback, useMemo, memo } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Icons } from "@/components/icons"
import { useData } from "@/components/local-data-provider"

interface AIAssistantModalProps {
  isOpen: boolean
  onClose: () => void
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
      <div className={isUserMessage ? "flex justify-end" : "flex justify-start"}>
        <div
          className={`max-w-xs sm:max-w-sm md:max-w-md p-4 rounded-xl ${
            isUserMessage ? "bg-gradient-to-r from-emerald-600 to-blue-600 text-white" : "bg-gray-100 text-gray-900"
          }`}
        >
          <div className="whitespace-pre-wrap text-sm leading-relaxed break-words">{message.content}</div>
          <div className={`text-xs mt-2 ${isUserMessage ? "text-emerald-100" : "text-gray-500"}`}>
            {message.timestamp.toLocaleTimeString()}
          </div>

          {message.taskSuggestions && message.taskSuggestions.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-xs font-semibold opacity-75">Suggested Tasks:</p>
              {message.taskSuggestions.map((task, idx) => (
                <button
                  key={idx}
                  onClick={() => onAddSuggestedTask(task)}
                  className="w-full text-left p-2 rounded bg-white bg-opacity-20 hover:bg-opacity-30 transition-colors text-xs"
                  type="button"
                >
                  <div className="font-medium">{task.title}</div>
                  <div className="opacity-75 text-xs">
                    {task.duration}min - {task.time} - {task.priority}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  },
)

ChatMessageComponent.displayName = "ChatMessage"

export function AIAssistantModal({ isOpen, onClose }: AIAssistantModalProps) {
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

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)

        const data = await response.json()
        const assistantResponseContent = typeof data.response === "string" ? data.response : "No response generated"

        const assistantMessage: ChatMessage = {
          role: "assistant",
          content: assistantResponseContent,
          timestamp: new Date(),
          taskSuggestions: data.taskSuggestions,
        }

        setChatHistory((prev) => [...prev, assistantMessage])
      } catch (error) {
        console.error("API Error:", error)
        const errorMessage: ChatMessage = {
          role: "assistant",
          content: "I apologize, but I had trouble connecting to the Growth AI service. Please try again.",
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4 px-6 pt-6">
          <DialogTitle className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Icons.sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xl">Growth AI Assistant</span>
              <p className="text-sm text-gray-500 font-normal">Powered by Gemini Flash 2.0</p>
            </div>
          </DialogTitle>
          <DialogDescription className="sr-only">Growth AI Assistant powered by Google Gemini</DialogDescription>
          {chatHistory.length > 0 && (
            <Button variant="outline" size="sm" onClick={clearChat}>
              Clear Chat
            </Button>
          )}
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col px-6">
          {chatHistory.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center space-y-4">
                <Icons.sparkles className="w-16 h-16 text-emerald-600 mx-auto" />
                <h3 className="text-lg font-semibold text-gray-900">Welcome to Growth AI</h3>
                <p className="text-sm text-gray-600">Ask me about productivity, tasks, focus, and growth</p>
              </div>
            </div>
          ) : (
            <ScrollArea className="flex-1 w-full">
              <div className="space-y-4 py-4 pr-4">
                {chatHistory.map((message, index) => (
                  <ChatMessageComponent key={index} message={message} onAddSuggestedTask={handleAddSuggestedTask} />
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 p-4 rounded-xl flex items-center space-x-2">
                      <Icons.spinner className="w-4 h-4 animate-spin" />
                      <span className="text-sm text-gray-600">Thinking...</span>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 border-t pt-4 px-6 pb-6 bg-white">
          <Textarea
            placeholder="Ask me anything..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-h-[80px] resize-none"
            onKeyDown={handleKeyDown}
          />

          <div className="flex items-center justify-between gap-2">
            <Badge variant="outline" className="text-xs">
              Gemini Flash 2.0
            </Badge>
            <Button
              onClick={() => handleSubmit()}
              disabled={!prompt.trim() || isLoading}
              className="bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700"
            >
              {isLoading ? "Thinking..." : "Send"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
