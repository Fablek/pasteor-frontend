"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Copy, Link as LinkIcon, Check } from "lucide-react"

interface CopyButtonsProps {
    content: string
    pasteId: string
}

export function CopyButtons({ content, pasteId }: CopyButtonsProps) {
    const [copiedContent, setCopiedContent] = useState(false)
    const [copiedLink, setCopiedLink] = useState(false)

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(content)
            setCopiedContent(true)
            setTimeout(() => setCopiedContent(false), 2000)
        } catch (err) {
            console.error("Failed to copy content: ", err)
        }
    }

    const copyLink = async () => {
        try {
            const url = `${window.location.origin}/paste/${pasteId}`
            await navigator.clipboard.writeText(url)
            setCopiedLink(true)
            setTimeout(() => setCopiedLink(false), 2000)
        } catch (err) {
            console.error("Failed to copy link: ", err)
        }
    }

    return (
        <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={copyToClipboard}>
                {copiedContent ? (
                <Check className="w-4 h-4 mr-2" />
                ) : (
                <Copy className="w-4 h-4 mr-2" />
                )}
                {copiedContent ? "Copied!" : "Copy"}
            </Button>
            <Button variant="outline" size="sm" onClick={copyLink}>
                {copiedLink ? (
                <Check className="w-4 h-4 mr-2" />
                ) : (
                <LinkIcon className="w-4 h-4 mr-2" />
                )}
                {copiedLink ? "Copied!" : "Copy Link"}
            </Button>
        </div>
    )
}