import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { authApi, getToken, setToken } from '../api/client.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(() => Boolean(getToken()))

  // 重新整理頁面時，用存著的 token 取回使用者；token 失效就清掉
  useEffect(() => {
    if (!getToken()) return
    authApi.me()
      .then(setUser)
      .catch(() => setToken(null))
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback(async (email, password) => {
    const { token, user } = await authApi.login(email, password)
    setToken(token)
    setUser(user)
    return user
  }, [])

  /** 修改資料後重新取得目前使用者（例如導覽列的名稱） */
  const refresh = useCallback(async () => {
    const me = await authApi.me()
    setUser(me)
    return me
  }, [])

  const logout = useCallback(() => {
    setToken(null)
    setUser(null)
  }, [])

  const value = useMemo(() => ({ user, loading, login, logout, refresh }), [user, loading, login, logout, refresh])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth 必須在 AuthProvider 裡使用')
  return ctx
}

export const ROLE_LABEL = { MEMBER: '會員', ADMIN: '管理員' }
