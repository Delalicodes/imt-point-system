import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { status } = await request.json()
    const studentId = parseInt(params.id)

    if (!['ACTIVE', 'ON_HOLD', 'COMPLETED'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      )
    }

    const updatedStudent = await prisma.student.update({
      where: { id: studentId },
      data: { status },
    })

    return NextResponse.json(updatedStudent)
  } catch (error) {
    console.error('Failed to update student status:', error)
    return NextResponse.json(
      { error: 'Failed to update student status' },
      { status: 500 }
    )
  }
}
