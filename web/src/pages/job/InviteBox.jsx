import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { applicationsApi, jobsApi } from '../../api/client.js'

/** 在接案者公開檔案上，用自己招募中的案件邀請對方應徵（openspec: add-job-application） */
export default function InviteBox({ member }) {
  const [jobs, setJobs] = useState(null)
  const [form, setForm] = useState({ jobId: '', message: '' })
  const [sent, setSent] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    jobsApi.mine()
      .then((list) => {
        const open = list.filter((j) => j.status === 'OPEN')
        setJobs(open)
        if (open.length) setForm((f) => ({ ...f, jobId: String(open[0].id) }))
      })
      .catch((e) => setError(e.message))
  }, [])

  async function submit(e) {
    e.preventDefault()
    if (form.message.length > 200) { setError('訊息最多 200 字'); return }
    setBusy(true)
    setError('')
    setSent('')
    try {
      await applicationsApi.invite(form.jobId, { freelancerId: member.id, message: form.message.trim() })
      const title = jobs.find((j) => String(j.id) === form.jobId)?.title
      setSent(`已邀請 ${member.displayName} 應徵「${title}」`)
      setForm({ ...form, message: '' })
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  if (!jobs) return error ? <p className="form-error">{error}</p> : <p className="muted">載入中…</p>
  if (!jobs.length) return <p className="muted">你目前沒有招募中的案件。<Link to="/post">先刊登案件 →</Link></p>

  return (
    <form onSubmit={submit} noValidate className="invite-form">
      <label>用哪個案件邀請
        <select value={form.jobId} onChange={(e) => setForm({ ...form, jobId: e.target.value })}>
          {jobs.map((j) => <option key={j.id} value={j.id}>{j.title}</option>)}
        </select>
      </label>
      <label>訊息（選填）
        <input value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} maxLength={200}
          placeholder="例如：看過你的作品，想請你報價" />
      </label>
      {error && <p className="form-error">{error}</p>}
      <div className="row">
        <button className="btn primary" disabled={busy}>{busy ? '送出中…' : '邀請應徵'}</button>
        {sent && <span className="ok-text">✓ {sent}</span>}
      </div>
    </form>
  )
}
