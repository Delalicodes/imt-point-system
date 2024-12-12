import { NextResponse } from "next/server"
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const { studentId, points, reason } = await request.json()

    // Validate input
    if (!studentId || !points || !reason) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Start a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Get the student
      const student = await tx.student.findUnique({
        where: { id: studentId }
      })

      if (!student) {
        throw new Error('Student not found')
      }

      // Create point transaction
      const transaction = await tx.pointTransaction.create({
        data: {
          points,
          reason,
          type: 'AWARD',
          student: { connect: { id: studentId } },
          awardedBy: { connect: { id: studentId } } // For now, use same student as awarded by
        }
      })

      // Update student points
      const updatedStudent = await tx.student.update({
        where: { id: studentId },
        data: {
          points: {
            increment: points
          }
        }
      })

      return { transaction, student: updatedStudent }
    })

    return NextResponse.json({
      success: true,
      message: 'Points awarded successfully',
      data: result
    })
  } catch (error: any) {
    console.error('Error awarding points:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to award points' },
      { status: 500 }
    )
  }
}
