import { useCallback, useEffect, useState } from 'react'

import { fetchDevices } from '../api/devices'
import { getErrorMessage } from '../api/errors'
import { createTicket, fetchTickets } from '../api/tickets'
import EmptyState from '../components/EmptyState'
import Modal from '../components/Modal'
import SkeletonCard from '../components/SkeletonCard'
import StatusBadge from '../components/StatusBadge'
import { IconTicket } from '../components/icons'

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
]

const TICKET_STATUS_LABEL = {
  open: 'Open',
  in_progress: 'In progress',
  resolved: 'Resolved',
  closed: 'Closed',
}

function formatTicketStatus(s) {
  return TICKET_STATUS_LABEL[s] ?? s
}

function formatAiConfidence(value) {
  if (value == null || Number.isNaN(value)) return null
  return `${Math.round(value * 100)}%`
}

const emptyTicketForm = {
  title: '',
  description: '',
  device_id: '',
  priority: 'medium',
  status: 'open',
}

export default function Tickets() {
  const [tickets, setTickets] = useState([])
  const [devices, setDevices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [statusFilter, setStatusFilter] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(emptyTicketForm)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState(null)

  const loadTickets = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchTickets(statusFilter ? { status: statusFilter } : {})
      setTickets(data)
    } catch (e) {
      setError(getErrorMessage(e))
    } finally {
      setLoading(false)
    }
  }, [statusFilter])

  const loadDevices = useCallback(async () => {
    try {
      const data = await fetchDevices({ includeInactive: true })
      setDevices(data)
    } catch {
      setDevices([])
    }
  }, [])

  useEffect(() => {
    queueMicrotask(() => {
      void loadTickets()
    })
  }, [loadTickets])

  useEffect(() => {
    queueMicrotask(() => {
      void loadDevices()
    })
  }, [loadDevices])

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setFormError(null)
    const deviceId = Number(form.device_id)
    if (!deviceId || Number.isNaN(deviceId)) {
      setFormError('Select a device.')
      setSubmitting(false)
      return
    }
    try {
      await createTicket({
        device_id: deviceId,
        title: form.title.trim(),
        description: form.description.trim() || null,
        priority: form.priority,
        status: form.status,
      })
      setModalOpen(false)
      setForm(emptyTicketForm)
      await loadTickets()
    } catch (err) {
      setFormError(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight" style={{ color: 'var(--text)' }}>
            Tickets
          </h1>
          <p className="mt-1" style={{ color: 'var(--text2)' }}>
            Support issues linked to devices.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setForm(emptyTicketForm)
            setFormError(null)
            setModalOpen(true)
          }}
          className="btn-primary-solid"
        >
          Create ticket
        </button>
      </div>

      <div className="flex flex-wrap items-end gap-4">
        <label className="text-sm font-medium" style={{ color: 'var(--text2)' }}>
          Status
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field mt-1 block w-48"
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value || 'all'} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {error ? (
        <div
          className="rounded-lg border px-4 py-3 text-sm"
          style={{
            borderColor: 'rgba(248, 113, 113, 0.35)',
            background: 'rgba(248, 113, 113, 0.08)',
            color: 'var(--red)',
          }}
        >
          {error}
          <button
            type="button"
            className="ml-3 font-medium underline hover:no-underline"
            style={{ color: 'var(--purple)' }}
            onClick={loadTickets}
          >
            Retry
          </button>
        </div>
      ) : null}

      {loading ? (
        <div className="panel overflow-hidden p-4 shadow-lg shadow-black/10" aria-busy="true" aria-label="Loading tickets">
          <div className="space-y-2">
            <SkeletonCard className="h-12 w-full" />
            <SkeletonCard className="h-12 w-full" />
            <SkeletonCard className="h-12 w-full" />
          </div>
        </div>
      ) : tickets.length === 0 ? (
        <div className="page-data-fade-in">
          <EmptyState
            title="No tickets"
            description={
              statusFilter
                ? 'Nothing matches this status filter. Try another status or clear the filter.'
                : 'Create a ticket to track work on a device.'
            }
            icon={<IconTicket className="h-10 w-10" />}
          />
        </div>
      ) : (
        <div className="page-data-fade-in">
        <div className="panel overflow-hidden shadow-lg shadow-black/10">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y text-left text-sm" style={{ borderColor: 'var(--border)' }}>
              <thead className="text-xs font-semibold uppercase tracking-wide" style={{ background: 'var(--bg3)', color: 'var(--text3)' }}>
                <tr>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Device</th>
                  <th className="px-4 py-3">Priority</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">AI category</th>
                  <th className="px-4 py-3">Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: 'var(--border)', color: 'var(--text)' }}>
                {tickets.map((t) => {
                  const device = devices.find((d) => d.id === t.device_id)
                  return (
                    <tr key={t.id} className="transition-colors hover:bg-[var(--bg3)]">
                      <td className="max-w-xs px-4 py-3">
                        <div className="font-medium" style={{ color: 'var(--text)' }}>
                          {t.title}
                        </div>
                        {t.description ? (
                          <div className="mt-0.5 line-clamp-2 text-xs" style={{ color: 'var(--text2)' }}>
                            {t.description}
                          </div>
                        ) : null}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3" style={{ color: 'var(--text2)' }}>
                        {device ? device.name : `#${t.device_id}`}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <StatusBadge type={t.priority} />
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <StatusBadge type={t.status} label={formatTicketStatus(t.status)} />
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        {t.ai_category ? (
                          <div>
                            <StatusBadge type={t.ai_category} label={t.ai_category} />
                            {formatAiConfidence(t.ai_confidence) ? (
                              <div className="mt-0.5 text-xs tabular-nums" style={{ color: 'var(--text3)' }}>
                                {formatAiConfidence(t.ai_confidence)}
                              </div>
                            ) : null}
                          </div>
                        ) : (
                          <span className="text-xs" style={{ color: 'var(--text3)' }}>
                            —
                          </span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-xs" style={{ color: 'var(--text3)' }}>
                        {new Date(t.updated_at).toLocaleString()}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
        </div>
      )}

      {modalOpen ? (
        <Modal
          title="Create ticket"
          onClose={() => !submitting && setModalOpen(false)}
          footer={
            <>
              <button
                type="button"
                disabled={submitting}
                onClick={() => setModalOpen(false)}
                className="btn-ghost"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="create-ticket-form"
                disabled={submitting}
                className={`btn-primary-solid gap-2 ${submitting ? 'btn-primary-loading' : ''}`}
              >
                {submitting ? <span className="submit-btn-spinner" aria-hidden /> : null}
                <span>{submitting ? 'Creating…' : 'Create'}</span>
              </button>
            </>
          }
        >
          <form id="create-ticket-form" className="space-y-4" onSubmit={handleSubmit}>
            {formError ? (
              <p
                className="rounded-md border px-3 py-2 text-sm"
                style={{
                  borderColor: 'rgba(248, 113, 113, 0.35)',
                  background: 'rgba(248, 113, 113, 0.08)',
                  color: 'var(--red)',
                }}
              >
                {formError}
              </p>
            ) : null}
            <div>
              <label className="text-sm font-medium" style={{ color: 'var(--text2)' }} htmlFor="tk-title">
                Title
              </label>
              <input
                id="tk-title"
                required
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                className="input-field"
              />
            </div>
            <div>
              <label className="text-sm font-medium" style={{ color: 'var(--text2)' }} htmlFor="tk-desc">
                Description
              </label>
              <textarea
                id="tk-desc"
                rows={3}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                className="input-field"
              />
            </div>
            <div>
              <label className="text-sm font-medium" style={{ color: 'var(--text2)' }} htmlFor="tk-device">
                Device
              </label>
              <select
                id="tk-device"
                required
                value={form.device_id}
                onChange={(e) => setForm((f) => ({ ...f, device_id: e.target.value }))}
                className="input-field"
              >
                <option value="">Select device…</option>
                {devices.filter((d) => d.is_active).map((d) => (
                  <option key={d.id} value={String(d.id)}>
                    {d.name}
                  </option>
                ))}
              </select>
              {devices.filter((d) => d.is_active).length === 0 ? (
                <p className="mt-1 text-xs" style={{ color: 'var(--amber)' }}>
                  No active devices available. Add one in Inventory first.
                </p>
              ) : null}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium" style={{ color: 'var(--text2)' }} htmlFor="tk-pri">
                  Priority
                </label>
                <select
                  id="tk-pri"
                  value={form.priority}
                  onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}
                  className="input-field"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium" style={{ color: 'var(--text2)' }} htmlFor="tk-st">
                  Status
                </label>
                <select
                  id="tk-st"
                  value={form.status}
                  onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                  className="input-field"
                >
                  <option value="open">Open</option>
                  <option value="in_progress">In progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </div>
          </form>
        </Modal>
      ) : null}
    </div>
  )
}


