"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { toast } from 'sonner'

interface RegistrationMainProps {
  userId: string
  isAdmin: boolean
}

interface Registration {
  id: string
  studentName: string
  course: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  submittedAt: string
}

export default function RegistrationMain({ userId, isAdmin }: RegistrationMainProps) {
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fetchRegistrations()
  }, [])

  const fetchRegistrations = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/registration')
      if (!response.ok) {
        throw new Error('Failed to fetch registrations')
      }
      const data = await response.json()
      setRegistrations(data)
    } catch (error) {
      console.error('Error fetching registrations:', error)
      toast.error('Failed to load registrations')
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusChange = async (id: string, newStatus: 'APPROVED' | 'REJECTED') => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/registration/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error('Failed to update registration status')
      }

      await fetchRegistrations()
      toast.success(`Registration ${newStatus.toLowerCase()}`)
    } catch (error) {
      console.error('Error updating registration:', error)
      toast.error('Failed to update registration')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Registration Management</h1>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student Name</TableHead>
              <TableHead>Course</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Submitted At</TableHead>
              {isAdmin && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={isAdmin ? 5 : 4} className="text-center py-4">
                  Loading registrations...
                </TableCell>
              </TableRow>
            ) : registrations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isAdmin ? 5 : 4} className="text-center py-4 text-gray-500">
                  No registrations found
                </TableCell>
              </TableRow>
            ) : (
              registrations.map((registration) => (
                <TableRow key={registration.id}>
                  <TableCell>{registration.studentName}</TableCell>
                  <TableCell>{registration.course}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        registration.status === 'APPROVED'
                          ? 'bg-green-100 text-green-800'
                          : registration.status === 'REJECTED'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {registration.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    {new Date(registration.submittedAt).toLocaleDateString()}
                  </TableCell>
                  {isAdmin && (
                    <TableCell className="text-right space-x-2">
                      {registration.status === 'PENDING' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStatusChange(registration.id, 'APPROVED')}
                            disabled={isLoading}
                            className="bg-green-50 text-green-700 hover:bg-green-100"
                          >
                            Approve
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStatusChange(registration.id, 'REJECTED')}
                            disabled={isLoading}
                            className="bg-red-50 text-red-700 hover:bg-red-100"
                          >
                            Reject
                          </Button>
                        </>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
