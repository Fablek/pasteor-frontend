"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface User {
    id: number
    email: string
    name?: string
    avatarUrl?: string
    provider: string
}

interface AuthContextType {
    user: User | null
    token: string | null
    login: (token: string) => Promise<void>
    logout: () => void
    isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode}) {
    const [user, setUser] = useState<User | null>(null)
    const [token, setToken ] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5297'

    useEffect(() => {
        const savedToken = localStorage.getItem('auth_token')
        if (savedToken) {
            fetchUser(savedToken)
        } else {
            setIsLoading(false)
        }
    }, [])

    const fetchUser = async (authToken: string) => {
        try {
            const response = await fetch(`${API_URL}/api/auth/me`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            })

            if (response.ok) {
                const userData = await response.json()
                setUser(userData)
                setToken(authToken)
            } else {
                localStorage.removeItem('auth_token')
            }
        } catch (error) {
            console.error("Failed to fetch user:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const login = async (authToken: string) => {
        setToken(authToken)
        localStorage.setItem('auth_token', authToken)
        await fetchUser(authToken)
    }

    const logout = () => {
        setUser(null)
        setToken(null)
        localStorage.removeItem('auth_token')
    }

    return (
        <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}