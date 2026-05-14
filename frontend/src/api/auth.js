import api from './client'

/** @param {{ email: string; password: string }} body */
export function login(body) {
  return api.post('/auth/login', body)
}

/** @param {{ email: string; password: string }} body */
export function register(body) {
  return api.post('/auth/register', body)
}
