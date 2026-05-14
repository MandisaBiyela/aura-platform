import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { login, register } from '../api/auth'
import { setStoredToken } from '../api/client'
import { getErrorMessage } from '../api/errors'

export default function Register() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    setLoading(true)
    try {
      await register({ email, password })
      const { data } = await login({ email, password })
      setStoredToken(data.access_token)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Create account</h1>
        <p className="mt-1 text-sm text-slate-600">Password must be at least 8 characters.</p>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="reg-email" className="block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              id="reg-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 shadow-sm outline-none ring-violet-500 focus:border-violet-500 focus:ring-1"
            />
          </div>
          <div>
            <label htmlFor="reg-password" className="block text-sm font-medium text-slate-700">
              Password
            </label>
            <input
              id="reg-password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 shadow-sm outline-none ring-violet-500 focus:border-violet-500 focus:ring-1"
            />
          </div>
          {error ? (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
              {error}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Creating account…' : 'Register'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-600">
          Already registered?{' '}
          <Link className="font-medium text-violet-600 hover:text-violet-500" to="/login">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
