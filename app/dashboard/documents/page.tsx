'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { FileText, Loader2, Trash2, Upload, CheckCircle, XCircle, Clock } from 'lucide-react'
import { useToast } from '@/app/components/ToastProvider'
import { useModal } from '@/app/components/ModalProvider'

interface Document {
  id: string
  originalName: string
  mimeType: string
  size: number
  status: string
  createdAt: string
  _count: {
    chunks: number
    generations: number
  }
}

export default function DocumentsPage() {
  const router = useRouter()
  const { showToast } = useToast()
  const { confirm } = useModal()
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadedDocId, setUploadedDocId] = useState<string | null>(null)

  useEffect(() => {
    fetchDocuments()
  }, [])

  useEffect(() => {
    if (!uploadedDocId) return

    let attempts = 0
    const maxAttempts = 30
    let timeoutId: NodeJS.Timeout

    const checkDocumentStatus = async () => {
      attempts++
      
      if (attempts > maxAttempts) {
        showToast('Document processing is taking longer than expected.', 'warning')
        setUploadedDocId(null)
        return
      }

      try {
        const res = await fetch(`/api/documents/${uploadedDocId}`)
        if (res.ok) {
          const updatedDoc = await res.json()
          
          if (updatedDoc.status === 'READY') {
            showToast('Document ready!', 'success')
            router.push(`/dashboard/documents/${uploadedDocId}`)
            setUploadedDocId(null)
            return
          }
          
          if (updatedDoc.status === 'FAILED') {
            showToast('Document processing failed. Please try again.', 'error')
            setUploadedDocId(null)
            return
          }
        }
      } catch (error) {
        console.error('Error checking document status:', error)
      }

      timeoutId = setTimeout(checkDocumentStatus, 2000)
    }

    timeoutId = setTimeout(checkDocumentStatus, 2000)
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [uploadedDocId, router, showToast])

  async function fetchDocuments() {
    try {
      const res = await fetch('/api/documents')
      if (res.ok) {
        setDocuments(await res.json())
      }
    } catch (error) {
      console.error('Failed to fetch documents', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
    ]

    if (!allowedTypes.includes(file.type)) {
      showToast('Unsupported file type. Allowed: PDF, DOCX, TXT', 'error')
      return
    }

    if (file.size > 50 * 1024 * 1024) {
      showToast('File too large. Maximum size is 50MB', 'error')
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        let errorMessage = 'Upload failed'
        try {
          const data = await res.json()
          errorMessage = data.message || data.error || errorMessage
        } catch {
          const text = await res.text()
          if (text) errorMessage = text
        }
        throw new Error(errorMessage)
      }

      const data = await res.json()
      setUploadedDocId(data.id)
      await fetchDocuments()
    } catch (error) {
      console.error('Upload failed', error)
      if (error instanceof TypeError && error.message.includes('fetch')) {
        showToast('Unable to connect to server. Please check your network connection.', 'error')
      } else {
        showToast(error instanceof Error ? error.message : 'Upload failed', 'error')
      }
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  async function handleDelete(id: string, name: string) {
    const confirmed = await confirm({
      title: 'Delete Document',
      message: `Delete "${name}"? This cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger',
    })
    if (!confirmed) return

    try {
      const res = await fetch(`/api/documents/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setDocuments((prev) => prev.filter((d) => d.id !== id))
        showToast('Document deleted', 'success')
      }
    } catch (error) {
      showToast('Failed to delete document', 'error')
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

  const statusIcon = (status: string) => {
    switch (status) {
      case 'READY':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'PROCESSING':
        return <Loader2 className="h-5 w-5 text-yellow-500 animate-spin" />
      case 'FAILED':
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <Clock className="h-5 w-5 text-gray-400" />
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
          <p className="text-sm text-gray-500 mt-1">
            Upload educational materials to generate questions
          </p>
        </div>
        <label className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 cursor-pointer transition-colors disabled:opacity-50">
          <Upload className="h-4 w-4" />
          {uploading ? 'Uploading...' : 'Upload Document'}
          <input
            type="file"
            accept=".pdf,.docx,.txt"
            onChange={handleUpload}
            className="hidden"
            disabled={uploading}
          />
        </label>
      </div>

      {uploading && (
        <div className="flex items-center gap-3 p-4 mb-6 bg-indigo-50 border border-indigo-200 rounded-lg">
          <Loader2 className="h-5 w-5 text-indigo-600 animate-spin" />
          <span className="text-sm text-indigo-700">
            Processing document... This may take a moment.
          </span>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
        </div>
      ) : documents.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No documents yet</h3>
          <p className="text-sm text-gray-500 mb-4">
            Upload a PDF, DOCX, or TXT file to get started
          </p>
          <label className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 cursor-pointer">
            <Upload className="h-4 w-4" />
            Upload your first document
            <input
              type="file"
              accept=".pdf,.docx,.txt"
              onChange={handleUpload}
              className="hidden"
            />
          </label>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <ul role="list" className="divide-y divide-gray-200">
            {documents.map((doc) => (
              <li key={doc.id}>
                <div className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex-shrink-0">{statusIcon(doc.status)}</div>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/dashboard/documents/${doc.id}`}
                      className="text-sm font-medium text-indigo-600 hover:text-indigo-800 truncate block"
                    >
                      {doc.originalName}
                    </Link>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-gray-500">
                        {formatSize(doc.size)}
                      </span>
                      <span className="text-xs text-gray-400">·</span>
                      <span className="text-xs text-gray-500">
                        {formatDate(doc.createdAt)}
                      </span>
                      <span className="text-xs text-gray-400">·</span>
                      <span className="text-xs text-gray-500">
                        {doc._count.chunks} chunks
                      </span>
                      {doc._count.generations > 0 && (
                        <>
                          <span className="text-xs text-gray-400">·</span>
                          <span className="text-xs text-gray-500">
                            {doc._count.generations} generations
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(doc.id, doc.originalName)}
                    className="flex-shrink-0 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete document"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
