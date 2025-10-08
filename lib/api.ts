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

export interface Author {
    name: string
    avatarUrl?: string
}

export interface Paste {
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

export interface PasteListItem {
    id: string
    title?: string
    language: string
    createdAt: string
    expiresAt?: string
    views: number
    preview: string
}

export interface MyPastesResponse {
    pastes: PasteListItem[]
    totalCount: number
    page: number
    pageSize: number
    totalPages: number
}

export interface UserStats {
    totalPastes: number
    totalViews: number
    activePastes: number
    mostViewedPaste?: string
}

export async function createPaste(data: CreatePasteRequest, token?: string): Promise<PasteResponse> {
    const headers: HeadersInit = {
        "Content-Type": "application/json",
    }

    if (token) {
        headers['Authorization'] = `Bearer ${token}`
    }

    const response = await fetch(`${API_URL}/api/pastes`, {
        method: "POST",
        headers,
        body: JSON.stringify(data)
    })

    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create paste')
    }

    return response.json()
}

export async function getMyPastes(token: string, page = 1, pageSize = 20): Promise<MyPastesResponse> {
    const response = await fetch(
        `${API_URL}/api/pastes/my?page=${page}&pageSize=${pageSize}`,
        {
            headers: {
                'Authorization': `Bearer ${token}`
            },
            cache: 'no-store'
        }
    )

    if (!response.ok) {
        throw new Error('Failed to fetch pastes')
    }

    return response.json()
}

export async function getUserStats(token: string): Promise<UserStats> {
    const response = await fetch(`${API_URL}/api/pastes/stats`, {
        headers: {
            'Authorization': `Bearer ${token}`
        },
        cache: 'no-store'
    })

    if (!response.ok) {
        throw new Error('Failed to fetch stats')
    }

    return response.json()
}

export async function deletePaste(token: string, pasteId: string): Promise<void> {
    const response = await fetch(`${API_URL}/api/pastes/${pasteId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })

    if (!response.ok) {
        throw new Error('Failed to delete paste')
    }
}