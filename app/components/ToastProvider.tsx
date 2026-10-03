'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'

type ToastType = 'success' | 'error' | 'info' | 'warning'

interface Toast {
  id: string
  message: string
  type: ToastType
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Date.now().toString()
    setToasts(prev => [...prev, { id, message, type }])
    
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 5000)
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const getIcon = (type: ToastType) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-5 w-5 shrink-0 text-emerald-600" />
      case 'error': return <AlertCircle className="h-5 w-5 shrink-0 text-red-500" />
      case 'warning': return <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600" />
      default: return <Info className="h-5 w-5 shrink-0 text-[#C2410C]" />
    }
  }

  const getStyles = (type: ToastType) => {
    switch (type) {
      case 'success': return 'bg-[#FFFDF9] border-emerald-200 text-stone-900'
      case 'error': return 'bg-[#FFFDF9] border-red-200 text-stone-900'
      case 'warning': return 'bg-[#FFFDF9] border-amber-200 text-stone-900'
      default: return 'bg-[#FFFDF9] border-stone-900/10 text-stone-900'
    }
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-[0_16px_40px_-24px_rgba(28,25,23,0.4)] ${getStyles(toast.type)} animate-in slide-in-from-right`}
            style={{ minWidth: '300px', maxWidth: '400px' }}
          >
            {getIcon(toast.type)}
            <p className="flex-1 text-sm font-medium">{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-stone-400 opacity-60 hover:opacity-100 hover:text-stone-700 transition-all"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
