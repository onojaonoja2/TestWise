'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2, Zap } from 'lucide-react'

export default function GeneratePage() {
  const params = useParams()
  const router = useRouter()
  const [questionType, setQuestionType] = useState('MULTIPLE_CHOICE')
  const [count, setCount] = useState(5)
  const [difficulty, setDifficulty] = useState('medium')
  const [prompt, setPrompt] = useState('')
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault()
    setGenerating(true)
    setError(null)

    try {
      const res = await fetch(`/api/documents/${params.id}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionType, count, difficulty, prompt: prompt || undefined }),
      })

      if (!res.ok) {
        const text = await res.text()
        if (res.status === 429) throw new Error('Rate limit exceeded. Maximum 10 generations per hour.')
        throw new Error(text)
      }

      const data = await res.json()
      router.push(`/dashboard/generations/${data.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed')
    } finally {
      setGenerating(false)
    }
  }

  const inputClass =
    'w-full px-3.5 py-2.5 border border-stone-900/10 rounded-xl text-sm text-stone-900 bg-white placeholder:text-stone-400 focus:border-[#C2410C] focus:outline-none focus:ring-2 focus:ring-[#C2410C]/25 transition-all'

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link
        href={`/dashboard/documents/${params.id}`}
        className="inline-flex items-center gap-1 text-sm font-medium text-stone-500 hover:text-[#C2410C] transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to document
      </Link>

      <div>
        <h1 className="font-display text-2xl font-semibold text-stone-900 mb-2">Generate Questions</h1>
        <p className="text-sm text-stone-500">
          Configure the type and quantity of questions to generate from your document.
        </p>
      </div>

      <form onSubmit={handleGenerate} className="paper-card rounded-[1.75rem] p-6 space-y-6">
        <div>
          <label className="block text-sm font-semibold text-stone-900 mb-2">
            Question Type
          </label>
          <select
            value={questionType}
            onChange={(e) => setQuestionType(e.target.value)}
            className={inputClass}
          >
            <option value="MULTIPLE_CHOICE">Multiple Choice</option>
            <option value="TRUE_FALSE">True / False</option>
            <option value="SHORT_ANSWER">Short Answer</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-stone-900 mb-2">
            Number of Questions
          </label>
          <input
            type="number"
            min={1}
            max={50}
            value={count}
            onChange={(e) => setCount(parseInt(e.target.value) || 5)}
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-stone-900 mb-2">
            Difficulty
          </label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className={inputClass}
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-stone-900 mb-2">
            Custom Instructions (optional)
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. Focus on chapter 3 concepts about cellular respiration"
            rows={3}
            className={`${inputClass} resize-none`}
          />
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-800">
            {error}
          </div>
        )}

        <div className="flex items-center gap-4 pt-2">
          <button
            type="submit"
            disabled={generating}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-stone-900 text-[#FFF7ED] rounded-full hover:bg-[#C2410C] disabled:opacity-50 transition-colors text-sm font-semibold shadow-[0_14px_28px_-14px_rgba(28,25,23,0.6)]"
          >
            {generating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4" />
                Generate Questions
              </>
            )}
          </button>
          <Link
            href={`/dashboard/documents/${params.id}`}
            className="text-sm font-medium text-stone-500 hover:text-[#C2410C] transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
