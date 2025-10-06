"use client"

import { useEffect, useRef } from "react"
import Prism from "prismjs"
import "prismjs/themes/prism-tomorrow.css" // Lightmode: "prismjs/themes/prism.css"

// Load additional languages as needed
import "prismjs/components/prism-javascript"
import "prismjs/components/prism-typescript"
import "prismjs/components/prism-python"
import "prismjs/components/prism-java"
import "prismjs/components/prism-csharp"
import "prismjs/components/prism-markup" // HTML
import "prismjs/components/prism-css"
import "prismjs/components/prism-json"

interface CodeBlockProps {
  code: string
  language: string
}

export function CodeBlock({ code, language }: CodeBlockProps) {
    const codeRef = useRef<HTMLElement>(null)

    useEffect(() => {
        if (codeRef.current) {
            Prism.highlightElement(codeRef.current)
        }
    }, [code, language])

    // Map language names
    const languageMap: Record<string, string> = {
        javascript: "javascript",
        typescript: "typescript",
        python: "python",
        java: "java",
        csharp: "csharp",
        html: "markup",
        css: "css",
        json: "json",
        plaintext: "plaintext"
    }

    const prismLanguage = languageMap[language] || "plaintext"

    return (
        <div className="rounded-lg overflow-hidden">
            <pre className="overflow-x-auto p-6 m-0" suppressHydrationWarning>
                <code 
                ref={codeRef} 
                className={`language-${prismLanguage} text-sm`}
                suppressHydrationWarning
                >
                {code}
                </code>
            </pre>
        </div>
    )
}