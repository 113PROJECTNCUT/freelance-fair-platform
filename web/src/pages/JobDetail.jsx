import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { jobsApi } from '../api/client.js'
import { useBackendStatus } from '../auth/BackendNotice.jsx'
import { CATEGORY_LABEL, IP_LABEL, SAMPLE_JOBS, formatBudget } from '../data/jobs.js'

export default function JobDetail() {
  const { id } = useParams()
  const backend = useBackendStatus()
  const [job, setJob] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (backend === 'checking') return
    if (backend === 'down' || String(id).startsWith('demo-')) {
      const found = SAMPLE_JOBS.find((j) => j.id === id)
      if (found) setJob(found)
      else setError('找不到這個案件')
      return
    }
    jobsApi.get(id).then(setJob).catch((e) => setError(e.message))
  }, [backend, id])

  if (error) return <div className="card"><p>{error}</p><Link to="/jobs">← 回案件列表</Link></div>
  if (!job) return <p className="muted">載入中…</p>

  return (
    <>
      <Link to="/jobs" className="muted small">← 回案件列表</Link>
      <h1 className="page-title">{job.title}</h1>
      <p className="page-sub">
        <span className="tag">{CATEGORY_LABEL[job.category]}</span> 發案方：{job.client.displayName}
        ｜刊登於 {new Date(job.createdAt).toLocaleDateString('zh-TW')}
      </p>
      <div className="grid two">
        <section className="card">
          <h3>需求描述</h3>
          <p className="pre">{job.description}</p>
          <h3>驗收標準</h3>
          <ol className="checklist">
            {job.acceptanceCriteria.map((c, i) => (
              <li key={i}><span className="box">☐</span><span className="txt">{c}</span></li>
            ))}
          </ol>
        </section>
        <section className="card">
          <h3>交易條件</h3>
          <dl className="kv">
            <dt>預算</dt><dd><b>{formatBudget(job.budgetMin, job.budgetMax)}</b></dd>
            <dt>截止日</dt><dd>{job.deadline}</dd>
            <dt>修改次數</dt><dd>免費修改 {job.revisionLimit} 次，超過另計</dd>
            <dt>權利歸屬</dt><dd>{IP_LABEL[job.ipOwnership]}</dd>
            <dt>作品集</dt><dd>{job.portfolioAllowed ? '接案者可放入作品集' : '不可公開展示'}</dd>
          </dl>
          <p className="muted small">應徵功能開發中。應徵前可先用「雙向合約健檢」檢查合約草案。</p>
          <Link to="/review" className="btn ghost">合約健檢 →</Link>
        </section>
      </div>
    </>
  )
}
