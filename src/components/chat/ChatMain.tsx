"use client"

import { useState, useEffect, useRef } from 'react'
import { Socket } from 'socket.io-client'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Send, Paperclip, Smile } from 'lucide-react'
import { connectSocket, disconnectSocket } from '@/lib/socket-client'
import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface Message {
  id?: string
  content: string
  senderId: string
  senderName: string
  isAdmin: boolean
  timestamp: Date
  profileImage?: string
  file?: {
    name: string
    url: string
    type: string
  }
}

interface ChatMainProps {
  userId: string
  username: string
  isAdmin: boolean
}

export default function ChatMain({ userId, username, isAdmin }: ChatMainProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [socket, setSocket] = useState<Socket | null>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    console.log('Connecting socket...')
    const socket = connectSocket()
    setSocket(socket)

    socket.on('connect', () => {
      console.log('Socket connected successfully')
    })

    socket.on('message', (message: Message) => {
      console.log('Received message:', message)
      setMessages(prev => {
        console.log('Current messages:', prev)
        const updated = [...prev, {
          ...message,
          timestamp: new Date(message.timestamp)
        }]
        console.log('Updated messages:', updated)
        return updated
      })
      setTimeout(() => {
        if (scrollAreaRef.current) {
          scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
        }
      }, 100)
    })

    socket.on('previousMessages', (previousMessages: Message[]) => {
      console.log('Received previous messages:', previousMessages)
      if (Array.isArray(previousMessages)) {
        const formattedMessages = previousMessages.map(msg => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }))
        console.log('Setting previous messages:', formattedMessages)
        setMessages(formattedMessages)
        setTimeout(() => {
          if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
          }
        }, 100)
      }
    })

    return () => {
      console.log('Disconnecting socket...')
      disconnectSocket()
    }
  }, [])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !socket) return

    // Create a URL for the file
    const fileUrl = URL.createObjectURL(file)

    const messageData = {
      content: `Sent a file: ${file.name}`,
      senderId: userId,
      senderName: username,
      isAdmin,
      timestamp: new Date(),
      profileImage: `/api/avatar/${userId}`,
      file: {
        name: file.name,
        url: fileUrl,
        type: file.type
      }
    }

    console.log('Sending file message:', messageData)
    socket.emit('message', messageData)
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !socket) return

    const messageData = {
      content: newMessage.trim(),
      senderId: userId,
      senderName: username,
      isAdmin,
      timestamp: new Date(),
      profileImage: `/api/avatar/${userId}`
    }

    console.log('Sending message:', messageData)
    socket.emit('message', messageData)
    setNewMessage('')
  }

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="flex flex-col h-full bg-[#f5f7fb] dark:bg-[#1a1f36]">
      <div className="px-6 py-4 bg-white dark:bg-[#1e2642] border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src="/default-avatar.png" />
            <AvatarFallback>GC</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Group Chat</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">{messages.length} messages</p>
          </div>
        </div>
      </div>

      <ScrollArea ref={scrollAreaRef} className="flex-1 p-6">
        <div className="space-y-6">
          {messages.map((message, index) => {
            const isOwnMessage = message.senderId === userId
            return (
              <div
                key={message.id || index}
                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'} items-end gap-2 max-w-[80%]`}>
                  {!isOwnMessage && (
                    <Avatar className="h-8 w-8">
                      {message.profileImage ? (
                        <AvatarImage src={message.profileImage} alt={message.senderName} />
                      ) : (
                        <AvatarFallback className="bg-blue-600 text-white">
                          {message.senderName?.substring(0, 2).toUpperCase() || 'U'}
                        </AvatarFallback>
                      )}
                    </Avatar>
                  )}
                  <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                    <span className={`text-sm font-medium mb-1 flex items-center gap-2 ${
                      isOwnMessage ? 'text-right text-gray-300' : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {message.senderName}
                      {message.isAdmin && (
                        <span className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-100 px-1.5 py-0.5 rounded-full">
                          Admin
                        </span>
                      )}
                      <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                        isOwnMessage 
                          ? 'bg-blue-500/20 text-blue-100'
                          : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        {isOwnMessage ? 'You' : 'Member'}
                      </span>
                    </span>
                    <div
                      className={`rounded-2xl px-4 py-2.5 ${
                        isOwnMessage
                          ? 'bg-blue-600 text-white rounded-br-none'
                          : 'bg-white dark:bg-[#1e2642] text-gray-900 dark:text-white rounded-bl-none shadow-sm'
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words">{message.content}</p>
                      {message.file && (
                        <div className="mt-2">
                          <a
                            href={message.file.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm underline hover:no-underline"
                          >
                            {message.file.name}
                          </a>
                        </div>
                      )}
                      <span className={`text-xs mt-1 block ${
                        isOwnMessage ? 'text-blue-100' : 'text-gray-400'
                      }`}>
                        {formatTime(message.timestamp)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </ScrollArea>

      <div className="p-4 bg-white dark:bg-[#1e2642] border-t border-gray-200 dark:border-gray-700">
        <form onSubmit={sendMessage} className="flex items-center gap-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="flex-none"
            onClick={() => fileInputRef.current?.click()}
          >
            <Paperclip className="h-5 w-5" />
          </Button>
          <Input
            type="text"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1"
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                if (newMessage.trim()) {
                  sendMessage(e)
                }
              }
            }}
          />
          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="flex-none"
              >
                <Smile className="h-5 w-5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="end">
              <Picker
                data={data}
                onEmojiSelect={(emoji: any) => {
                  setNewMessage(prev => prev + emoji.native)
                }}
                theme="light"
              />
            </PopoverContent>
          </Popover>
          <Button type="submit" className="flex-none">
            <Send className="h-5 w-5" />
          </Button>
        </form>
      </div>
    </div>
  )
}
