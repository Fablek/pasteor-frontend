"use client"

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Eye, Clock, Trash2 } from 'lucide-react'
import { type PasteListItem } from '@/lib/api'
import { use, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5297'

interface PasteCardProps {
    paste: PasteListItem
    onDelete?: () => void
}

export function PasteCard({ paste, onDelete }: PasteCardProps) {
    const [isDeleting, setIsDeleting] = useState(false)
    const { token } = useAuth()

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
    }

    const handleDelete = async () => {
        if (!token) return

        setIsDeleting(true)
        try {
            const response = await fetch(`${API_URL}/api/pastes/${paste.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (response.ok) {
                toast.success('Paste deleted successfully')
                onDelete?.()
            } else {
                throw new Error('Failed to delete')
            }
        } catch (error) {
            toast.error('Failed to delete paste')
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <Card className="hover:border-primary/50 transition-colors">
            <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                    <Link href={`/paste/${paste.id}`} className="flex-1 min-w-0">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <h3 className="font-semibold truncate">
                                    {paste.title || 'Untitled Paste'}
                                </h3>
                                <Badge variant="secondary">{paste.language}</Badge>
                            </div>
                            
                            <p className="text-sm text-muted-foreground line-clamp-2 font-mono">
                                {paste.preview}
                            </p>

                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                    <Eye className="h-3 w-3" />
                                    {paste.views} views
                                </span>
                                <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {formatDate(paste.createdAt)}
                                </span>
                                {paste.expiresAt && (
                                    <span className="text-orange-500">
                                        Expires {formatDate(paste.expiresAt)}
                                    </span>
                                )}
                            </div>
                        </div>
                    </Link>

                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Delete paste?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                    {isDeleting ? 'Deleting...' : 'Delete'}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </CardContent>
        </Card>
    )
}