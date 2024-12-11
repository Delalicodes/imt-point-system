import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

export async function GET() {
  try {
    const admin = await prisma.admin.findFirst()
    
    if (!admin) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 })
    }

    return NextResponse.json({
      username: admin.username,
      profileImage: admin.profileImage
    })

  } catch (error) {
    console.error("Profile fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json()
    const admin = await prisma.admin.findFirst()

    if (!admin) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 })
    }

    let updateData: any = {}

    // Handle image URL update
    if (data.profileImage) {
      updateData.profileImage = data.profileImage
    }

    // Handle username update
    if (data.username) {
      updateData.username = data.username
    }

    // Handle password update
    if (data.newPassword) {
      // Verify current password
      const isValidPassword = await bcrypt.compare(data.currentPassword, admin.password)
      if (!isValidPassword) {
        return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 })
      }
      // Hash new password
      updateData.password = await bcrypt.hash(data.newPassword, 10)
    }

    // Update admin with only the provided fields
    const updatedAdmin = await prisma.admin.update({
      where: { id: admin.id },
      data: updateData
    })

    return NextResponse.json({ 
      message: "Profile updated successfully",
      username: updatedAdmin.username,
      profileImage: updatedAdmin.profileImage
    })

  } catch (error) {
    console.error("Profile update error:", error)
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
  }
}
