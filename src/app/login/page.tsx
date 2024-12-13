"use client"

import { useState } from "react"
import { ImageCarousel } from "@/components/ui/image-carousel"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { useUser } from "@/contexts/UserContext"

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { updateUserData } = useUser()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/auth/login', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()
      console.log('Login response:', data)

      if (response.ok) {
        // Store user data in localStorage and context
        const { user } = data
        const userData = {
          id: user.id,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          type: user.type
        }
        
        localStorage.setItem('user', JSON.stringify(userData))
        updateUserData(userData)
        
        toast.success(`Welcome back, ${userData.firstName}!`)
        router.push("/dashboard")
      } else {
        toast.error(data.error || "Invalid username or password")
      }
    } catch (error) {
      console.error('Login error:', error)
      toast.error("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex h-screen">
      {/* Left side - Image Carousel */}
      <div className="hidden lg:block w-1/2 relative">
        <ImageCarousel />
      </div>

      {/* Right side - Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 bg-white">
        <div className="w-full max-w-md space-y-8">
          {/* Logo and Title */}
          <div className="flex flex-col items-center space-y-2">
            <Image
              src="/images/it-education-logo.svg"
              alt="Logo"
              width={64}
              height={64}
              priority
            />
            <h2 className="text-2xl font-bold">Welcome back</h2>
            <p className="text-gray-600">Please enter your credentials to login</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username">Username or Email</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Log in"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
