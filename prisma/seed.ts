const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  // Default admin credentials
  const defaultAdmin = {
    username: 'admin@imt.com',
    password: 'admin123', // This is just for development, change in production!
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(defaultAdmin.password, 10)

  // Create the admin user
  const admin = await prisma.admin.upsert({
    where: { username: defaultAdmin.username },
    update: {},
    create: {
      username: defaultAdmin.username,
      password: hashedPassword,
    },
  })

  console.log('Default admin account created:', admin.username)

  // Create test students
  const testStudents = [
    {
      firstName: 'John',
      lastName: 'Doe',
      username: 'john.doe',
      status: 'ACTIVE',
      courses: {
        create: {
          name: 'Web Development',
          duration: 12
        }
      }
    },
    {
      firstName: 'Jane',
      lastName: 'Smith',
      username: 'jane.smith',
      status: 'ON_HOLD',
      courses: {
        create: {
          name: 'Mobile Development',
          duration: 6
        }
      }
    }
  ]

  for (const studentData of testStudents) {
    const student = await prisma.student.create({
      data: studentData
    })
    console.log('Test student created:', student.firstName, student.lastName)
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
