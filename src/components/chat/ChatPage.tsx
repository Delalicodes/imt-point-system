"use client"

import { useState, useEffect } from 'react'
import ChatSidebar from '@/components/chat/ChatSidebar'
import ChatMain from '@/components/chat/ChatMain'
import UserProfile from '@/components/chat/UserProfile'
import { useUser } from '@/contexts/UserContext'

interface Student {
  id: string
  username: string
  firstName: string
  lastName: string
}

export default function ChatPage() {
  const [selectedChat, setSelectedChat] = useState<string | null>(null)
  const [showProfile, setShowProfile] = useState(false)
  const { userData } = useUser()
  const [isLoading, setIsLoading] = useState(false)

  const handleChatSelect = (username: string) => {
    console.log('Selected chat:', username)
    setSelectedChat(username)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)] bg-[#1E1E2D]">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-gray-300">Loading chat...</p>
        </div>
      </div>
    )
  }

  if (!userData) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)] bg-[#1E1E2D]">
        <div className="text-center">
          <p className="text-red-400">Error: Unable to load user session</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-2 text-purple-400 hover:text-purple-300 hover:underline"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-[#1E1E2D] overflow-hidden">
      {/* Left Sidebar */}
      <ChatSidebar 
        selectedChat={selectedChat}
        onChatSelect={handleChatSelect}
        username={userData.username}
      />

      {/* Main Chat Area */}
      <div className="flex-1">
        <ChatMain
          chatId={selectedChat}
          onProfileClick={() => setShowProfile(true)}
          userId={userData.id}
          username={userData.username}
        />
      </div>

      {/* Right Profile Sidebar */}
      {showProfile && (
        <UserProfile
          onClose={() => setShowProfile(false)}
          user={{
            username: userData.username,
            firstName: userData.firstName || '',
            lastName: userData.lastName || ''
          }}
        />
      )}
    </div>
  )
}
