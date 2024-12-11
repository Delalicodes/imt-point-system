import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export async function GET() {
  try {
    const students = await prisma.student.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        username: true,
        status: true,
        courses: {
          select: {
            name: true,
            duration: true
          }
        }
      },
      where: {
        status: "ACTIVE"
      },
      orderBy: {
        username: 'asc'
      }
    })

    // Transform the data to include course name and duration
    const transformedStudents = students.map(student => ({
      id: student.id,
      firstName: student.firstName,
      lastName: student.lastName,
      username: student.username,
      status: student.status,
      course: student.courses[0]?.name || 'No Course',
      duration: student.courses[0]?.duration || 0
    }))

    return NextResponse.json(transformedStudents)
  } catch (error) {
    console.error('Error fetching students:', error)
    return NextResponse.json(
      { error: 'Failed to fetch students' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { firstName, lastName, username, courseId, supervisorId } = body

    const student = await prisma.student.create({
      data: {
        firstName,
        lastName,
        username,
        courses: {
          connect: courseId ? [{ id: courseId }] : []
        },
        ...(supervisorId && {
          supervisor: {
            connect: { id: supervisorId }
          }
        })
      },
      include: {
        courses: true,
        supervisor: true
      }
    })

    return NextResponse.json(student)
  } catch (error) {
    console.error('Failed to create student:', error)
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return NextResponse.json(
          { error: 'Username already exists' },
          { status: 400 }
        )
      }
    }
    return NextResponse.json(
      { error: 'Failed to create student' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, firstName, lastName, username, courseId, supervisorId, status } = body

    const student = await prisma.student.update({
      where: { id },
      data: {
        firstName,
        lastName,
        username,
        status,
        courses: courseId ? {
          set: [{ id: courseId }]
        } : undefined,
        supervisor: supervisorId ? {
          connect: { id: supervisorId }
        } : undefined
      },
      include: {
        courses: true,
        supervisor: true
      }
    })

    return NextResponse.json(student)
  } catch (error) {
    console.error('Failed to update student:', error)
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return NextResponse.json(
          { error: 'Student not found' },
          { status: 404 }
        )
      }
    }
    return NextResponse.json(
      { error: 'Failed to update student' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = parseInt(searchParams.get('id') || '')

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid student ID' },
        { status: 400 }
      )
    }

    await prisma.student.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete student:', error)
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return NextResponse.json(
          { error: 'Student not found' },
          { status: 404 }
        )
      }
    }
    return NextResponse.json(
      { error: 'Failed to delete student' },
      { status: 500 }
    )
  }
}

function calculateMonthsLeft(startDate: Date, duration: number): number {
  const start = new Date(startDate)
  const now = new Date()
  const monthsPassed = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth())
  const monthsLeft = duration - monthsPassed
  return Math.max(0, monthsLeft)
}
