"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card"

export default function LoginForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault()
    setIsLoading(true)
    setError("")

    const formData = new FormData(event.target as HTMLFormElement)
    const username = formData.get("username")
    const password = formData.get("password")

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      })

      if (response.ok) {
        router.push("/admin/dashboard")
      } else {
        const data = await response.json()
        setError(data.error || "Invalid credentials")
      }
    } catch (error) {
      setError("Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-[400px] items-center justify-center w-full">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-2">
          <h2 className="text-2xl font-bold text-center">Sign in</h2>
          <p className="text-sm text-muted-foreground text-center">
            Enter your credentials to access your account
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium" htmlFor="username">
                Username
              </Label>
              <Input
                id="username"
                name="username"
                placeholder="Enter your username"
                type="text"
                autoCapitalize="none"
                autoComplete="username"
                autoCorrect="off"
                disabled={isLoading}
                required
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium" htmlFor="password">
                Password
              </Label>
              <Input
                id="password"
                name="password"
                placeholder="Enter your password"
                type="password"
                autoComplete="current-password"
                disabled={isLoading}
                required
                className="w-full"
              />
            </div>
            {error && (
              <div className="text-sm text-red-500 text-center bg-red-50 p-2 rounded-md">
                {error}
              </div>
            )}
            <Button className="w-full" type="submit" disabled={isLoading}>
              {isLoading && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{" "}
            <a href="/register" className="text-primary hover:underline">
              Create one now
            </a>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
