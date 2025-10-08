"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"

export default function AuthCallbackPage() {
    const router = useRouter()
    const searchParams = useSearchParams()

    useEffect(() => {
        const token = searchParams.get('token')

        if (token) {
            localStorage.setItem('auth_token', token)

            router.push('/')
        } else {
            router.push('/')
        }
    }, [searchParams, router])

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <h1 className="text-2xl font-bold mb-4">Logging you in...</h1>
                <p className="text-muted-foreground">Please wait</p>
            </div>
        </div>
    )
}