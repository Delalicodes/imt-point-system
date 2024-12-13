"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface UserData {
  id: string
  username: string
  firstName: string
  lastName: string
  imageUrl?: string
  role?: string
  type?: string
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
        credentials: 'include',
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
        credentials: 'include',
      })
      if (!response.ok) {
        throw new Error('Failed to fetch session')
      }
      const data = await response.json()
      if (data) {
        setUserData(data)
        localStorage.setItem('user', JSON.stringify(data))
      } else {
        setUserData(null)
        localStorage.removeItem('user')
      }
    } catch (error) {
      console.error("Failed to fetch user data:", error)
      setUserData(null)
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
  }

  useEffect(() => {
    const initializeUserData = async () => {
      try {
        // First try to get data from session
        const response = await fetch("/api/auth/session", {
          credentials: 'include',
        })
        
        if (response.ok) {
          const data = await response.json()
          if (data) {
            setUserData(data)
            return
          }
        }

        // If no session data, try localStorage
        const storedUser = localStorage.getItem('user')
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser)
            // Validate the stored user data
            if (parsedUser && parsedUser.id && parsedUser.username) {
              setUserData(parsedUser)
              return
            }
          } catch (e) {
            console.error('Error parsing stored user data:', e)
          }
        }

        // If no valid data found, redirect to login
        window.location.href = '/login'
      } catch (error) {
        console.error('Error initializing user data:', error)
        window.location.href = '/login'
      }
    }

    initializeUserData()
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
