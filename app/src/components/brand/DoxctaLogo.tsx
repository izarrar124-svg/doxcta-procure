import Image from 'next/image'
import Link from 'next/link'

/**
 * Official Doxcta lockup: live mark (chevron) + live wordmark ("doxcta.")
 * composed together: the full logo, not the header's wordmark-only crop.
 */
export function DoxctaLogo({
  href = '/',
  size = 'md',
  tagline,
  asLink = true,
  variant = 'lockup',
}: {
  href?: string
  size?: 'sm' | 'md' | 'lg'
  tagline?: string
  asLink?: boolean
  variant?: 'lockup' | 'mark'
}) {
  // Composed aspect ~2325×360 (chevron + wordmark)
  const h = size === 'sm' ? 24 : size === 'lg' ? 36 : 28
  const lockupW = Math.round(h * (2325 / 360))
  const markSize = h

  const img =
    variant === 'mark' ? (
      <Image
        src="/brand/doxcta-mark.png"
        alt=""
        width={markSize}
        height={markSize}
        className="dx-logo-img"
        priority
      />
    ) : (
      <Image
        src="/brand/doxcta-lockup.png"
        alt="doxcta."
        width={lockupW}
        height={h}
        className="dx-logo-img"
        priority
      />
    )

  const inner = (
    <>
      {img}
      {tagline ? <span className="dx-logo-tag">{tagline}</span> : null}
    </>
  )

  if (!asLink) {
    return <span className={`dx-logo${tagline ? ' dx-logo-stacked' : ''}`}>{inner}</span>
  }

  return (
    <Link href={href} className={`dx-logo${tagline ? ' dx-logo-stacked' : ''}`} aria-label="Doxcta home">
      {inner}
    </Link>
  )
}

export function DoxctaMark({ size = 34 }: { size?: number }) {
  return (
    <Image src="/brand/doxcta-mark.png" alt="" width={size} height={size} className="dx-logo-img" />
  )
}
