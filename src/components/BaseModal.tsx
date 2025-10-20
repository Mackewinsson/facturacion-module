'use client'
import { ReactNode } from 'react'

interface BaseModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  subtitle?: string
  children: ReactNode
  toolbar?: ReactNode
  footer?: ReactNode
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '6xl'
}

export default function BaseModal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  toolbar,
  footer,
  maxWidth = '4xl'
}: BaseModalProps) {
  if (!isOpen) return null

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '4xl': 'max-w-4xl',
    '6xl': 'max-w-6xl'
  }

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
    >
      <div className={`bg-card rounded-lg shadow-xl ${maxWidthClasses[maxWidth]} w-full mx-4 max-h-[90vh] overflow-y-auto`}>
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-semibold text-card-foreground">{title}</h2>
              {subtitle && (
                <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Toolbar */}
          {toolbar && (
            <div className="bg-gray-100 px-4 py-3 flex items-center gap-4 border-b rounded-lg mb-6">
              {toolbar}
            </div>
          )}

          {/* Content */}
          <div className="overflow-y-auto">
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div className="bg-gray-100 px-4 py-3 flex justify-end gap-3 border-t rounded-lg mt-6">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
