"use client"

import { useState, useEffect } from 'react'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Pencil, Trash2, Plus } from 'lucide-react'

interface Subject {
  id?: number
  name: string
  description?: string
}

interface Course {
  id?: number
  name: string
  description: string
  duration: number
  subjects: Subject[]
}

interface CourseFormData {
  name: string
  description: string
  durationMonths: number
  subjects: Subject[]
}

export default function CourseSetupPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [courses, setCourses] = useState<Course[]>([])
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)
  const [formData, setFormData] = useState<CourseFormData>({
    name: '',
    description: '',
    durationMonths: 1,
    subjects: []
  })
  const [subjectInput, setSubjectInput] = useState<Subject>({ 
    name: '', 
    description: '' 
  })
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | null
    message: string
  }>({ type: null, message: '' })

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/admin/course-setup')
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to fetch courses')
      }

      const data = await response.json()
      if (Array.isArray(data)) {
        setCourses(data)
      } else {
        console.error('Unexpected response format:', data)
        throw new Error('Invalid response format')
      }
    } catch (error) {
      console.error('Error fetching courses:', error)
      setNotification({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to fetch courses'
      })
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setFormData(prev => ({
      ...prev,
      [id]: id === 'durationMonths' ? parseInt(value) || 1 : value
    }))
  }

  const handleSubjectChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setSubjectInput(prev => ({ ...prev, [name]: value }))
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
      const url = editingCourse 
        ? `/api/admin/course-setup?id=${editingCourse.id}`
        : '/api/admin/course-setup'

      const method = editingCourse ? 'PUT' : 'POST'
      
      const dataToSend = {
        ...(editingCourse?.id ? { id: editingCourse.id } : {}),
        name: formData.name,
        description: formData.description || "",
        duration: formData.durationMonths,
        subjects: formData.subjects.map(subject => ({
          name: subject.name,
          description: subject.description || ""
        }))
      }

      console.log('Sending data:', dataToSend)
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend)
      })

      const responseData = await response.json()

      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to save course')
      }

      setNotification({
        type: 'success',
        message: `Course ${editingCourse ? 'updated' : 'created'} successfully!`
      })

      fetchCourses()
      resetForm()
      setIsModalOpen(false)

    } catch (error) {
      console.error('Error saving course:', error)
      setNotification({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to save course'
      })
    }
  }

  const handleEdit = (course: Course) => {
    setEditingCourse(course)
    setFormData({
      name: course.name,
      description: course.description || '',
      durationMonths: course.duration,
      subjects: course.subjects || []
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (courseId: number) => {
    if (!confirm('Are you sure you want to delete this course?')) return

    try {
      const response = await fetch(`/api/admin/course-setup?id=${courseId}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete course')
      }

      setNotification({
        type: 'success',
        message: 'Course deleted successfully'
      })

      fetchCourses()
    } catch (error) {
      console.error('Error deleting course:', error)
      setNotification({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to delete course'
      })
    }
  }

  const resetForm = () => {
    setEditingCourse(null)
    setFormData({
      name: '',
      description: '',
      durationMonths: 1,
      subjects: []
    })
    setSubjectInput({ name: '', description: '' })
  }

  return (
    <div className="container mx-auto py-6">
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

      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Course Management</h1>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Course
          </Button>
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg w-full max-w-2xl">
              <h2 className="text-xl font-bold mb-4">
                {editingCourse ? 'Edit Course' : 'Add New Course'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Course Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <Label htmlFor="durationMonths">Duration (months)</Label>
                  <Input
                    id="durationMonths"
                    type="number"
                    min="1"
                    value={formData.durationMonths}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <Label>Subjects</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      name="name"
                      placeholder="Subject name"
                      value={subjectInput.name}
                      onChange={handleSubjectChange}
                    />
                    <Input
                      name="description"
                      placeholder="Description (optional)"
                      value={subjectInput.description}
                      onChange={handleSubjectChange}
                    />
                    <Button type="button" onClick={handleAddSubject}>
                      Add
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    {formData.subjects.map((subject, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                        <span className="flex-1">{subject.name}</span>
                        {subject.description && (
                          <span className="text-gray-500 text-sm">
                            - {subject.description}
                          </span>
                        )}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveSubject(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-2 mt-4">
                  <Button type="button" variant="outline" onClick={() => {
                    resetForm()
                    setIsModalOpen(false)
                  }}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingCourse ? 'Update' : 'Create'} Course
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subjects
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {courses.map((course) => (
                <tr key={course.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{course.name}</td>
                  <td className="px-6 py-4">{course.description}</td>
                  <td className="px-6 py-4">{course.duration} months</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-2">
                      {course.subjects?.map((subject, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {subject.name}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(course)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(course.id!)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
