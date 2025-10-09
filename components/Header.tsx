"use client"

import { Moon, Sun, LogOut, User, LayoutDashboard } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"

export function Header() {
    const { theme, setTheme } = useTheme()
    const { user, logout, isLoading } = useAuth()

    return (
        <header className="border-b">
            <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                <Link href="/" className="flex items-center space-x-2">
                    <h1 className="text-2xl font-bold">Pasteor</h1>
                </Link>

                <nav className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                    >
                        <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                        <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                        <span className="sr-only">Toggle theme</span>
                    </Button>

                    {!isLoading && (
                        <>
                            {user ? (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="rounded-full">
                                        {user.avatarUrl ? (
                                            <img 
                                            src={user.avatarUrl} 
                                            alt={user.name || user.email}
                                            className="w-8 h-8 rounded-full"
                                            />
                                        ) : (
                                            <User className="h-5 w-5" />
                                        )}
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <div className="px-2 py-1.5 text-sm">
                                            <p className="font-medium">{user.name || "User"}</p>
                                            <p className="text-xs text-muted-foreground">{user.email}</p>
                                        </div>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem asChild>
                                            <Link href="/dashboard" className="cursor-pointer">
                                                <LayoutDashboard className="mr-2 h-4 w-4" />
                                                Dashboard
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={logout}>
                                            <LogOut className="mr-2 h-4 w-4" />
                                            Logout
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            ) : (
                                <Button asChild>
                                    <Link href="/login">Login</Link>
                                </Button>
                            )}
                        </>
                    )}
                </nav>
            </div>
        </header>
    )
}