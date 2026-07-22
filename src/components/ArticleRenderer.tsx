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

// Hàm chuyển đổi nội dung markdown sang HTML/JSX trang nhã (hỗ trợ đầy đủ khối và inline, nhóm các dòng liên tiếp)
export function renderArticleContent(content: string): React.ReactNode {
  if (!content) return null

  const lines = content.split('\n')
  const elements: React.ReactNode[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]
    const trimmed = line.trim()

    if (!trimmed) {
      elements.push(<div key={`spacer-${i}`} className="h-4" />)
      i++
      continue
    }

    // Trích dẫn blockquote (Nhóm tất cả các dòng liên tiếp bắt đầu bằng > hoặc &gt; thành 1 khối liền mạch)
    if (trimmed.startsWith('>') || trimmed.startsWith('&gt;')) {
      const quoteLines: string[] = []
      let j = i
      while (j < lines.length) {
        const currentTrimmed = lines[j].trim()
        if (currentTrimmed.startsWith('>') || currentTrimmed.startsWith('&gt;')) {
          quoteLines.push(currentTrimmed.replace(/^(>|&gt;)\s*/, ''))
          j++
        } else if (currentTrimmed === '' && j + 1 < lines.length && (lines[j + 1].trim().startsWith('>') || lines[j + 1].trim().startsWith('&gt;'))) {
          // Cho phép dòng trống giữa các đoạn trích dẫn cùng một khối nếu dòng kế tiếp vẫn là >
          quoteLines.push('')
          j++
        } else {
          break
        }
      }

      elements.push(
        <blockquote key={`quote-${i}`} className="relative border-l-4 border-[#8B4513] bg-amber-50/80 dark:bg-amber-950/30 px-6 py-5 my-6 rounded-r-2xl italic text-stone-800 dark:text-stone-200 shadow-sm overflow-hidden">
          <span className="absolute top-2 right-4 font-serif text-6xl text-[#8B4513]/10 dark:text-amber-400/10 select-none pointer-events-none">
            &ldquo;
          </span>
          <div className="relative z-10 leading-relaxed space-y-2">
            {quoteLines.map((qLine, qIdx) => (
              qLine.trim() === '' ? (
                <div key={qIdx} className="h-2" />
              ) : (
                <p key={qIdx} className="my-1">
                  {parseInlineFormatting(qLine)}
                </p>
              )
            ))}
          </div>
        </blockquote>
      )

      i = j
      continue
    }

    // Danh sách (Nhóm tất cả các dòng liên tiếp bắt đầu bằng - hoặc * thành 1 danh sách ul)
    const isListItem = (str: string) => str.startsWith('- ') || str.startsWith('* ') || (str.startsWith('-') && str.length > 1 && str[1] !== '-')
    if (isListItem(trimmed)) {
      const listItems: string[] = []
      let j = i
      while (j < lines.length) {
        const currentTrimmed = lines[j].trim()
        if (isListItem(currentTrimmed)) {
          listItems.push(currentTrimmed.replace(/^[-*]\s*/, ''))
          j++
        } else {
          break
        }
      }

      elements.push(
        <ul key={`list-${i}`} className="my-4 space-y-2 ml-6 list-disc text-stone-700 dark:text-stone-300 leading-relaxed">
          {listItems.map((item, lIdx) => (
            <li key={lIdx}>
              {parseInlineFormatting(item)}
            </li>
          ))}
        </ul>
      )

      i = j
      continue
    }

    // Ảnh markdown: ![alt](url)
    const imgMatch = trimmed.match(/^!\[(.*?)\]\((.*?)\)$/)
    if (imgMatch) {
      elements.push(
        <div key={`img-${i}`} className="my-8 rounded-2xl overflow-hidden shadow-lg border border-stone-200 dark:border-stone-800">
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
      i++
      continue
    }

    // Tiêu đề H3
    if (trimmed.startsWith('###')) {
      elements.push(
        <h3 key={`h3-${i}`} className="font-serif text-xl font-bold text-stone-800 dark:text-stone-200 mt-6 mb-3">
          {parseInlineFormatting(trimmed.replace(/^###\s*/, ''))}
        </h3>
      )
      i++
      continue
    }

    // Tiêu đề H2
    if (trimmed.startsWith('##')) {
      elements.push(
        <h2 key={`h2-${i}`} className="font-serif text-2xl font-bold text-stone-900 dark:text-amber-400 mt-8 mb-4">
          {parseInlineFormatting(trimmed.replace(/^##\s*/, ''))}
        </h2>
      )
      i++
      continue
    }

    // Đoạn văn bình thường
    elements.push(
      <p key={`p-${i}`} className="text-stone-700 dark:text-stone-300 leading-8 text-base md:text-lg my-3">
        {parseInlineFormatting(trimmed)}
      </p>
    )
    i++
  }

  return elements
}
