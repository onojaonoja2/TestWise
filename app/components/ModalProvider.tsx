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
        return <X className="h-6 w-6 text-red-500" />
      case 'warning':
        return <AlertTriangle className="h-6 w-6 text-yellow-500" />
      default:
        return <Info className="h-6 w-6 text-blue-500" />
    }
  }

  const getStyles = () => {
    switch (modal.typeColor) {
      case 'danger':
        return 'border-red-200 bg-red-50'
      case 'warning':
        return 'border-yellow-200 bg-yellow-50'
      default:
        return 'border-blue-200 bg-blue-50'
    }
  }

  const getButtonStyles = () => {
    switch (modal.typeColor) {
      case 'danger':
        return 'bg-red-600 hover:bg-red-700 text-white'
      case 'warning':
        return 'bg-yellow-600 hover:bg-yellow-700 text-white'
      default:
        return 'bg-blue-600 hover:bg-blue-700 text-white'
    }
  }

  return (
    <ModalContext.Provider value={{ confirm, alert }}>
      {children}
      {modal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => modal.type === 'confirm' && closeModal(false)}
          />
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            <div className={`flex items-center gap-4 p-6 border-b ${getStyles()}`}>
              {getIcon()}
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{modal.title}</h3>
              </div>
            </div>
            <div className="p-6">
              <p className="text-gray-600">{modal.message}</p>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 border-t">
              {modal.type === 'confirm' && (
                <button
                  onClick={() => closeModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  {modal.cancelText}
                </button>
              )}
              <button
                onClick={() => closeModal(true)}
                className={`px-4 py-2 text-sm font-medium rounded-lg ${getButtonStyles()}`}
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