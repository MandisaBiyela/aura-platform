/** Normalize FastAPI / axios error payloads for display. */
export function getErrorMessage(error) {
  const detail = error.response?.data?.detail
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail)) {
    return detail
      .map((item) => (typeof item?.msg === 'string' ? item.msg : JSON.stringify(item)))
      .join(' ')
  }
  if (detail && typeof detail === 'object') {
    return JSON.stringify(detail)
  }

  // Axios: no response (connection refused, wrong host, CORS in some cases, proxy target down).
  const code = error.code
  const msg = error.message || ''
  const isNetworkish =
    code === 'ERR_NETWORK' ||
    code === 'ECONNREFUSED' ||
    msg === 'Network Error' ||
    (error.request && !error.response)

  if (isNetworkish) {
    const hint =
      import.meta.env.DEV && !import.meta.env.VITE_API_BASE_URL
        ? 'Start the FastAPI server on port 8000 (e.g. from the repo root: python -m uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000). If the API uses another host or port, set VITE_DEV_PROXY_TARGET in frontend/.env and restart npm run dev.'
        : 'Check that the API is running and that VITE_API_BASE_URL (if set) is correct.'
    return `Cannot reach the server. ${hint}`
  }

  return msg || 'Something went wrong'
}
