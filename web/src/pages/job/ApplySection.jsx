import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { applicationsApi } from '../../api/client.js'
import { useAuth } from '../../auth/AuthContext.jsx'
import { APPLICATION_STATUS_LABEL, validateApplication } from '../../data/applications.js'

const STATUS_CLASS = { PENDING: '', ACCEPTED: ' open', REJECTED: ' muted-tag' }

function StatusTag({ status }) {
  return <span className={`tag${STATUS_CLASS[status] ?? ''}`}>{APPLICATION_STATUS_LABEL[status] ?? status}</span>
}

/** 後端錯誤轉成 { field: message }；沒有欄位時放在 form */
function toFieldErrors(err) {
  const be = {}
  for (const { field, message } of err.errors ?? []) be[field] = message
  if (!Object.keys(be).length) be.form = err.message
  return be
}

function ApplyForm({ job, onApplied }) {
  const [form, setForm] = useState({ message: '', quotedPrice: '', estimatedDays: '' })
  const [errors, setErrors] = useState({})
  const [busy, setBusy] = useState(false)
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  async function submit(e) {
    e.preventDefault()
    const fe = validateApplication(form)
    setErrors(fe)
    if (Object.keys(fe).length) return
    setBusy(true)
    try {
      const app = await applicationsApi.apply(job.id, {
        message: form.message.trim(),
        quotedPrice: Number(form.quotedPrice),
        estimatedDays: Number(form.estimatedDays),
      })
      onApplied(app)
    } catch (err) {
      setErrors(toFieldErrors(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} noValidate className="apply-form">
      <label>自我推薦
        <textarea className="short" value={form.message} onChange={set('message')} maxLength={1000}
          placeholder="相關經驗、作品、打算怎麼做這個案子" />
        <small className="muted">{form.message.trim().length} / 1000（至少 10 字）</small>
        {errors.message && <small className="form-error">{errors.message}</small>}
      </label>
      <div className="row">
        <label>報價（NT$）
          <input type="number" min={1} step={1} value={form.quotedPrice} onChange={set('quotedPrice')} />
          {errors.quotedPrice && <small className="form-error">{errors.quotedPrice}</small>}
        </label>
        <label>預計天數
          <input type="number" min={1} max={365} step={1} value={form.estimatedDays} onChange={set('estimatedDays')} />
          {errors.estimatedDays && <small className="form-error">{errors.estimatedDays}</small>}
        </label>
      </div>
      {errors.form && <p className="form-error">{errors.form}</p>}
      <button className="btn primary" disabled={busy}>{busy ? '送出中…' : '送出應徵'}</button>
    </form>
  )
}

/** 應徵者看自己的應徵；沒應徵過且招募中就顯示表單 */
function ApplicantView({ job, onChanged }) {
  const [mine, setMine] = useState(undefined) // undefined＝載入中，null＝沒應徵過
  const [error, setError] = useState('')

  useEffect(() => {
    applicationsApi.mine()
      .then((list) => setMine(list.find((a) => a.jobId === job.id) ?? null))
      .catch((e) => setError(e.message))
  }, [job.id])

  if (error) return <p className="form-error">{error}</p>
  if (mine === undefined) return <p className="muted">載入中…</p>
  if (mine) {
    return (
      <p>你已於 {new Date(mine.createdAt).toLocaleDateString('zh-TW')} 應徵：報價 NT$ {mine.quotedPrice.toLocaleString()}、
        預計 {mine.estimatedDays} 天　<StatusTag status={mine.status} />
        {mine.status === 'ACCEPTED' && <span className="ok-text">　恭喜！發案方選定了你</span>}
      </p>
    )
  }
  if (job.status !== 'OPEN') return <p className="muted">這個案件已不在招募中。</p>
  return <ApplyForm job={job} onApplied={(app) => { setMine({ ...app, jobId: job.id }); onChanged() }} />
}

/** 發案方看所有應徵並選定 */
function OwnerView({ job, onChanged }) {
  const [apps, setApps] = useState(null)
  const [confirming, setConfirming] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const load = () => applicationsApi.listForJob(job.id).then(setApps).catch((e) => setError(e.message))
  useEffect(() => { load() }, [job.id]) // eslint-disable-line react-hooks/exhaustive-deps

  async function accept(app) {
    setBusy(true)
    setError('')
    try {
      await applicationsApi.accept(job.id, app.id)
      setConfirming(null)
      await load()
      onChanged()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  if (!apps) return error ? <p className="form-error">{error}</p> : <p className="muted">載入中…</p>
  return (
    <>
      {job.status === 'OPEN' && <p className="muted small">選定一位後，案件會改為「進行中」並停止招募，其他應徵者會標示為未錄取；目前無法取消。</p>}
      {error && <p className="form-error">{error}</p>}
      {apps.length === 0 ? <p className="muted">還沒有人應徵。可以到<Link to="/freelancers">找接案者</Link>邀請合適的人。</p> : (
        <ul className="application-list">
          {apps.map((a) => (
            <li key={a.id}>
              <div className="application-head">
                <Link to={`/members/${a.applicant.id}`}><b>{a.applicant.displayName}</b></Link>
                <StatusTag status={a.status} />
              </div>
              <p className="muted small">報價 NT$ {a.quotedPrice.toLocaleString()}｜預計 {a.estimatedDays} 天｜
                {new Date(a.createdAt).toLocaleDateString('zh-TW')} 應徵</p>
              <p className="pre">{a.message}</p>
              {job.status === 'OPEN' && a.status === 'PENDING' && (
                confirming === a.id ? (
                  <div className="row confirm-row">
                    <span>確定選定 <b>{a.applicant.displayName}</b>？</span>
                    <button className="btn primary small" disabled={busy} onClick={() => accept(a)}>{busy ? '處理中…' : '確定選定'}</button>
                    <button className="btn ghost small" disabled={busy} onClick={() => setConfirming(null)}>取消</button>
                  </div>
                ) : (
                  <button className="btn ghost small" onClick={() => setConfirming(a.id)}>選定這位接案者</button>
                )
              )}
            </li>
          ))}
        </ul>
      )}
    </>
  )
}

export default function ApplySection({ job, demo, onChanged }) {
  const { user, loading } = useAuth()
  const isOwner = user && job.client?.id === user.id

  let body
  if (demo) body = <p className="muted">這是示範資料。應徵需要連線後端，請在雲端版網站登入後使用。</p>
  else if (loading) body = <p className="muted">載入中…</p>
  else if (!user) body = <p><Link to="/login">登入</Link>後即可應徵這個案件。</p>
  else if (isOwner) body = <OwnerView job={job} onChanged={onChanged} />
  else body = <ApplicantView job={job} onChanged={onChanged} />

  return (
    <section className="card apply-card">
      <h3>{isOwner ? `應徵者（${job.applicationCount ?? 0}）` : '應徵這個案件'}</h3>
      {body}
    </section>
  )
}
