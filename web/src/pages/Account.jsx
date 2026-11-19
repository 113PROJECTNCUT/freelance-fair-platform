import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { applicationsApi, jobsApi, profileApi } from '../api/client.js'
import { ROLE_LABEL, useAuth } from '../auth/AuthContext.jsx'
import { APPLICATION_STATUS_LABEL, JOB_STATUS_LABEL } from '../data/applications.js'
import { formatBudget } from '../data/jobs.js'
import { MAX_SKILL_LENGTH, MAX_SKILLS, parseSkills } from '../data/skills.js'

function ProfileForm({ profile, onSaved }) {
  const { refresh } = useAuth()
  const [form, setForm] = useState({
    displayName: profile.displayName,
    bio: profile.bio ?? '',
    skills: profile.skills.join(', '),
    openForWork: profile.openForWork,
  })
  const [errors, setErrors] = useState({})
  const [saved, setSaved] = useState(false)
  const [busy, setBusy] = useState(false)
  const set = (k) => (e) => {
    setSaved(false)
    setForm({ ...form, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value })
  }

  async function save(e) {
    e.preventDefault()
    const skills = parseSkills(form.skills)
    const fe = {}
    if (!form.displayName.trim()) fe.displayName = '請輸入顯示名稱'
    else if (form.displayName.trim().length > 30) fe.displayName = '顯示名稱最多 30 字'
    if (form.bio.length > 500) fe.bio = '自我介紹最多 500 字'
    if (skills.length > MAX_SKILLS) fe.skills = `技能最多 ${MAX_SKILLS} 個`
    else if (skills.some((s) => s.length > MAX_SKILL_LENGTH)) fe.skills = `每個技能最多 ${MAX_SKILL_LENGTH} 字`
    setErrors(fe)
    if (Object.keys(fe).length) return
    setBusy(true)
    try {
      const p = await profileApi.update({ displayName: form.displayName.trim(), bio: form.bio, skills, openForWork: form.openForWork })
      onSaved(p)
      await refresh()
      setSaved(true)
    } catch (err) {
      const be = {}
      for (const { field, message } of err.errors ?? []) be[field.replace(/\[.*$/, '')] = message
      if (!Object.keys(be).length) be.form = err.message
      setErrors(be)
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={save} noValidate className="profile-form">
      <label>顯示名稱
        <input value={form.displayName} onChange={set('displayName')} maxLength={30} />
        {errors.displayName && <small className="form-error">{errors.displayName}</small>}
      </label>
      <label>自我介紹
        <textarea className="short" value={form.bio} onChange={set('bio')} maxLength={500}
          placeholder="擅長什麼、做過哪些案子、怎麼合作" />
        <small className="muted">{form.bio.length} / 500</small>
        {errors.bio && <small className="form-error">{errors.bio}</small>}
      </label>
      <label>技能
        <input value={form.skills} onChange={set('skills')} placeholder="用逗號分隔，例如：React, Figma, Logo 設計" />
        <small className="muted">最多 {MAX_SKILLS} 個，每個 {MAX_SKILL_LENGTH} 字以內</small>
        {errors.skills && <small className="form-error">{errors.skills}</small>}
      </label>
      <label className="check">
        <input type="checkbox" checked={form.openForWork} onChange={set('openForWork')} />
        開放接案（打開後，你會出現在「找接案者」，發案方可以看到你的檔案）
      </label>
      {errors.form && <p className="form-error">{errors.form}</p>}
      <div className="row">
        <button className="btn primary" disabled={busy}>{busy ? '儲存中…' : '儲存'}</button>
        {saved && <span className="ok-text">✓ 已儲存</span>}
      </div>
    </form>
  )
}

function Portfolio({ items, onChange }) {
  const [form, setForm] = useState({ title: '', description: '', link: '' })
  const [errors, setErrors] = useState({})
  const [busy, setBusy] = useState(false)
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  async function add(e) {
    e.preventDefault()
    const fe = {}
    if (!form.title.trim()) fe.title = '請輸入作品標題'
    if (form.link && !/^https?:\/\/\S+$/.test(form.link.trim())) fe.link = '連結需以 http:// 或 https:// 開頭'
    setErrors(fe)
    if (Object.keys(fe).length) return
    setBusy(true)
    try {
      const item = await profileApi.addPortfolio({ title: form.title.trim(), description: form.description, link: form.link.trim() })
      onChange([item, ...items])
      setForm({ title: '', description: '', link: '' })
    } catch (err) {
      const be = {}
      for (const { field, message } of err.errors ?? []) be[field] = message
      if (!Object.keys(be).length) be.form = err.message
      setErrors(be)
    } finally {
      setBusy(false)
    }
  }

  async function remove(id) {
    try {
      await profileApi.deletePortfolio(id)
      onChange(items.filter((i) => i.id !== id))
    } catch (err) {
      setErrors({ form: err.message })
    }
  }

  return (
    <>
      {items.length === 0 ? <p className="muted">還沒有作品。</p> : (
        <ul className="portfolio-list">
          {items.map((p) => (
            <li key={p.id}>
              <div>
                <b>{p.title}</b>
                {p.description && <p className="muted small">{p.description}</p>}
                {p.link && <a href={p.link} target="_blank" rel="noopener noreferrer" className="small">{p.link}</a>}
              </div>
              <button className="btn ghost small" onClick={() => remove(p.id)}>刪除</button>
            </li>
          ))}
        </ul>
      )}
      <form onSubmit={add} noValidate className="portfolio-add">
        <h4>新增作品</h4>
        <label>標題<input value={form.title} onChange={set('title')} maxLength={60} placeholder="例如：咖啡店形象網站" />
          {errors.title && <small className="form-error">{errors.title}</small>}</label>
        <label>說明（選填）<input value={form.description} onChange={set('description')} maxLength={500} /></label>
        <label>連結（選填）<input value={form.link} onChange={set('link')} maxLength={300} placeholder="https://" />
          {errors.link && <small className="form-error">{errors.link}</small>}</label>
        {errors.form && <p className="form-error">{errors.form}</p>}
        <button className="btn ghost" disabled={busy}>{busy ? '新增中…' : '新增作品'}</button>
      </form>
    </>
  )
}

export default function Account() {
  const { user, loading, logout } = useAuth()
  const [profile, setProfile] = useState(null)
  const [myJobs, setMyJobs] = useState(null)
  const [myApps, setMyApps] = useState(null)
  const [invites, setInvites] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) return
    profileApi.mine().then(setProfile).catch((e) => setError(e.message))
    jobsApi.mine().then(setMyJobs).catch(() => setMyJobs([]))
    applicationsApi.mine().then(setMyApps).catch(() => setMyApps([]))
    applicationsApi.myInvitations().then(setInvites).catch(() => setInvites([]))
  }, [user?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) return <p className="muted">載入中…</p>
  if (!user) return <Navigate to="/login" replace />

  return (
    <>
      <h1 className="page-title">會員中心</h1>
      <p className="page-sub">
        {user.email}{user.role === 'ADMIN' && <span className="tag">{ROLE_LABEL.ADMIN}</span>}
        ｜<Link to={`/members/${user.id}`}>查看我的公開檔案 →</Link>
        ｜<button className="linklike" onClick={logout}>登出</button>
      </p>
      {error && <p className="form-error">{error}</p>}
      {!profile ? <p className="muted">載入中…</p> : (
        <div className="grid two">
          <section className="card">
            <h3>基本資料</h3>
            <ProfileForm profile={profile} onSaved={setProfile} />
          </section>
          <section className="card">
            <h3>作品集</h3>
            <Portfolio items={profile.portfolio} onChange={(portfolio) => setProfile({ ...profile, portfolio })} />
          </section>
        </div>
      )}
      <section className="card my-jobs-card">
        <h3>我刊登的案件</h3>
        {!myJobs ? <p className="muted">載入中…</p>
          : myJobs.length === 0 ? <p className="muted">還沒有刊登案件。<Link to="/post">去刊登 →</Link></p>
          : (
            <ul className="my-jobs-list">
              {myJobs.map((j) => (
                <li key={j.id}>
                  <Link to={`/jobs/${j.id}`}>{j.title}</Link>
                  <span className="muted small">{formatBudget(j.budgetMin, j.budgetMax)}｜{JOB_STATUS_LABEL[j.status] ?? j.status}｜應徵 {j.applicationCount ?? 0} 人</span>
                </li>
              ))}
            </ul>
          )}
      </section>
      <div className="grid two my-jobs-card">
        <section className="card">
          <h3>我的應徵</h3>
          {!myApps ? <p className="muted">載入中…</p>
            : myApps.length === 0 ? <p className="muted">還沒有應徵案件。<Link to="/jobs">去找案件 →</Link></p>
            : (
              <ul className="my-jobs-list">
                {myApps.map((a) => (
                  <li key={a.id}>
                    <Link to={`/jobs/${a.jobId}`}>{a.jobTitle}</Link>
                    <span className="muted small">報價 NT$ {a.quotedPrice.toLocaleString()}｜
                      <b className={a.status === 'ACCEPTED' ? 'ok-text' : ''}>{APPLICATION_STATUS_LABEL[a.status] ?? a.status}</b></span>
                  </li>
                ))}
              </ul>
            )}
        </section>
        <section className="card">
          <h3>收到的邀請</h3>
          {!invites ? <p className="muted">載入中…</p>
            : invites.length === 0 ? <p className="muted">還沒有收到邀請。打開「開放接案」，發案方就能在找接案者看到你。</p>
            : (
              <ul className="my-jobs-list">
                {invites.map((i) => (
                  <li key={i.id}>
                    <div>
                      <Link to={`/jobs/${i.jobId}`}>{i.jobTitle}</Link>
                      <span className="muted small">　來自 {i.client.displayName}</span>
                      {i.message && <p className="muted small">「{i.message}」</p>}
                    </div>
                    <span className="small">
                      {i.applied ? <span className="ok-text">已應徵</span>
                        : i.jobStatus === 'OPEN' ? <Link to={`/jobs/${i.jobId}`}>去應徵 →</Link>
                        : <span className="muted">{JOB_STATUS_LABEL[i.jobStatus] ?? i.jobStatus}</span>}
                    </span>
                  </li>
                ))}
              </ul>
            )}
        </section>
      </div>
    </>
  )
}
