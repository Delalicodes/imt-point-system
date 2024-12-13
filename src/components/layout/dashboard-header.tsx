"use client"

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Bell, Settings, User, LogOut } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useUser } from '@/contexts/UserContext'
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import Link from 'next/link'

export default function DashboardHeader() {
  const router = useRouter()
  const { userData, clearUserData } = useUser()
  const { toast } = useToast()
  const [notifications] = useState([]) // TODO: Implement notifications

  const handleLogout = async () => {
    try {
      await clearUserData()
      router.push('/login')
    } catch (error) {
      console.error('Logout failed:', error)
      toast({
        title: "Logout Failed",
        description: "There was an error logging out. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleProfileClick = () => {
    router.push('/dashboard/profile')
  }

  const handleSettingsClick = () => {
    router.push('/dashboard/settings')
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1">
            <Link 
              href="/dashboard" 
              className="flex items-center space-x-2 md:container md:h-14 md:max-w-screen-2xl"
            >
              <div className="hidden font-bold sm:inline-block">
                IMT Point System
              </div>
              <span className="inline-block sm:hidden font-bold">IPS</span>
            </Link>
          </div>

          <nav className="flex items-center space-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border bg-background hover:bg-accent hover:text-accent-foreground">
                  <Bell className="h-4 w-4" />
                  {notifications.length > 0 && (
                    <span className="absolute right-0 top-0 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                    </span>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[300px]">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {notifications.length === 0 ? (
                  <div className="p-4 text-sm text-muted-foreground text-center">
                    No new notifications
                  </div>
                ) : (
                  notifications.map((notification, index) => (
                    <DropdownMenuItem key={index}>
                      {notification}
                    </DropdownMenuItem>
                  ))
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-full border bg-background p-1.5 text-sm hover:bg-accent hover:text-accent-foreground">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted">
                    <span className="font-medium">
                      {userData?.username?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <span className="hidden md:inline-block">
                    {userData?.username || 'User'}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleProfileClick}
                  className="cursor-pointer focus:bg-accent"
                >
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={handleSettingsClick}
                  className="cursor-pointer focus:bg-accent"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleLogout}
                  className="cursor-pointer focus:bg-destructive focus:text-destructive-foreground text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        </div>
      </div>
    </header>
  )
}
