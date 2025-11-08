"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    router.push("/dashboard")
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
    </div>
  )
}
