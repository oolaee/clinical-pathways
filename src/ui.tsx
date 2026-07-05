import { type CSSProperties, type ReactNode, useMemo, useState } from 'react'

/**
 * Convert a CSS declaration string ("prop:val;prop:val") into a React style
 * object. Lets us paste the prototype's inline styles verbatim and keep the
 * output pixel-identical, while React still gets camelCased keys.
 */
export function css(decl: string): CSSProperties {
  const out: Record<string, string> = {}
  for (const part of decl.split(';')) {
    const i = part.indexOf(':')
    if (i < 0) continue
    const prop = part.slice(0, i).trim()
    const val = part.slice(i + 1).trim()
    if (!prop) continue
    const key = prop.startsWith('--')
      ? prop
      : prop.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase())
    out[key] = val
  }
  return out as CSSProperties
}

type BoxProps = {
  /** Base style, as a CSS declaration string. */
  s: string
  /** Extra style merged while hovered, as a CSS declaration string. */
  hover?: string
  onClick?: () => void
  title?: string
  children?: ReactNode
  /** Rare cases that need a non-div element (e.g. inline text). */
  as?: keyof JSX.IntrinsicElements
}

/**
 * A styled box that mirrors the prototype's `style` + `style-hover` pattern.
 * Inline styles can't express `:hover`, so we track it with local state.
 */
export function Box({ s, hover, onClick, title, children, as = 'div' }: BoxProps) {
  const [h, setH] = useState(false)
  const base = useMemo(() => css(s), [s])
  const hov = useMemo(() => (hover ? css(hover) : null), [hover])
  const Tag = as as 'div'
  return (
    <Tag
      style={hov && h ? { ...base, ...hov } : base}
      title={title}
      onClick={onClick}
      onMouseEnter={hover ? () => setH(true) : undefined}
      onMouseLeave={hover ? () => setH(false) : undefined}
    >
      {children}
    </Tag>
  )
}
