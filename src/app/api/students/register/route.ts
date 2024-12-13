import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";  
import { sendEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    // Check for database URL
    if (!process.env.DATABASE_URL) {
      console.error('Missing DATABASE_URL environment variable');
      return NextResponse.json(
        { error: "Server configuration error. Please contact administrator." },
        { status: 500 }
      );
    }

    const body = await req.json();
    console.log('Received registration data:', body);
    console.log('Course data type:', typeof body.course);

    const { firstName, lastName, username, email, phone, course } = body;

    // Validate required fields
    const requiredFields = { firstName, lastName, username, email, phone };
    const missingFields = Object.entries(requiredFields)
      .filter(([_, value]) => !value)
      .map(([key]) => key);

    if (missingFields.length > 0) {
      console.error('Missing required fields:', missingFields);
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.student.findFirst({
      where: {
        OR: [
          { username },
          { email }
        ]
      }
    });

    if (existingUser) {
      const field = existingUser.username === username ? 'username' : 'email';
      return NextResponse.json(
        { error: `This ${field} is already registered` },
        { status: 400 }
      );
    }

    // Generate a default password using first name and last name
    const defaultPassword = `${firstName.toLowerCase()}${lastName.toLowerCase()}123!`
    console.log('Generated password:', defaultPassword);
    const hashedPassword = await hash(defaultPassword, 10);
    console.log('Hashed password generated');

    // Verify course exists if provided
    let courseData = null;
    if (course) {
      try {
        const courseId = typeof course === 'string' ? parseInt(course) : course;
        console.log('Looking for course with ID:', courseId);
        
        courseData = await prisma.course.findUnique({
          where: { id: courseId }
        });
        
        if (!courseData) {
          console.error('Course not found:', courseId);
          return NextResponse.json(
            { error: `Course with ID ${courseId} not found` },
            { status: 400 }
          );
        }
        console.log('Found course:', courseData);
      } catch (error) {
        console.error('Error parsing course ID:', error);
        return NextResponse.json(
          { error: 'Invalid course ID format' },
          { status: 400 }
        );
      }
    }

    // Create the student with course connection if provided
    const studentData = {
      firstName,
      lastName,
      username,
      email,
      phone,
      password: hashedPassword,
      ...(courseData && {
        courses: {
          connect: [{ id: courseData.id }]
        }
      })
    };
    
    console.log('Creating student with data:', {
      ...studentData,
      password: '[REDACTED]'
    });

    const student = await prisma.student.create({
      data: studentData,
      include: {
        courses: true
      }
    });

    console.log('Student created successfully:', {
      id: student.id,
      username: student.username,
      email: student.email,
      courses: student.courses
    });

    // Try to send email if configuration exists
    const emailSent = await sendEmail({
      to: email,
      subject: "Welcome to IMT Point System - Your Login Credentials",
      html: `
        <h1>Welcome to IMT Point System</h1>
        <p>Hello ${firstName},</p>
        <p>Your account has been created successfully. Here are your login credentials:</p>
        <p><strong>Username:</strong> ${username}</p>
        <p><strong>Password:</strong> ${defaultPassword}</p>
        <p>Please change your password after your first login.</p>
        <p>Best regards,<br>IMT Point System Team</p>
      `,
    }).catch(error => {
      console.warn('Failed to send welcome email:', error);
      return null;
    });

    return NextResponse.json({
      success: true,
      user: {
        id: student.id,
        username: student.username,
        email: student.email,
        firstName: student.firstName,
        lastName: student.lastName,
        course: student.courses[0]?.name || 'Not Assigned'
      },
      ...(emailSent ? {} : { credentials: { username, password: defaultPassword } })
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
