/** @typedef {'sm' | 'md'} StatusBadgeSize */

const PALETTE = {
  green: {
    color: '#34d399',
    background: '#0e2a1f',
    borderColor: '#1a4a35',
  },
  blue: {
    color: '#60a5fa',
    background: '#0e1a2a',
    borderColor: '#1a3a6a',
  },
  amber: {
    color: '#fbbf24',
    background: '#2a1f0a',
    borderColor: '#4a3a0a',
  },
  grey: {
    color: '#8b949e',
    background: '#1c2230',
    borderColor: '#2a3447',
  },
  red: {
    color: '#f87171',
    background: '#2a0e0e',
    borderColor: '#4a1a1a',
  },
}

/** Maps semantic type (case-insensitive) to palette key. */
const TYPE_VARIANT = {
  active: 'green',
  resolved: 'green',
  online: 'green',
  open: 'blue',
  pending: 'blue',
  in_progress: 'amber',
  maintenance: 'amber',
  inactive: 'grey',
  closed: 'grey',
  critical: 'red',
  /** Ticket priorities → same palettes */
  low: 'grey',
  medium: 'grey',
  high: 'amber',
  urgent: 'red',
}

function normalizeType(type) {
  return String(type ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_')
}

function prettifyType(type) {
  const t = normalizeType(type)
  return t
    .split('_')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

/**
 * @param {{ type: string; size?: StatusBadgeSize; label?: string }} props
 */
export default function StatusBadge({ type, size = 'md', label }) {
  const key = normalizeType(type)
  const variant = TYPE_VARIANT[key] ?? 'grey'
  const palette = PALETTE[variant]

  const isSm = size === 'sm'
  const fontSize = isSm ? '9px' : '10px'
  const padding = isSm ? '1px 6px' : '2px 8px'
  const borderRadius = isSm ? '8px' : '10px'
  const text = label ?? prettifyType(type)

  return (
    <span
      className="inline-block font-medium"
      style={{
        fontSize,
        fontWeight: 500,
        padding,
        borderRadius,
        color: palette.color,
        background: palette.background,
        border: `1px solid ${palette.borderColor}`,
      }}
    >
      {text}
    </span>
  )
}
