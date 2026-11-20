import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'ghost' | 'link'
  size?: 'sm' | 'md' | 'lg'
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...rest
}: Props) {
  return (
    <button
      className={`dx-btn dx-btn-${variant} dx-btn-${size} ${className}`.trim()}
      {...rest}
    >
      {children}
    </button>
  )
}
