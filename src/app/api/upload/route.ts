import { NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import path from "path"
import { existsSync } from "fs"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded" },
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Get file extension and generate unique name
    const originalName = file.name
    const extension = path.extname(originalName)
    const timestamp = Date.now()
    const uniqueFilename = `profile-${timestamp}${extension}`

    // Create path to save file
    const uploadDir = path.join(process.cwd(), "public", "uploads")
    
    // Create uploads directory if it doesn't exist
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }
    
    const filePath = path.join(uploadDir, uniqueFilename)

    // Write file to disk
    await writeFile(filePath, buffer)

    // Return the URL that can be used to access the file
    const fileUrl = `/uploads/${uniqueFilename}`

    return NextResponse.json({ 
      message: "File uploaded successfully",
      url: fileUrl
    })

  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    )
  }
}
