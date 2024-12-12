import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Default courses to seed if none exist
const defaultCourses = [
  { name: "Computer Science" },
  { name: "Information Technology" },
  { name: "Software Engineering" },
  { name: "Data Science" },
  { name: "Cybersecurity" },
];

export async function GET() {
  try {
    // Check if we have any courses
    const courseCount = await prisma.course.count();

    // If no courses exist, seed the default ones
    if (courseCount === 0) {
      console.log('No courses found, seeding default courses...');
      await prisma.course.createMany({
        data: defaultCourses,
      });
      console.log('Default courses seeded successfully');
    }

    // Get all courses
    const courses = await prisma.course.findMany({
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(courses);
  } catch (error) {
    console.error('Error in courses API:', error);
    return NextResponse.json(
      { error: "Failed to fetch courses" },
      { status: 500 }
    );
  }
}
