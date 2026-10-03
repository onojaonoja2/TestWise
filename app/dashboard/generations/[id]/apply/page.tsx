'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2, CheckSquare, Plus, List } from 'lucide-react'

interface Test {
  id: string
  title: string
  published: boolean
  _count: { submissions: number; questions: number }
}

export default function ApplyGenerationPage() {
  const params = useParams()
  const router = useRouter()
  const [mode, setMode] = useState<'new' | 'existing' | null>(null)
  const [tests, setTests] = useState<Test[]>([])
  const [loading, setLoading] = useState(false)
  const [applying, setApplying] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [duration, setDuration] = useState(30)
  const [selectedTestId, setSelectedTestId] = useState('')

  useEffect(() => {
    if (mode === 'existing') fetchTests()
  }, [mode])

  async function fetchTests() {
    setLoading(true)
    try {
      const res = await fetch(`/api/tests`)
      if (res.ok) {
        const allTests = await res.json()
        setTests(allTests.filter((t: Test) => !t.published && t._count.submissions === 0))
      }
    } catch (error) {
      console.error('Failed to fetch tests', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleApply() {
    if (mode === 'new' && !title) {
      setError('Please enter a test title')
      return
    }
    if (mode === 'existing' && !selectedTestId) {
      setError('Please select a test')
      return
    }

    setApplying(true)
    setError(null)

    try {
      const body =
        mode === 'new'
          ? { title, description, duration }
          : { testId: selectedTestId }

      const res = await fetch(`/api/generations/${params.id}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const text = await res.text()
        throw new Error(text)
      }

      const data = await res.json()
      router.push(`/dashboard/test/${data.testId}/edit`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to apply questions')
    } finally {
      setApplying(false)
    }
  }

  const inputClass =
    'w-full px-3.5 py-2.5 border border-stone-900/10 rounded-xl text-sm text-stone-900 bg-white placeholder:text-stone-400 focus:border-[#C2410C] focus:outline-none focus:ring-2 focus:ring-[#C2410C]/25 transition-all'

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link
        href={`/dashboard/generations/${params.id}`}
        className="inline-flex items-center gap-1 text-sm font-medium text-stone-500 hover:text-[#C2410C] transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to review
      </Link>

      <div>
        <h1 className="font-display text-2xl font-semibold text-stone-900 mb-2">Apply to Test</h1>
        <p className="text-sm text-stone-500">
          Add approved questions to a new or existing test.
        </p>
      </div>

      {!mode ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => setMode('new')}
            className="paper-card paper-card-hover rounded-[1.5rem] p-6 text-center transition-all"
          >
            <Plus className="h-8 w-8 text-[#C2410C] mx-auto mb-3" />
            <h3 className="font-display font-semibold text-stone-900">New Test</h3>
            <p className="text-sm text-stone-500 mt-1">Create a new test from scratch</p>
          </button>
          <button
            onClick={() => setMode('existing')}
            className="paper-card paper-card-hover rounded-[1.5rem] p-6 text-center transition-all"
          >
            <List className="h-8 w-8 text-[#C2410C] mx-auto mb-3" />
            <h3 className="font-display font-semibold text-stone-900">Existing Test</h3>
            <p className="text-sm text-stone-500 mt-1">Add to a draft test</p>
          </button>
        </div>
      ) : (
        <div className="paper-card rounded-[1.75rem] p-6 space-y-6">
          {mode === 'new' && (
            <>
              <div>
                <label className="block text-sm font-semibold text-stone-900 mb-2">
                  Test Title
                </label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Chapter 3 Quiz"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-stone-900 mb-2">
                  Description (optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className={`${inputClass} resize-none`}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-stone-900 mb-2">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  min={1}
                  max={180}
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value) || 30)}
                  className={inputClass}
                />
              </div>
            </>
          )}

          {mode === 'existing' && (
            <div>
              <label className="block text-sm font-semibold text-stone-900 mb-2">
                Select Draft Test
              </label>
              {loading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-6 w-6 text-[#C2410C] animate-spin" />
                </div>
              ) : tests.length === 0 ? (
                <p className="text-sm text-stone-500 py-4">
                  No editable draft tests available. Create a new test instead.
                </p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {tests.map((test) => (
                    <button
                      key={test.id}
                      onClick={() => setSelectedTestId(test.id)}
                      className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-colors ${
                        selectedTestId === test.id
                          ? 'border-[#C2410C]/40 bg-[#C2410C]/8 text-stone-900'
                          : 'border-stone-900/10 bg-white text-stone-700 hover:border-stone-900/25'
                      }`}
                    >
                      <span className="font-semibold">{test.title}</span>
                      <span className="text-stone-400 ml-2">
                        ({test._count.questions} questions)
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex items-center gap-4 pt-2">
            <button
              onClick={handleApply}
              disabled={applying || (mode === 'existing' && !selectedTestId)}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-stone-900 text-[#FFF7ED] rounded-full hover:bg-[#C2410C] disabled:opacity-50 transition-colors text-sm font-semibold shadow-[0_14px_28px_-14px_rgba(28,25,23,0.6)]"
            >
              {applying ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckSquare className="h-4 w-4" />
              )}
              {applying ? 'Applying...' : 'Apply to Test'}
            </button>
            <button
              onClick={() => setMode(null)}
              className="text-sm font-medium text-stone-500 hover:text-[#C2410C] transition-colors"
            >
              Back
            </button>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-800">
              {error}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
