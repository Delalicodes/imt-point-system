import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const cookieStore = cookies()
    const userData = cookieStore.get('user_data')

    if (!userData) {
      return NextResponse.json(null)
    }

    return NextResponse.json(JSON.parse(userData.value))
  } catch (error) {
    console.error('Error fetching session:', error)
    return NextResponse.json({ error: 'Unable to load user session' }, { status: 500 })
  }
}
