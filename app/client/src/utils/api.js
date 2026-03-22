/**
 * API Configuration
 *
 * In development: Vite proxy forwards /api and /ws to localhost:3001
 * In production: Express serves both API and static files on same origin
 * In both cases, relative URLs work correctly.
 */
export const API_BASE = import.meta.env.VITE_API_URL || '';

/**
 * Derive the WebSocket URL from the current page location.
 *
 * In development: Vite proxy at :5173 forwards /ws to :3001
 * In production: Express on same origin handles /ws directly
 * Both cases: use window.location.host (works for both)
 */
export function getWsUrl(sessionId, role) {
  if (API_BASE) {
    // Explicit cross-origin API URL
    const wsBase = API_BASE.replace(/^https:/, 'wss:').replace(/^http:/, 'ws:');
    return `${wsBase}/ws?sessionId=${sessionId}&role=${role}`;
  }

  // Same-origin: use current page host (works with Vite proxy in dev, Express in prod)
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//${window.location.host}/ws?sessionId=${sessionId}&role=${role}`;
}
