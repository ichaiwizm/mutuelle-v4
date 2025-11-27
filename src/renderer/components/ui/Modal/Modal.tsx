import type { ReactNode } from 'react'
import { Card } from '../Card'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  className?: string
}

export function Modal({ isOpen, onClose, children, className }: ModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Content */}
      <Card
        className={`relative z-10 w-full max-w-2xl max-h-[80vh] overflow-hidden animate-fade-in ${className ?? ''}`}
      >
        {children}
      </Card>
    </div>
  )
}
