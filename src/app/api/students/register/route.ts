import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generatePassword } from "@/lib/utils";
import { hash } from "bcrypt";
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

    const { firstName, lastName, username, email, phone } = body;

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

    // Generate a random password
    const password = generatePassword();
    const hashedPassword = await hash(password, 10);

    // Create the student
    const student = await prisma.student.create({
      data: {
        firstName,
        lastName,
        username,
        email,
        phone,
        password: hashedPassword,
      }
    });

    console.log('Student created successfully:', {
      id: student.id,
      username: student.username,
      email: student.email
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
        <p><strong>Password:</strong> ${password}</p>
        <p>Please change your password after your first login.</p>
        <p>Best regards,<br>IMT Point System Team</p>
      `,
    }).catch(error => {
      console.warn('Failed to send welcome email:', error);
      return null;
    });

    // Return the credentials if email wasn't sent
    return NextResponse.json({ 
      message: "Student registered successfully",
      student: {
        id: student.id,
        username: student.username,
        email: student.email,
        ...(emailSent ? {} : { password }) // Include password in response if email wasn't sent
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    
    // More specific error messages based on error type
    if (error instanceof Error) {
      if (error.message.includes('prisma')) {
        console.error('Database error:', error);
        return NextResponse.json(
          { error: "Database error occurred. Please try again later." },
          { status: 500 }
        );
      }
      if (error.message.includes('JSON')) {
        console.error('Invalid request data:', error);
        return NextResponse.json(
          { error: "Invalid request data provided." },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to register student. Please try again later." },
      { status: 500 }
    );
  }
}
