'use client'
import { ReactNode } from 'react'

interface ModalToolbarButtonProps {
  onClick: () => void
  icon: ReactNode
  label: string
  variant?: 'primary' | 'secondary' | 'danger'
  disabled?: boolean
}

export default function ModalToolbarButton({
  onClick,
  icon,
  label,
  variant = 'secondary',
  disabled = false
}: ModalToolbarButtonProps) {
  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-700',
    danger: 'bg-red-600 hover:bg-red-700 text-white'
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${variantClasses[variant]}`}
    >
      {icon}
      {label}
    </button>
  )
}
