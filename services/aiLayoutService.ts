import { ComponentNode, CanvasConfig } from '@/editor/componentNodeTypes'

const PROD_BACKEND_URL = 'https://makeui-backend.vercel.app'
// EXPO_PUBLIC vars are inlined at build time. .env is gitignored, so EAS cloud
// builds have no .env unless vars are set as EAS secrets / eas.json env.
// Default to production so a missing env never falls back to localhost on-device.
const BACKEND_URL = process.env.EXPO_PUBLIC_AI_BACKEND_URL || PROD_BACKEND_URL
const AUTH_TOKEN = process.env.EXPO_PUBLIC_AI_AUTH_TOKEN

const TIMEOUT_MS = 60_000

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
  } catch (e) {
    // NOTE: no `instanceof DOMException` here. DOMException is a web-only global
    // and is undefined in the Hermes runtime, so referencing it throws
    // ReferenceError ("Can't find variable: DOMException") and masks the real error.
    if (e instanceof Error && e.name === 'AbortError') {
      throw new Error('AI request timed out. Please try again.')
    }
    if (e instanceof Error && e.message.includes('Network request failed')) {
      throw new Error(
        `Cannot reach AI backend at ${BACKEND_URL}. Check your connection and that the backend is deployed.`
      )
    }
    throw e
  } finally {
    clearTimeout(timeout)
  }
}
