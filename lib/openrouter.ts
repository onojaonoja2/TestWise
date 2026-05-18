import OpenAI from "openai"

const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1"

function getOpenRouterClient(): OpenAI {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY must be set")
  }

  return new OpenAI({
    baseURL: OPENROUTER_BASE_URL,
    apiKey,
    defaultHeaders: {
      "HTTP-Referer": process.env.NEXTAUTH_URL || "http://localhost:3000",
      "X-Title": "TestWise",
    },
  })
}

let client: OpenAI | null = null

function getClient(): OpenAI {
  if (!client) {
    client = getOpenRouterClient()
  }
  return client
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const openai = getClient()

  const response = await openai.embeddings.create({
    model: "openai/text-embedding-3-small",
    input: text,
  })

  return response.data[0].embedding
}

export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  const openai = getClient()

  const response = await openai.embeddings.create({
    model: "openai/text-embedding-3-small",
    input: texts,
  })

  return response.data.map((d) => d.embedding)
}

interface GenerateCompletionParams {
  systemPrompt: string
  userPrompt: string
  jsonMode?: boolean
  model?: string
  maxTokens?: number
  temperature?: number
}

export async function generateCompletion(
  params: GenerateCompletionParams
): Promise<string> {
  const openai = getClient()
  const model = params.model || process.env.OPENROUTER_MODEL || "openai/gpt-4o"

  const response = await openai.chat.completions.create({
    model,
    messages: [
      { role: "system", content: params.systemPrompt },
      { role: "user", content: params.userPrompt },
    ],
    response_format: params.jsonMode ? { type: "json_object" } : undefined,
    max_tokens: params.maxTokens ?? 1500,
    temperature: params.temperature ?? 0.3,
  })

  const content = response.choices[0]?.message?.content
  if (!content) {
    throw new Error("No content in LLM response")
  }

  return content
}

export function createStreamingCompletion(params: GenerateCompletionParams) {
  const openai = getClient()
  const model = params.model || process.env.OPENROUTER_MODEL || "openai/gpt-4o"

  return openai.chat.completions.create({
    model,
    messages: [
      { role: "system", content: params.systemPrompt },
      { role: "user", content: params.userPrompt },
    ],
    max_tokens: params.maxTokens ?? 4096,
    temperature: params.temperature ?? 0.3,
    stream: true,
  })
}
