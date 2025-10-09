import { SignupForm } from "@/components/signup-form"
import Link from "next/link"

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-muted/30">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <Link href="/" className="text-4xl font-bold">
            Pasteor
          </Link>
          <p className="text-muted-foreground mt-2">Share code and text snippets easily</p>
        </div>
        <SignupForm />
      </div>
    </div>
  )
}