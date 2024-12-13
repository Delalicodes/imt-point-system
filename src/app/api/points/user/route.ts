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

    // Get user's points and recent transactions
    const student = await prisma.student.findUnique({
      where: { id: user.id },
      select: {
        points: true,
        pointTransactions: {
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
        studentId: user.id,
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        }
      }
    })

    return NextResponse.json({
      points: student.points,
      rank,
      totalStudents,
      recentActivities,
      recentTransactions: student.pointTransactions
    })
  } catch (error) {
    console.error('Error fetching user points:', error)
    return NextResponse.json(
      { error: 'Failed to fetch points' },
      { status: 500 }
    )
  }
}
