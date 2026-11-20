import type { LabelHTMLAttributes, ReactNode } from 'react'

export function Label({
  children,
  className = '',
  ...rest
}: LabelHTMLAttributes<HTMLLabelElement> & { children: ReactNode }) {
  return (
    <label className={`dx-label ${className}`.trim()} {...rest}>
      {children}
    </label>
  )
}
