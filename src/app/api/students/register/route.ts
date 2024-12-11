import { NextResponse } from "next/server"
import { prisma } from '@/lib/prisma'
import { v4 as uuidv4 } from 'uuid'
import { cookies } from 'next/headers'

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

    // Create new student with course connection
    const student = await prisma.student.create({
      data: {
        firstName,
        lastName,
        username,
        status: 'ACTIVE',
        courses: {
          connect: { id: parseInt(course) }
        }
      },
      include: {
        courses: true
      }
    })

    return NextResponse.json({ 
      success: true,
      message: 'Student registered successfully',
      student
    })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Failed to register student' },
      { status: 500 }
    )
  }
}
