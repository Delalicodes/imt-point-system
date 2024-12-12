import { NextResponse } from "next/server"
import * as bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { cookies } from 'next/headers'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: Request) {
  try {
    console.log('Student login attempt started')
    const body = await request.json()
    console.log('Request body:', body)

    const { username, password } = body

    console.log('Looking up student:', username)
    const student = await prisma.student.findFirst({
      where: {
        OR: [
          { username },
          { email: username }
        ]
      },
      include: {
        course: true
      }
    })

    console.log('Student found:', student ? 'yes' : 'no')

    if (!student) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      )
    }

    console.log('Validating password')
    const isPasswordValid = await bcrypt.compare(password, student.password)
    console.log('Password valid:', isPasswordValid ? 'yes' : 'no')

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      )
    }

    // Create session token
    const sessionToken = uuidv4()
    const expires = new Date()
    expires.setHours(expires.getHours() + 24) // 24 hour expiry

    // Store session in cookie
    cookies().set('session_token', sessionToken, {
      expires,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    })

    // Store student data in session cookie for easy access
    cookies().set('user_data', JSON.stringify({
      id: student.id,
      username: student.username,
      firstName: student.firstName,
      lastName: student.lastName,
      type: 'student',
      course: student.course.name
    }), {
      expires,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    })

    return NextResponse.json({ 
      success: true,
      user: {
        id: student.id,
        username: student.username,
        firstName: student.firstName,
        lastName: student.lastName,
        type: 'student',
        course: student.course.name
      }
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    )
  }
}
