/**
 * Shimmer placeholder for stat cards, chart panels, and table row bars.
 * @param {{ className?: string; style?: object }} props
 */
export default function SkeletonCard({ className = '', style }) {
  return <div className={`skeleton-card ${className}`.trim()} style={style} aria-hidden />
}
