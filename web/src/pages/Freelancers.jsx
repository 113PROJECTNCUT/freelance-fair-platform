import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { profileApi } from '../api/client.js'
import { useBackendStatus } from '../auth/BackendNotice.jsx'

export default function Freelancers() {
  const backend = useBackendStatus()
  const [draft, setDraft] = useState({ keyword: '', skill: '' })
  const [filters, setFilters] = useState({ keyword: '', skill: '' })
  const [list, setList] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (backend !== 'up') return
    let alive = true
    setError('')
    profileApi.searchFreelancers(filters)
      .then((r) => alive && setList(r))
      .catch((e) => alive && setError(e.message))
    return () => { alive = false }
  }, [backend, filters])

  const apply = (e) => { e.preventDefault(); setFilters({ keyword: draft.keyword.trim(), skill: draft.skill.trim() }) }
  const bySkill = (skill) => { setDraft({ keyword: '', skill }); setFilters({ keyword: '', skill }) }

  return (
    <>
      <h1 className="page-title">找接案者</h1>
      <p className="page-sub">在會員中心打開「開放接案」的會員會出現在這裡，點進去看作品集。</p>

      <form className="card filter-bar" onSubmit={apply}>
        <label className="grow">關鍵字
          <input value={draft.keyword} onChange={(e) => setDraft({ ...draft, keyword: e.target.value })} placeholder="名稱或自我介紹" />
        </label>
        <label>技能
          <input value={draft.skill} onChange={(e) => setDraft({ ...draft, skill: e.target.value })} placeholder="例如：Figma" />
        </label>
        <div className="filter-actions">
          <button className="btn primary">查詢</button>
          <button type="button" className="btn ghost" onClick={() => bySkill('')}>清除</button>
        </div>
      </form>

      {backend === 'checking' && <p className="muted">正在連線伺服器…第一次開啟最多約需 1 分鐘</p>}
      {backend === 'down' && <div className="notice warn">目前連不到伺服器，請稍後重新整理。</div>}
      {error && <p className="form-error">{error}</p>}
      {backend === 'up' && !list && !error && <p className="muted">載入中…</p>}
      {list && (list.length === 0
        ? <p className="empty">目前沒有符合條件的接案者。到 <Link to="/account">會員中心</Link> 打開「開放接案」，你就會出現在這裡。</p>
        : (
          <>
            <p className="muted small">共 {list.length} 位</p>
            <div className="grid two">
              {list.map((m) => (
                <Link key={m.id} to={`/members/${m.id}`} className="card job-card">
                  <h3>{m.displayName}</h3>
                  {m.bio && <p className="job-desc">{m.bio}</p>}
                  <div>
                    {m.skills.map((s) => (
                      <button type="button" key={s} className="tag tag-btn"
                        onClick={(e) => { e.preventDefault(); bySkill(s) }}>{s}</button>
                    ))}
                  </div>
                  <span className="muted small">作品 {m.portfolioCount} 件｜{new Date(m.createdAt).toLocaleDateString('zh-TW')} 加入</span>
                </Link>
              ))}
            </div>
          </>
        ))}
      <p className="muted small" style={{ marginTop: 24 }}>
        信用評分（準時率、一次驗收率、互評）將在評價功能完成後上線，<Link to="/freelancers/score-demo">先看評分示範 →</Link>
      </p>
    </>
  )
}
