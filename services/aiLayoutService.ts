import { ComponentNode, CanvasConfig } from '@/editor/componentNodeTypes'

const PROD_BACKEND_URL = 'https://makeui-backend.vercel.app'
// EXPO_PUBLIC vars are inlined at build time. .env is gitignored, so EAS cloud
// builds have no .env unless vars are set as EAS secrets / eas.json env.
// Default to production so a missing env never falls back to localhost on-device.
const BACKEND_URL = process.env.EXPO_PUBLIC_AI_BACKEND_URL || PROD_BACKEND_URL
const AUTH_TOKEN = process.env.EXPO_PUBLIC_AI_AUTH_TOKEN

const TIMEOUT_MS = 60_000

// One silent retry for transient backend pressure (503 overload, 429 quota).
// The backend marks these { retryable: true } and 429s carry the server's
// suggested wait. A single retry keeps the spinner up and usually succeeds;
// anything persistent still surfaces to the user after it.
const MAX_ATTEMPTS = 2
const DEFAULT_RETRY_WAIT_MS = 5_000
const MAX_RETRY_WAIT_MS = 30_000

interface AiLayoutMultiResponse {
  suggestions: Array<{
    componentTree: ComponentNode[]
    improvements: string[]
    label: string
  }>
}

interface AiErrorBody {
  error?: string
  retryable?: boolean
  retryAfterSeconds?: number
}

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

export async function generateLayoutSuggestions(
  currentTree: ComponentNode[],
  canvasConfig: CanvasConfig
): Promise<AiLayoutMultiResponse> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (AUTH_TOKEN) {
    headers['Authorization'] = `Bearer ${AUTH_TOKEN}`
  }

  const url = `${BACKEND_URL}/api/ai/layout`
  const body = JSON.stringify({ componentTree: currentTree, canvasConfig })

  let lastError: Error = new Error('AI enhancement failed')

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS)

    try {
      console.log('[AiLayout] POST', url, `(attempt ${attempt})`)

      const res = await fetch(url, {
        method: 'POST',
        headers,
        body,
        signal: controller.signal,
      })

      if (!res.ok) {
        const err = (await res.json().catch(() => ({ error: `HTTP ${res.status}` }))) as AiErrorBody
        console.error('[AiLayout] Error response', res.status, err)
        if (err.retryable && attempt < MAX_ATTEMPTS) {
          const waitMs = Math.min((err.retryAfterSeconds ?? DEFAULT_RETRY_WAIT_MS / 1000) * 1000, MAX_RETRY_WAIT_MS)
          console.log(`[AiLayout] Retryable (${res.status}), retrying in ${waitMs}ms`)
          await wait(waitMs)
          continue
        }
        throw new Error(err.error || 'AI backend request failed')
      }

      const data = (await res.json()) as AiLayoutMultiResponse
      console.log('[AiLayout] Success', data)
      return data
    } catch (e) {
      // NOTE: no `instanceof DOMException` here. DOMException is a web-only global
      // and is undefined in the Hermes runtime, so referencing it throws
      // ReferenceError ("Can't find variable: DOMException") and masks the real error.
      if (e instanceof Error && e.name === 'AbortError') {
        lastError = new Error('AI request timed out. Please try again.')
      } else if (e instanceof Error && e.message.includes('Network request failed')) {
        lastError = new Error(
          `Cannot reach AI backend at ${BACKEND_URL}. Check your connection and that the backend is deployed.`
        )
      } else if (e instanceof Error) {
        lastError = e
      }
      break
    } finally {
      clearTimeout(timeout)
    }
  }

  throw lastError
}
