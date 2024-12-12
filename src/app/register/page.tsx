import { prisma } from '@/lib/prisma'
import RegisterForm from '@/components/auth/register-form'

export default async function RegisterPage() {
  // Fetch courses
  const courses = await prisma.course.findMany({
    select: {
      id: true,
      name: true
    },
    orderBy: {
      name: 'asc'
    }
  })

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md space-y-4">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">Register</h1>
          <p className="text-gray-500 dark:text-gray-400">Create your student account</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <RegisterForm courses={courses} />
        </div>
      </div>
    </div>
  )
}
