"use client"

import { useState, useEffect } from "react"
import { useUser } from "@/contexts/UserContext"

interface UserData {
  id: string
  username: string
  role: string
}

export default function DashboardPage() {
  const { userData } = useUser()

  if (!userData) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="text-center">
          <p className="text-red-400">Error: Unable to load user session</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-2 text-primary hover:text-primary/80"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500">Total Points</h3>
          <p className="text-2xl font-bold mt-2">1,234</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500">Recent Activities</h3>
          <p className="text-2xl font-bold mt-2">28</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500">Rank</h3>
          <p className="text-2xl font-bold mt-2">#12</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-2 border-b">
            <div>
              <p className="font-medium">Points Earned</p>
              <p className="text-sm text-gray-500">Task completion</p>
            </div>
            <span className="text-green-500">+50 points</span>
          </div>
        </div>
      </div>
    </div>
  )
}
