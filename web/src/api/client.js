// 後端 API 位址：本機開發走 Vite proxy（/api → localhost:8080），部署時用 VITE_API_BASE 指定
const BASE = (import.meta.env.VITE_API_BASE ?? '').replace(/\/$/, '')
const TOKEN_KEY = 'fairgig.token'

export function getToken() {
  try { return localStorage.getItem(TOKEN_KEY) } catch { return null }
}
export function setToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token)
    else localStorage.removeItem(TOKEN_KEY)
  } catch { /* 瀏覽器不允許儲存時忽略 */ }
}

export class ApiError extends Error {
  constructor(status, message, errors = []) {
    super(message)
    this.status = status
    this.errors = errors
  }
  /** 取某欄位的錯誤訊息，給表單顯示用 */
  fieldError(field) {
    return this.errors.find((e) => e.field === field)?.message
  }
}

export async function api(path, { method = 'GET', body, auth = true } = {}) {
  const headers = {}
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  const token = auth ? getToken() : null
  if (token) headers.Authorization = `Bearer ${token}`

  let res
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    throw new ApiError(0, '連不到後端伺服器，請確認後端已啟動')
  }

  const isJson = res.headers.get('content-type')?.includes('application/json')
  const data = isJson ? await res.json().catch(() => null) : null
  if (!res.ok) {
    throw new ApiError(res.status, data?.message ?? `伺服器錯誤（${res.status}）`, data?.errors ?? [])
  }
  if (!isJson) throw new ApiError(res.status, '連不到後端伺服器，請確認後端已啟動')
  return data
}

/** 後端有沒有開：GitHub Pages 上沒有後端，會回 false */
export async function backendAvailable() {
  try {
    const data = await api('/api/health', { auth: false })
    return data?.status === 'ok'
  } catch {
    return false
  }
}

export const authApi = {
  register: (form) => api('/api/auth/register', { method: 'POST', body: form, auth: false }),
  login: (email, password) => api('/api/auth/login', { method: 'POST', body: { email, password }, auth: false }),
  me: () => api('/api/auth/me'),
}
