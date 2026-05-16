import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import AuraBrandLogo from '../components/AuraBrandLogo'
import { login, register } from '../api/auth'
import { setStoredToken, setStoredUserEmail } from '../api/client'
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
      setStoredUserEmail(email)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4" style={{ background: 'var(--bg)' }}>
      <div className="panel w-full max-w-md p-8 shadow-lg shadow-black/20">
        <div className="mb-6 flex justify-center">
          <AuraBrandLogo className="h-auto w-full max-h-14 max-w-[260px] object-contain" alt="AURA" />
        </div>
        <h1 className="text-2xl font-semibold" style={{ color: 'var(--text)' }}>
          Create account
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--text2)' }}>
          Password must be at least 8 characters.
        </p>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="reg-email" className="block text-sm font-medium" style={{ color: 'var(--text2)' }}>
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
              className="input-field"
            />
          </div>
          <div>
            <label htmlFor="reg-password" className="block text-sm font-medium" style={{ color: 'var(--text2)' }}>
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
              className="input-field"
            />
          </div>
          {error ? (
            <p
              className="rounded-md border px-3 py-2 text-sm"
              style={{
                borderColor: 'rgba(248, 113, 113, 0.35)',
                background: 'rgba(248, 113, 113, 0.1)',
                color: 'var(--red)',
              }}
              role="alert"
            >
              {error}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={loading}
            className={`btn-primary-solid w-full gap-2 ${loading ? 'btn-primary-loading' : ''}`}
          >
            {loading ? <span className="submit-btn-spinner" aria-hidden /> : null}
            <span>{loading ? 'Creating account…' : 'Register'}</span>
          </button>
        </form>
        <p className="mt-6 text-center text-sm" style={{ color: 'var(--text2)' }}>
          Already registered?{' '}
          <Link className="font-medium hover:underline" style={{ color: 'var(--purple)' }} to="/login">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
