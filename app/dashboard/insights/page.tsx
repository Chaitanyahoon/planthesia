"use client"

import { ProductivityCharts } from "@/components/dashboard/productivity-charts"
import { WeeklyStats } from "@/components/dashboard/weekly-stats"
import { ProductivityTrends } from "@/components/dashboard/productivity-trends"

export default function InsightsPage() {
  return (
    <div className="space-y-4 sm:space-y-6 px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 bg-clip-text text-transparent">
            Growth Insights
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm sm:text-base">Track your productivity patterns and improvements.</p>
        </div>
      </div>

      <WeeklyStats />
      <ProductivityTrends />
      <ProductivityCharts />
    </div>
  )
}
