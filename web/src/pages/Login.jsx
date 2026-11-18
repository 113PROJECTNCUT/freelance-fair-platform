import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext.jsx'
import BackendNotice, { useBackendStatus } from '../auth/BackendNotice.jsx'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const backend = useBackendStatus()
  const [email, setEmail] = useState(location.state?.email ?? '')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await login(email, password)
      navigate('/account')
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="auth-card">
      <h1>登入</h1>
      <BackendNotice status={backend} />
      {location.state?.registered && <div className="notice ok">註冊成功，請登入。</div>}
      <form onSubmit={onSubmit} noValidate>
        <label>
          Email
          <input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label>
          密碼
          <input type="password" autoComplete="current-password" value={password}
            onChange={(e) => setPassword(e.target.value)} required />
        </label>
        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="btn primary" disabled={busy || backend !== 'up'}>{busy ? '登入中…' : '登入'}</button>
      </form>
      <p className="muted">還沒有帳號？<Link to="/register">註冊</Link></p>
    </section>
  )
}
