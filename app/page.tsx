"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createPaste } from "@/lib/api"

export default function Home() {
  const router = useRouter()
  const [content, setContent] = useState("")
  const [title, setTitle] = useState("")
  const [language, setLanguage] = useState("plaintext")
  const [expiresIn, setExpiresIn] = useState("never")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const paste = await createPaste({
        content,
        title: title || undefined,
        language,
        expiresIn,
      })

      router.push(`/paste/${paste.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create paste")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Pasteor</h1>
          <p className="text-muted-foreground">Share code and text snippets easily</p>
        </div>

        {error && (
          <div className="bg-destructive/15 text-destructive px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              placeholder="Title (optional)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mb-4"
            />
          </div>

          <div>
            <Textarea
              placeholder="Paste your code or text here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[400px] font-mono"
              required
            />
            <div className="text-sm text-muted-foreground mt-2">
              {content.length} characters
            </div>
          </div>

          <div className="flex gap-4">
            <Select value={language} onValueChange={setLanguage}>
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

            <Select value={expiresIn} onValueChange={setExpiresIn}>
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

            <Button type="submit" disabled={isLoading || !content}>
              {isLoading ? "Creating..." : "Create Paste"}
            </Button>
          </div>
        </form>
      </div>
    </main>
  )
}