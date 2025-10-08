"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createPaste, getRecentPastes, getPublicStats, type RecentPasteItem, type PublicStats } from "@/lib/api"
import { useAuth } from "@/contexts/AuthContext"
import Link from "next/link"
import { Clock, Eye, User, FileCode, Users, Code2, TrendingUp } from "lucide-react"

export default function Home() {
  const router = useRouter()
  const { token } = useAuth()
  const [content, setContent] = useState("")
  const [title, setTitle] = useState("")
  const [language, setLanguage] = useState("plaintext")
  const [expiresIn, setExpiresIn] = useState("never")
  const [isLoading, setIsLoading] = useState(false)
  const [recentPastes, setRecentPastes] = useState<RecentPasteItem[]>([])
  const [loadingRecent, setLoadingRecent] = useState(true)
  const [stats, setStats] = useState<PublicStats | null>(null)
  const [loadingStats, setLoadingStats] = useState(true)

  useEffect(() => {
    loadRecentPastes()
    loadStats()
  }, [])

  const loadRecentPastes = async () => {
    try {
      const pastes = await getRecentPastes(3)
      setRecentPastes(pastes)
    } catch (error) {
      console.error('Failed to load recent pastes:', error)
    } finally {
      setLoadingRecent(false)
    }
  }

  const loadStats = async () => {
    try {
      const data = await getPublicStats()
      setStats(data)
    } catch (error) {
      console.error('Failed to load stats:', error)
    } finally {
      setLoadingStats(false)
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

    setIsLoading(true)

    try {
      const paste = await createPaste({
        content,
        title: title || undefined,
        language,
        expiresIn,
      }, token)

      toast.success("Paste created successfully!")
      
      // Refresh data
      loadRecentPastes()
      loadStats()
      
      router.push(`/paste/${paste.id}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create paste")
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault()
      handleSubmit(e as any)
    }
  }

  const formatTimeAgo = (date: string) => {
    const now = new Date()
    const created = new Date(date)
    const diffInSeconds = Math.floor((now.getTime() - created.getTime()) / 1000)

    if (diffInSeconds < 60) return 'just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
    return `${Math.floor(diffInSeconds / 86400)} days ago`
  }

  const getCharacterCountColor = () => {
    if (content.length > 524288) return 'text-destructive'
    if (content.length > 400000) return 'text-orange-500'
    return 'text-muted-foreground'
  }

  return (
    <div className="bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left side - Create Paste Form */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <div className="mb-8">
                <h1 className="text-4xl font-bold mb-2">Pasteor</h1>
                <p className="text-muted-foreground">Share code and text snippets easily</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Input
                    placeholder="Title (optional)"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="mb-4"
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <Textarea
                    placeholder="Paste your code or text here... (Ctrl+Enter to submit)"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="min-h-[400px] font-mono"
                    required
                    disabled={isLoading}
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

                <div className="flex gap-4 flex-wrap">
                  <Select value={language} onValueChange={setLanguage} disabled={isLoading}>
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

                  <Select value={expiresIn} onValueChange={setExpiresIn} disabled={isLoading}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Expires in" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="never">Never</SelectItem>
                      <SelectItem value="1h">1 Hour</SelectItem>
                      <SelectItem value="24h">24 Hours</SelectItem>
                      <SelectItem value="7d">7 Days</SelectItem>
                      <SelectItem value="30d">30 Days</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button type="submit" disabled={isLoading || !content.trim()}>
                    {isLoading ? "Creating..." : "Create Paste"}
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground">
                  💡 Tip: Press <kbd className="px-2 py-1 bg-muted rounded text-xs">Ctrl+Enter</kbd> to quickly create your paste
                </p>
              </form>
            </div>

            {/* Popular Pastes */}
            {stats && stats.popularPastes.length > 0 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    <CardTitle>Trending Pastes</CardTitle>
                  </div>
                  <CardDescription>Most viewed pastes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {stats.popularPastes.map((paste) => (
                      <Link 
                        key={paste.id} 
                        href={`/paste/${paste.id}`}
                      >
                        <Card className="h-full hover:border-primary/50 transition-colors cursor-pointer">
                          <CardContent className="p-4">
                            <div className="space-y-2">
                              <div className="flex items-start justify-between gap-2">
                                <h3 className="font-semibold text-sm truncate flex-1">
                                  {paste.title || 'Untitled Paste'}
                                </h3>
                                <Badge variant="secondary" className="text-xs shrink-0">
                                  {paste.language}
                                </Badge>
                              </div>
                              
                              <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                                <span className="flex items-center gap-1">
                                  <User className="h-3 w-3" />
                                  {paste.authorName}
                                </span>
                                <span className="flex items-center gap-1 font-semibold">
                                  <Eye className="h-3 w-3" />
                                  {paste.views}
                                </span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right side - Recent Pastes & Top Languages */}
          <div className="lg:col-span-1 space-y-6">
            {/* Top Languages */}
            {stats && stats.topLanguages.length > 0 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Code2 className="h-5 w-5" />
                    <CardTitle>Popular Languages</CardTitle>
                  </div>
                  <CardDescription>Most used languages</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats.topLanguages.map((lang, index) => (
                      <div key={lang.language} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-muted-foreground">
                            #{index + 1}
                          </span>
                          <Badge variant="outline">{lang.language}</Badge>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {lang.count} pastes
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recent Pastes */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Pastes</CardTitle>
                <CardDescription>Latest public snippets</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingRecent ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-24 w-full" />
                    ))}
                  </div>
                ) : recentPastes.length === 0 ? (
                  <div className="text-center py-8">
                    <FileCode className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-sm text-muted-foreground mb-2">
                      No pastes yet
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Create the first one! 🚀
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentPastes.map((paste, index) => (
                      <Link 
                        key={paste.id} 
                        href={`/paste/${paste.id}`}
                        className="block"
                      >
                        <Card 
                          className="hover:border-primary/50 transition-all cursor-pointer animate-in fade-in-50 duration-300"
                          style={{ animationDelay: `${index * 100}ms` }}
                        >
                          <CardContent className="p-4">
                            <div className="space-y-2">
                              <div className="flex items-start justify-between gap-2">
                                <h3 className="font-semibold text-sm truncate flex-1">
                                  {paste.title || 'Untitled Paste'}
                                </h3>
                                <Badge variant="secondary" className="text-xs">
                                  {paste.language}
                                </Badge>
                              </div>
                              
                              <p className="text-xs text-muted-foreground line-clamp-2 font-mono bg-muted/30 p-2 rounded">
                                {paste.preview}
                              </p>

                              <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                                <div className="flex items-center gap-3">
                                  <span className="flex items-center gap-1">
                                    <User className="h-3 w-3" />
                                    {paste.authorName}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Eye className="h-3 w-3" />
                                    {paste.views}
                                  </span>
                                </div>
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {formatTimeAgo(paste.createdAt)}
                                </span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Stats Section - na samym dole */}
        {stats && (
          <div className="mt-12 border-t pt-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Platform Statistics</h2>
              <p className="text-muted-foreground">Real-time insights from our community</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="text-center">
                <CardContent className="p-6">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                    <FileCode className="h-6 w-6 text-primary" />
                  </div>
                  <p className="text-3xl font-bold mb-1">{stats.totalPastes.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Total Pastes</p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="p-6">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <p className="text-3xl font-bold mb-1">{stats.totalUsers.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Active Users</p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="p-6">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                    <Code2 className="h-6 w-6 text-primary" />
                  </div>
                  <p className="text-3xl font-bold mb-1">{stats.topLanguages.length}</p>
                  <p className="text-sm text-muted-foreground">Languages Used</p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="p-6">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                  <p className="text-3xl font-bold mb-1">
                    {stats.popularPastes.length > 0 
                      ? stats.popularPastes[0].views.toLocaleString() 
                      : '0'}
                  </p>
                  <p className="text-sm text-muted-foreground">Top Paste Views</p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}