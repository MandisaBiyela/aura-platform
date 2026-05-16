import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { fetchDevices } from '../api/devices'
import { fetchTickets } from '../api/tickets'
import { getErrorMessage } from '../api/errors'
import EmptyState from '../components/EmptyState'
import { IconDeviceSmall, IconEllipsisVertical, IconMonitor } from '../components/icons'
import SkeletonCard from '../components/SkeletonCard'

const CARD = {
  background: '#161b22',
  border: '1px solid #2a3447',
  borderRadius: '10px',
}

const COL = {
  bar: '#2a3447',
  barHi: '#7c3aed',
  cyan: '#22d3ee',
  amber: '#fbbf24',
  green: '#34d399',
  red: '#f87171',
  grey: '#8b949e',
  hole: '#161b22',
}

function lastSixCalendarMonths() {
  const d = new Date()
  const out = []
  for (let i = 5; i >= 0; i -= 1) {
    const x = new Date(d.getFullYear(), d.getMonth() - i, 1)
    out.push({
      key: `${x.getFullYear()}-${x.getMonth()}`,
      label: x.toLocaleString('default', { month: 'short' }),
      year: x.getFullYear(),
      month: x.getMonth(),
    })
  }
  return out
}

function inMonth(iso, year, month) {
  if (!iso) return false
  const t = new Date(iso)
  return t.getFullYear() === year && t.getMonth() === month
}

function deviceUiStatus(d) {
  const s = (d.status || '').toLowerCase()
  if (!d.is_active) return 'inactive'
  if (s.includes('maint') || s.includes('repair') || s.includes('offline')) return 'maintenance'
  return 'active'
}

const PRIORITY_RANK = { urgent: 4, high: 3, medium: 2, low: 1 }

function deviceRowPriority(deviceId, tickets) {
  const open = tickets.filter(
    (t) =>
      t.device_id === deviceId && (t.status === 'open' || t.status === 'in_progress'),
  )
  if (open.length === 0) return 'low'
  let best = 'low'
  let r = 0
  for (const t of open) {
    const pr = PRIORITY_RANK[t.priority] ?? 0
    if (pr > r) {
      r = pr
      best = t.priority
    }
  }
  if (best === 'urgent') return 'critical'
  if (best === 'high') return 'high'
  return 'low'
}

function TrendRow({ label, current, previous, upIsGood }) {
  const diff = current - previous
  const flat = diff === 0
  const up = diff > 0
  const good = flat ? null : up === upIsGood
  const arrow = flat ? '—' : up ? '↑' : '↓'
  const color = flat ? COL.grey : good ? COL.green : COL.red
  const text = flat ? 'Flat vs prior period' : `${up ? '+' : ''}${diff} vs prior period`
  return (
    <div className="mt-3 flex items-center gap-1.5 text-xs font-medium" style={{ color }}>
      <span className="text-sm" aria-hidden>
        {arrow}
      </span>
      <span style={{ color: COL.grey }}>{text}</span>
      <span className="sr-only">{label}</span>
    </div>
  )
}

function BarChartCanvas({ monthBuckets, currentMonthKey }) {
  const ref = useRef(null)
  const wrapRef = useRef(null)

  const draw = useCallback(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const cssW = wrapRef.current?.clientWidth || canvas.clientWidth || 560
    const cssH = 200
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = Math.floor(cssW * dpr)
    canvas.height = Math.floor(cssH * dpr)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, cssW, cssH)

    const padL = 36
    const padR = 12
    const padB = 28
    const padT = 16
    const max = Math.max(1, ...monthBuckets.map((b) => b.count))
    const n = monthBuckets.length
    const chartW = cssW - padL - padR
    const chartH = cssH - padT - padB
    const gap = 10
    const barW = n > 0 ? (chartW - gap * (n - 1)) / n : 0

    monthBuckets.forEach((b, i) => {
      const h = (b.count / max) * chartH
      const x = padL + i * (barW + gap)
      const y = padT + chartH - h
      ctx.fillStyle = b.key === currentMonthKey ? COL.barHi : COL.bar
      const r = 4
      ctx.beginPath()
      ctx.moveTo(x + r, y)
      ctx.lineTo(x + barW - r, y)
      ctx.quadraticCurveTo(x + barW, y, x + barW, y + r)
      ctx.lineTo(x + barW, padT + chartH)
      ctx.lineTo(x, padT + chartH)
      ctx.lineTo(x, y + r)
      ctx.quadraticCurveTo(x, y, x + r, y)
      ctx.closePath()
      ctx.fill()
    })

    ctx.fillStyle = COL.grey
    ctx.font = '11px system-ui, sans-serif'
    ctx.textAlign = 'center'
    monthBuckets.forEach((b, i) => {
      const x = padL + i * (barW + gap) + barW / 2
      ctx.fillText(b.label, x, cssH - 8)
    })

    ctx.textAlign = 'right'
    ctx.fillText(String(max), padL - 6, padT + 10)
  }, [monthBuckets, currentMonthKey])

  useEffect(() => {
    draw()
    const ro = new ResizeObserver(() => draw())
    if (wrapRef.current) ro.observe(wrapRef.current)
    return () => ro.disconnect()
  }, [draw])

  return (
    <div ref={wrapRef} className="w-full">
      <canvas ref={ref} className="h-[200px] w-full max-w-full" aria-label="Tickets created per month, last six months" />
    </div>
  )
}

