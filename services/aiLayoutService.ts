import { ComponentNode, CanvasConfig } from '@/editor/componentNodeTypes';

const OPENAI_API_URL = 'https://models.github.ai/inference/chat/completions';

interface AiLayoutResponse {
  componentTree: ComponentNode[];
  improvements: string[];
}

export async function generateLayoutSuggestion(
  currentTree: ComponentNode[],
  canvasConfig: CanvasConfig
): Promise<AiLayoutResponse> {
  const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;

  const systemPrompt = `You are a React Native UI layout expert specializing in Material Design for Android.

Your task is to analyze a component tree and suggest improvements to:
- Spacing (padding, margins, gaps between components)
- Alignment (flex alignment, justify content, align items)
- Font sizing (text properties)
- Visual consistency (colors, border radius, overall design)

RULES:
1. Return ONLY valid JSON matching the ComponentNode[] schema
2. Follow Material Design guidelines for Android
3. Do NOT add new components - only improve existing ones
4. Do NOT change component types - only adjust style properties
5. Keep the same nesting structure
6. Return the improved componentTree array

ComponentNode schema:
{
  id: string,
  type: 'View' | 'Text' | 'Button' | 'Image',
  x: number,
  y: number,
  style: ComponentStyle,
  content: string,
  children: ComponentNode[]
}`;

  const userPrompt = `Improve this React Native layout:

Current component tree:
${JSON.stringify(currentTree, null, 2)}

Canvas config:
${JSON.stringify(canvasConfig, null, 2)}

Return the improved component tree as valid JSON.`;

  const response = await fetch(OPENAI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'openai/gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: 4000,
    }),
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;

  const cleaned = content
    .replace(/^```(?:json)?\s*\n?/i, '')
    .replace(/\n?```\s*$/i, '')
    .trim();

  const parsed = JSON.parse(cleaned);

  return {
    componentTree: parsed.componentTree || parsed,
    improvements: parsed.improvements || [],
  };
}
