import { IconInbox } from './icons'

/**
 * @param {{ title: string; description?: string; icon?: import('react').ReactNode }} props
 */
export default function EmptyState({ title, description, icon }) {
  const graphic = icon ?? <IconInbox className="h-10 w-10" />
  return (
    <div
      className="flex flex-col items-center justify-center rounded-lg border border-dashed px-6 py-14 text-center"
      style={{ borderColor: 'var(--border)', background: 'var(--bg3)' }}
    >
      <div className="text-[var(--text2)]" aria-hidden>
        {graphic}
      </div>
      <h3 className="mt-3 text-base font-semibold" style={{ color: 'var(--text)' }}>
        {title}
      </h3>
      {description ? (
        <p className="mt-1 max-w-sm text-sm" style={{ color: 'var(--text2)' }}>
          {description}
        </p>
      ) : null}
    </div>
  )
}
