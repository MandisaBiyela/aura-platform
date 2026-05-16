import { useCallback, useEffect, useMemo, useState } from 'react'

import { createDevice, fetchDevices } from '../api/devices'
import { getErrorMessage } from '../api/errors'
import EmptyState from '../components/EmptyState'
import Modal from '../components/Modal'
import SkeletonCard from '../components/SkeletonCard'
import StatusBadge from '../components/StatusBadge'
import { IconCube, IconSearch } from '../components/icons'

function inventoryRecordType(d) {
  return d.is_active ? 'active' : 'inactive'
}

/** Semantic type for colouring the operational status cell. */
function inventoryOperationalType(d) {
  if (!d.is_active) return 'inactive'
  const s = (d.status || '').trim().toLowerCase()
  if (/maint|repair/.test(s)) return 'maintenance'
  if (s.includes('pending')) return 'pending'
  if (s.includes('offline')) return 'inactive'
  if (s.includes('open')) return 'open'
  if (s.includes('closed')) return 'closed'
  if (s.includes('resolved')) return 'resolved'
  if (s.includes('online') || s === 'active' || s === '') return 'online'
  return 'online'
}

const emptyForm = { name: '', serial_number: '', status: 'online', location: '' }

export default function Inventory() {
  const [devices, setDevices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchDevices({ includeInactive: true })
      setDevices(data)
    } catch (e) {
      setError(getErrorMessage(e))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    queueMicrotask(() => {
      void load()
    })
  }, [load])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return devices
    return devices.filter((d) => d.name.toLowerCase().includes(q))
  }, [devices, search])

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setFormError(null)
    try {
      await createDevice({
        name: form.name.trim(),
        serial_number: form.serial_number.trim(),
        status: form.status.trim(),
        location: form.location.trim(),
      })
      setModalOpen(false)
      setForm(emptyForm)
      await load()
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
            Inventory
          </h1>
          <p className="mt-1" style={{ color: 'var(--text2)' }}>
            Devices registered in Aura.
          </p>
        </div>
        <button type="button" onClick={() => {
            setForm(emptyForm)
            setFormError(null)
            setModalOpen(true)
          }} className="btn-primary-solid">
          Add device
        </button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="block max-w-md flex-1 text-sm font-medium" style={{ color: 'var(--text2)' }}>
          Search by name
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter devices…"
            className="input-field"
          />
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
            onClick={load}
          >
            Retry
          </button>
        </div>
      ) : null}

      {loading ? (
        <div className="panel overflow-hidden p-4 shadow-lg shadow-black/10" aria-busy="true" aria-label="Loading devices">
          <div className="space-y-2">
            <SkeletonCard className="h-12 w-full" />
            <SkeletonCard className="h-12 w-full" />
            <SkeletonCard className="h-12 w-full" />
          </div>
        </div>
      ) : devices.length === 0 ? (
        <div className="page-data-fade-in">
          <EmptyState
            title="No devices"
            description="Create your first device to start tracking hardware and tickets."
            icon={<IconCube className="h-10 w-10" />}
          />
        </div>
      ) : filtered.length === 0 ? (
        <div className="page-data-fade-in">
          <EmptyState
            title="No matches"
            description="Try a different name — nothing in the list matches your search."
            icon={<IconSearch className="h-10 w-10" />}
          />
        </div>
      ) : (
        <div className="page-data-fade-in">
        <div className="panel overflow-hidden shadow-lg shadow-black/10">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y text-left text-sm" style={{ borderColor: 'var(--border)' }}>
              <thead className="text-xs font-semibold uppercase tracking-wide" style={{ background: 'var(--bg3)', color: 'var(--text3)' }}>
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Serial</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Record</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: 'var(--border)', color: 'var(--text)' }}>
                {filtered.map((d) => (
                  <tr key={d.id} className="transition-colors hover:bg-[var(--bg3)]">
                    <td className="whitespace-nowrap px-4 py-3 font-medium">{d.name}</td>
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-xs" style={{ color: 'var(--text2)' }}>
                      {d.serial_number}
                    </td>
                    <td className="px-4 py-3" style={{ color: 'var(--text2)' }}>
                      {d.location}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <StatusBadge type={inventoryOperationalType(d)} label={d.status || '—'} />
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <StatusBadge type={inventoryRecordType(d)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        </div>
      )}

      {modalOpen ? (
        <Modal
          title="Add device"
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
                form="add-device-form"
                disabled={submitting}
                className={`btn-primary-solid gap-2 ${submitting ? 'btn-primary-loading' : ''}`}
              >
                {submitting ? <span className="submit-btn-spinner" aria-hidden /> : null}
                <span>{submitting ? 'Saving…' : 'Save device'}</span>
              </button>
            </>
          }
        >
          <form id="add-device-form" className="space-y-4" onSubmit={handleSubmit}>
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
              <label className="text-sm font-medium" style={{ color: 'var(--text2)' }} htmlFor="dev-name">
                Name
              </label>
              <input
                id="dev-name"
                required
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="input-field"
              />
            </div>
            <div>
              <label className="text-sm font-medium" style={{ color: 'var(--text2)' }} htmlFor="dev-serial">
                Serial number
              </label>
              <input
                id="dev-serial"
                required
                value={form.serial_number}
                onChange={(e) => setForm((f) => ({ ...f, serial_number: e.target.value }))}
                className="input-field font-mono text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium" style={{ color: 'var(--text2)' }} htmlFor="dev-status">
                Operational status
              </label>
              <input
                id="dev-status"
                required
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                placeholder="e.g. online, maintenance"
                className="input-field"
              />
            </div>
            <div>
              <label className="text-sm font-medium" style={{ color: 'var(--text2)' }} htmlFor="dev-loc">
                Location
              </label>
              <input
                id="dev-loc"
                required
                value={form.location}
                onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                className="input-field"
              />
            </div>
          </form>
        </Modal>
      ) : null}
    </div>
  )
}
