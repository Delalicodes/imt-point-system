import { NextResponse } from "next/server"
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const { firstName, lastName, username, course } = data

    console.log('Received registration data:', { firstName, lastName, username, course })

    if (!firstName || !lastName || !username || !course) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Check if username already exists
    const existingStudent = await prisma.student.findUnique({
      where: { username }
    })

    if (existingStudent) {
      return NextResponse.json(
        { error: 'Username already exists' },
        { status: 400 }
      )
    }

    // First, check if the course exists
    const courseExists = await prisma.course.findUnique({
      where: { id: parseInt(course) }
    })

    if (!courseExists) {
      return NextResponse.json(
        { error: 'Selected course does not exist' },
        { status: 400 }
      )
    }

    // Create new student with course connection
    const student = await prisma.student.create({
      data: {
        firstName,
        lastName,
        username,
        status: 'ACTIVE',
        points: 0,
        courses: {
          connect: [{ id: parseInt(course) }]
        }
      },
      include: {
        courses: true
      }
    })

    console.log('Created student:', student)

    return NextResponse.json({ 
      success: true,
      message: 'Student registered successfully',
      student
    })
  } catch (error: any) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to register student' },
      { status: 500 }
    )
  }
}
