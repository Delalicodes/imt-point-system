import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

// GET all supervisors
export async function GET() {
  try {
    const supervisors = await prisma.supervisor.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { students: true }
        }
      }
    })
    
    return NextResponse.json(supervisors)
  } catch (error) {
    console.error('Error fetching supervisors:', error)
    return NextResponse.json(
      { error: 'Failed to fetch supervisors' },
      { status: 500 }
    )
  }
}

// POST new supervisor
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name } = body

    if (!name?.trim()) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }

    const supervisor = await prisma.supervisor.create({
      data: { name: name.trim() }
    })
    
    return NextResponse.json(supervisor)
  } catch (error) {
    console.error('Error creating supervisor:', error)
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return NextResponse.json(
          { error: 'A supervisor with this name already exists' },
          { status: 400 }
        )
      }
    }
    return NextResponse.json(
      { error: 'Failed to create supervisor' },
      { status: 500 }
    )
  }
}

// PUT update supervisor
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, name } = body

    if (!id || !name?.trim()) {
      return NextResponse.json(
        { error: 'ID and name are required' },
        { status: 400 }
      )
    }

    const supervisor = await prisma.supervisor.update({
      where: { id },
      data: { name: name.trim() }
    })
    
    return NextResponse.json(supervisor)
  } catch (error) {
    console.error('Error updating supervisor:', error)
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return NextResponse.json(
          { error: 'Supervisor not found' },
          { status: 404 }
        )
      }
      if (error.code === 'P2002') {
        return NextResponse.json(
          { error: 'A supervisor with this name already exists' },
          { status: 400 }
        )
      }
    }
    return NextResponse.json(
      { error: 'Failed to update supervisor' },
      { status: 500 }
    )
  }
}

// DELETE supervisor
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = parseInt(searchParams.get('id') || '')

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid supervisor ID' },
        { status: 400 }
      )
    }

    // Check if supervisor has any assigned students
    const supervisor = await prisma.supervisor.findUnique({
      where: { id },
      include: {
        _count: {
          select: { students: true }
        }
      }
    })

    if (!supervisor) {
      return NextResponse.json(
        { error: 'Supervisor not found' },
        { status: 404 }
      )
    }

    if (supervisor._count.students > 0) {
      return NextResponse.json(
        { error: 'Cannot delete supervisor with assigned students' },
        { status: 400 }
      )
    }

    await prisma.supervisor.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting supervisor:', error)
    return NextResponse.json(
      { error: 'Failed to delete supervisor' },
      { status: 500 }
    )
  }
}
