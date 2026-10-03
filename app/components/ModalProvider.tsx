'use client'

import { useState, createContext, useContext, ReactNode } from 'react'
import { X, AlertTriangle, CheckCircle, Info } from 'lucide-react'

type ModalType = 'confirm' | 'alert'

interface ModalOptions {
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: 'danger' | 'warning' | 'info'
}

interface ModalContextType {
  confirm: (options: ModalOptions) => Promise<boolean>
  alert: (options: ModalOptions) => Promise<void>
}

const ModalContext = createContext<ModalContextType | undefined>(undefined)

export function useModal() {
  const context = useContext(ModalContext)
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider')
  }
  return context
}

interface ModalState {
  isOpen: boolean
  type: ModalType
  title: string
  message: string
  confirmText: string
  cancelText: string
  typeColor: 'danger' | 'warning' | 'info'
  resolve?: (value: boolean) => void
}

export function ModalProvider({ children }: { children: ReactNode }) {
  const [modal, setModal] = useState<ModalState>({
    isOpen: false,
    type: 'confirm',
    title: '',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    typeColor: 'warning',
  })

  const openModal = (
    type: ModalType,
    options: ModalOptions,
    resolve?: (value: boolean) => void
  ) => {
    setModal({
      isOpen: true,
      type,
      title: options.title,
      message: options.message,
      confirmText: options.confirmText || 'Confirm',
      cancelText: options.cancelText || 'Cancel',
      typeColor: options.type || 'warning',
      resolve,
    })
  }

  const closeModal = (result: boolean) => {
    if (modal.resolve) {
      modal.resolve(result)
    }
    setModal((prev) => ({ ...prev, isOpen: false }))
  }

  const confirm = (options: ModalOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      openModal('confirm', options, resolve)
    })
  }

  const alert = (options: ModalOptions): Promise<void> => {
    return new Promise((resolve) => {
      openModal('alert', options, { resolve } as any)
    })
  }

  const getIcon = () => {
    switch (modal.typeColor) {
      case 'danger':
        return (
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-red-600/10">
            <X className="h-6 w-6 text-red-600" />
          </span>
        )
      case 'warning':
        return (
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#C2410C]/10">
            <AlertTriangle className="h-6 w-6 text-[#C2410C]" />
          </span>
        )
      default:
        return (
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-stone-900">
            <Info className="h-6 w-6 text-[#FFF7ED]" />
          </span>
        )
    }
  }

  const getHeaderStyles = () => {
    switch (modal.typeColor) {
      case 'danger':
        return 'bg-red-50/60 border-red-100'
      case 'warning':
        return 'bg-[#FFF7ED] border-[#C2410C]/15'
      default:
        return 'bg-[#FAF7F1] border-stone-900/10'
    }
  }

  const getButtonStyles = () => {
    switch (modal.typeColor) {
      case 'danger':
        return 'bg-red-600 hover:bg-red-700 text-white shadow-[0_14px_28px_-14px_rgba(220,38,38,0.7)]'
      case 'warning':
        return 'bg-[#C2410C] hover:bg-[#9A3412] text-white shadow-[0_14px_28px_-14px_rgba(194,65,12,0.7)]'
      default:
        return 'bg-stone-900 hover:bg-[#C2410C] text-[#FFF7ED] shadow-[0_14px_28px_-14px_rgba(28,25,23,0.6)]'
    }
  }

  return (
    <ModalContext.Provider value={{ confirm, alert }}>
      {children}
      {modal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm"
            onClick={() => modal.type === 'confirm' && closeModal(false)}
          />
          <div className="paper-card relative rounded-[1.75rem] w-full max-w-md mx-4 overflow-hidden">
            <div className={`flex items-center gap-4 p-6 border-b ${getHeaderStyles()}`}>
              {getIcon()}
              <div>
                <h3 className="font-display text-lg font-semibold text-stone-900">{modal.title}</h3>
              </div>
            </div>
            <div className="p-6 bg-[#FFFDF9]">
              <p className="text-sm leading-relaxed text-stone-600">{modal.message}</p>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 bg-[#FAF7F1] border-t border-stone-900/10">
              {modal.type === 'confirm' && (
                <button
                  onClick={() => closeModal(false)}
                  className="px-4 py-2 text-sm font-semibold text-stone-900 bg-white border border-stone-900/10 rounded-full hover:bg-white transition-colors"
                >
                  {modal.cancelText}
                </button>
              )}
              <button
                onClick={() => closeModal(true)}
                className={`px-5 py-2 text-sm font-semibold rounded-full transition-colors ${getButtonStyles()}`}
              >
                {modal.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </ModalContext.Provider>
  )
}
