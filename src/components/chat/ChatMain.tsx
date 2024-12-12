"use client"

import { useState, useEffect, useRef } from 'react'
import { Socket } from 'socket.io-client'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Send, Paperclip, Smile, FileText, X, Reply, Edit2 } from 'lucide-react'
import { connectSocket, disconnectSocket } from '@/lib/socket-client'
import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { Textarea } from "@/components/ui/textarea"

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
  isReport?: boolean
  replyTo?: {
    id: string
    content: string
    senderName: string
  }
  isEdited?: boolean
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
  const [report, setReport] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [replyingTo, setReplyingTo] = useState<Message | null>(null)
  const [editingMessage, setEditingMessage] = useState<Message | null>(null)
  const [editContent, setEditContent] = useState('')
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
      setMessages(prev => [...prev, message])
      setTimeout(() => {
        if (scrollAreaRef.current) {
          scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
        }
      }, 100)
    })

    socket.on('previousMessages', (previousMessages: Message[]) => {
      console.log('Received previous messages:', previousMessages)
      setMessages(previousMessages)
      setTimeout(() => {
        if (scrollAreaRef.current) {
          scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
        }
      }, 100)
    })

    socket.on('editMessage', (updatedMessage: Message) => {
      console.log('Received edited message:', updatedMessage)
      setMessages(prev => prev.map(msg => 
        msg.id === updatedMessage.id ? updatedMessage : msg
      ))
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

  const handleReply = (message: Message) => {
    setReplyingTo(message)
    setEditingMessage(null)
    // Focus the input field
    const inputElement = document.querySelector('input[type="text"]') as HTMLInputElement
    if (inputElement) {
      inputElement.focus()
    }
  }

  const handleEdit = (message: Message) => {
    setEditingMessage(message)
    setEditContent(message.content)
    setReplyingTo(null)
  }

  const cancelReply = () => {
    setReplyingTo(null)
  }

  const cancelEdit = () => {
    setEditingMessage(null)
    setEditContent('')
  }

  const saveEdit = () => {
    if (!editContent.trim() || !socket || !editingMessage) return

    const updatedMessage = {
      ...editingMessage,
      content: editContent.trim(),
      isEdited: true,
      timestamp: new Date()
    }

    socket.emit('editMessage', updatedMessage)
    setEditingMessage(null)
    setEditContent('')
  }

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !socket) return

    const messageData = {
      content: newMessage.trim(),
      senderId: userId,
      senderName: username,
      isAdmin,
      isReport: false,
      ...(replyingTo && {
        replyTo: {
          id: replyingTo.id!,
          content: replyingTo.content,
          senderName: replyingTo.senderName
        }
      })
    }

    socket.emit('message', messageData)
    setNewMessage('')
    setReplyingTo(null)
  }

  const submitReport = () => {
    if (!report.trim() || !socket) return

    const reportData = {
      content: report.trim(),
      senderId: userId,
      senderName: username,
      isAdmin,
      isReport: true,
      ...(replyingTo && {
        replyTo: {
          id: replyingTo.id!,
          content: replyingTo.content,
          senderName: replyingTo.senderName
        }
      })
    }

    socket.emit('message', reportData)
    setReport('')
    setIsDialogOpen(false)
    setReplyingTo(null)
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
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="gap-2">
              <FileText className="h-4 w-4" />
              Submit Report
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Submit Daily Report</DialogTitle>
              <DialogDescription>
                Share your daily activities and progress with the team.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Textarea
                placeholder="Write your report here..."
                value={report}
                onChange={(e) => setReport(e.target.value)}
                className="min-h-[200px]"
              />
              <Button onClick={submitReport} className="w-full">
                Submit Report
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <ScrollArea ref={scrollAreaRef} className="flex-1 p-6">
        <div className="space-y-6">
          {messages.map((message, index) => {
            const isOwnMessage = message.senderId === userId
            return (
              <ContextMenu key={message.id || index}>
                <ContextMenuTrigger>
                  <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} py-1`}>
                    <div className={`flex ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'} items-end gap-1.5 max-w-[70%]`}>
                      {!isOwnMessage && (
                        <Avatar className="h-6 w-6">
                          {message.profileImage ? (
                            <AvatarImage src={message.profileImage} alt={message.senderName} />
                          ) : (
                            <AvatarFallback className="bg-blue-600 text-white text-xs">
                              {message.senderName?.substring(0, 2).toUpperCase() || 'U'}
                            </AvatarFallback>
                          )}
                        </Avatar>
                      )}
                      <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                        <span className={`text-xs font-medium mb-0.5 flex items-center gap-1.5 ${
                          isOwnMessage ? 'text-right text-gray-300' : 'text-gray-500 dark:text-gray-400'
                        }`}>
                          {message.senderName}
                          {message.isAdmin && (
                            <span className="text-[10px] bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-100 px-1 py-px rounded-full">
                              Admin
                            </span>
                          )}
                          {message.isReport && (
                            <span className="text-[10px] bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-100 px-1 py-px rounded-full">
                              Report
                            </span>
                          )}
                          <span className={`text-[10px] px-1 py-px rounded-full ${
                            isOwnMessage 
                              ? 'bg-blue-500/20 text-blue-100'
                              : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                          }`}>
                            {isOwnMessage ? 'You' : 'Member'}
                          </span>
                        </span>
                        <div
                          className={`rounded-xl px-3 py-1.5 ${
                            isOwnMessage
                              ? 'bg-blue-600 text-white rounded-br-sm'
                              : 'bg-white dark:bg-[#1e2642] text-gray-900 dark:text-white rounded-bl-sm shadow-sm'
                          } ${message.isReport ? 'border border-green-500' : ''}`}
                        >
                          {message.replyTo && (
                            <div className={`mb-1 pb-1 text-xs border-b ${
                              isOwnMessage ? 'border-blue-500' : 'border-gray-200 dark:border-gray-700'
                            }`}>
                              <div className={`font-medium ${
                                isOwnMessage ? 'text-blue-200' : 'text-gray-500 dark:text-gray-400'
                              }`}>
                                Replying to {message.replyTo.senderName}
                              </div>
                              <div className="line-clamp-1 opacity-75">
                                {message.replyTo.content}
                              </div>
                            </div>
                          )}
                          {editingMessage?.id === message.id ? (
                            <div className="space-y-1.5">
                              <Textarea
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                className="min-h-[45px] text-sm bg-white/10 border-white/20"
                                placeholder="Edit your message..."
                              />
                              <div className="flex justify-end gap-1.5">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={cancelEdit}
                                  className="h-7 text-xs"
                                >
                                  Cancel
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={saveEdit}
                                  className="h-7 text-xs"
                                >
                                  Save
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                              {message.file && (
                                <div className="mt-1">
                                  <a
                                    href={message.file.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs underline hover:no-underline"
                                  >
                                    {message.file.name}
                                  </a>
                                </div>
                              )}
                            </>
                          )}
                          <span className={`text-[10px] mt-0.5 block ${
                            isOwnMessage ? 'text-blue-100' : 'text-gray-400'
                          }`}>
                            {formatTime(message.timestamp)}
                            {message.isEdited && ' (edited)'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </ContextMenuTrigger>
                <ContextMenuContent>
                  <ContextMenuItem
                    onClick={() => handleReply(message)}
                    className="gap-2"
                  >
                    <Reply className="h-4 w-4" />
                    Reply
                  </ContextMenuItem>
                  {isOwnMessage && (
                    <ContextMenuItem
                      onClick={() => handleEdit(message)}
                      className="gap-2"
                    >
                      <Edit2 className="h-4 w-4" />
                      Edit
                    </ContextMenuItem>
                  )}
                </ContextMenuContent>
              </ContextMenu>
            )
          })}
        </div>
      </ScrollArea>

      <div className="p-4 bg-white dark:bg-[#1e2642] border-t border-gray-200 dark:border-gray-700">
        {replyingTo && (
          <div className="mb-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-start justify-between">
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Replying to {replyingTo.senderName}
              </div>
              <div className="text-sm line-clamp-1 text-gray-600 dark:text-gray-300">
                {replyingTo.content}
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="flex-none -mt-1 -mr-1"
              onClick={cancelReply}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
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
