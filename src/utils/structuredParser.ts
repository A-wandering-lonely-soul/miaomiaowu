/**
 * 结构化内容解析器
 * 将 AI 输出文本拆分为 markdown / chart / datatable / mermaid 片段
 */

export type MarkdownSegment = { type: 'markdown'; content: string }
export type ChartSegment    = { type: 'chart';    rawJson: string }
export type TableSegment    = { type: 'datatable'; rawJson: string }
export type MermaidSegment  = { type: 'mermaid';  content: string }

export type Segment = MarkdownSegment | ChartSegment | TableSegment | MermaidSegment

export interface ChartData {
  type: 'bar' | 'line'
  title?: string
  xAxis: string[]
  series: { name: string; data: number[] }[]
}

export interface TableData {
  headers: string[]
  rows: string[][]
}

const BLOCK_RE = /```(chart|datatable|mermaid)\n([\s\S]*?)```/g

export function parseStructuredContent(text: string): Segment[] {
  const segments: Segment[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null

  BLOCK_RE.lastIndex = 0

  while ((match = BLOCK_RE.exec(text)) !== null) {
    // 收集代码块前面的普通文本
    if (match.index > lastIndex) {
      const before = text.slice(lastIndex, match.index).trim()
      if (before) segments.push({ type: 'markdown', content: before })
    }

    const lang = match[1] as 'chart' | 'datatable' | 'mermaid'
    const content = match[2].trim()

    if (lang === 'mermaid') {
      segments.push({ type: 'mermaid', content })
    } else {
      segments.push({ type: lang, rawJson: content } as ChartSegment | TableSegment)
    }

    lastIndex = match.index + match[0].length
  }

  // 收集末尾剩余文本
  if (lastIndex < text.length) {
    const remaining = text.slice(lastIndex).trim()
    if (remaining) segments.push({ type: 'markdown', content: remaining })
  }

  return segments.length > 0 ? segments : [{ type: 'markdown', content: text }]
}

/** 安全解析 JSON，失败返回 null */
export function safeParseJson<T>(raw: string): T | null {
  try {
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}
