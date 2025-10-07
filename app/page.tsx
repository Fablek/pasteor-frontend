"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
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
  //const [error, setError] = useState("")

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
      })

      toast.success("Paste created successfully!")
      router.push(`/paste/${paste.id}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create paste")
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
              placeholder="Paste your code or text here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[400px] font-mono"
              required
              disabled={isLoading}
            />
            <div className="text-sm text-muted-foreground mt-2">
              {content.length} characters {content.length > 524288 && (
                <span className="text-destructive">(exceeds 512KB limit)</span>
              )}
            </div>
          </div>

          <div className="flex gap-4">
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
        </form>
      </div>
    </main>
  )
}