import { Link, Outlet, useNavigate } from 'react-router-dom'

import { clearStoredToken } from '../api/client'

const navLinkClass =
  'rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900'

export default function AppLayout() {
  const navigate = useNavigate()

  function handleLogout() {
    clearStoredToken()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
          <span className="text-lg font-semibold tracking-tight text-slate-900">Aura</span>
          <nav className="flex flex-wrap items-center gap-1">
            <Link className={navLinkClass} to="/dashboard">
              Dashboard
            </Link>
            <Link className={navLinkClass} to="/inventory">
              Inventory
            </Link>
            <Link className={navLinkClass} to="/tickets">
              Tickets
            </Link>
            <button
              type="button"
              className="ml-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              onClick={handleLogout}
            >
              Log out
            </button>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}
