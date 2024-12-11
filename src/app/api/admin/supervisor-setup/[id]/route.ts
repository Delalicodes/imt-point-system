import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// PUT (update) supervisor
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    const body = await request.json()
    const { name } = body

    if (!name?.trim()) {
      return NextResponse.json(
        { error: 'Supervisor name is required' },
        { status: 400 }
      )
    }

    const supervisor = await prisma.supervisor.update({
      where: { id },
      data: { name: name.trim() }
    })

    return NextResponse.json(supervisor)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update supervisor' },
      { status: 500 }
    )
  }
}

// DELETE supervisor
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    await prisma.supervisor.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete supervisor' },
      { status: 500 }
    )
  }
}
