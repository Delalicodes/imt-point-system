import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const groups = await prisma.chatGroup.findMany({
      include: {
        members: {
          select: {
            username: true,
            role: true
          }
        },
        _count: {
          select: {
            messages: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    return NextResponse.json(groups)
  } catch (error) {
    console.error('Error fetching chat groups:', error)
    return NextResponse.json(
      { error: 'Failed to fetch chat groups' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, description, members, createdBy } = await request.json()

    if (!name || !members || !Array.isArray(members) || members.length === 0 || !createdBy) {
      return NextResponse.json(
        { error: 'Invalid group data' },
        { status: 400 }
      )
    }

    const group = await prisma.chatGroup.create({
      data: {
        name,
        description,
        createdBy,
        members: {
          create: members.map(username => ({
            username,
            role: username === createdBy ? "ADMIN" : "MEMBER"
          }))
        }
      },
      include: {
        members: {
          select: {
            username: true,
            role: true
          }
        },
        _count: {
          select: {
            messages: true
          }
        }
      }
    })

    return NextResponse.json(group)
  } catch (error) {
    console.error('Error creating chat group:', error)
    return NextResponse.json(
      { error: 'Failed to create chat group' },
      { status: 500 }
    )
  }
}
