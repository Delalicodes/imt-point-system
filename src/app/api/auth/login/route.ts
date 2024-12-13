import { NextResponse } from "next/server"
import { hash, compare } from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { cookies } from 'next/headers'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: Request) {
  try {
    console.log('Login attempt started')
    const body = await request.json()
    console.log('Request body:', { ...body, password: '[REDACTED]' })

    const { username, password } = body

    // First try to find a student
    const student = await prisma.student.findFirst({
      where: {
        OR: [
          { username },
          { email: username }
        ]
      },
      include: {
        courses: true
      }
    })

    console.log('Student search result:', student ? {
      ...student,
      password: '[REDACTED]'
    } : 'Not found')

    // Then try to find an admin
    const admin = await prisma.admin.findUnique({
      where: { username }
    })

    console.log('Admin search result:', admin ? {
      ...admin,
      password: '[REDACTED]'
    } : 'Not found')

    // If neither exists, return error
    if (!student && !admin) {
      console.log('No user found with username:', username)
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      )
    }

    let isPasswordValid = false
    let userData = null

    if (student) {
      console.log('Attempting student password validation')
      isPasswordValid = await compare(password, student.password)
      console.log('Student password valid:', isPasswordValid)
      if (isPasswordValid) {
        userData = {
          id: student.id,
          username: student.username,
          firstName: student.firstName,
          lastName: student.lastName,
          email: student.email,
          type: 'student',
          course: student.courses[0]?.name || 'Not Assigned'
        }
      }
    } else if (admin) {
      console.log('Attempting admin password validation')
      isPasswordValid = await compare(password, admin.password)
      console.log('Admin password valid:', isPasswordValid)
      if (isPasswordValid) {
        userData = {
          id: admin.id,
          username: admin.username,
          firstName: 'Admin',
          lastName: 'User',
          type: 'admin'
        }
      }
    }

    if (!isPasswordValid || !userData) {
      console.log('Password validation failed')
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

    // Store user data in session cookie
    cookies().set('user_data', JSON.stringify(userData), {
      expires,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    })

    console.log('Login successful for:', {
      username: userData.username,
      type: userData.type,
      firstName: userData.firstName,
      lastName: userData.lastName
    })

    return NextResponse.json({ 
      success: true,
      user: userData
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    )
  }
}
