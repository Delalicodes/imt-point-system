import { NextResponse } from "next/server"
import * as bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { cookies } from 'next/headers'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: Request) {
  try {
    console.log('Login attempt started')
    const body = await request.json()
    console.log('Request body:', body)

    const { username, password } = body

    console.log('Looking up admin:', username)
    const admin = await prisma.admin.findUnique({
      where: { username },
    })

    console.log('Admin found:', admin ? 'yes' : 'no')

    if (!admin) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      )
    }

    console.log('Validating password')
    const isPasswordValid = await bcrypt.compare(password, admin.password)
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

    // Store admin data in session cookie for easy access
    cookies().set('user_data', JSON.stringify({
      id: admin.id,
      username: admin.username,
      firstName: 'Admin', // Default values for admin
      lastName: 'User',
      type: 'admin'
    }), {
      expires,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    })

    return NextResponse.json({ 
      success: true,
      user: {
        id: admin.id,
        username: admin.username,
        firstName: 'Admin',
        lastName: 'User',
        type: 'admin'
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
