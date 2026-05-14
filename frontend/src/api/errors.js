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
  return error.message || 'Something went wrong'
}
