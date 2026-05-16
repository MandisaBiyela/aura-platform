import api from './client'

/** @typedef {'open' | 'in_progress' | 'resolved' | 'closed'} TicketStatus */
/** @typedef {'low' | 'medium' | 'high' | 'urgent'} TicketPriority */

/** @typedef {{ id: number, title: string, description: string | null, status: TicketStatus, priority: TicketPriority, device_id: number, created_by: number, created_at: string, updated_at: string, ai_category: string | null, ai_confidence: number | null, ai_classified_at: string | null }} Ticket */

/** @typedef {{ category: string, confidence: number, all_scores: Record<string, number> }} ClassifyResult */

/**
 * @param {{ status?: TicketStatus }} [params]
 * @returns {Promise<Ticket[]>}
 */
export function fetchTickets(params = {}) {
  const search = new URLSearchParams()
  if (params.status) search.set('status', params.status)
  const q = search.toString()
  return api.get(q ? `/tickets?${q}` : '/tickets').then((r) => r.data)
}

/**
 * @param {{ device_id: number, title: string, description?: string | null, priority?: TicketPriority, status?: TicketStatus }} body
 * @returns {Promise<Ticket>}
 */
export function createTicket(body) {
  return api.post('/tickets', body).then((r) => r.data)
}

/**
 * @param {string} text
 * @returns {Promise<ClassifyResult>}
 */
export function classifyTicketText(text) {
  return api.post('/tickets/classify', { text }).then((r) => r.data)
}
