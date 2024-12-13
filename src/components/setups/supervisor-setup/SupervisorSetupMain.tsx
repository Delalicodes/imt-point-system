"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

interface SupervisorSetupMainProps {
  userId: string
}

interface Supervisor {
  id: string
  name: string
  email: string
  department: string
}

export default function SupervisorSetupMain({ userId }: SupervisorSetupMainProps) {
  const [supervisors, setSupervisors] = useState<Supervisor[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [editingSupervisor, setEditingSupervisor] = useState<Supervisor | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: ''
  })

  useEffect(() => {
    fetchSupervisors()
  }, [])

  const fetchSupervisors = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/admin/supervisor-setup')
      if (!response.ok) {
        throw new Error('Failed to fetch supervisors')
      }
      const data = await response.json()
      setSupervisors(data)
    } catch (error) {
      console.error('Error fetching supervisors:', error)
      toast.error('Failed to load supervisors')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim() || !formData.email.trim() || !formData.department.trim()) {
      toast.error('All fields are required')
      return
    }

    try {
      setIsLoading(true)
      const response = await fetch('/api/admin/supervisor-setup', {
        method: editingSupervisor ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: editingSupervisor?.id,
          ...formData,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save supervisor')
      }

      await fetchSupervisors()
      setIsOpen(false)
      setFormData({ name: '', email: '', department: '' })
      setEditingSupervisor(null)
      toast.success(editingSupervisor ? 'Supervisor updated' : 'Supervisor created')
    } catch (error) {
      console.error('Error saving supervisor:', error)
      toast.error('Failed to save supervisor')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this supervisor?')) return

    try {
      setIsLoading(true)
      const response = await fetch(`/api/admin/supervisor-setup?id=${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete supervisor')
      }

      await fetchSupervisors()
      toast.success('Supervisor deleted')
    } catch (error) {
      console.error('Error deleting supervisor:', error)
      toast.error('Failed to delete supervisor')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (supervisor: Supervisor) => {
    setEditingSupervisor(supervisor)
    setFormData({
      name: supervisor.name,
      email: supervisor.email,
      department: supervisor.department,
    })
    setIsOpen(true)
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Supervisor Setup</h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingSupervisor(null)
                setFormData({ name: '', email: '', department: '' })
              }}
              disabled={isLoading}
            >
              Add Supervisor
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingSupervisor ? 'Edit Supervisor' : 'Add Supervisor'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter supervisor name"
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter supervisor email"
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  placeholder="Enter department"
                  disabled={isLoading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Loading...' : (editingSupervisor ? 'Update Supervisor' : 'Add Supervisor')}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Department</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-4">
                  Loading supervisors...
                </TableCell>
              </TableRow>
            ) : supervisors.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-4 text-gray-500">
                  No supervisors found
                </TableCell>
              </TableRow>
            ) : (
              supervisors.map((supervisor) => (
                <TableRow key={supervisor.id}>
                  <TableCell>{supervisor.name}</TableCell>
                  <TableCell>{supervisor.email}</TableCell>
                  <TableCell>{supervisor.department}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(supervisor)}
                      disabled={isLoading}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(supervisor.id)}
                      disabled={isLoading}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
