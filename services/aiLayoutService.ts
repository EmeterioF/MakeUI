import { ComponentNode, CanvasConfig } from '@/editor/componentNodeTypes'

const BACKEND_URL = process.env.EXPO_PUBLIC_AI_BACKEND_URL || 'http://localhost:3000'
const AUTH_TOKEN = process.env.EXPO_PUBLIC_AI_AUTH_TOKEN

const TIMEOUT_MS = 30_000

interface AiLayoutMultiResponse {
  suggestions: Array<{
    componentTree: ComponentNode[]
    improvements: string[]
    label: string
  }>
}

export async function generateLayoutSuggestions(
  currentTree: ComponentNode[],
  canvasConfig: CanvasConfig
): Promise<AiLayoutMultiResponse> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (AUTH_TOKEN) {
      headers['Authorization'] = `Bearer ${AUTH_TOKEN}`
    }

    const url = `${BACKEND_URL}/api/ai/layout`
    console.log('[AiLayout] POST', url)

    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({ componentTree: currentTree, canvasConfig }),
      signal: controller.signal,
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
      console.error('[AiLayout] Error response', res.status, err)
      throw new Error(err.error || 'AI backend request failed')
    }

    const data = await res.json()
    console.log('[AiLayout] Success', data)
    return data
  } finally {
    clearTimeout(timeout)
  }
}
