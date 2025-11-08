"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Icons } from "@/components/icons"
import { useData } from "@/components/local-data-provider"
import getAppreciation from '@/lib/appreciation'
import { useToast } from "@/hooks/use-toast"

export default function TasksPage() {
  const { tasks, addTask, updateTask, deleteTask, userName, userTone } = useData()
  const { toast } = useToast()
  const [filter, setFilter] = useState<"all" | "pending" | "completed">("all")
  const [priorityFilter, setPriorityFilter] = useState<"all" | "low" | "medium" | "high">("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [groupBy, setGroupBy] = useState<"none" | "priority" | "category" | "dueDate">("none")
  const [sortBy, setSortBy] = useState<"priority" | "dueDate" | "category" | "title">("priority")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [quickAddValue, setQuickAddValue] = useState("")
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "medium" as const,
    category: "work" as const,
    dueDate: "",
    recurrence: "none" as "none" | "daily" | "weekly" | "monthly",
  })

  const filteredTasks = tasks.filter((task) => {
    const matchesFilter =
      filter === "all" || (filter === "pending" && !task.completed) || (filter === "completed" && task.completed)

    const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesFilter && matchesPriority && matchesSearch
  })

  // Sort tasks
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === "priority") {
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    } else if (sortBy === "dueDate") {
      if (!a.dueDate && !b.dueDate) return 0
      if (!a.dueDate) return 1
      if (!b.dueDate) return -1
      return a.dueDate.localeCompare(b.dueDate)
    } else if (sortBy === "category") {
      return a.category.localeCompare(b.category)
    } else {
      return a.title.localeCompare(b.title)
    }
  })

  // Group tasks
  const groupedTasks = groupBy === "none" 
    ? { "All Tasks": sortedTasks }
    : groupBy === "priority"
    ? sortedTasks.reduce((acc, task) => {
        const key = task.priority.charAt(0).toUpperCase() + task.priority.slice(1) + " Priority"
        if (!acc[key]) acc[key] = []
        acc[key].push(task)
        return acc
      }, {} as Record<string, typeof sortedTasks>)
    : groupBy === "category"
    ? sortedTasks.reduce((acc, task) => {
        const key = task.category.charAt(0).toUpperCase() + task.category.slice(1)
        if (!acc[key]) acc[key] = []
        acc[key].push(task)
        return acc
      }, {} as Record<string, typeof sortedTasks>)
    : sortedTasks.reduce((acc, task) => {
        const today = new Date().toISOString().split("T")[0]
        let key = "No Due Date"
        if (task.dueDate) {
          if (task.dueDate < today) key = "Overdue"
          else if (task.dueDate === today) key = "Due Today"
          else {
            const dueDate = new Date(task.dueDate)
            const daysDiff = Math.ceil((dueDate.getTime() - new Date(today).getTime()) / (1000 * 60 * 60 * 24))
            if (daysDiff <= 7) key = "This Week"
            else if (daysDiff <= 30) key = "This Month"
            else key = "Later"
          }
        }
        if (!acc[key]) acc[key] = []
        acc[key].push(task)
        return acc
      }, {} as Record<string, typeof sortedTasks>)

  const handleQuickAdd = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && quickAddValue.trim()) {
      addTask({
        title: quickAddValue.trim(),
        description: "",
        priority: "medium",
        category: "work",
        completed: false,
      })
      setQuickAddValue("")
      toast({
        title: "Task added!",
        description: "Quick task created successfully.",
      })
    }
  }

  const handleAddTask = () => {
    if (!newTask.title.trim()) return

    addTask({
      title: newTask.title,
      description: newTask.description,
      priority: newTask.priority,
      category: newTask.category,
      completed: false,
      dueDate: newTask.dueDate || undefined,
      recurrence: newTask.recurrence,
    })

    setNewTask({
      title: "",
      description: "",
      priority: "medium",
      category: "work",
      dueDate: "",
      recurrence: "none",
    })
    setIsAddDialogOpen(false)

    toast({
      title: "Task added!",
      description: "Your new task has been created successfully.",
    })
  }

  const handleToggleTask = (taskId: string, completed: boolean) => {
    updateTask(taskId, { completed })
    const task = tasks.find((t) => t.id === taskId)
    if (completed && task) {
      const app = getAppreciation(task.title, { userName, tone: (userTone as any) || 'balanced' })
      toast({
        title: app.title,
        description: app.message,
      })
    } else {
      toast({
        title: completed ? 'Task completed! 🎉' : 'Task reopened',
        description: completed ? 'Great job! Keep up the momentum.' : 'Task marked as pending.',
      })
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800"
      case "medium":
        return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800"
      case "low":
        return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800"
      default:
        return "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700"
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "work":
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
      case "personal":
        return "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
      case "learning":
        return "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300"
      case "health":
        return "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300"
      default:
        return "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6 px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      <div className="space-y-3 sm:space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
              Tasks
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Manage and track your tasks efficiently.</p>
          </div>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white">
                <Icons.plus className="w-4 h-4 mr-2" />
                Add Task
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-lg bg-gradient-to-br from-white via-slate-50/50 to-blue-50/30 dark:from-slate-900 dark:via-slate-800/50 dark:to-slate-800/30 border-0 shadow-xl rounded-2xl">
            <DialogHeader className="space-y-3 pb-4 border-b border-slate-200 dark:border-slate-700">
              <DialogTitle className="flex items-center space-x-3 text-2xl">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                  <Icons.seedling className="w-6 h-6 text-white" />
                </div>
                <div>
                  <span className="bg-gradient-to-r from-slate-800 to-blue-600 dark:from-slate-100 dark:to-blue-400 bg-clip-text text-transparent block">
                    Create New Task
                  </span>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-normal mt-0.5">
                    Add details to organize your work
                  </p>
                </div>
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-5 pt-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Icons.tasks className="w-4 h-4" />
                  Task Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="What needs to be done?"
                  className="bg-white/80 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 focus:border-blue-400 dark:focus:border-blue-500 focus:ring-blue-400/20 dark:focus:ring-blue-500/20 h-11"
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Icons.book className="w-4 h-4" />
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  placeholder="Add more details about this task (optional)"
                  className="bg-white/80 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 focus:border-blue-400 dark:focus:border-blue-500 focus:ring-blue-400/20 dark:focus:ring-blue-500/20 resize-none"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <Icons.target className="w-4 h-4" />
                    Priority
                  </Label>
                  <Select
                    value={newTask.priority}
                    onValueChange={(value: any) => setNewTask({ ...newTask, priority: value })}
                  >
                    <SelectTrigger className="bg-white/80 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 focus:border-blue-400 dark:focus:border-blue-500 h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">🟢 Low</SelectItem>
                      <SelectItem value="medium">🟡 Medium</SelectItem>
                      <SelectItem value="high">🔴 High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <Icons.briefcase className="w-4 h-4" />
                    Category
                  </Label>
                  <Select
                    value={newTask.category}
                    onValueChange={(value: any) => setNewTask({ ...newTask, category: value })}
                  >
                    <SelectTrigger className="bg-white/80 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 focus:border-blue-400 dark:focus:border-blue-500 h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="work">💼 Work</SelectItem>
                      <SelectItem value="personal">👤 Personal</SelectItem>
                      <SelectItem value="learning">📚 Learning</SelectItem>
                      <SelectItem value="health">❤️ Health</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <Icons.reset className="w-4 h-4" />
                    Repeat
                  </Label>
                  <Select
                    value={newTask.recurrence}
                    onValueChange={(value: any) => setNewTask({ ...newTask, recurrence: value })}
                  >
                    <SelectTrigger className="bg-white/80 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 focus:border-blue-400 dark:focus:border-blue-500 h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dueDate" className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Icons.calendar className="w-4 h-4" />
                  Due Date
                </Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                  className="bg-white/80 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 focus:border-blue-400 dark:focus:border-blue-500 focus:ring-blue-400/20 dark:focus:ring-blue-500/20 h-11"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                  className="flex-1 border-slate-200 dark:border-slate-700"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddTask}
                  disabled={!newTask.title.trim()}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
                >
                  <Icons.seedling className="w-4 h-4 mr-2" />
                  Create Task
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

        {/* Quick Add Section */}
        <Card className="bg-gradient-to-br from-emerald-50/50 to-blue-50/30 dark:from-emerald-900/20 dark:to-blue-900/20 border border-emerald-200/50 dark:border-emerald-800/50 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Icons.plus className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
              <Input
                placeholder="Quick add task (Press Enter to add)..."
                value={quickAddValue}
                onChange={(e) => setQuickAddValue(e.target.value)}
                onKeyDown={handleQuickAdd}
                className="flex-1 border-emerald-200 dark:border-emerald-700 focus:border-emerald-400 dark:focus:border-emerald-500 focus:ring-emerald-400/20 dark:focus:ring-emerald-500/20 bg-white/80 dark:bg-slate-800/80"
              />
              <Button
                onClick={() => {
                  if (quickAddValue.trim()) {
                    addTask({
                      title: quickAddValue.trim(),
                      description: "",
                      priority: "medium",
                      category: "work",
                      completed: false,
                    })
                    setQuickAddValue("")
                    toast({
                      title: "Task added!",
                      description: "Quick task created successfully.",
                    })
                  }
                }}
                disabled={!quickAddValue.trim()}
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Add
              </Button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 ml-8">Or click "Add Task" for detailed options</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-lg">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white/50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-700"
              />
            </div>
            <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tasks</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={(value: any) => setPriorityFilter(value)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Select value={groupBy} onValueChange={(value: any) => setGroupBy(value)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Group by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Grouping</SelectItem>
                <SelectItem value="priority">By Priority</SelectItem>
                <SelectItem value="category">By Category</SelectItem>
                <SelectItem value="dueDate">By Due Date</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="priority">Priority</SelectItem>
                <SelectItem value="dueDate">Due Date</SelectItem>
                <SelectItem value="category">Category</SelectItem>
                <SelectItem value="title">Title</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tasks List */}
      <div className="space-y-6">
        {Object.keys(groupedTasks).length === 0 || sortedTasks.length === 0 ? (
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg dark:bg-slate-800/80">
            <CardContent className="p-8 text-center">
              <Icons.tasks className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No tasks found</h3>
              <p className="text-gray-600 dark:text-gray-400">
                {tasks.length === 0
                  ? "Create your first task to get started!"
                  : "Try adjusting your filters or search term."}
              </p>
            </CardContent>
          </Card>
        ) : (
          Object.entries(groupedTasks).map(([groupName, groupTasks]) => (
            <div key={groupName} className="space-y-3">
              {groupBy !== "none" && (
                <div className="flex items-center gap-2 px-2">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                    {groupName === "Overdue" && <Icons.droplets className="w-5 h-5 text-red-500" />}
                    {groupName === "Due Today" && <Icons.sun className="w-5 h-5 text-yellow-500" />}
                    {groupName === "This Week" && <Icons.calendar className="w-5 h-5 text-blue-500" />}
                    {groupName === "High Priority" && <Icons.target className="w-5 h-5 text-red-500" />}
                    {groupName === "Medium Priority" && <Icons.target className="w-5 h-5 text-yellow-500" />}
                    {groupName === "Low Priority" && <Icons.target className="w-5 h-5 text-green-500" />}
                    {groupName}
                    <Badge variant="secondary" className="ml-2">
                      {groupTasks.length}
                    </Badge>
                  </h3>
                </div>
              )}
              <div className="grid gap-4">
                {groupTasks.map((task) => (
                  <Card
                    key={task.id}
                    className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-4">
                        <Checkbox
                          checked={task.completed}
                          onCheckedChange={(checked) => handleToggleTask(task.id, checked as boolean)}
                          className="mt-1"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3
                                className={`font-medium ${task.completed ? "line-through text-gray-500 dark:text-gray-500" : "text-gray-900 dark:text-gray-100"}`}
                              >
                                {task.title}
                              </h3>
                              {task.description && (
                                <p
                                  className={`text-sm mt-1 ${task.completed ? "line-through text-gray-400" : "text-gray-600 dark:text-gray-400"}`}
                                >
                                  {task.description}
                                </p>
                              )}
                              <div className="flex items-center space-x-2 mt-2 flex-wrap gap-2">
                                <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                                <Badge className={getCategoryColor(task.category)}>{task.category}</Badge>
                                {task.dueDate && (
                                  <Badge 
                                    variant="outline" 
                                    className={`text-xs ${
                                      task.dueDate < new Date().toISOString().split("T")[0] && !task.completed
                                        ? "border-red-500 text-red-600 dark:text-red-400"
                                        : ""
                                    }`}
                                  >
                                    <Icons.calendar className="w-3 h-3 mr-1" />
                                    Due: {new Date(task.dueDate).toLocaleDateString()}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteTask(task.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                              <Icons.trash className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