function DonutCanvas({ segments }) {
  const ref = useRef(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const size = 200
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = size * dpr
    canvas.height = size * dpr
    canvas.style.width = `${size}px`
    canvas.style.height = `${size}px`
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, size, size)

    const cx = size / 2
    const cy = size / 2
    const outerR = 78
    const innerR = 48
    const total = segments.reduce((a, s) => a + s.value, 0)
    let angle = -Math.PI / 2

    if (total === 0) {
      ctx.beginPath()
      ctx.arc(cx, cy, outerR, 0, Math.PI * 2)
      ctx.arc(cx, cy, innerR, Math.PI * 2, 0, true)
      ctx.closePath()
      ctx.fillStyle = COL.grey
      ctx.globalAlpha = 0.35
      ctx.fill()
      ctx.globalAlpha = 1
    } else {
      for (const seg of segments) {
        if (seg.value <= 0) continue
        const slice = (seg.value / total) * Math.PI * 2
        ctx.beginPath()
        ctx.arc(cx, cy, outerR, angle, angle + slice)
        ctx.arc(cx, cy, innerR, angle + slice, angle, true)
        ctx.closePath()
        ctx.fillStyle = seg.color
        ctx.fill()
        angle += slice
      }
    }

    ctx.beginPath()
    ctx.arc(cx, cy, innerR, 0, Math.PI * 2)
    ctx.fillStyle = '#161b22'
    ctx.fill()
  }, [segments])

  return (
    <canvas
      ref={ref}
      width={200}
      height={200}
      aria-label="Device status distribution"
    />
  )
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [devices, setDevices] = useState([])
  const [tickets, setTickets] = useState([])

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [devs, tix] = await Promise.all([
        fetchDevices({ includeInactive: true }),
        fetchTickets(),
      ])
      setDevices(devs)
      setTickets(tix)
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

  const months = useMemo(() => lastSixCalendarMonths(), [])
  const currentMonthKey = months[months.length - 1]?.key ?? ''

  const monthBuckets = useMemo(
    () =>
      months.map((m) => ({
        key: m.key,
        label: m.label,
        count: tickets.filter((t) => inMonth(t.created_at, m.year, m.month)).length,
      })),
    [months, tickets],
  )

  const totalDevices = devices.length
  const openTickets = tickets.filter((t) => t.status === 'open' || t.status === 'in_progress').length
  const resolvedTickets = tickets.filter((t) => t.status === 'resolved').length

  const now = useMemo(() => new Date(), [])

  const trendDevices = useMemo(() => {
    const t0 = now.getTime()
    const d30 = t0 - 30 * 86400000
    const d60 = t0 - 60 * 86400000
    const last = devices.filter((d) => new Date(d.created_at).getTime() >= d30).length
    const prev = devices.filter((d) => {
      const x = new Date(d.created_at).getTime()
      return x >= d60 && x < d30
    }).length
    return { current: last, previous: prev }
  }, [devices, now])

  const trendOpen = useMemo(() => {
    const t0 = now.getTime()
    const d30 = t0 - 30 * 86400000
    const d60 = t0 - 60 * 86400000
    const last = tickets.filter(
      (t) =>
        (t.status === 'open' || t.status === 'in_progress') &&
        new Date(t.created_at).getTime() >= d30,
    ).length
    const prev = tickets.filter(
      (t) =>
        (t.status === 'open' || t.status === 'in_progress') &&
        new Date(t.created_at).getTime() >= d60 &&
        new Date(t.created_at).getTime() < d30,
    ).length
    return { current: last, previous: prev }
  }, [tickets, now])

  const trendResolved = useMemo(() => {
    const t0 = now.getTime()
    const d30 = t0 - 30 * 86400000
    const d60 = t0 - 60 * 86400000
    const last = tickets.filter(
      (t) => t.status === 'resolved' && new Date(t.updated_at).getTime() >= d30,
    ).length
    const prev = tickets.filter(
      (t) =>
        t.status === 'resolved' &&
        new Date(t.updated_at).getTime() >= d60 &&
        new Date(t.updated_at).getTime() < d30,
    ).length
    return { current: last, previous: prev }
  }, [tickets, now])

  const donutSegments = useMemo(() => {
    let a = 0
    let m = 0
    let i = 0
    for (const d of devices) {
      const u = deviceUiStatus(d)
      if (u === 'active') a += 1
      else if (u === 'maintenance') m += 1
      else i += 1
    }
    return [
      { label: 'Active', value: a, color: COL.green },
      { label: 'Maintenance', value: m, color: COL.amber },
      { label: 'Inactive', value: i, color: COL.grey },
    ]
  }, [devices])

  const recentDevices = useMemo(() => {
    return [...devices]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 8)
  }, [devices])

  const hasNoFleet = !loading && totalDevices === 0

  return (
    <div className="space-y-6">
      {/* Top bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl" style={{ color: '#e6edf3' }}>
          Dashboard
        </h1>
        <div className="flex items-center gap-3">
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
            style={{
              background: 'rgba(52, 211, 153, 0.12)',
              color: COL.green,
              border: '1px solid rgba(52, 211, 153, 0.35)',
            }}
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: COL.green }} aria-hidden />
            All systems online
          </span>
          <button
            type="button"
            className="relative rounded-lg p-2 transition-colors hover:bg-white/5"
            style={{ color: '#8b949e' }}
            aria-label="Notifications"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            <span
              className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full ring-2 ring-[#161b22]"
              style={{ background: '#a78bfa' }}
              aria-hidden
            />
          </button>
        </div>
      </div>

      {error ? (
        <div
          className="px-4 py-3 text-sm"
          style={{
            ...CARD,
            borderColor: 'rgba(248, 113, 113, 0.35)',
            color: COL.red,
            background: 'rgba(248, 113, 113, 0.08)',
          }}
          role="alert"
        >
          {error}
          <button
            type="button"
            className="ml-3 font-medium underline hover:no-underline"
            style={{ color: '#a78bfa' }}
            onClick={load}
          >
            Retry
          </button>
        </div>
      ) : null}

      {loading ? (
        <div className="space-y-6" aria-busy="true" aria-label="Loading dashboard">
          <div className="grid gap-4 sm:grid-cols-3">
            <SkeletonCard className="min-h-[118px]" />
            <SkeletonCard className="min-h-[118px]" />
            <SkeletonCard className="min-h-[118px]" />
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <SkeletonCard className="min-h-[240px]" />
            <SkeletonCard className="min-h-[240px]" />
          </div>
          <div className="p-5" style={CARD}>
            <SkeletonCard className="mb-4 h-4 w-40" />
            <SkeletonCard className="mb-3 h-3 w-56" />
            <div className="mt-4 space-y-2">
              <SkeletonCard className="h-12 w-full" />
              <SkeletonCard className="h-12 w-full" />
              <SkeletonCard className="h-12 w-full" />
            </div>
          </div>
        </div>
      ) : (
        <div className="page-data-fade-in space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="p-5" style={CARD}>
          <p className="text-sm font-medium" style={{ color: '#8b949e' }}>
            Total devices
          </p>
          <p className="mt-1 text-3xl font-bold tabular-nums" style={{ color: COL.cyan }}>
            {totalDevices}
          </p>
          <TrendRow label="New devices" {...trendDevices} upIsGood />
          <p className="mt-2 text-xs" style={{ color: '#58677a' }}>
            Fleet size including inactive records
          </p>
        </div>
        <div className="p-5" style={CARD}>
          <p className="text-sm font-medium" style={{ color: '#8b949e' }}>
            Open tickets
          </p>
          <p className="mt-1 text-3xl font-bold tabular-nums" style={{ color: COL.amber }}>
            {openTickets}
          </p>
          <TrendRow label="New open tickets" {...trendOpen} upIsGood={false} />
          <p className="mt-2 text-xs" style={{ color: '#58677a' }}>
            Open and in progress
          </p>
        </div>
        <div className="p-5" style={CARD}>
          <p className="text-sm font-medium" style={{ color: '#8b949e' }}>
            Resolved tickets
          </p>
          <p className="mt-1 text-3xl font-bold tabular-nums" style={{ color: COL.green }}>
            {resolvedTickets}
          </p>
          <TrendRow label="Resolved last 30d" {...trendResolved} upIsGood />
          <p className="mt-2 text-xs" style={{ color: '#58677a' }}>
            Marked resolved (lifetime)
          </p>
        </div>
      </div>

      {/* Charts row */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="p-5" style={CARD}>
          <h2 className="text-sm font-semibold" style={{ color: '#e6edf3' }}>
            Tickets (last 6 months)
          </h2>
          <p className="mt-0.5 text-xs" style={{ color: '#58677a' }}>
            By created date
          </p>
          <div className="mt-4 w-full">
            <BarChartCanvas monthBuckets={monthBuckets} currentMonthKey={currentMonthKey} />
          </div>
        </div>
        <div className="p-5" style={CARD}>
          <h2 className="text-sm font-semibold" style={{ color: '#e6edf3' }}>
            Device status
          </h2>
          <p className="mt-0.5 text-xs" style={{ color: '#58677a' }}>
            Active, maintenance, and inactive
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-8 sm:justify-start">
            <DonutCanvas segments={donutSegments} />
            <ul className="min-w-[140px] space-y-2 text-sm" style={{ color: '#8b949e' }}>
              {donutSegments.map((s) => (
                <li key={s.label} className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: s.color }} />
                  <span>
                    {s.label}{' '}
                    <span className="tabular-nums" style={{ color: '#e6edf3' }}>
                      ({s.value})
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Recent devices */}
      <div className="p-5" style={CARD}>
        <h2 className="text-sm font-semibold" style={{ color: '#e6edf3' }}>
          Recent devices
        </h2>
        <p className="mt-0.5 text-xs" style={{ color: '#58677a' }}>
          Newest registrations first
        </p>
        {recentDevices.length === 0 ? (
          <p className="mt-6 text-sm" style={{ color: '#8b949e' }}>
            No devices yet.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr style={{ color: '#58677a' }}>
                  <th className="pb-3 pl-1 pr-2 font-medium" scope="col">
                    {' '}
                  </th>
                  <th className="pb-3 pr-4 font-medium" scope="col">
                    Device
                  </th>
                  <th className="pb-3 pr-4 font-medium" scope="col">
                    Status
                  </th>
                  <th className="pb-3 pr-4 font-medium" scope="col">
                    Priority
                  </th>
                  <th className="pb-3 pr-1 text-right font-medium" scope="col">
                    {' '}
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentDevices.map((d) => {
                  const ui = deviceUiStatus(d)
                  const pr = deviceRowPriority(d.id, tickets)
                  const statusStyles =
                    ui === 'active'
                      ? { bg: 'rgba(52, 211, 153, 0.12)', fg: COL.green, label: 'Active' }
                      : ui === 'maintenance'
                        ? { bg: 'rgba(251, 191, 36, 0.12)', fg: COL.amber, label: 'Maintenance' }
                        : { bg: 'rgba(139, 148, 158, 0.12)', fg: COL.grey, label: 'Inactive' }
                  const priStyles =
                    pr === 'critical'
                      ? { bg: 'rgba(248, 113, 113, 0.12)', fg: COL.red, label: 'Critical' }
                      : pr === 'high'
                        ? { bg: 'rgba(251, 191, 36, 0.12)', fg: COL.amber, label: 'High' }
                        : { bg: 'rgba(139, 148, 158, 0.12)', fg: COL.grey, label: 'Low' }
                  return (
                    <tr key={d.id} className="border-t" style={{ borderColor: '#2a3447' }}>
                      <td className="py-3 pl-1 pr-2 align-middle">
                        <span
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg"
                          style={{ background: '#1c2230', color: '#a78bfa' }}
                          aria-hidden
                        >
                          <IconDeviceSmall className="h-5 w-5" />
                        </span>
                      </td>
                      <td className="py-3 pr-4 align-middle">
                        <div className="font-medium" style={{ color: '#e6edf3' }}>
                          {d.name}
                        </div>
                        <div className="font-mono text-xs" style={{ color: '#58677a' }}>
                          {d.serial_number}
                        </div>
                      </td>
                      <td className="py-3 pr-4 align-middle">
                        <span
                          className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold"
                          style={{ background: statusStyles.bg, color: statusStyles.fg }}
                        >
                          {statusStyles.label}
                        </span>
                      </td>
                      <td className="py-3 pr-4 align-middle">
                        <span
                          className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold"
                          style={{ background: priStyles.bg, color: priStyles.fg }}
                        >
                          {priStyles.label}
                        </span>
                      </td>
                      <td className="py-3 pr-1 text-right align-middle">
                        <button
                          type="button"
                          className="inline-flex items-center justify-center rounded-md p-1.5 hover:bg-white/5"
                          style={{ color: '#8b949e' }}
                          aria-label={`Actions for ${d.name}`}
                        >
                          <IconEllipsisVertical className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {hasNoFleet && !error ? (
        <EmptyState
          title="No devices yet"
          description="Add devices from Inventory to populate your fleet and attach tickets."
          icon={<IconMonitor className="h-10 w-10" />}
        />
      ) : null}
        </div>
      )}
    </div>
  )
}
