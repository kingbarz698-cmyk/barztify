import { type ReactNode } from 'react'

interface Props {
  onClick?: () => void
  label: string
  children: ReactNode
  className?: string
  active?: boolean
}

export function IconButton({ onClick, label, children, className = '', active }: Props) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={`btn-ghost flex-shrink-0 ${active ? 'text-primary' : ''} ${className}`}
    >
      {children}
    </button>
  )
}
