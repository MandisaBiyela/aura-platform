import { useState } from 'react'

import { classifyTicketText } from '../api/tickets'
import { getErrorMessage } from '../api/errors'
import StatusBadge from '../components/StatusBadge'

const SAMPLE =
  'Laptop will not boot after Windows update. Blue screen on startup, error code 0x0000007B.'

function formatConfidence(value) {
  return `${Math.round(value * 100)}%`
}

function ScoreBars({ scores }) {
  const entries = Object.entries(scores).sort((a, b) => b[1] - a[1])
  if (entries.length === 0) return null

  return (
    <div className="mt-6 space-y-3">
      <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text3)' }}>
        All scores
      </p>
      <ul className="space-y-2">
        {entries.map(([label, score]) => (
          <li key={label}>
            <div className="mb-1 flex justify-between text-xs" style={{ color: 'var(--text2)' }}>
              <span className="capitalize">{label.replace(/_/g, ' ')}</span>
              <span className="tabular-nums">{formatConfidence(score)}</span>
            </div>
            <div
              className="h-2 overflow-hidden rounded-full"
              style={{ background: 'var(--bg3)' }}
              role="presentation"
            >
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${Math.min(100, Math.max(0, score * 100))}%`,
                  background: 'linear-gradient(90deg, var(--purple2), var(--purple))',
                }}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function Classifier() {
  const [text, setText] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleClassify(e) {
    e.preventDefault()
    const trimmed = text.trim()
    if (!trimmed) {
      setError('Enter ticket title and description text to classify.')
      setResult(null)
      return
    }
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const data = await classifyTicketText(trimmed)
      setResult(data)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight" style={{ color: 'var(--text)' }}>
          Ticket classifier
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--text2)' }}>
          Try ticket wording and see the NLP category and confidence from{' '}
          <span className="font-mono text-xs">aura-ticket-ai</span>. New tickets are classified
          automatically on create.
        </p>
      </div>

      <div className="panel p-5 shadow-lg shadow-black/10">
        <form className="space-y-4" onSubmit={handleClassify}>
          <div>
            <label className="text-sm font-medium" style={{ color: 'var(--text2)' }} htmlFor="clf-text">
              Ticket text
            </label>
            <textarea
              id="clf-text"
              rows={5}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste a title and description…"
              className="input-field mt-1 font-mono text-sm"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="btn-ghost text-xs"
              onClick={() => setText(SAMPLE)}
              disabled={loading}
            >
              Load sample
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`btn-primary-solid gap-2 ${loading ? 'btn-primary-loading' : ''}`}
            >
              {loading ? <span className="submit-btn-spinner" aria-hidden /> : null}
              <span>{loading ? 'Classifying…' : 'Classify'}</span>
            </button>
          </div>
        </form>

        {error ? (
          <p
            className="mt-4 rounded-md border px-3 py-2 text-sm"
            style={{
              borderColor: 'rgba(248, 113, 113, 0.35)',
              background: 'rgba(248, 113, 113, 0.08)',
              color: 'var(--red)',
            }}
            role="alert"
          >
            {error}
          </p>
        ) : null}

        {result ? (
          <div
            className="mt-6 rounded-lg border p-4"
            style={{ borderColor: 'var(--border)', background: 'var(--bg3)' }}
          >
            <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text3)' }}>
              Result
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <StatusBadge type={result.category} label={result.category} />
              <span className="text-sm tabular-nums" style={{ color: 'var(--cyan)' }}>
                {formatConfidence(result.confidence)} confidence
              </span>
            </div>
            <ScoreBars scores={result.all_scores} />
          </div>
        ) : null}
      </div>
    </div>
  )
}
