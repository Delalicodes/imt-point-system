import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import * as bcrypt from "bcryptjs"

export async function GET() {
  try {
    console.log("Starting admin seed process...")
    
    // Check if admin exists
    const adminCount = await prisma.admin.count();
    console.log("Current admin count:", adminCount);

    if (adminCount === 0) {
      // Create default admin
      const hashedPassword = await bcrypt.hash('admin123', 10);
      console.log("Created hashed password");
      
      const admin = await prisma.admin.create({
        data: {
          username: 'admin',
          password: hashedPassword,
        }
      });
      console.log("Created admin:", admin);

      return NextResponse.json({
        message: "Default admin created",
        credentials: {
          username: 'admin',
          password: 'admin123'
        }
      });
    }

    return NextResponse.json({ message: "Admin already exists" });
  } catch (error) {
    console.error("Error seeding admin:", error);
    return NextResponse.json(
      { error: "Failed to seed admin", details: error.message },
      { status: 500 }
    );
  }
}
