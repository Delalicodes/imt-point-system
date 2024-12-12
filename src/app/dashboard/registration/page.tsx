"use client"

import { useState, useEffect } from 'react'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Notification } from "@/components/ui/notification"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import DashboardLayout from '@/components/layout/dashboard-layout'
import { Card } from "@/components/ui/card"

interface Course {
  id: number
  name: string
  duration: number
}

export default function RegistrationPage() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    course: '',
    email: '',
    phone: '',
    address: ''
  })

  const [availableCourses, setAvailableCourses] = useState<Course[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
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
        console.log('Fetched courses:', data)
        setAvailableCourses(data)
      } catch (error) {
        console.error('Failed to fetch courses:', error)
        showNotification('error', 'Failed to load courses. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }
    fetchCourses()
  }, [])

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message })
  }

  const validateStep1 = () => {
    if (!formData.firstName.trim()) {
      showNotification('error', 'First name is required')
      return false
    }
    if (!formData.lastName.trim()) {
      showNotification('error', 'Last name is required')
      return false
    }
    if (!formData.username.trim()) {
      showNotification('error', 'Username is required')
      return false
    }
    if (!formData.course) {
      showNotification('error', 'Please select a course')
      return false
    }
    return true
  }

  const validateStep2 = () => {
    if (!formData.email.trim()) {
      showNotification('error', 'Email is required')
      return false
    }
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      showNotification('error', 'Please enter a valid email address')
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (step === 1) {
      if (validateStep1()) {
        setStep(2)
      }
      return
    }
    
    if (!validateStep2()) {
      return
    }
    
    try {
      setIsSubmitting(true)
      
      // Find the selected course
      const selectedCourse = availableCourses.find(c => c.id.toString() === formData.course)
      if (!selectedCourse) {
        showNotification('error', 'Invalid course selection')
        return
      }

      console.log('Submitting registration data:', {
        ...formData,
        course: selectedCourse.id
      })

      const response = await fetch('/api/students/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          course: selectedCourse.id.toString()
        }),
      })

      const data = await response.json()
      console.log('Registration response:', data)

      if (response.ok) {
        showNotification('success', 'Registration successful!')
        setFormData({
          firstName: '',
          lastName: '',
          username: '',
          course: '',
          email: '',
          phone: '',
          address: ''
        })
        setStep(1)
      } else {
        showNotification('error', data.error || 'Registration failed')
      }
    } catch (error) {
      console.error('Registration error:', error)
      showNotification('error', 'Failed to register student. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleCourseChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      course: value
    }))
  }

  return (
    <DashboardLayout>
      <Notification
        type={notification.type}
        message={notification.message}
        onClose={() => setNotification({ type: null, message: '' })}
      />

      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Student Registration</h2>
        </div>

        <div className="max-w-2xl mx-auto">
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex justify-between mb-2">
              <div className="flex-1">
                <div className={`h-2 ${step === 1 ? 'bg-blue-500' : 'bg-gray-200'} rounded-l-full`}></div>
                <p className={`text-sm mt-1 ${step === 1 ? 'text-blue-500' : 'text-gray-500'}`}>Personal Information</p>
              </div>
              <div className="flex-1">
                <div className={`h-2 ${step === 2 ? 'bg-blue-500' : 'bg-gray-200'} rounded-r-full`}></div>
                <p className={`text-sm mt-1 ${step === 2 ? 'text-blue-500' : 'text-gray-500'}`}>Contact Information</p>
              </div>
            </div>
          </div>

          <Card className="p-6">
            <form onSubmit={handleSubmit} className="space-y-8">
              {step === 1 ? (
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      placeholder="Enter first name"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      placeholder="Enter last name"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      name="username"
                      placeholder="Enter username"
                      value={formData.username}
                      onChange={handleChange}
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="course">Course</Label>
                    <Select
                      value={formData.course}
                      onValueChange={handleCourseChange}
                      disabled={isSubmitting || isLoading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={isLoading ? "Loading courses..." : "Select a course"} />
                      </SelectTrigger>
                      <SelectContent>
                        {availableCourses.map((course) => (
                          <SelectItem key={course.id} value={course.id.toString()}>
                            {course.name} ({course.duration} months)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ) : (
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Enter email address"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="phone">Phone Number (Optional)</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="Enter phone number"
                      value={formData.phone}
                      onChange={handleChange}
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="address">Address (Optional)</Label>
                    <Input
                      id="address"
                      name="address"
                      placeholder="Enter address"
                      value={formData.address}
                      onChange={handleChange}
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-4 justify-end">
                {step === 2 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(1)}
                    disabled={isSubmitting}
                  >
                    Back
                  </Button>
                )}
                <Button type="submit" disabled={isSubmitting || isLoading}>
                  {isSubmitting ? 'Registering...' : step === 1 ? 'Next' : 'Register Student'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
