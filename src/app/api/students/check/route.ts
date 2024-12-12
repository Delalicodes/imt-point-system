import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const students = await prisma.student.findMany({
      select: {
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        course: {
          select: {
            name: true
          }
        }
      }
    });

    return NextResponse.json(students);
  } catch (error) {
    console.error("Error fetching students:", error);
    return NextResponse.json(
      { error: "Failed to fetch students" },
      { status: 500 }
    );
  }
}
