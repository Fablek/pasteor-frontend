"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { getMyPastes, getUserStats, type PasteListItem, type UserStats } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import Link from 'next/link'
import { FileText, Eye, Clock, TrendingUp } from 'lucide-react'
import { PasteCard } from '@/components/PasteCard'

export default function DashboardPage() {
    const { user, token, isLoading: authLoading } = useAuth()
    const router = useRouter()
    const [pastes, setPastes] = useState<PasteListItem[]>([])
    const [stats, setStats] = useState<UserStats | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/')
        }
    }, [authLoading, user, router])

    useEffect(() => {
        if (token && user) {
            loadData()
        }
    }, [token, user, page])

    const loadData = async () => {
        if (!token) return

        setIsLoading(true)
        try {
            const [pastesData, statsData] = await Promise.all([
                getMyPastes(token, page),
                getUserStats(token)
            ])

            setPastes(pastesData.pastes)
            setTotalPages(pastesData.totalPages)
            setStats(statsData)
        } catch (error) {
            console.error('Failed to load data:', error)
        } finally {
            setIsLoading(false)
        }
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
        <div className="container mx-auto px-4 py-8">
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
                    {isLoading ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <Skeleton key={i} className="h-32 w-full" />
                            ))}
                        </div>
                    ) : pastes.length === 0 ? (
                        <div className="text-center py-12">
                            <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No pastes yet</h3>
                            <p className="text-muted-foreground mb-4">
                                Create your first paste to get started
                            </p>
                            <Button asChild>
                                <Link href="/">Create Paste</Link>
                            </Button>
                        </div>
                    ) : (
                        <>
                            <div className="space-y-4">
                                {pastes.map((paste) => (
                                    <PasteCard 
                                        key={paste.id} 
                                        paste={paste}
                                        onDelete={loadData}
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