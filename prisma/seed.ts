const { PrismaClient } = require('@prisma/client')
const { hash } = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  // Create default admin account
  const adminPassword = 'admin123'
  const hashedPassword = await hash(adminPassword, 10)

  const admin = await prisma.admin.upsert({
    where: { username: 'admin@imt.com' },
    update: {},
    create: {
      username: 'admin@imt.com',
      password: hashedPassword,
    },
  })

  console.log('Default admin account created:', admin.username)

  // Create test courses
  const courses = [
    {
      name: 'Computer Science',
      description: 'Bachelor of Science in Computer Science',
      duration: 48,
      subjects: {
        create: [
          {
            name: 'Programming Fundamentals',
            description: 'Introduction to programming concepts'
          },
          {
            name: 'Data Structures',
            description: 'Study of data organization and algorithms'
          }
        ]
      }
    },
    {
      name: 'Information Technology',
      description: 'Bachelor of Science in Information Technology',
      duration: 48,
      subjects: {
        create: [
          {
            name: 'Web Development',
            description: 'Building web applications'
          },
          {
            name: 'Database Management',
            description: 'Managing and querying databases'
          }
        ]
      }
    }
  ]

  for (const courseData of courses) {
    await prisma.course.upsert({
      where: { name: courseData.name },
      update: courseData,
      create: courseData
    })
  }

  // Create test students
  const testStudents = [
    {
      firstName: 'John',
      lastName: 'Doe',
      username: 'john.doe',
      status: 'ACTIVE',
      points: 0,
      courses: {
        connect: [{ name: 'Computer Science' }]
      }
    },
    {
      firstName: 'Jane',
      lastName: 'Smith',
      username: 'jane.smith',
      status: 'ACTIVE',
      points: 0,
      courses: {
        connect: [{ name: 'Information Technology' }]
      }
    }
  ]

  for (const studentData of testStudents) {
    await prisma.student.upsert({
      where: { username: studentData.username },
      update: studentData,
      create: studentData
    })
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
