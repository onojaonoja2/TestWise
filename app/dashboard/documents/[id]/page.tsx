'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2, ArrowLeft, FileText, CheckCircle, XCircle, Zap, ChevronRight, MessageSquare } from 'lucide-react'

interface DocumentDetail {
  id: string
  originalName: string
  mimeType: string
  size: number
  status: string
  createdAt: string
  _count: {
    conversations: number
    generations: number
  }
  generations: {
    id: string
    status: string
    questionType: string
    count: number
    createdAt: string
    _count: { questions: number }
  }[]
}

export default function DocumentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [doc, setDoc] = useState<DocumentDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDocument()
  }, [])

  async function fetchDocument() {
    try {
      const res = await fetch(`/api/documents/${params.id}`)
      if (!res.ok) {
        if (res.status === 404) throw new Error('Document not found')
        throw new Error('Failed to fetch document')
      }
      setDoc(await res.json())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading document')
    } finally {
      setLoading(false)
    }
  }

  function formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 text-[#C2410C] animate-spin" />
      </div>
    )
  }

  if (error || !doc) {
    return (
      <div className="text-center py-12">
        <XCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
        <h3 className="font-display text-lg font-semibold text-stone-900 mb-2">Error</h3>
        <p className="text-sm text-stone-500">{error || 'Document not found'}</p>
        <Link
          href="/dashboard/documents"
          className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#9A3412] hover:text-[#C2410C] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to documents
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/dashboard/documents"
          className="inline-flex items-center gap-1 text-sm font-medium text-stone-500 hover:text-[#C2410C] mb-4 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to documents
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-semibold text-stone-900">{doc.originalName}</h1>
            <p className="text-sm text-stone-500 mt-1">
              {formatSize(doc.size)} · {doc.mimeType} · Uploaded {formatDate(doc.createdAt)}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {doc.status === 'READY' && (
              <>
                <Link
                  href={`/dashboard/documents/${doc.id}/chat`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-stone-900 text-[#FFF7ED] rounded-full hover:bg-[#C2410C] transition-colors text-sm font-semibold shadow-[0_14px_28px_-14px_rgba(28,25,23,0.6)]"
                >
                  <MessageSquare className="h-4 w-4" />
                  Chat with Document
                </Link>
                <Link
                  href={`/dashboard/documents/${doc.id}/generate`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#C2410C] text-white rounded-full hover:bg-[#9A3412] transition-colors text-sm font-semibold shadow-[0_14px_28px_-14px_rgba(194,65,12,0.7)]"
                >
                  <Zap className="h-4 w-4" />
                  Generate Questions
                </Link>
              </>
            )}
            {doc.status === 'PROCESSING' && (
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-900 rounded-full text-sm font-medium">
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing...
              </span>
            )}
            {doc.status === 'FAILED' && (
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                <XCircle className="h-4 w-4" />
                Processing Failed
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="paper-card rounded-2xl p-5">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-stone-400 mb-2">Status</p>
          <div className="flex items-center gap-2">
            {doc.status === 'READY' && (
              <>
                <CheckCircle className="h-5 w-5 text-emerald-600" />
                <span className="font-semibold text-emerald-800">Ready</span>
              </>
            )}
            {doc.status === 'PROCESSING' && (
              <>
                <Loader2 className="h-5 w-5 text-amber-600 animate-spin" />
                <span className="font-semibold text-amber-800">Processing</span>
              </>
            )}
            {doc.status === 'FAILED' && (
              <>
                <XCircle className="h-5 w-5 text-red-500" />
                <span className="font-semibold text-red-800">Failed</span>
              </>
            )}
          </div>
        </div>
        <div className="paper-card rounded-2xl p-5">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-stone-400 mb-1">Conversations</p>
          <p className="font-display text-2xl font-semibold text-stone-900">{doc._count.conversations}</p>
        </div>
        <div className="paper-card rounded-2xl p-5">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-stone-400 mb-1">Generations</p>
          <p className="font-display text-2xl font-semibold text-stone-900">{doc._count.generations}</p>
        </div>
      </div>

      <div className="paper-card rounded-[1.5rem] overflow-hidden">
        <div className="px-6 py-4 border-b border-stone-900/10">
          <h2 className="font-display text-lg font-semibold text-stone-900">Generation History</h2>
        </div>
        {doc.generations.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-8 w-8 text-stone-300 mx-auto mb-3" />
            <p className="text-sm text-stone-500">No generations yet</p>
          </div>
        ) : (
          <ul role="list" className="divide-y divide-stone-900/8">
            {doc.generations.map((gen) => (
              <li key={gen.id}>
                <Link
                  href={`/dashboard/generations/${gen.id}`}
                  className="flex items-center justify-between px-6 py-4 hover:bg-[#FAF7F1] transition-colors"
                >
                  <div>
                    <p className="text-sm font-semibold text-stone-900">
                      {gen.count} {gen.questionType.replace(/_/g, ' ').toLowerCase()} questions
                    </p>
                    <p className="text-xs text-stone-500 mt-1">
                      {formatDate(gen.createdAt)} · {gen._count.questions} questions generated
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {gen.status === 'COMPLETED' && (
                      <span className="text-xs px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full font-semibold">
                        Completed
                      </span>
                    )}
                    {gen.status === 'PROCESSING' && (
                      <span className="text-xs px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full font-semibold">
                        Processing
                      </span>
                    )}
                    {gen.status === 'FAILED' && (
                      <span className="text-xs px-2.5 py-1 bg-red-100 text-red-800 rounded-full font-semibold">
                        Failed
                      </span>
                    )}
                    <ChevronRight className="h-4 w-4 text-stone-400" />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
