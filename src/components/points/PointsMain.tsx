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

interface PointsMainProps {
  userId: string
  isAdmin: boolean
}

interface PointRecord {
  id: string
  studentName: string
  points: number
  reason: string
  date: string
}

export default function PointsMain({ userId, isAdmin }: PointsMainProps) {
  const [points, setPoints] = useState<PointRecord[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fetchPoints()
  }, [])

  const fetchPoints = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/points')
      if (!response.ok) {
        throw new Error('Failed to fetch points')
      }
      const data = await response.json()
      setPoints(data)
    } catch (error) {
      console.error('Error fetching points:', error)
      toast.error('Failed to load points')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Points Management</h1>
        {isAdmin && (
          <Button onClick={() => toast.info('Add points feature coming soon')}>
            Add Points
          </Button>
        )}
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student Name</TableHead>
              <TableHead>Points</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Date</TableHead>
              {isAdmin && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={isAdmin ? 5 : 4} className="text-center py-4">
                  Loading points...
                </TableCell>
              </TableRow>
            ) : points.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isAdmin ? 5 : 4} className="text-center py-4 text-gray-500">
                  No points records found
                </TableCell>
              </TableRow>
            ) : (
              points.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>{record.studentName}</TableCell>
                  <TableCell>{record.points}</TableCell>
                  <TableCell>{record.reason}</TableCell>
                  <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                  {isAdmin && (
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toast.info('Edit feature coming soon')}
                      >
                        Edit
                      </Button>
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
