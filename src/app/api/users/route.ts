import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')

    const students = await prisma.student.findMany({
      where: {
        OR: search ? [
          { firstName: { contains: search } },
          { surname: { contains: search } },
          { username: { contains: search } }
        ] : undefined
      },
      select: {
        id: true,
        firstName: true,
        surname: true,
        username: true
      },
      orderBy: [
        { surname: 'asc' },
        { firstName: 'asc' }
      ]
    })

    // Format the data for the frontend - only show name
    const formattedStudents = students.map(student => ({
      id: student.id.toString(),
      name: `${student.surname}, ${student.firstName}`,
      studentId: student.username
    }))

    return NextResponse.json({
      success: true,
      data: formattedStudents
    })
  } catch (error) {
    console.error('Error fetching students:', error)
    return NextResponse.json(
      { error: 'Failed to fetch students' },
      { status: 500 }
    )
  }
}
