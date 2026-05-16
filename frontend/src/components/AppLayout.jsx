import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'

import AuraBrandLogo from './AuraBrandLogo'
import { clearStoredToken, getStoredUserEmail } from '../api/client'

const USER_ROLE_LABEL = 'Operator'

function navClass({ isActive }) {
  return ['sidebar-nav-link', isActive ? 'sidebar-nav-link--active' : ''].filter(Boolean).join(' ')
}

function displayNameFromEmail(email) {
  if (!email) return 'User'
  const local = email.split('@')[0] || email
  return local
    .split(/[._-]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ')
}

function initialsFromEmail(email) {
  if (!email) return '?'
  const display = displayNameFromEmail(email)
  const parts = display.split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return display.slice(0, 2).toUpperCase()
}

export default function AppLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const email = getStoredUserEmail()
  const name = displayNameFromEmail(email)
  const initials = initialsFromEmail(email)

  function handleLogout() {
    clearStoredToken()
    navigate('/login', { replace: true })
  }

  return (
    <div className="app-shell">
      <aside className="app-sidebar" aria-label="Primary">
        <div className="border-b px-2 py-3" style={{ borderColor: 'var(--border)' }}>
          <AuraBrandLogo
            className="mx-auto h-auto w-full max-h-[52px] object-contain object-center"
            alt="AURA — intelligent device management"
          />
        </div>

        <div className="app-sidebar__scroll">
          <div className="app-sidebar__section-label">main</div>
          <nav className="app-sidebar__nav" aria-label="Main">
            <NavLink className={navClass} to="/dashboard" end>
              Dashboard
            </NavLink>
            <NavLink className={navClass} to="/inventory">
              Inventory
            </NavLink>
            <NavLink className={navClass} to="/tickets">
              Tickets
            </NavLink>
          </nav>

          <div className="app-sidebar__section-label">ai features</div>
          <nav className="app-sidebar__nav" aria-label="AI features">
            <NavLink className={navClass} to="/classifier">
              Classifier
            </NavLink>
            <NavLink className={navClass} to="/predictive-ml">
              Predictive ML
            </NavLink>
            <NavLink className={navClass} to="/vision-scan">
              Vision Scan
            </NavLink>
          </nav>

          <div className="app-sidebar__section-label">system</div>
          <nav className="app-sidebar__nav" aria-label="System">
            <NavLink className={navClass} to="/settings">
              Settings
            </NavLink>
          </nav>
        </div>

        <div className="mt-auto border-t p-2" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-2.5 rounded-md px-1.5 py-2">
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
              style={{
                background: 'linear-gradient(135deg, var(--purple2), var(--purple))',
                color: 'var(--text)',
              }}
              aria-hidden
            >
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium" style={{ color: 'var(--text)' }}>
                {name}
              </p>
              <p className="truncate text-[11px]" style={{ color: 'var(--text3)' }}>
                {USER_ROLE_LABEL}
              </p>
            </div>
          </div>
          <button
            type="button"
            className="btn-ghost mt-1 w-full text-xs"
            onClick={handleLogout}
          >
            Log out
          </button>
        </div>
      </aside>

      <main className="app-main">
        <div className="mx-auto max-w-6xl">
          <div key={location.pathname} className="route-outlet-enter">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  )
}
