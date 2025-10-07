"use client"

import { useEffect, useRef, useState } from "react"
import { useTheme } from "next-themes"
import Prism from "prismjs"

// Import languages only
import "prismjs/components/prism-javascript"
import "prismjs/components/prism-typescript"
import "prismjs/components/prism-python"
import "prismjs/components/prism-java"
import "prismjs/components/prism-csharp"
import "prismjs/components/prism-markup"
import "prismjs/components/prism-css"
import "prismjs/components/prism-json"

interface CodeBlockProps {
  code: string
  language: string
}

export function CodeBlock({ code, language }: CodeBlockProps) {
  const codeRef = useRef<HTMLElement>(null)
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [themeLoaded, setThemeLoaded] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    // Remove old theme stylesheets
    const oldThemes = document.querySelectorAll('link[data-prism-theme]')
    oldThemes.forEach(link => link.remove())

    // Add new theme
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.setAttribute('data-prism-theme', 'true')
    
    if (resolvedTheme === 'dark') {
      link.href = 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-okaidia.min.css'
    } else {
      link.href = 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism.min.css'
    }

    link.onload = () => {
      setThemeLoaded(true)
      if (codeRef.current) {
        Prism.highlightElement(codeRef.current)
      }
    }

    document.head.appendChild(link)
  }, [mounted, resolvedTheme])

  useEffect(() => {
    if (codeRef.current && themeLoaded) {
      Prism.highlightElement(codeRef.current)
    }
  }, [code, language, themeLoaded])

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

  if (!mounted) {
    return (
      <div className="rounded-lg overflow-hidden border bg-muted">
        <pre className="p-6 overflow-x-auto" style={{ margin: 0 }} suppressHydrationWarning>
          <code 
            className={`language-${prismLanguage} font-mono text-sm`}
            suppressHydrationWarning
          >
            {code}
          </code>
        </pre>
      </div>
    )
  }

  return (
    <div className="rounded-lg overflow-hidden border">
      <pre className="p-6 overflow-x-auto" style={{ margin: 0 }} suppressHydrationWarning>
        <code
          ref={codeRef}
          className={`language-${prismLanguage} font-mono text-sm`}
          suppressHydrationWarning
        >
          {code}
        </code>
      </pre>
    </div>
  )
}