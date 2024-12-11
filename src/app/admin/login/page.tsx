import { Metadata } from "next"
import Image from "next/image"
import LoginForm from "@/components/auth/login-form"
import { ImageCarousel } from "@/components/ui/image-carousel"

export const metadata: Metadata = {
  title: "Admin Login - IMT Point System",
  description: "Admin login page for IMT Point System",
}

export default function LoginPage() {
  return (
    <div className="container relative min-h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
        <div className="absolute inset-0">
          <ImageCarousel />
        </div>
        <div className="relative z-20 flex items-center text-lg font-medium">
          <div className="relative h-12 w-12 mr-4">
            <Image
              src="/images/logo.png"
              fill
              alt="IMT Logo"
              className="object-contain"
            />
          </div>
          <span className="text-xl font-bold">IMT Point System</span>
        </div>
      </div>
      <div className="relative h-full lg:p-8">
        <div className="mx-auto flex h-full w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-3xl font-semibold tracking-tight">
              Welcome Back
            </h1>
            <p className="text-sm text-muted-foreground">
              Enter your credentials to access the admin portal
            </p>
          </div>
          <LoginForm />
          <p className="px-8 text-center text-sm text-muted-foreground">
            By logging in, you agree to our{" "}
            <a
              href="#"
              className="underline underline-offset-4 hover:text-primary"
            >
              Terms of Service
            </a>{" "}
            and{" "}
            <a
              href="#"
              className="underline underline-offset-4 hover:text-primary"
            >
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  )
}
