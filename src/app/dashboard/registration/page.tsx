"use client"

import { useState, useEffect } from 'react'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import DashboardLayout from '@/components/layout/dashboard-layout'

interface Course {
  id: number
  name: string
  duration: number
}

export default function RegistrationPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    course: ''
  })

  const [availableCourses, setAvailableCourses] = useState<Course[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' })

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/admin/course-setup')
        if (!response.ok) {
          throw new Error('Failed to fetch courses')
        }
        const data = await response.json()
        setAvailableCourses(data) // The API returns the courses array directly
      } catch (error) {
        console.error('Failed to fetch courses:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchCourses()
  }, [])

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message })
    setTimeout(() => {
      setNotification({ type: null, message: '' })
    }, 2000)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      // Ensure course ID is a number
      const submitData = {
        ...formData,
        course: parseInt(formData.course)
      }

      const response = await fetch('/api/students/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      })

      const data = await response.json()

      if (response.ok) {
        showNotification('success', 'Registration successful!')
        setFormData({
          firstName: '',
          lastName: '',
          username: '',
          course: ''
        })
      } else {
        showNotification('error', data.error || 'Registration failed')
      }
    } catch (error) {
      console.error('Registration error:', error)
      showNotification('error', 'Failed to register student')
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  return (
    <DashboardLayout>
      {notification.type && (
        <div
          className={`fixed top-4 left-4 z-50 p-4 rounded-lg shadow-lg ${
            notification.type === 'success'
              ? 'bg-green-500 text-white'
              : 'bg-red-500 text-white'
          }`}
        >
          {notification.message}
        </div>
      )}

      <div className="flex min-h-[600px] w-full items-start justify-center">
        <div className="w-full max-w-[500px] p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Student Registration</h1>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                name="firstName"
                placeholder="Enter first name"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                name="lastName"
                placeholder="Enter last name"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                placeholder="Choose a username"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="course">Course</Label>
              <select
                id="course"
                name="course"
                value={formData.course}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2"
                required
              >
                <option value="">Select a course</option>
                {isLoading ? (
                  <option value="" disabled>Loading courses...</option>
                ) : (
                  availableCourses?.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.name} ({course.duration} months)
                    </option>
                  ))
                )}
              </select>
            </div>

            <Button type="submit" className="w-full">
              Register Student
            </Button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  )
}
