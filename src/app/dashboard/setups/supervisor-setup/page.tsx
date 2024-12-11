'use client'

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
import { Pencil, Trash2 } from 'lucide-react'
import DashboardLayout from '@/components/layout/dashboard-layout'
import { toast } from 'sonner'
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell 
} from '@/components/ui/table'

interface Supervisor {
  id: number
  name: string
}

export default function SupervisorSetup() {
  const [supervisors, setSupervisors] = useState<Supervisor[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [editingSupervisor, setEditingSupervisor] = useState<Supervisor | null>(null)
  const [supervisorName, setSupervisorName] = useState('')

  useEffect(() => {
    fetchSupervisors()
  }, [])

  const fetchSupervisors = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/admin/supervisor-setup')
      
      if (!response.ok) {
        const error = await response.text()
        throw new Error(error)
      }
      
      const supervisors = await response.json()
      setSupervisors(supervisors)
    } catch (error) {
      console.error('Error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to load supervisors')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!supervisorName.trim()) {
      toast.error('Supervisor name is required')
      return
    }

    try {
      setIsLoading(true)
      const response = await fetch('/api/admin/supervisor-setup', {
        method: editingSupervisor ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingSupervisor?.id,
          name: supervisorName.trim()
        })
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to save supervisor')
      }

      await fetchSupervisors()
      setIsOpen(false)
      setSupervisorName('')
      setEditingSupervisor(null)
      toast.success(editingSupervisor ? 'Supervisor updated' : 'Supervisor created')
    } catch (error) {
      console.error('Error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to save supervisor')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this supervisor?')) return

    try {
      setIsLoading(true)
      const response = await fetch(`/api/admin/supervisor-setup?id=${id}`, {
        method: 'DELETE'
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete supervisor')
      }

      await fetchSupervisors()
      toast.success('Supervisor deleted')
    } catch (error) {
      console.error('Error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to delete supervisor')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (supervisor: Supervisor) => {
    setEditingSupervisor(supervisor)
    setSupervisorName(supervisor.name)
    setIsOpen(true)
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Supervisor Setup</h1>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  setEditingSupervisor(null)
                  setSupervisorName('')
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
                    value={supervisorName}
                    onChange={(e) => setSupervisorName(e.target.value)}
                    placeholder="Enter supervisor name"
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

        <div className="bg-white rounded-lg shadow">
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell className="px-6 py-3 text-left text-sm font-semibold">Name</TableCell>
                <TableCell className="px-6 py-3 text-right text-sm font-semibold">Actions</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={2} className="px-6 py-4 text-center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : supervisors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={2} className="px-6 py-4 text-center text-gray-500">
                    No supervisors found
                  </TableCell>
                </TableRow>
              ) : (
                supervisors.map((supervisor) => (
                  <TableRow key={supervisor.id}>
                    <TableCell className="px-6 py-4">{supervisor.name}</TableCell>
                    <TableCell className="px-6 py-4 text-right space-x-2">
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
    </DashboardLayout>
  )
}
