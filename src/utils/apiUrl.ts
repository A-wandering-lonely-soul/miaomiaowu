export function resolveApiPath(path: string): string {
  let p = path.startsWith('/') ? path : '/' + path
  const raw = (import.meta.env.VITE_APP_API_BASE || '').trim()
  if (!raw || !/^https?:\/\//i.test(raw)) {
    return p
  }
  const base = raw.replace(/\/$/, '')
  let u: URL
  try {
    u = new URL(base)
  } catch {
    return p
  }
  const isDirectBackend = u.port === '8082' || ['localhost', '127.0.0.1'].includes(u.hostname)
  let suffix = p
  if (isDirectBackend && suffix.startsWith('/api')) {
    suffix = suffix.replace(/^\/api/, '')
    if (!suffix.startsWith('/')) suffix = '/' + suffix
  }
  return `${base}${suffix}`
}
