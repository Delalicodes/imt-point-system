import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const defaultCourses = [
  {
    name: "Computer Science",
    description: "Bachelor's degree in Computer Science",
    duration: 48, // 4 years
  },
  {
    name: "Information Technology",
    description: "Bachelor's degree in Information Technology",
    duration: 48,
  },
  {
    name: "Software Engineering",
    description: "Bachelor's degree in Software Engineering",
    duration: 48,
  },
];

export async function GET() {
  try {
    const existingCourses = await prisma.course.findMany();

    if (existingCourses.length === 0) {
      // No courses exist, create the default ones
      const createdCourses = await Promise.all(
        defaultCourses.map(course =>
          prisma.course.create({
            data: course
          })
        )
      );

      return NextResponse.json({
        message: "Courses seeded successfully",
        courses: createdCourses
      });
    }

    return NextResponse.json({
      message: "Courses already exist",
      courses: existingCourses
    });

  } catch (error) {
    console.error("Error seeding courses:", error);
    return NextResponse.json(
      { error: "Failed to seed courses" },
      { status: 500 }
    );
  }
}
