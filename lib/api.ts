const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5297'

export interface CreatePasteRequest {
    content: string
    title?: string
    language?: string
    expiresIn?: string
}

export interface PasteResponse {
    id: string
    title?: string
    language: string
    createdAt: string
    expiresAt?: string
    url: string
}

export async function createPaste(data: CreatePasteRequest): Promise<PasteResponse> {
    const response = await fetch(`${API_URL}/api/pastes`, {
        method: "POST",
        headers: {
            "Content-Type" : "application/json",
        },
        body: JSON.stringify(data)
    })

    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create paste')
    }

    return response.json()
}