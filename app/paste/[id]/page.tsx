import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { CodeBlock } from "@/components/CodeBlock"
import { CopyButtons } from "@/components/CopyButtons"

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5297'

interface Paste {
    id: string
    content: string
    title?: string
    language: string
    createdAt: string
    expiresAt?: string
    views: number
    createdByIp: string
}

async function getPaste(id: string): Promise<Paste | null> {
    try {
        const response = await fetch(`${API_URL}/api/pastes/${id}`, {
            cache: 'no-store'
        })

        if (!response.ok) {
            return null
        }

        return response.json()
    } catch {
        return null
    }
}

export default async function PastePage({ params }: { params: { id: string } }) {
    const paste = await getPaste(params.id)

    if (!paste) {
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
                    <div>
                        <h1 className="text-2xl font-bold mb-1">
                            {paste.title || "Untitled Paste"}
                        </h1>
                        <div className="flex gap-4 text-sm text-muted-foreground">
                            <span>Language: {paste.language}</span>
                            <span>Views: {paste.views}</span>
                            <span>Created: {formatDate(paste.createdAt)}</span>
                            {paste.expiresAt && (
                                <span>Expires: {formatDate(paste.expiresAt)}</span>
                            )}
                        </div>
                    </div>

                    <CopyButtons content={paste.content} pasteId={paste.id} />
                </div>

                <CodeBlock code={paste.content} language={paste.language} />

                <div className="mt-6 text-center">
                    <Button variant="link" asChild>
                        <Link href="/">Create New Paste</Link>
                    </Button>
                </div>
            </div>
        </div>
    )
}