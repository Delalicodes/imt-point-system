"use client"

import { useState, useEffect } from 'react'
import { Pencil, Trash2, Eye, MoreHorizontal, Info, X } from 'lucide-react'
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
  DialogClose,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { User, AtSign, Mail, Phone, MapPin, GraduationCap, Clock, Activity, Star, Calendar } from 'lucide-react'

type Student = {
  id: number
  firstName: string
  lastName: string
  username: string
  email: string
  phone?: string
  address?: string
  course: string
  duration: number
  status: 'ACTIVE' | 'ON_HOLD' | 'COMPLETED'
  points: number
  createdAt: string
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [studentToView, setStudentToView] = useState<Student | null>(null)

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
      <div className="flex items-center justify-center min-h-[400px]">
        Loading...
      </div>
    )
  }

  return (
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
              <TableRow 
                key={student.id}
                className="cursor-pointer transition-colors hover:bg-gray-50 active:bg-gray-100"
                onClick={() => {
                  setStudentToView(student)
                  setShowConfirmDialog(true)
                }}
              >
                <TableCell>{student.firstName} {student.lastName}</TableCell>
                <TableCell>{student.course}</TableCell>
                <TableCell>{student.duration} months</TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
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
                <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem
                        onClick={() => {
                          setStudentToView(student)
                          setShowConfirmDialog(true)
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

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent className="max-w-[400px] p-0 overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-blue-50">
                <Info className="h-4 w-4 text-blue-500" />
              </div>
              <AlertDialogTitle className="text-base font-medium m-0">View Student Details</AlertDialogTitle>
            </div>
            <AlertDialogCancel className="p-2 hover:bg-gray-100 rounded-full border-0">
              <X className="h-4 w-4" />
            </AlertDialogCancel>
          </div>
            
          <div className="p-4">
            <AlertDialogDescription className="text-sm text-gray-600 mb-6">
              Do you want to view details for {studentToView?.firstName} {studentToView?.lastName}?
            </AlertDialogDescription>
              
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowConfirmDialog(false)}
                className="px-4"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setSelectedStudent(studentToView)
                  setIsViewModalOpen(true)
                  setShowConfirmDialog(false)
                }}
                className="bg-blue-500 hover:bg-blue-600 px-4"
              >
                View Details
              </Button>
            </div>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {selectedStudent && (
        <StudentDetailsDialog
          student={selectedStudent}
          open={isViewModalOpen}
          onOpenChange={setIsViewModalOpen}
        />
      )}

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
  )
}

function StudentDetailsDialog({
  student,
  open,
  onOpenChange,
}: {
  student: Student | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  if (!student) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[400px] p-0 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-blue-50">
              <User className="h-4 w-4 text-blue-500" />
            </div>
            <DialogTitle className="text-base font-medium m-0">Student Details</DialogTitle>
          </div>
          <DialogClose className="p-2 hover:bg-gray-100 rounded-full">
            <X className="h-4 w-4" />
          </DialogClose>
        </div>
        
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              <User className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">Full Name</p>
                <p className="text-sm font-medium">{student.firstName} {student.lastName}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              <AtSign className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">Username</p>
                <p className="text-sm font-medium">{student.username}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              <Mail className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p className="text-sm font-medium">{student.email}</p>
              </div>
            </div>

            {student.phone ? (
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <Phone className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500">Phone</p>
                  <p className="text-sm font-medium">{student.phone}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <GraduationCap className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500">Course</p>
                  <p className="text-sm font-medium">{student.course}</p>
                </div>
              </div>
            )}

            {student.address && (
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg col-span-2">
                <MapPin className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500">Address</p>
                  <p className="text-sm font-medium">{student.address}</p>
                </div>
              </div>
            )}

            {!student.phone && (
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <Clock className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500">Duration</p>
                  <p className="text-sm font-medium">{student.duration} months</p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              <Activity className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">Status</p>
                <p className="text-sm font-medium">{student.status}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              <Star className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">Points</p>
                <p className="text-sm font-medium">{student.points} points</p>
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              <Calendar className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">Join Date</p>
                <p className="text-sm font-medium">
                  {new Date(student.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="px-4"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
