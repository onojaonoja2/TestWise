import { generateCompletion } from "@/lib/openrouter"
import { prisma } from "@/lib/prisma"

export interface GenerateQuestionsParams {
  documentId: string
  documentContent?: string
  questionType: string
  count: number
  difficulty: string
  customPrompt?: string
}

export interface GeneratedQuestionOutput {
  text: string
  type: string
  options?: string[]
  correctAnswer: string
  explanation: string
  sourceChunks: number[]
}

function buildSystemPrompt(
  questionType: string,
  count: number,
  difficulty: string
): string {
  return `You are an expert educational assessment creator. Generate ${count} ${questionType.toLowerCase().replace(/_/g, " ")} questions at a ${difficulty} difficulty level based ONLY on the document content provided.

IMPORTANT: You must base every question strictly on the information provided in the document below. Do not generate questions about topics not covered in the document.

Each question must test comprehension, analysis, or application — not just memorization.

For each question, provide:
- text: the question (based ONLY on the document content)
- type: "${questionType}"
- options: array of answer choices (for MULTIPLE_CHOICE, include exactly 4 options; for TRUE_FALSE, include ["True", "False"]; for SHORT_ANSWER, omit or set to null)
- correctAnswer: the correct answer
- explanation: why this answer is correct (reference specific details from the document when possible)

Ensure distractors (wrong options for MCQ) are realistic and cover common misconceptions. They should still be related to the document content.

Output a JSON object with a single key "questions" containing an array of question objects.`
}

export async function generateQuestionsFromDocument(
  params: GenerateQuestionsParams
): Promise<GeneratedQuestionOutput[]> {
  const { documentId, documentContent, questionType, count, difficulty, customPrompt } = params

  let content = documentContent
  if (!content) {
    const document = await prisma.document.findUnique({
      where: { id: documentId },
      select: { content: true },
    })
    content = document?.content || ""
  }

  if (!content) {
    throw new Error("Document has no content to generate questions from")
  }

  const truncatedContent = content.length > 100000 
    ? content.slice(0, 100000) + "\n\n[Document truncated]"
    : content

  const systemPrompt = buildSystemPrompt(questionType, count, difficulty)

  const userPrompt = customPrompt
    ? `${customPrompt}\n\nUse ONLY the following document content to generate questions:\n\n${truncatedContent}`
    : `Generate ${count} ${difficulty} ${questionType.toLowerCase().replace(/_/g, " ")} questions based ONLY on the document below:\n\n${truncatedContent}`

  const response = await generateCompletion({
    systemPrompt,
    userPrompt,
    jsonMode: true,
    temperature: 0.3,
  })

  const parsed = JSON.parse(response)

  if (!parsed.questions || !Array.isArray(parsed.questions)) {
    throw new Error("LLM response did not contain a questions array")
  }

  return parsed.questions.map((q: GeneratedQuestionOutput) => ({
    ...q,
    sourceChunks: [],
  }))
}
