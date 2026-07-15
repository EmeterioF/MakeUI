import { ComponentNode, CanvasConfig } from '@/editor/componentNodeTypes';

const OPENAI_API_URL = 'https://models.github.ai/inference/chat/completions';

interface AiLayoutSuggestion {
  componentTree: ComponentNode[];
  improvements: string[];
  label: string;
}

interface AiLayoutMultiResponse {
  suggestions: AiLayoutSuggestion[];
}

function stripCodeFences(content: string): string {
  return content
    .replace(/^```(?:json)?\s*\n?/i, '')
    .replace(/\n?```\s*$/i, '')
    .trim();
}

function isValidComponentNode(node: any): boolean {
  return (
    node &&
    typeof node === 'object' &&
    typeof node.id === 'string' &&
    ['View', 'Text', 'Button', 'Image'].includes(node.type) &&
    typeof node.x === 'number' &&
    typeof node.y === 'number' &&
    node.style &&
    typeof node.style === 'object'
  );
}

function validateComponentTree(tree: any): ComponentNode[] | null {
  if (!Array.isArray(tree)) return null;
  if (tree.length === 0) return null;
  return tree.every(isValidComponentNode) ? tree : null;
}

export async function generateLayoutSuggestions(
  currentTree: ComponentNode[],
  canvasConfig: CanvasConfig
): Promise<AiLayoutMultiResponse> {
  const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;

  const systemPrompt = `You are a React Native UI layout expert specializing in Material Design for Android.

Your task is to analyze a component tree and suggest 4 DISTINCT layout improvements.

Each suggestion should focus on a different improvement area:
1. "Spacing Focus" - Improve padding, margins, gaps between components
2. "Alignment Focus" - Improve flex alignment, justify content, align items, layout direction
3. "Visual Polish" - Improve colors, border radius, typography, visual consistency
4. "Balanced" - A well-rounded improvement across all areas

RULES:
1. Return ONLY valid JSON matching the exact schema below
2. Follow Material Design guidelines for Android
3. Do NOT add new components - only improve existing ones
4. Do NOT change component types - only adjust style properties
5. Keep the same nesting structure and component IDs
6. Each suggestion must be meaningfully different from the others
7. Preserve all x, y coordinates exactly as provided

ComponentNode schema:
{
  "id": "string",
  "type": "View" | "Text" | "Button" | "Image",
  "x": number,
  "y": number,
  "style": ComponentStyle,
  "content": "string",
  "children": ComponentNode[]
}

Response JSON schema:
{
  "suggestions": [
    {
      "label": "Spacing Focus",
      "componentTree": [...improved nodes...],
      "improvements": ["list of changes made"]
    },
    {
      "label": "Alignment Focus",
      "componentTree": [...improved nodes...],
      "improvements": ["list of changes made"]
    },
    {
      "label": "Visual Polish",
      "componentTree": [...improved nodes...],
      "improvements": ["list of changes made"]
    },
    {
      "label": "Balanced",
      "componentTree": [...improved nodes...],
      "improvements": ["list of changes made"]
    }
  ]
}`;

  const userPrompt = `Improve this React Native layout with 4 distinct variations:

Current component tree:
${JSON.stringify(currentTree, null, 2)}

Canvas config:
${JSON.stringify(canvasConfig, null, 2)}

Return exactly 4 suggestions as valid JSON.`;

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
      temperature: 0.4,
      max_tokens: 8000,
    }),
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  const data = await response.json();

  if (!data.choices?.[0]?.message?.content) {
    throw new Error('AI returned empty response');
  }

  const content = stripCodeFences(data.choices[0].message.content);
  const parsed = JSON.parse(content);

  const rawSuggestions = parsed.suggestions || (Array.isArray(parsed) ? parsed : [parsed]);
  const validSuggestions: AiLayoutSuggestion[] = [];

  for (const raw of rawSuggestions) {
    const tree = validateComponentTree(raw.componentTree);
    if (tree) {
      validSuggestions.push({
        componentTree: tree,
        improvements: Array.isArray(raw.improvements) ? raw.improvements : [],
        label: raw.label || `Suggestion ${validSuggestions.length + 1}`,
      });
    }
  }

  if (validSuggestions.length === 0) {
    throw new Error('AI returned no valid suggestions');
  }

  return { suggestions: validSuggestions.slice(0, 4) };
}
