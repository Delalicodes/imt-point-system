import { NextResponse } from "next/server"
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const { firstName, lastName, username, course, email, phone, address } = data

    console.log('Received registration data:', { firstName, lastName, username, course, email, phone, address })

    if (!firstName || !lastName || !username || !course || !email) {
      return NextResponse.json(
        { error: 'First name, last name, username, course, and email are required' },
        { status: 400 }
      )
    }

    // Create new student with course connection
    try {
      const courseId = parseInt(course)
      if (isNaN(courseId)) {
        return NextResponse.json(
          { error: 'Invalid course ID' },
          { status: 400 }
        )
      }

      // First, check if the course exists
      const courseExists = await prisma.course.findUnique({
        where: { id: courseId }
      })

      if (!courseExists) {
        return NextResponse.json(
          { error: `Course with ID ${courseId} does not exist` },
          { status: 400 }
        )
      }

      // Check if username or email already exists
      const existingStudent = await prisma.student.findFirst({
        where: {
          OR: [
            { username },
            { email }
          ]
        }
      })

      if (existingStudent) {
        return NextResponse.json(
          { error: existingStudent.username === username ? 'Username already exists' : 'Email already exists' },
          { status: 400 }
        )
      }

      console.log('Attempting to create student with data:', {
        firstName,
        lastName,
        username,
        email,
        phone,
        address,
        courseId
      })

      // Create new student
      const student = await prisma.student.create({
        data: {
          firstName,
          lastName,
          username,
          email,
          phone: phone || null,
          address: address || null,
          status: 'ACTIVE',
          points: 0,
          courses: {
            connect: [{ id: courseId }]
          }
        },
        include: {
          courses: true
        }
      })

      console.log('Student created successfully:', student)

      return NextResponse.json({
        message: 'Student registered successfully',
        student: {
          id: student.id,
          firstName: student.firstName,
          lastName: student.lastName,
          username: student.username,
          email: student.email,
          courses: student.courses
        }
      })

    } catch (error) {
      console.error('Detailed registration error:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        error
      })

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        console.error('Prisma error code:', error.code)
        console.error('Prisma error meta:', error.meta)
        
        // Handle specific Prisma errors
        if (error.code === 'P2002') {
          return NextResponse.json(
            { error: 'Username or email already exists' },
            { status: 400 }
          )
        }
      }

      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Failed to register student' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Failed to register student' },
      { status: 500 }
    )
  }
}
