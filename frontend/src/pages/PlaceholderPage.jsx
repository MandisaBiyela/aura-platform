export default function PlaceholderPage({ title, description = 'This area is coming soon.' }) {
  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-semibold tracking-tight" style={{ color: 'var(--text)' }}>
        {title}
      </h1>
      <p className="text-sm" style={{ color: 'var(--text2)' }}>
        {description}
      </p>
    </div>
  )
}
