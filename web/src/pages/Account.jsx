import { Navigate } from 'react-router-dom'
import { ROLE_LABEL, useAuth } from '../auth/AuthContext.jsx'

export default function Account() {
  const { user, loading, logout } = useAuth()
  if (loading) return <p className="muted">載入中…</p>
  if (!user) return <Navigate to="/login" replace />
  return (
    <section className="auth-card">
      <h1>我的帳號</h1>
      <dl className="kv">
        <dt>顯示名稱</dt><dd>{user.displayName}</dd>
        <dt>Email</dt><dd>{user.email}</dd>
        <dt>身分</dt><dd><span className={`tag ${user.role.toLowerCase()}`}>{ROLE_LABEL[user.role]}</span></dd>
        <dt>加入時間</dt><dd>{new Date(user.createdAt).toLocaleString('zh-TW')}</dd>
      </dl>
      <button className="btn ghost" onClick={logout}>登出</button>
    </section>
  )
}
