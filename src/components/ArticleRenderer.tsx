import React from 'react'

// Hàm phân tích và chuyển đổi định dạng inline: In đậm (** / __) và In nghiêng (* / _)
export function parseInlineFormatting(text: string): React.ReactNode[] {
  if (!text) return []

  // Regex tìm kiếm các cụm: **bold**, __bold__, *italic*, _italic_
  const regex = /(\*\*|__)(.*?)\1|(\*|_)(.*?)\3/g
  const result: React.ReactNode[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      result.push(text.substring(lastIndex, match.index))
    }

    const boldMarker = match[1]
    const boldText = match[2]
    const italicMarker = match[3]
    const italicText = match[4]

    if (boldMarker && boldText !== undefined) {
      result.push(
        <strong key={`bold-${match.index}`} className="font-bold text-stone-950 dark:text-white">
          {parseInlineFormatting(boldText)}
        </strong>
      )
    } else if (italicMarker && italicText !== undefined) {
      result.push(
        <em key={`italic-${match.index}`} className="italic text-stone-800 dark:text-stone-200">
          {parseInlineFormatting(italicText)}
        </em>
      )
    }

    lastIndex = regex.lastIndex
  }

  if (lastIndex < text.length) {
    result.push(text.substring(lastIndex))
  }

  return result.length > 0 ? result : [text]
}

// Hàm chuyển đổi nội dung markdown sang HTML/JSX trang nhã (hỗ trợ đầy đủ khối và inline)
export function renderArticleContent(content: string): React.ReactNode {
  if (!content) return null

  const lines = content.split('\n')
  return lines.map((line, idx) => {
    const trimmed = line.trim()
    if (!trimmed) return <div key={idx} className="h-4" />

    // Ảnh markdown: ![alt](url)
    const imgMatch = trimmed.match(/^!\[(.*?)\]\((.*?)\)$/)
    if (imgMatch) {
      return (
        <div key={idx} className="my-8 rounded-2xl overflow-hidden shadow-lg border border-stone-200 dark:border-stone-800">
          <img
            src={imgMatch[2]}
            alt={imgMatch[1] || 'Hình ảnh bài viết'}
            className="w-full max-h-[600px] object-cover mx-auto"
          />
          {imgMatch[1] && (
            <p className="text-center text-xs text-stone-500 dark:text-stone-400 py-2.5 bg-stone-50 dark:bg-stone-900/50 italic">
              {parseInlineFormatting(imgMatch[1])}
            </p>
          )}
        </div>
      )
    }

    // Tiêu đề H2
    if (trimmed.startsWith('## ')) {
      return (
        <h2 key={idx} className="font-serif text-2xl font-bold text-stone-900 dark:text-amber-400 mt-8 mb-4">
          {parseInlineFormatting(trimmed.replace(/^##\s+/, ''))}
        </h2>
      )
    }

    // Tiêu đề H3
    if (trimmed.startsWith('### ')) {
      return (
        <h3 key={idx} className="font-serif text-xl font-bold text-stone-800 dark:text-stone-200 mt-6 mb-3">
          {parseInlineFormatting(trimmed.replace(/^###\s+/, ''))}
        </h3>
      )
    }

    // Trích dẫn blockquote
    if (trimmed.startsWith('> ')) {
      return (
        <blockquote key={idx} className="border-l-4 border-[#8B4513] bg-amber-50/50 dark:bg-amber-950/20 px-5 py-4 my-6 rounded-r-xl italic text-stone-700 dark:text-stone-300">
          {parseInlineFormatting(trimmed.replace(/^>\s+/, ''))}
        </blockquote>
      )
    }

    // Danh sách
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      return (
        <li key={idx} className="ml-6 list-disc text-stone-700 dark:text-stone-300 leading-relaxed my-1">
          {parseInlineFormatting(trimmed.replace(/^[-*]\s+/, ''))}
        </li>
      )
    }

    return (
      <p key={idx} className="text-stone-700 dark:text-stone-300 leading-8 text-base md:text-lg my-3">
        {parseInlineFormatting(trimmed)}
      </p>
    )
  })
}
