import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { profileApi } from '../api/client.js'
import { useAuth } from '../auth/AuthContext.jsx'
import InviteBox from './job/InviteBox.jsx'

export default function MemberProfile() {
  const { id } = useParams()
  const { user } = useAuth()
  const [p, setP] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    setP(null)
    setError('')
    profileApi.get(id).then(setP).catch((e) => setError(e.message))
  }, [id])

  if (error) return <div className="card"><p>{error}</p><Link to="/freelancers">← 回找接案者</Link></div>
  if (!p) return <p className="muted">載入中…（第一次開啟最多約需 1 分鐘）</p>

  return (
    <>
      <Link to="/freelancers" className="muted small">← 回找接案者</Link>
      <h1 className="page-title">{p.displayName}</h1>
      <p className="page-sub">
        {p.openForWork ? <span className="tag open">開放接案</span> : <span className="tag">目前未開放接案</span>}
        {new Date(p.createdAt).toLocaleDateString('zh-TW')} 加入
        {user?.id === p.id && <>｜<Link to="/account">編輯我的資料</Link></>}
      </p>
      <div className="grid two">
        <section className="card">
          <h3>自我介紹</h3>
          <p className="pre">{p.bio || <span className="muted">尚未填寫</span>}</p>
          <h3>技能</h3>
          {p.skills.length ? p.skills.map((s) => <span key={s} className="tag">{s}</span>) : <p className="muted">尚未填寫</p>}
        </section>
        <section className="card">
          <h3>作品集（{p.portfolio.length}）</h3>
          {p.portfolio.length === 0 ? <p className="muted">尚未上傳作品。</p> : (
            <ul className="portfolio-list">
              {p.portfolio.map((w) => (
                <li key={w.id}>
                  <div>
                    <b>{w.title}</b>
                    {w.description && <p className="muted small">{w.description}</p>}
                    {w.link && <a href={w.link} target="_blank" rel="noopener noreferrer" className="small">{w.link}</a>}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
      {user && user.id !== p.id && p.openForWork && (
        <section className="card apply-card">
          <h3>邀請 {p.displayName} 應徵</h3>
          <InviteBox member={p} />
        </section>
      )}
    </>
  )
}
