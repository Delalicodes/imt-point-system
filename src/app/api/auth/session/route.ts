import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const cookieStore = cookies()
    const sessionToken = cookieStore.get('session_token')
    const userData = cookieStore.get('user_data')

    if (!sessionToken || !userData) {
      return NextResponse.json(null)
    }

    // Parse and validate user data
    const user = JSON.parse(userData.value)
    if (!user || !user.id || !user.username) {
      return NextResponse.json(null)
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error fetching session:', error)
    return NextResponse.json(null)
  }
}
