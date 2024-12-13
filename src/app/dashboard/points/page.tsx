"use client"

import { useState, useEffect } from 'react'
import { useUser } from '@/contexts/UserContext'
import PointsMain from '@/components/points/PointsMain'

export default function PointsPage() {
  const { userData } = useUser()
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    console.log('Points page user data:', userData)
  }, [userData])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-gray-800 dark:text-gray-300">Loading points...</p>
        </div>
      </div>
    )
  }

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
    <div className="h-[calc(100vh-4rem)] overflow-hidden">
      <PointsMain
        userId={userData.id}
        isAdmin={userData.role === 'ADMIN'}
      />
    </div>
  )
}
