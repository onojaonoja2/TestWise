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
        <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
      </div>
    )
  }

  if (!generation) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Generation not found</p>
        <Link href="/dashboard/documents" className="text-indigo-600 hover:text-indigo-800 mt-2 inline-block">
          Back to documents
        </Link>
      </div>
    )
  }

  if (generation.status === 'FAILED') {
    return (
      <div className="text-center py-12">
        <h2 className="text-lg font-medium text-red-700 mb-2">Generation Failed</h2>
        <p className="text-gray-500">The AI was unable to generate questions. Please try again.</p>
        <Link
          href={`/dashboard/documents/${generation.document.id}`}
          className="text-indigo-600 hover:text-indigo-800 mt-4 inline-block"
        >
          Back to document
        </Link>
      </div>
    )
  }

  if (generation.status === 'PROCESSING') {
    return (
      <div className="text-center py-12">
        <Loader2 className="h-8 w-8 text-indigo-600 animate-spin mx-auto mb-4" />
        <h2 className="text-lg font-medium text-gray-900 mb-2">Generating Questions...</h2>
        <p className="text-gray-500">This should only take a moment.</p>
      </div>
    )
  }

  const approvedCount = generation.questions.filter((q) => q.approved === true).length

  return (
    <div>
      <div className="mb-6">
        <Link
          href={`/dashboard/documents/${generation.document.id}`}
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="h-4 w-4" /> Back to {generation.document.originalName}
        </Link>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Review Questions</h1>
            <p className="text-sm text-gray-500 mt-1">
              {generation.count} {generation.questionType.replace(/_/g, ' ').toLowerCase()} questions
              {' · '}
              {generation.difficulty} difficulty
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">
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
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">
                Question {currentIndex + 1} of {totalQuestions}
              </span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  currentQuestion.approved === true
                    ? 'bg-green-100 text-green-700'
                    : currentQuestion.approved === false
                    ? 'bg-red-100 text-red-700'
                    : 'bg-gray-100 text-gray-600'
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
                className="p-1.5 text-gray-400 hover:text-gray-600 disabled:opacity-30"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => setCurrentIndex((i) => Math.min(totalQuestions - 1, i + 1))}
                disabled={currentIndex === totalQuestions - 1}
                className="p-1.5 text-gray-400 hover:text-gray-600 disabled:opacity-30"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          {editing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Question Text</label>
                <textarea
                  value={editData?.text || ''}
                  onChange={(e) => setEditData((d) => ({ ...d, text: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {currentQuestion.type === 'MULTIPLE_CHOICE' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Options</label>
                  {editData?.options?.map((opt, i) => (
                    <div key={i} className="flex items-center gap-2 mb-2">
                      <input
                        value={opt}
                        onChange={(e) => {
                          const newOpts = [...(editData?.options || [])]
                          newOpts[i] = e.target.value
                          setEditData((d) => ({ ...d, options: newOpts }))
                        }}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  ))}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Correct Answer</label>
                <input
                  value={editData?.correctAnswer || ''}
                  onChange={(e) => setEditData((d) => ({ ...d, correctAnswer: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Explanation</label>
                <textarea
                  value={editData?.explanation || ''}
                  onChange={(e) => setEditData((d) => ({ ...d, explanation: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={saveEdit}
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Question</h3>
                <p className="text-lg text-gray-900">{currentQuestion.text}</p>
              </div>

              {currentQuestion.options && currentQuestion.options.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Options</h3>
                  <div className="space-y-2">
                    {currentQuestion.options.map((opt, i) => (
                      <div
                        key={i}
                        className={`px-4 py-2.5 rounded-lg border text-sm ${
                          opt === currentQuestion.correctAnswer
                            ? 'border-green-300 bg-green-50 text-green-800'
                            : 'border-gray-200 text-gray-700'
                        }`}
                      >
                        {opt}
                        {opt === currentQuestion.correctAnswer && (
                          <Check className="h-4 w-4 inline ml-2 text-green-600" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Correct Answer</h3>
                  <p className="text-sm font-medium text-green-700">{currentQuestion.correctAnswer}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Points</h3>
                  <p className="text-sm text-gray-900">{currentQuestion.points}</p>
                </div>
              </div>

              {currentQuestion.explanation && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Explanation</h3>
                  <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">
                    {currentQuestion.explanation}
                  </p>
                </div>
              )}

              <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={startEditing}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <Edit3 className="h-4 w-4" />
                  Edit
                </button>
                {currentQuestion.approved !== true && (
                  <button
                    onClick={() => setApproved(true)}
                    disabled={saving}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    <Check className="h-4 w-4" />
                    Approve
                  </button>
                )}
                {currentQuestion.approved !== false && (
                  <button
                    onClick={() => setApproved(false)}
                    disabled={saving}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 disabled:opacity-50"
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
        <div className="mt-8 flex justify-center">
          <Link
            href={`/dashboard/generations/${params.id}/apply`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-lg font-medium"
          >
            <CheckSquare className="h-5 w-5" />
            Apply Approved Questions to Test
          </Link>
        </div>
      )}
    </div>
  )
}
