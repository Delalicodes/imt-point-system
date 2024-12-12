"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import { Card } from '@/components/ui/card'

interface Course {
  id: number
  name: string
}

export default function RegisterForm({ courses }: { courses: Course[] }) {
  const router = useRouter()
  const { toast } = useToast()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    course: '',
    email: '',
    phone: '',
    address: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleCourseChange = (value: string) => {
    setFormData(prev => ({ ...prev, course: value }))
  }

  const validateStep1 = () => {
    if (!formData.firstName.trim()) {
      toast({ title: "Error", description: "First name is required", variant: "destructive" })
      return false
    }
    if (!formData.lastName.trim()) {
      toast({ title: "Error", description: "Last name is required", variant: "destructive" })
      return false
    }
    if (!formData.username.trim()) {
      toast({ title: "Error", description: "Username is required", variant: "destructive" })
      return false
    }
    if (!formData.course) {
      toast({ title: "Error", description: "Please select a course", variant: "destructive" })
      return false
    }
    return true
  }

  const handleNext = () => {
    if (validateStep1()) {
      setStep(2)
    }
  }

  const validateStep2 = () => {
    if (!formData.email.trim()) {
      toast({ title: "Error", description: "Email is required", variant: "destructive" })
      return false
    }
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      toast({ title: "Error", description: "Please enter a valid email address", variant: "destructive" })
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateStep2()) {
      return
    }

    setLoading(true)

    try {
      console.log('Sending registration data:', formData)
      const res = await fetch('/api/students/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await res.json()
      console.log('Registration response:', data)

      if (!res.ok) {
        throw new Error(data.error || 'Registration failed')
      }

      toast({
        title: "Success",
        description: "Registration successful! Please login.",
      })

      router.push('/login')
    } catch (error) {
      console.error('Registration error:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Registration failed",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Progress indicator */}
      <div className="flex justify-between mb-4">
        <div className={`flex-1 h-2 rounded-l-full ${step === 1 ? 'bg-blue-500' : 'bg-gray-200'}`} />
        <div className={`flex-1 h-2 rounded-r-full ${step === 2 ? 'bg-blue-500' : 'bg-gray-200'}`} />
      </div>

      <form onSubmit={step === 1 ? (e) => { e.preventDefault(); handleNext(); } : handleSubmit}>
        {step === 1 ? (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold mb-4">Personal Information</h2>
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="Enter your first name"
                required
              />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Enter your last name"
                required
              />
            </div>
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Choose a username"
                required
              />
            </div>
            <div>
              <Label htmlFor="course">Course</Label>
              <Select onValueChange={handleCourseChange} value={formData.course}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a course" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id.toString()}>
                      {course.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              type="submit"
              className="w-full mt-6"
              disabled={loading}
            >
              Next
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold mb-4">Contact Information</h2>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number (Optional)</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter your phone number"
              />
            </div>
            <div>
              <Label htmlFor="address">Address (Optional)</Label>
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter your address"
              />
            </div>
            <div className="flex gap-4 mt-6">
              <Button
                type="button"
                onClick={() => setStep(1)}
                variant="outline"
                className="flex-1"
                disabled={loading}
              >
                Back
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={loading}
              >
                {loading ? 'Registering...' : 'Register'}
              </Button>
            </div>
          </div>
        )}
      </form>
    </div>
  )
}
