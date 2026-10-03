'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Loader2, ArrowLeft, Send, MessageSquare, Trash2, Plus } from 'lucide-react'
import { useToast } from '@/app/components/ToastProvider'
import { useModal } from '@/app/components/ModalProvider'

interface Message {
  id: string
  role: 'USER' | 'ASSISTANT'
  content: string
  createdAt: string
}

interface Conversation {
  id: string
  title: string
  updatedAt: string
  _count: { messages: number }
  messages?: Message[]
}

interface DocumentInfo {
  id: string
  originalName: string
  status: string
}

export default function DocumentChatPage() {
  const params = useParams()
  const { showToast } = useToast()
  const { confirm } = useModal()
  const [doc, setDoc] = useState<DocumentInfo | null>(null)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    fetchDocument()
    fetchConversations()
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  async function fetchDocument() {
    try {
      const res = await fetch(`/api/documents/${params.id}`)
      if (!res.ok) throw new Error('Failed to fetch document')
      setDoc(await res.json())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading document')
    } finally {
      setLoading(false)
    }
  }

  async function fetchConversations() {
    try {
      const res = await fetch(`/api/documents/${params.id}/conversations`)
      if (!res.ok) throw new Error('Failed to fetch conversations')
      setConversations(await res.json())
    } catch (err) {
      console.error('Error fetching conversations:', err)
    }
  }

  async function loadConversation(conversationId: string) {
    try {
      const res = await fetch(`/api/documents/${params.id}/chat?conversationId=${conversationId}`)
      if (!res.ok) throw new Error('Failed to load conversation')
      const data = await res.json()
      setActiveConversation(data)
      setMessages(data.messages || [])
    } catch (err) {
      console.error('Error loading conversation:', err)
    }
  }

  async function createNewConversation() {
    try {
      const res = await fetch(`/api/documents/${params.id}/conversations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'New Conversation' }),
      })
      if (!res.ok) throw new Error('Failed to create conversation')
      const newConv = await res.json()
      setConversations([newConv, ...conversations])
      setActiveConversation(newConv)
      setMessages([])
    } catch (err) {
      console.error('Error creating conversation:', err)
    }
  }

  async function deleteConversation(conversationId: string, e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    
    const confirmed = await confirm({
      title: 'Delete Conversation',
      message: 'Delete this conversation? This cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger',
    })
    if (!confirmed) return
    
    try {
      const res = await fetch(`/api/documents/${params.id}/conversations/${conversationId}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Failed to delete conversation')
      
      setConversations(conversations.filter(c => c.id !== conversationId))
      if (activeConversation?.id === conversationId) {
        setActiveConversation(null)
        setMessages([])
      }
    } catch (err) {
      console.error('Error deleting conversation:', err)
    }
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || sending) return

    const messageText = input.trim()
    setInput('')
    setSending(true)

    const tempUserMessage: Message = {
      id: `temp-user-${Date.now()}`,
      role: 'USER',
      content: messageText,
      createdAt: new Date().toISOString(),
    }

    const tempAssistantMessage: Message = {
      id: `temp-assistant-${Date.now()}`,
      role: 'ASSISTANT',
      content: '',
      createdAt: new Date().toISOString(),
    }

    setMessages(prev => [...prev, tempUserMessage, tempAssistantMessage])

    try {
      let conversationId = activeConversation?.id

      if (!conversationId) {
        const createRes = await fetch(`/api/documents/${params.id}/conversations`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: messageText.slice(0, 50) }),
        })
        if (createRes.ok) {
          const newConv = await createRes.json()
          conversationId = newConv.id
          setActiveConversation(newConv)
          setConversations(prev => [newConv, ...prev])
        }
      }

      const res = await fetch(`/api/documents/${params.id}/chat/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText,
          conversationId,
        }),
      })

      if (!res.ok) {
        throw new Error('Failed to send message')
      }

      const reader = res.body?.getReader()
      if (!reader) throw new Error('No reader available')

      const decoder = new TextDecoder()
      let done = false

      while (!done) {
        const { value, done: doneReading } = await reader.read()
        done = doneReading
        if (value) {
          const chunk = decoder.decode(value, { stream: !done })
          setMessages(prev => prev.map(msg => {
            if (msg.id === tempAssistantMessage.id) {
              return { ...msg, content: msg.content + chunk }
            }
            return msg
          }))
        }
      }

      await fetchConversations()
    } catch (err) {
      setMessages(prev => prev.filter(m => m.id !== tempUserMessage.id && m.id !== tempAssistantMessage.id))
      setError(err instanceof Error ? err.message : 'Failed to send message')
      setInput(messageText)
    } finally {
      setSending(false)
      inputRef.current?.focus()
    }
  }

  function formatTime(dateStr: string): string {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    
    if (diff < 60000) return 'Just now'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
    if (diff < 86400000) return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 text-[#C2410C] animate-spin" />
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col space-y-4">
      <div>
        <Link
          href={`/dashboard/documents/${params.id}`}
          className="inline-flex items-center gap-1 text-sm font-medium text-stone-500 hover:text-[#C2410C] mb-4 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to document
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-semibold text-stone-900">Chat with Document</h1>
            <p className="text-sm text-stone-500">{doc?.originalName}</p>
          </div>
          {doc?.status === 'READY' && (
            <button
              onClick={createNewConversation}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-stone-900 text-[#FFF7ED] rounded-full hover:bg-[#C2410C] transition-colors text-sm font-semibold shadow-[0_14px_28px_-14px_rgba(28,25,23,0.6)]"
            >
              <Plus className="h-4 w-4" />
              New Chat
            </button>
          )}
        </div>
      </div>

      {doc?.status !== 'READY' && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <p className="text-amber-900 text-sm">
            Document is still processing. Please wait until processing is complete to start chatting.
          </p>
        </div>
      )}

      <div className="flex-1 flex gap-4 min-h-0">
        <div className="w-64 paper-card rounded-[1.5rem] flex flex-col overflow-hidden">
          <div className="p-4 border-b border-stone-900/10">
            <h2 className="font-display font-semibold text-stone-900 flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-[#C2410C]" />
              Conversations
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {conversations.length === 0 ? (
              <p className="text-sm text-stone-500 text-center py-8 px-2">
                No conversations yet. Start chatting to create one.
              </p>
            ) : (
              <ul className="space-y-1">
                {conversations.map((conv) => (
<li key={conv.id}>
                  <div
                    onClick={() => loadConversation(conv.id)}
                    className={`w-full text-left px-3 py-2 rounded-xl transition-colors group cursor-pointer ${
                      activeConversation?.id === conv.id
                        ? 'bg-[#C2410C]/10 text-stone-900 border border-[#C2410C]/25'
                        : 'hover:bg-[#FAF7F1] border border-transparent'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold truncate">{conv.title}</span>
                      <button
                        onClick={(e) => deleteConversation(conv.id, e)}
                        className="opacity-0 group-hover:opacity-100 text-stone-400 hover:text-red-600 p-1 transition-all"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                    <span className="text-xs text-stone-500">{formatTime(conv.updatedAt)}</span>
                  </div>
                </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="flex-1 paper-card rounded-[1.5rem] flex flex-col min-h-0 overflow-hidden">
          {activeConversation ? (
            <>
              <div className="p-4 border-b border-stone-900/10">
                <h2 className="font-display font-semibold text-stone-900">{activeConversation.title}</h2>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#FAF7F1]/50">
                {messages.length === 0 && !sending ? (
                  <div className="text-center py-12">
                    <MessageSquare className="h-12 w-12 text-stone-300 mx-auto mb-4" />
                    <p className="text-stone-500">
                      Start a conversation about the document
                    </p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.role === 'USER' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                          msg.role === 'USER'
                            ? 'bg-stone-900 text-[#FFF7ED]'
                            : 'bg-white border border-stone-900/10 text-stone-900 shadow-sm'
                        }`}
                      >
                        <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content || (msg.id.startsWith('temp-assistant') && sending ? 'Typing...' : '')}</p>
                        {msg.role === 'USER' && (
                          <p className="text-xs mt-1 text-stone-400">
                            {formatTime(msg.createdAt)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>
              {doc?.status === 'READY' && (
                <form onSubmit={sendMessage} className="p-4 border-t border-stone-900/10 bg-white">
                  <div className="flex gap-2">
                    <textarea
                      ref={inputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          sendMessage(e)
                        }
                      }}
                      placeholder="Ask a question about the document..."
                      disabled={sending}
                      rows={1}
                      className="flex-1 resize-none rounded-xl border border-stone-900/10 bg-[#FAF7F1] px-4 py-2.5 text-stone-900 placeholder:text-stone-400 focus:border-[#C2410C] focus:outline-none focus:ring-2 focus:ring-[#C2410C]/25 disabled:opacity-50 text-sm transition-all"
                    />
                    <button
                      type="submit"
                      disabled={!input.trim() || sending}
                      className="px-4 py-2 bg-stone-900 text-[#FFF7ED] rounded-full hover:bg-[#C2410C] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {sending ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <Send className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </form>
              )}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="h-16 w-16 text-stone-300 mx-auto mb-4" />
                <h3 className="font-display text-lg font-semibold text-stone-900 mb-2">
                  Select or start a conversation
                </h3>
                <p className="text-sm text-stone-500 mb-4">
                  Ask questions about the document content
                </p>
                <button
                  onClick={createNewConversation}
                  disabled={doc?.status !== 'READY'}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-stone-900 text-[#FFF7ED] rounded-full hover:bg-[#C2410C] disabled:opacity-50 transition-colors text-sm font-semibold"
                >
                  <Plus className="h-4 w-4" />
                  Start New Chat
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="fixed bottom-4 right-4 bg-stone-900 text-[#FFF7ED] px-4 py-3 rounded-2xl shadow-xl border border-stone-900/10">
          <p className="text-sm">{error}</p>
          <button onClick={() => setError(null)} className="text-xs font-semibold underline mt-1 text-[#E7A06B] hover:text-white">
            Dismiss
          </button>
        </div>
      )}
    </div>
  )
}
