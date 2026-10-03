'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2, Check, X, Edit3, Save, ChevronLeft, ChevronRight, CheckSquare } from 'lucide-react'

interface GeneratedQuestion {
  id: string
  text: string
  type: string
  points: number
  options: string[] | null
  correctAnswer: string
  explanation: string | null
  approved: boolean | null
  feedback: string | null
}

interface Generation {
  id: string
  status: string
  questionType: string
  count: number
  difficulty: string
  prompt: string | null
  document: { id: string; originalName: string }
  questions: GeneratedQuestion[]
}

export default function ReviewGenerationPage() {
  const params = useParams()
  const router = useRouter()
  const [generation, setGeneration] = useState<Generation | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editData, setEditData] = useState<Partial<GeneratedQuestion> | null>(null)

  useEffect(() => {
    fetchGeneration()
  }, [])

  async function fetchGeneration() {
    try {
      const res = await fetch(`/api/generations/${params.id}`)
      if (res.ok) {
        setGeneration(await res.json())
      }
    } catch (error) {
      console.error('Failed to fetch generation', error)
    } finally {
      setLoading(false)
    }
  }

  const currentQuestion = generation?.questions[currentIndex]
  const totalQuestions = generation?.questions.length || 0

  function startEditing() {
    if (!currentQuestion) return
    setEditData({
      text: currentQuestion.text,
      type: currentQuestion.type,
      options: currentQuestion.options,
      correctAnswer: currentQuestion.correctAnswer,
      explanation: currentQuestion.explanation,
      points: currentQuestion.points,
    })
    setEditing(true)
  }

  async function saveEdit() {
    if (!currentQuestion || !editData) return
    setSaving(true)

    try {
      const res = await fetch(
        `/api/generations/${params.id}/questions/${currentQuestion.id}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editData),
        }
      )

      if (res.ok) {
        const updated = await res.json()
        setGeneration((prev) => {
          if (!prev) return prev
          const questions = [...prev.questions]
          questions[currentIndex] = updated
          return { ...prev, questions }
        })
        setEditing(false)
      }
    } catch (error) {
      console.error('Failed to save', error)
    } finally {
      setSaving(false)
    }
  }

  async function setApproved(approved: boolean) {
    if (!currentQuestion) return
    setSaving(true)

    try {
      const res = await fetch(
        `/api/generations/${params.id}/questions/${currentQuestion.id}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ approved }),
        }
      )

      if (res.ok) {
        const updated = await res.json()
        setGeneration((prev) => {
          if (!prev) return prev
          const questions = [...prev.questions]
          questions[currentIndex] = updated
          return { ...prev, questions }
        })
      }
    } catch (error) {
      console.error('Failed to update', error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 text-[#C2410C] animate-spin" />
      </div>
    )
  }

  if (!generation) {
    return (
      <div className="text-center py-12">
        <p className="text-stone-500">Generation not found</p>
        <Link href="/dashboard/documents" className="text-sm font-semibold text-[#9A3412] hover:text-[#C2410C] mt-2 inline-block transition-colors">
          Back to documents
        </Link>
      </div>
    )
  }

  if (generation.status === 'FAILED') {
    return (
      <div className="text-center py-12">
        <h2 className="font-display text-lg font-semibold text-red-800 mb-2">Generation Failed</h2>
        <p className="text-stone-500">The AI was unable to generate questions. Please try again.</p>
        <Link
          href={`/dashboard/documents/${generation.document.id}`}
          className="text-sm font-semibold text-[#9A3412] hover:text-[#C2410C] mt-4 inline-block transition-colors"
        >
          Back to document
        </Link>
      </div>
    )
  }

  if (generation.status === 'PROCESSING') {
    return (
      <div className="text-center py-12">
        <Loader2 className="h-8 w-8 text-[#C2410C] animate-spin mx-auto mb-4" />
        <h2 className="font-display text-lg font-semibold text-stone-900 mb-2">Generating Questions...</h2>
        <p className="text-stone-500">This should only take a moment.</p>
      </div>
    )
  }

  const approvedCount = generation.questions.filter((q) => q.approved === true).length
  const inputClass =
    'w-full px-3.5 py-2.5 border border-stone-900/10 rounded-xl text-sm text-stone-900 bg-white placeholder:text-stone-400 focus:border-[#C2410C] focus:outline-none focus:ring-2 focus:ring-[#C2410C]/25 transition-all'

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/dashboard/documents/${generation.document.id}`}
          className="inline-flex items-center gap-1 text-sm font-medium text-stone-500 hover:text-[#C2410C] mb-4 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to {generation.document.originalName}
        </Link>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-semibold text-stone-900">Review Questions</h1>
            <p className="text-sm text-stone-500 mt-1">
              {generation.count} {generation.questionType.replace(/_/g, ' ').toLowerCase()} questions
              {' · '}
              {generation.difficulty} difficulty
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="rounded-full border border-stone-900/10 bg-white px-4 py-1.5 text-sm text-stone-500 shadow-sm">
              {generation.questions.filter((q) => q.approved === true).length} approved
              {' · '}
              {generation.questions.filter((q) => q.approved === false).length} rejected
              {' · '}
              {generation.questions.filter((q) => q.approved === null).length} pending
            </span>
          </div>
        </div>
      </div>

      {totalQuestions > 0 && currentQuestion && (
        <div className="paper-card rounded-[1.75rem] p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <span className="text-sm text-stone-500">
                Question {currentIndex + 1} of {totalQuestions}
              </span>
              <span
                className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                  currentQuestion.approved === true
                    ? 'bg-emerald-100 text-emerald-800'
                    : currentQuestion.approved === false
                    ? 'bg-red-100 text-red-800'
                    : 'bg-stone-900/8 text-stone-600'
                }`}
              >
                {currentQuestion.approved === true
                  ? 'Approved'
                  : currentQuestion.approved === false
                  ? 'Rejected'
                  : 'Pending'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
                disabled={currentIndex === 0}
                className="p-1.5 text-stone-400 hover:text-[#C2410C] disabled:opacity-30 transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => setCurrentIndex((i) => Math.min(totalQuestions - 1, i + 1))}
                disabled={currentIndex === totalQuestions - 1}
                className="p-1.5 text-stone-400 hover:text-[#C2410C] disabled:opacity-30 transition-colors"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          {editing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-stone-900 mb-1">Question Text</label>
                <textarea
                  value={editData?.text || ''}
                  onChange={(e) => setEditData((d) => ({ ...d, text: e.target.value }))}
                  rows={3}
                  className={inputClass}
                />
              </div>

              {currentQuestion.type === 'MULTIPLE_CHOICE' && (
                <div>
                  <label className="block text-sm font-semibold text-stone-900 mb-1">Options</label>
                  {editData?.options?.map((opt, i) => (
                    <div key={i} className="flex items-center gap-2 mb-2">
                      <input
                        value={opt}
                        onChange={(e) => {
                          const newOpts = [...(editData?.options || [])]
                          newOpts[i] = e.target.value
                          setEditData((d) => ({ ...d, options: newOpts }))
                        }}
                        className={inputClass}
                      />
                    </div>
                  ))}
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-stone-900 mb-1">Correct Answer</label>
                <input
                  value={editData?.correctAnswer || ''}
                  onChange={(e) => setEditData((d) => ({ ...d, correctAnswer: e.target.value }))}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-stone-900 mb-1">Explanation</label>
                <textarea
                  value={editData?.explanation || ''}
                  onChange={(e) => setEditData((d) => ({ ...d, explanation: e.target.value }))}
                  rows={2}
                  className={inputClass}
                />
              </div>

              <div className="flex items-center gap-4 pt-2">
                <button
                  onClick={saveEdit}
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-stone-900 text-[#FFF7ED] rounded-full hover:bg-[#C2410C] disabled:opacity-50 text-sm font-semibold transition-colors"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="text-sm font-medium text-stone-500 hover:text-[#C2410C] transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-stone-400 mb-2">Question</h3>
                <p className="font-display text-lg font-medium text-stone-900">{currentQuestion.text}</p>
              </div>

              {currentQuestion.options && currentQuestion.options.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-stone-400 mb-2">Options</h3>
                  <div className="space-y-2">
                    {currentQuestion.options.map((opt, i) => (
                      <div
                        key={i}
                        className={`px-4 py-2.5 rounded-xl border text-sm ${
                          opt === currentQuestion.correctAnswer
                            ? 'border-emerald-300 bg-emerald-50 text-emerald-900'
                            : 'border-stone-900/10 bg-[#FAF7F1] text-stone-700'
                        }`}
                      >
                        {opt}
                        {opt === currentQuestion.correctAnswer && (
                          <Check className="h-4 w-4 inline ml-2 text-emerald-600" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-stone-400 mb-1">Correct Answer</h3>
                  <p className="text-sm font-semibold text-emerald-800">{currentQuestion.correctAnswer}</p>
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-stone-400 mb-1">Points</h3>
                  <p className="text-sm font-semibold text-stone-900">{currentQuestion.points}</p>
                </div>
              </div>

              {currentQuestion.explanation && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-stone-400 mb-1">Explanation</h3>
                  <p className="text-sm text-stone-700 bg-[#FAF7F1] border border-stone-900/8 rounded-xl p-3">
                    {currentQuestion.explanation}
                  </p>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-stone-900/10">
                <button
                  onClick={startEditing}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-stone-900 bg-white border border-stone-900/10 rounded-full hover:bg-[#FAF7F1] transition-colors"
                >
                  <Edit3 className="h-4 w-4" />
                  Edit
                </button>
                {currentQuestion.approved !== true && (
                  <button
                    onClick={() => setApproved(true)}
                    disabled={saving}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-emerald-700 rounded-full hover:bg-emerald-800 disabled:opacity-50 transition-colors"
                  >
                    <Check className="h-4 w-4" />
                    Approve
                  </button>
                )}
                {currentQuestion.approved !== false && (
                  <button
                    onClick={() => setApproved(false)}
                    disabled={saving}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-full hover:bg-red-700 disabled:opacity-50 transition-colors"
                  >
                    <X className="h-4 w-4" />
                    Reject
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {totalQuestions > 0 && (
        <div className="mt-2 flex justify-center">
          <Link
            href={`/dashboard/generations/${params.id}/apply`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-stone-900 text-[#FFF7ED] rounded-full hover:bg-[#C2410C] transition-colors text-base font-semibold shadow-[0_14px_28px_-14px_rgba(28,25,23,0.6)]"
          >
            <CheckSquare className="h-5 w-5" />
            Apply Approved Questions to Test
          </Link>
        </div>
      )}
    </div>
  )
}
