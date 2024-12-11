import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"

export async function GET() {
  try {
    console.log('Fetching courses...')
    const courses = await prisma.course.findMany({
      include: {
        subjects: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    console.log('Fetched courses:', courses)
    return new NextResponse(JSON.stringify(courses), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  } catch (error) {
    console.error("Error fetching courses:", error)
    return new NextResponse(
      JSON.stringify({ error: "Failed to fetch courses" }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
  }
}

/**
 * Creates a new course
 * @route POST /api/admin/course-setup
 * @param {Object} request.body - The course data
 * @example Request body format:
 * {
 *   "name": "Course Name",    // string, required
 *   "description": "Course Description",  // string, optional
 *   "duration": 12           // number, required
 * }
 */
export async function POST(request: Request) {
  try {
    const data = await request.json()
    console.log("Received course data:", data)

    const { name, description, duration, subjects } = data

    if (!name || !duration) {
      return NextResponse.json(
        { error: "Name and duration are required fields" },
        { status: 400 }
      )
    }

    // Check if course with same name exists
    const existingCourse = await prisma.course.findUnique({
      where: { name }
    })

    if (existingCourse) {
      return NextResponse.json(
        { error: "Course with this name already exists" },
        { status: 400 }
      )
    }

    // Create course with subjects
    const course = await prisma.course.create({
      data: {
        name,
        description: description || "",
        duration,
        subjects: {
          create: subjects?.map((subject: { name: string; description?: string }) => ({
            name: subject.name,
            description: subject.description || ""
          })) || []
        }
      },
      include: {
        subjects: true
      }
    })

    return NextResponse.json(course)
  } catch (error) {
    console.error("Error creating course:", error)
    return NextResponse.json(
      { error: "Failed to create course" },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json()
    console.log("Received course data:", data)

    const { id, name, description, duration, subjects } = data

    if (!id || !name || !duration) {
      return NextResponse.json(
        { error: "ID, name, and duration are required fields" },
        { status: 400 }
      )
    }

    // Check if course exists
    const existingCourse = await prisma.course.findUnique({
      where: { id }
    })

    if (!existingCourse) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      )
    }

    // Check if new name conflicts with another course
    const nameConflict = await prisma.course.findFirst({
      where: {
        name,
        id: { not: id }
      }
    })

    if (nameConflict) {
      return NextResponse.json(
        { error: "Course with this name already exists" },
        { status: 400 }
      )
    }

    // Update course with subjects
    const course = await prisma.course.update({
      where: { id },
      data: {
        name,
        description: description || "",
        duration,
        subjects: {
          deleteMany: {},
          create: subjects?.map((subject: { name: string; description?: string }) => ({
            name: subject.name,
            description: subject.description || ""
          })) || []
        }
      },
      include: {
        subjects: true
      }
    })

    return NextResponse.json(course)
  } catch (error) {
    console.error("Error updating course:", error)
    return NextResponse.json(
      { error: "Failed to update course" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: "Course ID is required" },
        { status: 400 }
      )
    }

    await prisma.course.delete({
      where: { id: parseInt(id) }
    })

    return NextResponse.json({ message: "Course deleted successfully" })
  } catch (error) {
    console.error("Error deleting course:", error)
    return NextResponse.json(
      { error: "Failed to delete course" },
      { status: 500 }
    )
  }
}