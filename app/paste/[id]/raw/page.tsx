import { notFound } from "next/navigation"

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5297'

interface Paste {
    id: string
    content: string
    title?: string
    language: string
    createdAt: string
    expiresAt?: string
    views: number
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

export default async function RawPastePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const paste = await getPaste(id)

    if (!paste) {
        notFound()
    }

    return (
        <pre className="whitespace-pre-wrap break-words p-4 font-mono text-sm">
            {paste.content}
        </pre>
    )
}