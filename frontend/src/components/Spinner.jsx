export default function Spinner({ className = '', label = 'Loading' }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 py-12 ${className}`}>
      <div
        className="h-9 w-9 animate-spin rounded-full border-2"
        style={{ borderColor: 'var(--border)', borderTopColor: 'var(--purple)' }}
        role="status"
        aria-label={label}
      />
      <span className="text-sm" style={{ color: 'var(--text2)' }}>
        {label}
      </span>
    </div>
  )
}
