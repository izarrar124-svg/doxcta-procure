import type { ButtonHTMLAttributes, ComponentPropsWithoutRef, ElementType, ReactNode } from 'react'

type ButtonOwnProps<T extends ElementType> = {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'ghost' | 'link'
  size?: 'sm' | 'md' | 'lg'
  as?: T
  className?: string
}

type Props<T extends ElementType> = ButtonOwnProps<T> &
  Omit<ComponentPropsWithoutRef<T>, keyof ButtonOwnProps<T>>

export function Button<T extends ElementType = 'button'>({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  as,
  ...rest
}: Props<T>) {
  const Tag = (as || 'button') as ElementType
  const buttonProps =
    Tag === 'button' && !(rest as ButtonHTMLAttributes<HTMLButtonElement>).type
      ? { type: 'button' as const }
      : {}

  return (
    <Tag
      className={`dx-btn dx-btn-${variant} dx-btn-${size} ${className}`.trim()}
      {...buttonProps}
      {...rest}
    >
      {children}
    </Tag>
  )
}
