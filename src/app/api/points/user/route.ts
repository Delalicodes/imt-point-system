import { NextResponse } from "next/server"
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    // Get user data from cookie
    const cookieStore = cookies()
    const userData = cookieStore.get('user_data')

    if (!userData) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const user = JSON.parse(userData.value)
    console.log('User data:', user) // Debug log

    // Only proceed if user is a student
    if (user.type !== 'student') {
      return NextResponse.json({
        points: 0,
        rank: '-',
        totalStudents: 0,
        recentActivities: 0,
        recentTransactions: []
      })
    }

    // Find student by username
    const student = await prisma.student.findUnique({
      where: { username: user.username },
      select: {
        id: true,
        points: true,
        receivedPoints: {
          take: 5,
          orderBy: {
            createdAt: 'desc'
          },
          select: {
            points: true,
            reason: true,
            type: true,
            createdAt: true
          }
        }
      }
    })

    console.log('Student data:', student) // Debug log

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      )
    }

    // Get student's rank
    const studentsWithHigherPoints = await prisma.student.count({
      where: {
        points: {
          gt: student.points
        }
      }
    })

    const totalStudents = await prisma.student.count()
    const rank = studentsWithHigherPoints + 1

    // Get recent activities count (last 30 days)
    const recentActivities = await prisma.pointTransaction.count({
      where: {
        studentId: student.id, 
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        }
      }
    })

    return NextResponse.json({
      points: student.points || 0,
      rank,
      totalStudents,
      recentActivities,
      recentTransactions: student.receivedPoints || []
    })
  } catch (error) {
    console.error('Error fetching user points:', error)
    return NextResponse.json(
      { error: 'Failed to fetch points', details: error.message },
      { status: 500 }
    )
  }
}
