"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface UserData {
  id: string
  username: string
  firstName: string
  lastName: string
  imageUrl?: string
}

interface UserContextType {
  userData: UserData | null
  updateUserData: (data: UserData) => void
  refreshUserData: () => Promise<void>
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const [userData, setUserData] = useState<UserData | null>(null)

  const updateUserData = (data: UserData) => {
    setUserData(data)
  }

  const refreshUserData = async () => {
    try {
      const response = await fetch("/api/auth/session")
      if (!response.ok) {
        throw new Error('Failed to fetch session')
      }
      const data = await response.json()
      if (data) {
        setUserData({
          id: data.id,
          username: data.username,
          firstName: data.firstName,
          lastName: data.lastName,
          imageUrl: data.imageUrl || "/images/it-education-logo.svg"
        })
      } else {
        setUserData(null)
      }
    } catch (error) {
      console.error("Failed to fetch user data:", error)
      setUserData(null)
    }
  }

  useEffect(() => {
    refreshUserData()
  }, [])

  return (
    <UserContext.Provider value={{ userData, updateUserData, refreshUserData }}>
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
