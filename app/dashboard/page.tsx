'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { getMyPastes, getUserStats, getUserLanguages, type PasteListItem, type UserStats } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import Link from 'next/link'
import { FileText, Eye, Clock, TrendingUp, Search } from 'lucide-react'
import { PasteCard } from '@/components/PasteCard'

export default function DashboardPage() {
    const { user, token, isLoading: authLoading } = useAuth()
    const router = useRouter()
    const [pastes, setPastes] = useState<PasteListItem[]>([])
    const [stats, setStats] = useState<UserStats | null>(null)
    const [languages, setLanguages] = useState<string[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    
    // Filters
    const [search, setSearch] = useState('')
    const [searchInput, setSearchInput] = useState('')
    const [selectedLanguage, setSelectedLanguage] = useState('all')
    const [sortBy, setSortBy] = useState('date')

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/')
        }
    }, [authLoading, user, router])

    useEffect(() => {
        if (token && user) {
            loadLanguages()
            loadStats()
        }
    }, [token, user])

    useEffect(() => {
        if (token && user) {
            loadPastes()
        }
    }, [token, user, page, search, selectedLanguage, sortBy])

    const loadLanguages = async () => {
        if (!token) return
        try {
            const langs = await getUserLanguages(token)
            setLanguages(langs)
        } catch (error) {
            console.error('Failed to load languages:', error)
        }
    }

    const loadStats = async () => {
        if (!token) return
        try {
            const statsData = await getUserStats(token)
            setStats(statsData)
        } catch (error) {
            console.error('Failed to load stats:', error)
        }
    }

    const loadPastes = async () => {
        if (!token) return

        setIsLoading(true)
        try {
            const pastesData = await getMyPastes(
                token, 
                page, 
                20, 
                search || undefined, 
                selectedLanguage,
                sortBy
            )

            setPastes(pastesData.pastes)
            setTotalPages(pastesData.totalPages)
        } catch (error) {
            console.error('Failed to load pastes:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        setSearch(searchInput)
        setPage(1) // Reset to first page on new search
    }

    const handleLanguageChange = (value: string) => {
        setSelectedLanguage(value)
        setPage(1)
    }

    const handleSortChange = (value: string) => {
        setSortBy(value)
        setPage(1)
    }

    const handleResetFilters = () => {
        setSearch('')
        setSearchInput('')
        setSelectedLanguage('all')
        setSortBy('date')
        setPage(1)
    }

    if (authLoading || !user) {
        return (
            <div className="container mx-auto p-8">
                <Skeleton className="h-8 w-64 mb-4" />
                <Skeleton className="h-32 w-full mb-4" />
                <Skeleton className="h-64 w-full" />
            </div>
        )
    }

    return (
        <div className="container mx-auto p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">My Dashboard</h1>
                <p className="text-muted-foreground">
                    Welcome back, {user.name || user.email}!
                </p>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Pastes</CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalPastes}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                            <Eye className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalViews}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Pastes</CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.activePastes}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Most Viewed</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            {stats.mostViewedPaste ? (
                                <Link href={`/paste/${stats.mostViewedPaste}`}>
                                    <div className="text-sm font-medium text-primary hover:underline">
                                        View paste →
                                    </div>
                                </Link>
                            ) : (
                                <div className="text-sm text-muted-foreground">No pastes yet</div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Pastes List */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>My Pastes</CardTitle>
                            <CardDescription>
                                All your created pastes in one place
                            </CardDescription>
                        </div>
                        <Button asChild>
                            <Link href="/">Create New Paste</Link>
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {/* Filters */}
                    <div className="mb-6 space-y-4">
                        <form onSubmit={handleSearch} className="flex gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by title or content..."
                                    value={searchInput}
                                    onChange={(e) => setSearchInput(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            <Button type="submit">Search</Button>
                        </form>

                        <div className="flex gap-2 flex-wrap">
                            <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Language" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Languages</SelectItem>
                                    {languages.map((lang) => (
                                        <SelectItem key={lang} value={lang}>
                                            {lang}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select value={sortBy} onValueChange={handleSortChange}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Sort by" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="date">Date (Newest)</SelectItem>
                                    <SelectItem value="views">Most Views</SelectItem>
                                    <SelectItem value="title">Title (A-Z)</SelectItem>
                                </SelectContent>
                            </Select>

                            {(search || selectedLanguage !== 'all' || sortBy !== 'date') && (
                                <Button variant="outline" onClick={handleResetFilters}>
                                    Reset Filters
                                </Button>
                            )}
                        </div>

                        {(search || selectedLanguage !== 'all') && (
                            <div className="text-sm text-muted-foreground">
                                {search && `Searching for: "${search}" `}
                                {selectedLanguage !== 'all' && `• Language: ${selectedLanguage}`}
                            </div>
                        )}
                    </div>

                    {isLoading ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <Skeleton key={i} className="h-32 w-full" />
                            ))}
                        </div>
                    ) : pastes.length === 0 ? (
                        <div className="text-center py-12">
                            <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold mb-2">
                                {search || selectedLanguage !== 'all' 
                                    ? 'No pastes found' 
                                    : 'No pastes yet'}
                            </h3>
                            <p className="text-muted-foreground mb-4">
                                {search || selectedLanguage !== 'all'
                                    ? 'Try adjusting your filters'
                                    : 'Create your first paste to get started'}
                            </p>
                            {search || selectedLanguage !== 'all' ? (
                                <Button variant="outline" onClick={handleResetFilters}>
                                    Clear Filters
                                </Button>
                            ) : (
                                <Button asChild>
                                    <Link href="/">Create Paste</Link>
                                </Button>
                            )}
                        </div>
                    ) : (
                        <>
                            <div className="space-y-4">
                                {pastes.map((paste) => (
                                    <PasteCard 
                                        key={paste.id} 
                                        paste={paste}
                                        onDelete={() => {
                                            loadPastes()
                                            loadStats()
                                        }}
                                    />
                                ))}
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex justify-center gap-2 mt-6">
                                    <Button
                                        variant="outline"
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                    >
                                        Previous
                                    </Button>
                                    <div className="flex items-center px-4">
                                        Page {page} of {totalPages}
                                    </div>
                                    <Button
                                        variant="outline"
                                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                        disabled={page === totalPages}
                                    >
                                        Next
                                    </Button>
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}