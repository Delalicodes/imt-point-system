"use client"

import { useState, useEffect } from 'react'
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface Student {
  id: number
  firstName: string
  lastName: string
  username: string
  lastMessage?: string
  lastMessageTime?: string
  online?: boolean
}

interface ChatSidebarProps {
  selectedChat: string | null
  onChatSelect: (chatId: string) => void
  username: string
}

export default function ChatSidebar({ selectedChat, onChatSelect, username }: ChatSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [students, setStudents] = useState<Student[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchStudents()
  }, [])

  const fetchStudents = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await fetch('/api/students')
      if (!response.ok) throw new Error('Failed to fetch students')
      const data = await response.json()
      setStudents(data)
    } catch (error) {
      console.error('Error fetching students:', error)
      setError('Failed to load students')
    } finally {
      setIsLoading(false)
    }
  }

  const handleStudentSelect = (student: Student) => {
    console.log('Selected student:', student)
    if (student.username === username) {
      console.warn('Cannot chat with yourself')
      return
    }
    onChatSelect(student.username)
  }

  const filteredStudents = students.filter(student => 
    (student.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.username.toLowerCase().includes(searchQuery.toLowerCase())) &&
    student.username !== username // Don't show current user in the list
  )

  if (error) {
    return (
      <div className="w-80 border-r flex flex-col bg-white">
        <div className="p-4 border-b bg-white">
          <h2 className="text-xl font-semibold text-gray-800">Messages</h2>
          <div className="mt-3">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search students..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2">
            <div className="text-center p-8">
              <p className="text-red-500 mb-2">{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="text-blue-500 hover:text-blue-600 font-medium"
              >
                Try Again
              </button>
            </div>
          </div>
        </ScrollArea>
      </div>
    )
  }

  return (
    <div className="w-80 border-r flex flex-col bg-white">
      <div className="p-4 border-b bg-white">
        <h2 className="text-xl font-semibold text-gray-800">Messages</h2>
        <div className="mt-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search students..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="text-center p-8">
              <p className="text-gray-500">No students found</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredStudents.map((student) => (
                <button
                  key={student.id}
                  onClick={() => handleStudentSelect(student)}
                  className={`w-full flex items-center p-3 rounded-lg transition-all ${
                    selectedChat === student.username
                      ? 'bg-blue-50 border border-blue-100'
                      : 'hover:bg-gray-50 border border-transparent'
                  }`}
                >
                  <div className="flex items-center space-x-3 w-full">
                    <div className={`relative flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                      selectedChat === student.username ? 'bg-blue-100' : 'bg-gray-100'
                    }`}>
                      <span className={`font-semibold ${
                        selectedChat === student.username ? 'text-blue-600' : 'text-gray-600'
                      }`}>
                        {student.firstName[0]}
                        {student.lastName[0]}
                      </span>
                      {student.online && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></span>
                      )}
                    </div>
                    <div className="flex-1 text-left">
                      <p className={`font-medium ${
                        selectedChat === student.username ? 'text-blue-600' : 'text-gray-800'
                      }`}>
                        {student.firstName} {student.lastName}
                      </p>
                      <p className="text-sm text-gray-500">{student.username}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
