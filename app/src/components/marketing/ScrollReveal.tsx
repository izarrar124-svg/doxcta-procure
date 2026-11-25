'use client'

import { useEffect } from 'react'

const SELECTOR = [
  '.mkt-section:not(.mkt-hero)',
  '.mkt-final',
  '.mkt-problem-item',
  '.mkt-step',
  '.mkt-card',
  '.mkt-module',
  '.mkt-trust-list li',
  '.mkt-split > *',
  '.mkt-compare',
].join(', ')

/**
 * Progressive reveal on scroll for marketing surfaces.
 * Marks matching nodes with .mkt-reveal and toggles .is-in when visible.
 */
export function ScrollReveal() {
  useEffect(() => {
    const root = document.querySelector('.mkt')
    if (!root) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const nodes = Array.from(root.querySelectorAll<HTMLElement>(SELECTOR))

    if (reduced) {
      nodes.forEach((el) => {
        el.classList.add('mkt-reveal', 'is-in')
      })
      return
    }

    nodes.forEach((el) => {
      el.classList.add('mkt-reveal')
      const parent = el.parentElement
      const siblings = parent
        ? Array.from(parent.children).filter((c) => (c as HTMLElement).matches?.(SELECTOR))
        : []
      const idx = Math.max(0, siblings.indexOf(el))
      el.style.setProperty('--mkt-reveal-delay', `${Math.min(idx, 5) * 80}ms`)
    })

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          entry.target.classList.add('is-in')
          observer.unobserve(entry.target)
        }
      },
      { root: null, rootMargin: '0px 0px -12% 0px', threshold: 0.12 },
    )

    nodes.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return null
}
