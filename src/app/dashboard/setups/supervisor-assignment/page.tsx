"use client"

import { useState, useEffect } from 'react'
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell 
} from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useUser } from '@/contexts/UserContext'

interface Student {
  id: number
  firstName: string
  surname: string
  supervisor?: {
    id: number
    name: string
  }
}

interface Supervisor {
  id: number
  name: string
}

export default function SupervisorAssignment() {
  const { userData } = useUser()
  const [students, setStudents] = useState<Student[]>([])
  const [supervisors, setSupervisors] = useState<Supervisor[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<string>('')
  const [selectedSupervisor, setSelectedSupervisor] = useState<string>('')
  const [editMode, setEditMode] = useState(false)

  const fetchData = async () => {
    try {
      const response = await fetch('/api/admin/supervisor-assignment')
      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch data')
      }

      setStudents(data.students)
      setSupervisors(data.supervisors)
      setLoading(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to fetch data')
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleAssign = async () => {
    if (!selectedStudent || !selectedSupervisor) return

    try {
      const response = await fetch('/api/admin/supervisor-assignment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: selectedStudent,
          supervisorId: selectedSupervisor,
        }),
      })

      const data = await response.json()
      if (!data.success) {
        throw new Error(data.error)
      }

      await fetchData()
      resetModal()
      toast.success('Supervisor assigned successfully')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to assign supervisor')
    }
  }

  const handleDelete = async (studentId: number) => {
    try {
      const response = await fetch('/api/admin/supervisor-assignment', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId }),
      })

      const data = await response.json()
      if (!data.success) {
        throw new Error(data.error)
      }

      await fetchData()
      toast.success('Supervisor removed successfully')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to remove supervisor')
    }
  }

  const handleEdit = (student: Student) => {
    setSelectedStudent(student.id.toString())
    setSelectedSupervisor(student.supervisor?.id.toString() || '')
    setEditMode(true)
    setIsModalOpen(true)
  }

  const resetModal = () => {
    setIsModalOpen(false)
    setSelectedStudent('')
    setSelectedSupervisor('')
    setEditMode(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-gray-800 dark:text-gray-300">Loading assignments...</p>
        </div>
      </div>
    )
  }

  if (!userData) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="text-center">
          <p className="text-red-400">Error: Unable to load user session</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-2 text-primary hover:text-primary/80"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (userData.role !== 'ADMIN') {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="text-center">
          <p className="text-red-400">Access Denied: Admin privileges required</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Supervisor Assignments</h1>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditMode(false)}>
              Assign Supervisor
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editMode ? 'Edit Supervisor Assignment' : 'Assign Supervisor'}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label>Student</label>
                <Select
                  value={selectedStudent}
                  onValueChange={setSelectedStudent}
                  disabled={editMode}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a student" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((student) => (
                      <SelectItem key={student.id} value={student.id.toString()}>
                        {student.surname}, {student.firstName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <label>Supervisor</label>
                <Select
                  value={selectedSupervisor}
                  onValueChange={setSelectedSupervisor}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a supervisor" />
                  </SelectTrigger>
                  <SelectContent>
                    {supervisors.map((supervisor) => (
                      <SelectItem key={supervisor.id} value={supervisor.id.toString()}>
                        {supervisor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={resetModal}>
                Cancel
              </Button>
              <Button onClick={handleAssign}>
                {editMode ? 'Update' : 'Assign'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Current Supervisor</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((student) => (
              <TableRow key={student.id}>
                <TableCell>
                  {student.surname}, {student.firstName}
                </TableCell>
                <TableCell>
                  {student.supervisor?.name || 'Not assigned'}
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(student)}
                  >
                    Edit
                  </Button>
                  {student.supervisor && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(student.id)}
                    >
                      Remove
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
