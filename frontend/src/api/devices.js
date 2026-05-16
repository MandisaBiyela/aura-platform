import api from './client'

/** @typedef {{ id: number, name: string, serial_number: string, status: string, location: string, is_active: boolean, created_at: string }} Device */

/**
 * @param {{ status?: string, includeInactive?: boolean }} [params]
 * @returns {Promise<Device[]>}
 */
export function fetchDevices(params = {}) {
  const search = new URLSearchParams()
  if (params.status) search.set('status', params.status)
  if (params.includeInactive) search.set('include_inactive', 'true')
  const q = search.toString()
  return api.get(q ? `/devices?${q}` : '/devices').then((r) => r.data)
}

/**
 * @param {Omit<Device, 'id' | 'created_at' | 'is_active'>} body
 * @returns {Promise<Device>}
 */
export function createDevice(body) {
  return api.post('/devices', body).then((r) => r.data)
}
