/** Public asset (see `frontend/public/aura-logo.png`). */
export const AURA_LOGO_SRC = '/aura-logo.png'

/**
 * @param {{ className?: string; alt?: string }} props
 */
export default function AuraBrandLogo({
  className = 'h-10 w-auto max-w-full object-contain object-left',
  alt = 'AURA',
}) {
  return (
    <img
      src={AURA_LOGO_SRC}
      alt={alt}
      className={className}
      decoding="async"
      fetchpriority="high"
    />
  )
}
