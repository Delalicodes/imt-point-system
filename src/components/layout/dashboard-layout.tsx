"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { 
  Search,
  Bell,
  ChevronDown,
} from "lucide-react"
import { useUser } from '@/contexts/UserContext'
import Sidebar from './sidebar'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter()
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const { userData, updateUserData } = useUser()

  useEffect(() => {
    // Check if user data exists in localStorage
    const storedUser = localStorage.getItem('user')
    if (!storedUser) {
      router.push('/login')
      return
    }

    // Update context with stored user data
    const parsedUser = JSON.parse(storedUser)
    updateUserData(parsedUser)
  }, [router, updateUserData])

  const handleLogout = () => {
    localStorage.removeItem('user')
    updateUserData(null)
    router.push('/login')
  }

  if (!userData) {
    return null // Don't render anything while checking auth
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-200">
        <div className="max-w-full mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Image
                src="/images/it-education-logo.svg"
                alt="Logo"
                width={32}
                height={32}
                className="mr-3"
              />
              <h1 className="text-xl font-semibold">IMT Points</h1>
            </div>

            <div className="flex items-center space-x-4">
              <button className="p-2 hover:bg-gray-100 rounded-full">
                <Search size={20} />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-full">
                <Bell size={20} />
              </button>
              <div className="relative">
                <button 
                  className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-lg"
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                >
                  <Image
                    src={userData?.imageUrl || "/images/it-education-logo.svg"}
                    alt="Profile"
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                  <span className="text-sm font-medium">
                    {userData.firstName} {userData.lastName}
                  </span>
                  <ChevronDown size={16} />
                </button>
                
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-10">
                    <button 
                      onClick={() => router.push("/dashboard")}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Dashboard
                    </button>
                    <button 
                      onClick={() => router.push("/profile")}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Profile
                    </button>
                    <button 
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Log out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="pl-64 transition-all duration-300 ease-in-out">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  )
}
