import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { jobsApi } from '../api/client.js'
import { formatBudget } from '../data/jobs.js'
import { ROLE_LABEL, useAuth } from '../auth/AuthContext.jsx'

export default function Account() {
  const { user, loading, logout } = useAuth()
  const [myJobs, setMyJobs] = useState(null)
  useEffect(() => {
    if (user) jobsApi.mine().then(setMyJobs).catch(() => setMyJobs([]))
  }, [user])
  if (loading) return <p className="muted">載入中…</p>
  if (!user) return <Navigate to="/login" replace />
  return (
    <section className="auth-card">
      <h1>我的帳號</h1>
      <dl className="kv">
        <dt>顯示名稱</dt><dd>{user.displayName}</dd>
        <dt>Email</dt><dd>{user.email}</dd>
        {user.role === 'ADMIN' && <><dt>身分</dt><dd><span className="tag">{ROLE_LABEL.ADMIN}</span></dd></>}
        <dt>加入時間</dt><dd>{new Date(user.createdAt).toLocaleString('zh-TW')}</dd>
      </dl>
      <button className="btn ghost" onClick={logout}>登出</button>
      {(
        <div className="my-jobs">
          <h3>我刊登的案件</h3>
          {!myJobs ? <p className="muted">載入中…</p>
            : myJobs.length === 0 ? <p className="muted">還沒有刊登案件。<Link to="/post">去刊登 →</Link></p>
            : (
              <ul>
                {myJobs.map((j) => (
                  <li key={j.id}>
                    <Link to={`/jobs/${j.id}`}>{j.title}</Link>
                    <span className="muted small">{formatBudget(j.budgetMin, j.budgetMax)}｜{j.status === 'OPEN' ? '招募中' : j.status}</span>
                  </li>
                ))}
              </ul>
            )}
        </div>
      )}
    </section>
  )
}
