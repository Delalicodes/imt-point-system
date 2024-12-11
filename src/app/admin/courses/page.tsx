"use client"

import { useState } from 'react'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import DashboardLayout from '@/components/layout/dashboard-layout'

interface Subject {
  name: string
  description?: string
}

interface CourseFormData {
  name: string
  description: string
  durationMonths: number
  subjects: Subject[]
}

export default function CourseManagementPage() {
  const [formData, setFormData] = useState<CourseFormData>({
    name: '',
    description: '',
    durationMonths: 1,
    subjects: []
  })
  const [subjectInput, setSubjectInput] = useState({ name: '', description: '' })
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | null
    message: string
  }>({ type: null, message: '' })

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message })
    setTimeout(() => {
      setNotification({ type: null, message: '' })
    }, 3000)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'durationMonths' ? parseInt(value) || 0 : value
    }))
  }

  const handleAddSubject = () => {
    if (subjectInput.name.trim()) {
      setFormData(prev => ({
        ...prev,
        subjects: [...prev.subjects, { ...subjectInput }]
      }))
      setSubjectInput({ name: '', description: '' })
    }
  }

  const handleRemoveSubject = (index: number) => {
    setFormData(prev => ({
      ...prev,
      subjects: prev.subjects.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/admin/course-setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        showNotification('success', 'Course created successfully!')
        setFormData({
          name: '',
          description: '',
          durationMonths: 1,
          subjects: []
        })
      } else {
        showNotification('error', data.error || 'Failed to create course')
      }
    } catch (error) {
      showNotification('error', 'An error occurred while creating the course')
    }
  }

  return (
    <DashboardLayout>
      {notification.type && (
        <div
          className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
            notification.type === 'success'
              ? 'bg-green-500 text-white'
              : 'bg-red-500 text-white'
          }`}
        >
          {notification.message}
        </div>
      )}

      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8">Course Management</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Course Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter course name"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Course Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter course description"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="durationMonths">Duration (months)</Label>
              <Input
                id="durationMonths"
                name="durationMonths"
                type="number"
                min="1"
                value={formData.durationMonths}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-4">
              <Label>Subjects</Label>
              <div className="flex gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Subject name"
                    value={subjectInput.name}
                    onChange={(e) => setSubjectInput(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="flex-1">
                  <Input
                    placeholder="Subject description (optional)"
                    value={subjectInput.description}
                    onChange={(e) => setSubjectInput(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                <Button type="button" onClick={handleAddSubject}>
                  Add Subject
                </Button>
              </div>

              {formData.subjects.length > 0 && (
                <div className="mt-4 space-y-2">
                  {formData.subjects.map((subject, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{subject.name}</p>
                        {subject.description && (
                          <p className="text-sm text-gray-500">{subject.description}</p>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRemoveSubject(index)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <Button type="submit" className="w-full">
            Create Course
          </Button>
        </form>
      </div>
    </DashboardLayout>
  )
}
