"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Notification } from "@/components/ui/notification"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Loader2, Plus, Trophy } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

interface Student {
  id: number
  firstName: string
  lastName: string
  username: string
  points: number
  status: string
}

interface Transaction {
  id: number
  points: number
  reason: string
  type: string
  createdAt: string
  student: {
    id: number
    firstName: string
    lastName: string
    username: string
  }
  awardedBy: {
    id: number
    firstName: string
    lastName: string
    username: string
  }
}

const formSchema = z.object({
  studentId: z.number({
    required_error: "Please select a student",
  }),
  points: z.number({
    required_error: "Please enter points",
  }).min(1, "Points must be at least 1"),
  reason: z.string({
    required_error: "Please provide a reason",
  }).min(3, "Reason must be at least 3 characters"),
})

export default function PointsPanel() {
  const [students, setStudents] = useState<Student[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      points: 1,
      reason: "",
    },
  })

  useEffect(() => {
    fetchStudents()
    fetchTransactions()
  }, [])

  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/students')
      const data = await response.json()
      setStudents(data)
    } catch (error) {
      console.error('Error fetching students:', error)
      showNotification('error', 'Failed to load students')
    }
  }

  const fetchTransactions = async () => {
    try {
      const response = await fetch('/api/points/transactions')
      const data = await response.json()
      setTransactions(data)
    } catch (error) {
      console.error('Error fetching transactions:', error)
      showNotification('error', 'Failed to load transactions')
    }
  }

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message })
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true)
      const response = await fetch('/api/points/award', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        throw new Error('Failed to award points')
      }

      // Refresh data
      await Promise.all([
        fetchStudents(),
        fetchTransactions()
      ])
      
      // Reset form and close dialog
      form.reset()
      setSelectedStudent(null)
      setIsDialogOpen(false)
      showNotification('success', 'Points awarded successfully')
    } catch (error) {
      console.error('Error awarding points:', error)
      showNotification('error', 'Failed to award points')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Notification
        type={notification.type}
        message={notification.message}
        onClose={() => setNotification({ type: null, message: '' })}
      />

      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Points Management</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Award Points
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Award Points</DialogTitle>
              <DialogDescription>
                Select a student and enter the number of points to award.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="studentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Select Student</FormLabel>
                      <Select
                        value={field.value?.toString()}
                        onValueChange={(value) => {
                          const student = students.find(s => s.id === parseInt(value))
                          field.onChange(parseInt(value))
                          setSelectedStudent(student || null)
                        }}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a student" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {students.map((student) => (
                            <SelectItem
                              key={student.id}
                              value={student.id.toString()}
                            >
                              {student.firstName} {student.lastName} ({student.points} points)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        {selectedStudent ? (
                          <span className="text-green-600 dark:text-green-400">
                            Selected: {selectedStudent.firstName} {selectedStudent.lastName}
                          </span>
                        ) : (
                          "Select a student"
                        )}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="points"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Points</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          {...field}
                          onChange={e => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription>
                        Enter the number of points to award
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="reason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reason</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., Excellent performance" />
                      </FormControl>
                      <FormDescription>
                        Provide a reason for awarding points
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Awarding Points...
                    </>
                  ) : (
                    'Award Points'
                  )}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {students
          .sort((a, b) => b.points - a.points)
          .slice(0, 3)
          .map((student, index) => (
          <div
            key={student.id}
            className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-2 h-2 rounded-br-lg bg-amber-500" />
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {index === 0 && (
                    <span className="text-amber-500 text-lg">👑</span>
                  )}
                  <h3 className="font-medium text-lg">
                    {student.firstName} {student.lastName}
                  </h3>
                </div>
                <p className="text-sm text-gray-500">@{student.username}</p>
                <div className="flex items-center gap-2 text-amber-500">
                  <Trophy className="h-5 w-5" />
                  <span className="font-bold text-lg">{student.points} points</span>
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-200">
                #{index + 1}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Points</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Awarded By</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">
                      {transaction.student.firstName} {transaction.student.lastName}
                    </div>
                    <div className="text-sm text-gray-500">
                      @{transaction.student.username}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-amber-500">
                    <Trophy className="h-4 w-4" />
                    <span className="font-medium">+{transaction.points}</span>
                  </div>
                </TableCell>
                <TableCell>{transaction.reason}</TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">
                      {transaction.awardedBy.firstName} {transaction.awardedBy.lastName}
                    </div>
                    <div className="text-sm text-gray-500">
                      @{transaction.awardedBy.username}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {new Date(transaction.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
