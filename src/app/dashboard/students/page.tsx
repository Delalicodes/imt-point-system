"use client"

import { useState, useEffect } from 'react'
import { Pencil, Trash2, Eye, MoreHorizontal } from 'lucide-react'
import DashboardLayout from '@/components/layout/dashboard-layout'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

type Student = {
  id: number
  firstName: string
  lastName: string
  course: string
  duration: number
  status: 'ACTIVE' | 'ON_HOLD' | 'COMPLETED'
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  useEffect(() => {
    fetchStudents()
  }, [])

  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/students')
      if (!response.ok) throw new Error('Failed to fetch students')
      const data = await response.json()
      setStudents(data)
    } catch (error) {
      toast.error('Failed to load students')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (studentId: number, newStatus: Student['status']) => {
    try {
      const response = await fetch(`/api/students/${studentId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) throw new Error('Failed to update status')
      
      setStudents(prev => prev.map(student => 
        student.id === studentId ? { ...student, status: newStatus } : student
      ))
      
      toast.success('Status updated successfully')
    } catch (error) {
      toast.error('Failed to update status')
      console.error(error)
    }
  }

  const handleDelete = async (studentId: number) => {
    if (!confirm('Are you sure you want to delete this student?')) return

    try {
      const response = await fetch(`/api/students/${studentId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete student')
      
      setStudents(prev => prev.filter(student => student.id !== studentId))
      toast.success('Student deleted successfully')
    } catch (error) {
      toast.error('Failed to delete student')
      console.error(error)
    }
  }

  const getStatusBadge = (status: Student['status']) => {
    const statusStyles = {
      ACTIVE: 'bg-green-100 text-green-800',
      ON_HOLD: 'bg-yellow-100 text-yellow-800',
      COMPLETED: 'bg-blue-100 text-blue-800',
    }

    return (
      <Badge className={statusStyles[status]}>
        {status.replace('_', ' ')}
      </Badge>
    )
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          Loading...
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto py-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Students</h1>
        </div>

        <div className="bg-white rounded-lg shadow">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>{student.firstName} {student.lastName}</TableCell>
                  <TableCell>{student.course}</TableCell>
                  <TableCell>{student.duration} months</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        {getStatusBadge(student.status)}
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => handleStatusChange(student.id, 'ACTIVE')}>
                          Active
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange(student.id, 'ON_HOLD')}>
                          On Hold
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange(student.id, 'COMPLETED')}>
                          Completed
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedStudent(student)
                            setIsViewModalOpen(true)
                          }}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedStudent(student)
                            setIsEditModalOpen(true)
                          }}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(student.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* View Details Modal */}
        <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Student Details</DialogTitle>
            </DialogHeader>
            {selectedStudent && (
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium">Name</h4>
                  <p>{selectedStudent.firstName} {selectedStudent.lastName}</p>
                </div>
                <div>
                  <h4 className="font-medium">Course</h4>
                  <p>{selectedStudent.course}</p>
                </div>
                <div>
                  <h4 className="font-medium">Duration</h4>
                  <p>{selectedStudent.duration} months</p>
                </div>
                <div>
                  <h4 className="font-medium">Status</h4>
                  <p>{getStatusBadge(selectedStudent.status)}</p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Student</DialogTitle>
            </DialogHeader>
            {/* Add edit form here */}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
