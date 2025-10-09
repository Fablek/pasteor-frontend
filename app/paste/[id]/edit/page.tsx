"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { updatePaste } from "@/lib/api"

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5297'

interface Paste {
    id: string
    content: string
    title?: string
    language: string
    createdAt: string
    expiresAt?: string
    views: number
    isOwner: boolean
}

export default function EditPastePage() {
    const router = useRouter()
    const params = useParams()
    const { token, user, isLoading: authLoading } = useAuth()
    const [paste, setPaste] = useState<Paste | null>(null)
    const [loading, setLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const [content, setContent] = useState("")
    const [title, setTitle] = useState("")
    const [language, setLanguage] = useState("plaintext")

    useEffect(() => {
        if (authLoading) return
        
        if (!user) {
            router.push('/login')
            return
        }
        fetchPaste()
    }, [params.id, user, authLoading])

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
                throw new Error('Paste not found')
            }

            const data = await response.json()

            if (!data.isOwner) {
                toast.error("You can only edit your own pastes")
                router.push(`/paste/${params.id}`)
                return
            }

            setPaste(data)
            setContent(data.content)
            setTitle(data.title || "")
            setLanguage(data.language)
        } catch (error) {
            toast.error('Failed to load paste')
            router.push('/')
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!content.trim()) {
            toast.error("Content cannot be empty")
            return
        }

        if (content.length > 524288) {
            toast.error("Content is too large (max 512KB)")
            return
        }

        if (!token) {
            toast.error("You must be logged in")
            return
        }

        setIsSubmitting(true)

        try {
            await updatePaste(token, params.id as string, {
                content,
                title: title || undefined,
                language
            })

            toast.success('Paste updated successfully!')
            router.push(`/paste/${params.id}`)
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to update paste')
        } finally {
            setIsSubmitting(false)
        }
    }

    const getCharacterCountColor = () => {
        if (content.length > 524288) return 'text-destructive'
        if (content.length > 400000) return 'text-orange-500'
        return 'text-muted-foreground'
    }

    // PRZENIEŚ NA GÓRĘ - sprawdzaj authLoading NAJPIERW
    if (authLoading) {
        return (
            <div className="bg-background p-8">
                <div className="max-w-4xl mx-auto">
                    <Skeleton className="h-8 w-64 mb-4" />
                    <Skeleton className="h-96 w-full" />
                </div>
            </div>
        )
    }

    if (loading) {
        return (
            <div className="bg-background p-8">
                <div className="max-w-4xl mx-auto">
                    <Skeleton className="h-8 w-64 mb-4" />
                    <Skeleton className="h-96 w-full" />
                </div>
            </div>
        )
    }

    if (!paste) {
        return null
    }

    return (
        <div className="bg-background p-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <Link 
                        href={`/paste/${params.id}`}
                        className="text-sm text-muted-foreground hover:text-primary inline-flex items-center gap-1 mb-4"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to paste
                    </Link>
                    <h1 className="text-3xl font-bold">Edit Paste</h1>
                    <p className="text-muted-foreground mt-2">
                        Make changes to your paste
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Paste Details</CardTitle>
                        <CardDescription>
                            Update the content, title, or language of your paste
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <Input
                                    placeholder="Title (optional)"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    disabled={isSubmitting}
                                />
                            </div>

                            <div>
                                <Textarea
                                    placeholder="Paste your code or text here..."
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    className="min-h-[400px] font-mono"
                                    required
                                    disabled={isSubmitting}
                                />
                                <div className={`text-sm mt-2 ${getCharacterCountColor()}`}>
                                    {content.length.toLocaleString()} characters
                                    {content.length > 524288 && (
                                        <span className="ml-2">(exceeds 512KB limit)</span>
                                    )}
                                    {content.length > 400000 && content.length <= 524288 && (
                                        <span className="ml-2">(approaching limit)</span>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <Select 
                                    value={language} 
                                    onValueChange={setLanguage} 
                                    disabled={isSubmitting}
                                >
                                    <SelectTrigger className="w-[200px]">
                                        <SelectValue placeholder="Language" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="plaintext">Plain Text</SelectItem>
                                        <SelectItem value="javascript">JavaScript</SelectItem>
                                        <SelectItem value="typescript">TypeScript</SelectItem>
                                        <SelectItem value="python">Python</SelectItem>
                                        <SelectItem value="java">Java</SelectItem>
                                        <SelectItem value="csharp">C#</SelectItem>
                                        <SelectItem value="html">HTML</SelectItem>
                                        <SelectItem value="css">CSS</SelectItem>
                                        <SelectItem value="json">JSON</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Button type="submit" disabled={isSubmitting || !content.trim()}>
                                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                                </Button>

                                <Button 
                                    type="button" 
                                    variant="outline" 
                                    onClick={() => router.push(`/paste/${params.id}`)}
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}