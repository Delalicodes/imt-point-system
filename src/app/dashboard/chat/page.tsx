"use client"

import { useState, useEffect } from 'react'
import ChatMain from '@/components/chat/ChatMain'
import { useUser } from '@/contexts/UserContext'

export default function ChatPage() {
  const { userData } = useUser()
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    console.log('Chat page user data:', userData)
  }, [userData])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)] bg-[#efeae2] dark:bg-[#0c1317]">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-[#00a884] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-gray-800 dark:text-gray-300">Loading chat...</p>
        </div>
      </div>
    )
  }

  if (!userData) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)] bg-[#efeae2] dark:bg-[#0c1317]">
        <div className="text-center">
          <p className="text-red-400">Error: Unable to load user session</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-2 text-[#00a884] hover:text-[#008f6c]"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  const displayName = userData.firstName && userData.lastName 
    ? `${userData.firstName} ${userData.lastName}`
    : userData.username || 'Anonymous'

  return (
    <div className="h-[calc(100vh-4rem)] bg-[#1E1E2D] overflow-hidden">
      <ChatMain
        userId={userData.id}
        username={displayName}
        isAdmin={userData.role === 'ADMIN'}
      />
    </div>
  )
}
