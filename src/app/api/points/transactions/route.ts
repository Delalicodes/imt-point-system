import { NextResponse } from "next/server"
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  try {
    // Get all transactions with student and admin details
    const transactions = await prisma.pointTransaction.findMany({
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true
          }
        },
        awardedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(transactions)
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
