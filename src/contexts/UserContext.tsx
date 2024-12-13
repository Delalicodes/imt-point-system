"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface UserData {
  id: string
  username: string
  firstName: string
  lastName: string
  imageUrl?: string
  role?: string
}

interface UserContextType {
  userData: UserData | null
  updateUserData: (data: UserData) => void
  refreshUserData: () => Promise<void>
  clearUserData: () => Promise<void>
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const [userData, setUserData] = useState<UserData | null>(null)

  const updateUserData = (data: UserData) => {
    setUserData(data)
    localStorage.setItem('user', JSON.stringify(data))
  }

  const clearUserData = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important for cookies
      })
      
      if (!response.ok) {
        throw new Error('Logout failed')
      }
      
      localStorage.removeItem('user')
      localStorage.removeItem('token')
      setUserData(null)
    } catch (error) {
      console.error('Logout error:', error)
      throw error
    }
  }

  const refreshUserData = async () => {
    try {
      const response = await fetch("/api/auth/session", {
        credentials: 'include', // Important for cookies
      })
      if (!response.ok) {
        throw new Error('Failed to fetch session')
      }
      const data = await response.json()
      if (data && data.user) {
        const userData = {
          id: data.user.id,
          username: data.user.username,
          firstName: data.user.firstName,
          lastName: data.user.lastName,
          imageUrl: data.user.imageUrl || "/images/it-education-logo.svg",
          role: data.user.role
        }
        setUserData(userData)
        localStorage.setItem('user', JSON.stringify(userData))
      } else {
        setUserData(null)
        localStorage.removeItem('user')
      }
    } catch (error) {
      console.error("Failed to fetch user data:", error)
      setUserData(null)
      localStorage.removeItem('user')
    }
  }

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      try {
        setUserData(JSON.parse(storedUser))
      } catch (e) {
        console.error('Error parsing stored user data:', e)
        localStorage.removeItem('user')
      }
    }
    refreshUserData()
  }, [])

  return (
    <UserContext.Provider value={{ userData, updateUserData, refreshUserData, clearUserData }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}
