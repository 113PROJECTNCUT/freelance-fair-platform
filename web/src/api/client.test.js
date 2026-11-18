import { afterEach, describe, expect, it, vi } from 'vitest'
import { ApiError, api, backendAvailable } from './client.js'
import { PASSWORD_RULE } from '../pages/Register.jsx'

function mockFetch(status, body, contentType = 'application/json') {
  globalThis.fetch = vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    headers: { get: () => contentType },
    json: async () => body,
  })
}

afterEach(() => { vi.restoreAllMocks() })

describe('api client', () => {
  it('後端錯誤轉成 ApiError，保留欄位錯誤', async () => {
    mockFetch(400, { message: '輸入資料有誤', errors: [{ field: 'password', message: '太短' }] })
    const err = await api('/api/auth/register', { method: 'POST', body: {} }).catch((e) => e)
    expect(err).toBeInstanceOf(ApiError)
    expect(err.status).toBe(400)
    expect(err.fieldError('password')).toBe('太短')
  })

  it('連不到後端時給出清楚訊息', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'))
    await expect(api('/api/auth/me')).rejects.toThrow('連不到後端伺服器')
  })

  it('GitHub Pages 回 HTML 時判定為後端未連線', async () => {
    mockFetch(200, null, 'text/html')
    expect(await backendAvailable()).toBe(false)
  })

  it('健康檢查成功', async () => {
    mockFetch(200, { status: 'ok' })
    expect(await backendAvailable()).toBe(true)
  })
})

describe('密碼規則（與後端一致）', () => {
  it.each([
    ['secret123', true],
    ['abc', false],
    ['abcdefgh', false],
    ['12345678', false],
    ['a1' + 'x'.repeat(71), false],
  ])('%s → %s', (pw, ok) => {
    expect(PASSWORD_RULE.test(pw)).toBe(ok)
  })
})
