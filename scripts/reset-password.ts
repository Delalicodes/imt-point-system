import { prisma } from "../src/lib/prisma"
import bcrypt from "bcryptjs"

async function resetPassword() {
  try {
    const newPassword = "admin123" // New default password
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    const admin = await prisma.admin.findFirst()
    if (!admin) {
      console.error("Admin not found")
      return
    }

    await prisma.admin.update({
      where: { id: admin.id },
      data: { password: hashedPassword }
    })

    console.log("Password reset successfully")
    console.log("New credentials:")
    console.log("Username: admin@imt.com")
    console.log("Password: admin123")
  } catch (error) {
    console.error("Failed to reset password:", error)
  } finally {
    await prisma.$disconnect()
  }
}

resetPassword()
