"use client"

import { useState, useEffect } from 'react'
import { io, Socket } from 'socket.io-client'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

interface User {
  id: string
  username: string
  isAdmin: boolean
  isOnline: boolean
}

interface ChatSidebarProps {
  username: string
  isAdmin: boolean
}

export default function ChatSidebar({ username, isAdmin }: ChatSidebarProps) {
  const [onlineUsers, setOnlineUsers] = useState<User[]>([])
  const [socket, setSocket] = useState<Socket | null>(null)

  useEffect(() => {
    const newSocket = io(process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'http://localhost:3001')

    newSocket.on('connect', () => {
      console.log('Connected to chat server for user list')
    })

    newSocket.on('userList', (users: User[]) => {
      setOnlineUsers(users)
    })

    setSocket(newSocket)

    return () => {
      newSocket.close()
    }
  }, [])

  return (
    <div className="w-80 bg-[#f0f2f5] dark:bg-[#202c33] border-r border-gray-200 dark:border-gray-800">
      <div className="p-4 bg-[#f0f2f5] dark:bg-[#202c33] border-b border-gray-200 dark:border-gray-800">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Online Users</h2>
      </div>

      <ScrollArea className="h-[calc(100vh-8rem)]">
        <div className="p-2">
          {onlineUsers.map((user) => (
            <div
              key={user.id}
              className="flex items-center gap-3 p-3 hover:bg-gray-100 dark:hover:bg-[#2a3942] transition-colors cursor-pointer border-b border-gray-100 dark:border-gray-800"
            >
              <div className="relative">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className={user.isAdmin ? 'bg-[#00a884]' : 'bg-[#128C7E]'}>
                    {user.username.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#25d366] rounded-full border-2 border-[#f0f2f5] dark:border-[#202c33]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {user.username}
                  </p>
                  {user.isAdmin && (
                    <span className="text-xs bg-[#00a884] text-white px-2 py-0.5 rounded">Admin</span>
                  )}
                </div>
                <p className="text-xs text-[#00a884] dark:text-[#00a884]">online</p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="p-4 bg-[#f0f2f5] dark:bg-[#202c33] border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className={isAdmin ? 'bg-[#00a884]' : 'bg-[#128C7E]'}>
              {username.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
              {username}
              {isAdmin && (
                <span className="ml-2 text-xs bg-[#00a884] text-white px-2 py-0.5 rounded">Admin</span>
              )}
            </p>
            <p className="text-xs text-[#00a884] dark:text-[#00a884]">You</p>
          </div>
        </div>
      </div>
    </div>
  )
}
