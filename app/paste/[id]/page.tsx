'use client'

import { useEffect, useState } from "react"
import { notFound, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User } from "lucide-react"
import Link from "next/link"
import { CodeBlock } from "@/components/CodeBlock"
import { CopyButtons } from "@/components/CopyButtons"
import { DeletePasteButton } from "@/components/DeletePasteButton"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/contexts/AuthContext"

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5297'

interface Author {
    name: string
    avatarUrl?: string
}

interface Paste {
    id: string
    content: string
    title?: string
    language: string
    createdAt: string
    expiresAt?: string
    views: number
    isOwner: boolean
    author?: Author
}

export default function PastePage() {
    const params = useParams()
    const { token } = useAuth()
    const [paste, setPaste] = useState<Paste | null>(null)
    const [loading, setLoading] = useState(true)
    const [notFoundError, setNotFoundError] = useState(false)

    useEffect(() => {
        const fetchPaste = async () => {
            try {
                const headers: HeadersInit = {}
                if (token) {
                    headers['Authorization'] = `Bearer ${token}`
                }

                const response = await fetch(`${API_URL}/api/pastes/${params.id}`, {
                    headers,
                    cache: 'no-store'
                })

                if (!response.ok) {
                    setNotFoundError(true)
                    return
                }

                const data = await response.json()
                setPaste(data)
            } catch (error) {
                setNotFoundError(true)
            } finally {
                setLoading(false)
            }
        }

        if (params.id) {
            fetchPaste()
        }
    }, [params.id, token])

    if (loading) {
        return (
            <div className="bg-background p-8">
                <div className="max-w-6xl mx-auto">
                    <Skeleton className="h-8 w-64 mb-4" />
                    <Skeleton className="h-4 w-96 mb-2" />
                    <Skeleton className="h-4 w-full mb-8" />
                    <Skeleton className="h-96 w-full" />
                </div>
            </div>
        )
    }

    if (notFoundError || !paste) {
        notFound()
    }

    const formatDate = (date: string) => {
        return new Date(date).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    return (
        <div className="bg-background p-8">
            <div className="max-w-6xl mx-auto">
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold mb-2">
                            {paste.title || "Untitled Paste"}
                        </h1>
                        
                        {/* Author info */}
                        <div className="flex items-center gap-2 mb-2">
                            {paste.author ? (
                                <>
                                    <Avatar className="h-6 w-6">
                                        <AvatarImage src={paste.author.avatarUrl} />
                                        <AvatarFallback>
                                            {paste.author.name.charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="text-sm text-muted-foreground">
                                        by {paste.author.name}
                                    </span>
                                </>
                            ) : (
                                <>
                                    <Avatar className="h-6 w-6">
                                        <AvatarFallback>
                                            <User className="h-3 w-3" />
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="text-sm text-muted-foreground">
                                        by Anonymous
                                    </span>
                                </>
                            )}
                        </div>

                        <div className="flex gap-4 text-sm text-muted-foreground">
                            <span>Language: {paste.language}</span>
                            <span>Views: {paste.views}</span>
                            <span>Created: {formatDate(paste.createdAt)}</span>
                            {paste.expiresAt && (
                                <span>Expires: {formatDate(paste.expiresAt)}</span>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <CopyButtons content={paste.content} pasteId={paste.id} />
                        {paste.isOwner && (
                            <DeletePasteButton pasteId={paste.id} />
                        )}
                    </div>
                </div>

                <CodeBlock code={paste.content} language={paste.language} />

                <div className="mt-6 flex justify-center gap-4">
                    <Button variant="link" asChild>
                        <Link href="/">Create New Paste</Link>
                    </Button>
                    {paste.isOwner && (
                        <Button variant="link" asChild>
                            <Link href="/dashboard">My Pastes</Link>
                        </Button>
                    )}
                </div>
            </div>
        </div>
    )
}