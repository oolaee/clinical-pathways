/** Small pure helpers ported 1:1 from the prototype's Component methods. */

export type ChipStyle = { bg: string; c: string; bd: string }
export type LevelStyle = { bg: string; c: string }
export type RoleKey = 'provider' | 'ma' | 'admin'

/** Build an SVG sparkline polyline + last-point coordinates from a history array. */
export function sparkline(
  hist: number[],
  w: number,
  h: number,
): { pts: string; x: string; y: string } {
  const min = Math.min(...hist)
  const max = Math.max(...hist)
  const rg = max - min || 1
  const pts = hist.map((v, i) => {
    const x = (i / (hist.length - 1)) * (w - 6) + 3
    const y = h - 4 - ((v - min) / rg) * (h - 8)
    return x.toFixed(1) + ',' + y.toFixed(1)
  })
  const [lx, ly] = pts[pts.length - 1].split(',')
  return { pts: pts.join(' '), x: lx, y: ly }
}

/** Selected/unselected filter-chip colors. */
export function chip(sel: boolean): ChipStyle {
  return sel
    ? { bg: '#171810', c: '#fcfbfb', bd: '#171810' }
    : { bg: '#ffffff', c: '#55503f', bd: '#ddd2c2' }
}

/** Semantic severity colors: red (critical) / amber (out of range) / neutral (ok). */
export function lvl(l: string): LevelStyle {
  return l === 'red'
    ? { bg: '#f6e3e1', c: '#b3423a' }
    : l === 'amber'
      ? { bg: '#f3e8d3', c: '#a9762c' }
      : { bg: '#e6ece6', c: '#4f7355' }
}

/** Role badge label + colors. */
export function roleMetaOf(k: RoleKey | string): { label: string; bg: string; c: string } {
  return k === 'provider'
    ? { label: 'Provider', bg: '#171810', c: '#f0e5db' }
    : k === 'ma'
      ? { label: 'Clinical staff', bg: '#b6a28e', c: '#ffffff' }
      : { label: 'Admin', bg: '#f0e5db', c: '#6b5c46' }
}
