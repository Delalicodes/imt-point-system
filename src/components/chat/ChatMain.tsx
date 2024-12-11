"use client"

import { useState, useRef, useEffect } from "react"
import { Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useChat } from "@/hooks/useChat"
import { useUser } from "@/contexts/UserContext"
import { cn } from "@/lib/utils"

interface ChatMainProps {
  chatId: string | null
  onProfileClick?: () => void
  userId?: string
  username?: string
}

export default function ChatMain({ chatId, onProfileClick, userId, username }: ChatMainProps) {
  const [message, setMessage] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)
  const { userData } = useUser()
  const { messages, sendMessage, isConnected, error } = useChat(chatId || "")

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = () => {
    if (!message.trim() || !userData?.username || !chatId) return
    console.log("Sending message to:", chatId)
    sendMessage(message, userData.username)
    setMessage("")
  }

  if (!chatId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white text-gray-800">
        <div className="text-center">
          <h3 className="text-lg font-medium">Select a chat to start messaging</h3>
          <p className="text-sm text-gray-400 mt-1">Choose a student from the sidebar</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white text-gray-800">
        <div className="text-center">
          <h3 className="text-lg font-medium text-red-400">{error}</h3>
          <p className="text-sm text-gray-400 mt-1">Please try refreshing the page</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-white">
      {/* Connection Status */}
      {!isConnected && (
        <div className="bg-yellow-500/10 text-yellow-200 text-sm py-2 px-4">
          Connecting to chat server...
        </div>
      )}

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4 overflow-y-auto bg-gray-100">
        <div className="space-y-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.sender === userData?.username ? 'justify-end' : 'justify-start'} mb-4`}
            >
              <div
                className={`max-w-[70%] rounded-lg p-3 ${
                  msg.sender === userData?.username
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-800 border border-gray-200'
                }`}
              >
                <p className="text-sm">{msg.content}</p>
                <p className="text-xs mt-1 opacity-75">
                  {new Date(msg.timestamp).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>
            </div>
          ))}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Message Input */}
      <div className="flex-none p-4 border-t bg-gray-50">
        <form onSubmit={(e) => e.preventDefault()} className="flex gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={isConnected ? "Type a message..." : "Connecting..."}
            disabled={!isConnected}
            className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!isConnected}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-5 w-5" />
          </Button>
        </form>
      </div>
    </div>
  )
}
