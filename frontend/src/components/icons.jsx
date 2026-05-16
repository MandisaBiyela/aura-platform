/** Stroke icons; use `className` for size. `currentColor` inherits from parent. */

const common = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

export function IconInbox({ className = 'h-10 w-10', 'aria-hidden': ariaHidden = true }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden={ariaHidden} {...common}>
      <path d="M22 12h-4l-3-9H9L6 12H2" />
      <path d="M5.45 5 2 8v11a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-3.55-3A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1z" />
    </svg>
  )
}

export function IconCube({ className = 'h-10 w-10', 'aria-hidden': ariaHidden = true }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden={ariaHidden} {...common}>
      <path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z" />
      <path d="M12 12 20 7.5" />
      <path d="m12 12-8-4.5" />
      <path d="M12 12v9" />
    </svg>
  )
}

export function IconSearch({ className = 'h-10 w-10', 'aria-hidden': ariaHidden = true }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden={ariaHidden} {...common}>
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  )
}

export function IconTicket({ className = 'h-10 w-10', 'aria-hidden': ariaHidden = true }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden={ariaHidden} {...common}>
      <path d="M4 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3l-2 1 2 1v3a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-3l2-1-2-1z" />
      <path d="M12 5v14" />
    </svg>
  )
}

export function IconMonitor({ className = 'h-10 w-10', 'aria-hidden': ariaHidden = true }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden={ariaHidden} {...common}>
      <rect x="3" y="4" width="18" height="12" rx="2" />
      <path d="M7 20h10" />
      <path d="M12 16v4" />
    </svg>
  )
}

export function IconDeviceSmall({ className = 'h-5 w-5', 'aria-hidden': ariaHidden = true }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden={ariaHidden} {...common}>
      <rect x="6" y="2" width="12" height="20" rx="2" />
      <path d="M12 18h.01" strokeWidth="2.25" />
    </svg>
  )
}

export function IconEllipsisVertical({ className = 'h-5 w-5', 'aria-hidden': ariaHidden = true }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden={ariaHidden} fill="currentColor">
      <circle cx="12" cy="5" r="1.5" />
      <circle cx="12" cy="12" r="1.5" />
      <circle cx="12" cy="19" r="1.5" />
    </svg>
  )
}
