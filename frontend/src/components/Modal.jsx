import { useEffect } from 'react'

export default function Modal({ title, children, onClose, footer }) {
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 backdrop-blur-[1px]"
        style={{ background: 'rgba(13, 17, 23, 0.72)' }}
        onClick={onClose}
        aria-label="Close dialog"
      />
      <div
        className="relative w-full max-w-lg rounded-xl border shadow-xl"
        style={{ borderColor: 'var(--border)', background: 'var(--bg2)' }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div
          className="flex items-center justify-between border-b px-4 py-3"
          style={{ borderColor: 'var(--border)' }}
        >
          <h2 id="modal-title" className="text-lg font-semibold" style={{ color: 'var(--text)' }}>
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 transition-colors"
            style={{ color: 'var(--text2)' }}
            aria-label="Close"
          >
            <span aria-hidden className="text-xl leading-none">
              ×
            </span>
          </button>
        </div>
        <div className="max-h-[min(70vh,32rem)] overflow-y-auto p-4" style={{ color: 'var(--text)' }}>
          {children}
        </div>
        {footer ? (
          <div
            className="flex flex-wrap items-center justify-end gap-2 border-t px-4 py-3"
            style={{ borderColor: 'var(--border)' }}
          >
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  )
}
