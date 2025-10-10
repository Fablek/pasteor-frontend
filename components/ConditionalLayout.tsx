"use client"

import { usePathname } from "next/navigation"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"

export function ConditionalLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const isAuthPage = pathname === "/login" || pathname === "/register"

    const isRawPage = pathname?.includes("/raw")

    if (isAuthPage || isRawPage) {
        return <>{children}</>
    }

    return (
        <>
        <Header />
        <main className="flex-1">
            {children}
        </main>
        <Footer />
        </>
    )
}