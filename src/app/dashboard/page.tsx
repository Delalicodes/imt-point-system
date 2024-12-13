"use client"

import React, { useState, useEffect } from 'react'
import { useUser } from "@/contexts/UserContext"
import { format } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface UserPoints {
  points: number
  rank: number
  totalStudents: number
  recentActivities: number
  recentTransactions: {
    points: number
    reason: string
    type: string
    createdAt: string
  }[]
}

function PointsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Points</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-7 w-20" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Rank</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-7 w-24" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Recent Activities</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-7 w-16" />
        </CardContent>
      </Card>
    </div>
  )
}

function TransactionsSkeleton() {
  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="ml-4 space-y-1">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default function DashboardPage() {
  const { userData } = useUser()
  const [pointsData, setPointsData] = useState<UserPoints | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchPoints() {
      try {
        const response = await fetch('/api/points/user', {
          credentials: 'include'
        })
        if (!response.ok) {
          throw new Error('Failed to fetch points')
        }
        const data = await response.json()
        setPointsData(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (userData) {
      fetchPoints()
    }
  }, [userData])

  if (!userData) {
    return null
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-50 text-red-500 p-4 rounded-md">
          Error loading dashboard data: {error}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        </div>
        <PointsSkeleton />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <TransactionsSkeleton />
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Points</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pointsData?.points}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rank</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {pointsData?.rank} / {pointsData?.totalStudents}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pointsData?.recentActivities}</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pointsData?.recentTransactions.map((transaction, i) => (
                <div key={i} className="flex items-center">
                  <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
                    transaction.type === 'AWARD' ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    <span className={transaction.type === 'AWARD' ? 'text-green-600' : 'text-red-600'}>
                      {transaction.type === 'AWARD' ? '+' : '-'}
                    </span>
                  </div>
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">{transaction.reason}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(transaction.createdAt), 'PPpp')}
                    </p>
                  </div>
                  <div className="ml-auto">
                    <p className={`text-sm font-medium ${
                      transaction.type === 'AWARD' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'AWARD' ? '+' : '-'}{transaction.points} points
                    </p>
                  </div>
                </div>
              ))}
              {pointsData?.recentTransactions.length === 0 && (
                <div className="text-center py-4 text-muted-foreground">
                  No recent transactions
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
