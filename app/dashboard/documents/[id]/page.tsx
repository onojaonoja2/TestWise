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
        <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
      </div>
    )
  }

  if (error || !doc) {
    return (
      <div className="text-center py-12">
        <XCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error</h3>
        <p className="text-sm text-gray-500">{error || 'Document not found'}</p>
        <Link
          href="/dashboard/documents"
          className="mt-4 inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800"
        >
          <ArrowLeft className="h-4 w-4" /> Back to documents
        </Link>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/dashboard/documents"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="h-4 w-4" /> Back to documents
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{doc.originalName}</h1>
            <p className="text-sm text-gray-500 mt-1">
              {formatSize(doc.size)} · {doc.mimeType} · Uploaded {formatDate(doc.createdAt)}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {doc.status === 'READY' && (
              <>
                <Link
                  href={`/dashboard/documents/${doc.id}/chat`}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <MessageSquare className="h-4 w-4" />
                  Chat with Document
                </Link>
                <Link
                  href={`/dashboard/documents/${doc.id}/generate`}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Zap className="h-4 w-4" />
                  Generate Questions
                </Link>
              </>
            )}
            {doc.status === 'PROCESSING' && (
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg">
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing...
              </span>
            )}
            {doc.status === 'FAILED' && (
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg">
                <XCircle className="h-4 w-4" />
                Processing Failed
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Status</p>
          <div className="flex items-center gap-2">
            {doc.status === 'READY' && (
              <>
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="font-medium text-green-700">Ready</span>
              </>
            )}
            {doc.status === 'PROCESSING' && (
              <>
                <Loader2 className="h-5 w-5 text-yellow-500 animate-spin" />
                <span className="font-medium text-yellow-700">Processing</span>
              </>
            )}
            {doc.status === 'FAILED' && (
              <>
                <XCircle className="h-5 w-5 text-red-500" />
                <span className="font-medium text-red-700">Failed</span>
              </>
            )}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Conversations</p>
          <p className="text-2xl font-bold text-gray-900">{doc._count.conversations}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Generations</p>
          <p className="text-2xl font-bold text-gray-900">{doc._count.generations}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Generation History</h2>
        </div>
        {doc.generations.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-8 w-8 text-gray-400 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No generations yet</p>
          </div>
        ) : (
          <ul role="list" className="divide-y divide-gray-200">
            {doc.generations.map((gen) => (
              <li key={gen.id}>
                <Link
                  href={`/dashboard/generations/${gen.id}`}
                  className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {gen.count} {gen.questionType.replace(/_/g, ' ').toLowerCase()} questions
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDate(gen.createdAt)} · {gen._count.questions} questions generated
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {gen.status === 'COMPLETED' && (
                      <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                        Completed
                      </span>
                    )}
                    {gen.status === 'PROCESSING' && (
                      <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full">
                        Processing
                      </span>
                    )}
                    {gen.status === 'FAILED' && (
                      <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded-full">
                        Failed
                      </span>
                    )}
                    <ChevronRight className="h-4 w-4 text-gray-400" />
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
