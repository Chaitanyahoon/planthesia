"use client"

import type React from "react"
import { useState } from "react"
import { DataProvider } from "@/components/local-data-provider"
import { Sidebar } from "@/components/dashboard/sidebar"
import { TopNav } from "@/components/dashboard/top-nav"
import { PlantAIAssistant } from "@/components/dashboard/plant-ai-assistant"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isAIModalOpen, setIsAIModalOpen] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <DataProvider>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex">
        {/* Mobile Overlay */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
        
        {/* Sidebar - Hidden on mobile, shown as drawer */}
        <div className={`fixed lg:static inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}>
          <Sidebar onClose={() => setIsSidebarOpen(false)} />
        </div>
        
        <div className="flex-1 flex flex-col min-w-0 w-full lg:w-auto">
          <TopNav 
            onAIAssistantClick={() => setIsAIModalOpen(true)}
            onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
          />
          <main className="flex-1 overflow-y-auto overflow-x-hidden">{children}</main>
        </div>

        <PlantAIAssistant isOpen={isAIModalOpen} onClose={() => setIsAIModalOpen(false)} />
      </div>
    </DataProvider>
  )
}
