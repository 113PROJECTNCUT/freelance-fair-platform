import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authApi } from '../api/client.js'
import BackendNotice, { useBackendStatus } from '../auth/BackendNotice.jsx'

// 與後端規則一致：8–72 碼，同時有英文字母與數字
export const PASSWORD_RULE = /^(?=.*[A-Za-z])(?=.*\d).{8,72}$/

export default function Register() {
  const navigate = useNavigate()
  const backend = useBackendStatus()
  const [form, setForm] = useState({ email: '', password: '', confirm: '', displayName: '' })
  const [errors, setErrors] = useState({})
  const [busy, setBusy] = useState(false)
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  function validate() {
    const e = {}
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Email 格式不正確'
    if (!PASSWORD_RULE.test(form.password)) e.password = '密碼需 8–72 碼，且同時包含英文字母與數字'
    if (form.confirm !== form.password) e.confirm = '兩次輸入的密碼不一致'
    if (!form.displayName.trim()) e.displayName = '請輸入顯示名稱'
    else if (form.displayName.trim().length > 30) e.displayName = '顯示名稱最多 30 字'
    return e
  }

  async function onSubmit(ev) {
    ev.preventDefault()
    const e = validate()
    setErrors(e)
    if (Object.keys(e).length) return
    setBusy(true)
    try {
      const { email, password, displayName } = form
      await authApi.register({ email, password, displayName: displayName.trim() })
      navigate('/login', { state: { registered: true, email } })
    } catch (err) {
      const fe = {}
      for (const { field, message } of err.errors ?? []) fe[field] = message
      if (!Object.keys(fe).length) fe.form = err.message
      setErrors(fe)
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="auth-card">
      <h1>註冊會員</h1>
      <p className="muted">一個帳號就能刊登案件，也能接案。</p>
      <BackendNotice status={backend} />
      <form onSubmit={onSubmit} noValidate>
        <label>
          顯示名稱
          <input value={form.displayName} onChange={set('displayName')} maxLength={30} />
          {errors.displayName && <small className="form-error">{errors.displayName}</small>}
        </label>
        <label>
          Email
          <input type="email" autoComplete="email" value={form.email} onChange={set('email')} />
          {errors.email && <small className="form-error">{errors.email}</small>}
        </label>
        <label>
          密碼
          <input type="password" autoComplete="new-password" value={form.password} onChange={set('password')} />
          <small className="muted">至少 8 碼，需同時包含英文字母與數字</small>
          {errors.password && <small className="form-error">{errors.password}</small>}
        </label>
        <label>
          確認密碼
          <input type="password" autoComplete="new-password" value={form.confirm} onChange={set('confirm')} />
          {errors.confirm && <small className="form-error">{errors.confirm}</small>}
        </label>
        {errors.form && <p className="form-error" role="alert">{errors.form}</p>}
        <button className="btn primary" disabled={busy || backend !== 'up'}>{busy ? '送出中…' : '建立帳號'}</button>
      </form>
      <p className="muted">已經有帳號？<Link to="/login">登入</Link></p>
    </section>
  )
}
