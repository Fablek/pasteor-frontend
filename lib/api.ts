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

export interface UpdatePasteRequest {
    content?: string
    title?: string
    language?: string
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

export interface RecentPasteItem {
    id: string
    title?: string
    language: string
    createdAt: string
    views: number
    authorName: string
    preview: string
}

export interface LanguageStats {
    language: string
    count: number
}

export interface PopularPasteItem {
    id: string
    title?: string
    language: string
    views: number
    createdAt: string
    authorName: string
}

export interface PublicStats {
    totalPastes: number
    totalUsers: number
    topLanguages: LanguageStats[]
    popularPastes: PopularPasteItem[]
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

export async function getMyPastes(
    token: string, 
    page = 1, 
    pageSize = 20,
    search?: string,
    language?: string,
    sortBy?: string
): Promise<MyPastesResponse> {
    const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString()
    })

    if (search) params.append('search', search)
    if (language && language !== 'all') params.append('language', language)
    if (sortBy) params.append('sortBy', sortBy)

    const response = await fetch(
        `${API_URL}/api/pastes/my?${params.toString()}`,
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

export async function updatePaste(
    token: string,
    pasteId: string,
    data: UpdatePasteRequest
): Promise<PasteResponse> {
    const response = await fetch(`${API_URL}/api/pastes/${pasteId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
    })

    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update paste')
    }

    return response.json()
}

export async function getUserLanguages(token: string): Promise<string[]> {
    const response = await fetch(`${API_URL}/api/pastes/languages`, {
        headers: {
            'Authorization': `Bearer ${token}`
        },
        cache: 'no-store'
    })

    if (!response.ok) {
        throw new Error('Failed to fetch languages')
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

export async function getRecentPastes(limit = 10): Promise<RecentPasteItem[]> {
    const response = await fetch(`${API_URL}/api/pastes/recent?limit=${limit}`, {
        cache: 'no-store'
    })

    if (!response.ok) {
        throw new Error('Failed to fetch recent pastes')
    }

    return response.json()
}

export async function getPublicStats(): Promise<PublicStats> {
    const response = await fetch(`${API_URL}/api/pastes/public-stats`, {
        cache: 'no-store'
    })

    if (!response.ok) {
        throw new Error('Failed to fetch public stats')
    }

    return response.json()
}