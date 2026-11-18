import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authApi } from '../api/client.js'
import BackendNotice, { useBackendStatus } from '../auth/BackendNotice.jsx'

const ROLES = [
  { value: 'FREELANCER', title: '我是接案者', desc: '接案、報價、交付作品' },
  { value: 'CLIENT', title: '我是發案方', desc: '刊登案件、挑選接案者、驗收' },
]

// 與後端規則一致：8–72 碼，同時有英文字母與數字
export const PASSWORD_RULE = /^(?=.*[A-Za-z])(?=.*\d).{8,72}$/

export default function Register() {
  const navigate = useNavigate()
  const backend = useBackendStatus()
  const [form, setForm] = useState({ email: '', password: '', confirm: '', displayName: '', role: 'FREELANCER' })
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
      const { email, password, displayName, role } = form
      await authApi.register({ email, password, displayName: displayName.trim(), role })
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
      <BackendNotice status={backend} />
      <form onSubmit={onSubmit} noValidate>
        <fieldset className="role-pick">
          <legend>選擇身分</legend>
          {ROLES.map((r) => (
            <label key={r.value} className={form.role === r.value ? 'selected' : ''}>
              <input type="radio" name="role" value={r.value} checked={form.role === r.value} onChange={set('role')} />
              <strong>{r.title}</strong>
              <span>{r.desc}</span>
            </label>
          ))}
        </fieldset>
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
        {(errors.form || errors.role) && <p className="form-error" role="alert">{errors.form || errors.role}</p>}
        <button className="btn primary" disabled={busy || backend !== 'up'}>{busy ? '送出中…' : '建立帳號'}</button>
      </form>
      <p className="muted">已經有帳號？<Link to="/login">登入</Link></p>
    </section>
  )
}
