import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { jobsApi } from '../api/client.js'
import { useBackendStatus } from '../auth/BackendNotice.jsx'
import { CATEGORIES, CATEGORY_LABEL, SAMPLE_JOBS, filterJobs, formatBudget } from '../data/jobs.js'

const EMPTY = { category: '', keyword: '', minBudget: '', maxBudget: '' }

export function JobCard({ job }) {
  return (
    <Link to={`/jobs/${job.id}`} className="card job-card">
      <div className="job-head">
        <span className="tag">{CATEGORY_LABEL[job.category]}</span>
        <span className="muted small">{job.client.displayName}</span>
      </div>
      <h3>{job.title}</h3>
      <p className="job-desc">{job.description}</p>
      <div className="job-meta">
        <b>{formatBudget(job.budgetMin, job.budgetMax)}</b>
        <span className="muted small">截止 {job.deadline}｜修改 {job.revisionLimit} 次｜驗收 {job.acceptanceCriteria.length} 項</span>
      </div>
    </Link>
  )
}

export default function Jobs() {
  const backend = useBackendStatus()
  const [draft, setDraft] = useState(EMPTY)
  const [filters, setFilters] = useState(EMPTY)
  const [jobs, setJobs] = useState(null)
  const [error, setError] = useState('')
  const set = (k) => (e) => setDraft({ ...draft, [k]: e.target.value })

  useEffect(() => {
    if (backend === 'checking') return
    if (backend === 'down') {
      setJobs(filterJobs(SAMPLE_JOBS, filters))
      return
    }
    let alive = true
    setError('')
    jobsApi.search(filters)
      .then((r) => alive && setJobs(r))
      .catch((e) => alive && setError(e.message))
    return () => { alive = false }
  }, [backend, filters])

  const apply = (e) => { e.preventDefault(); setFilters(draft) }
  const reset = () => { setDraft(EMPTY); setFilters(EMPTY) }

  return (
    <>
      <h1 className="page-title">找案件</h1>
      <p className="page-sub">每個案件都先寫清楚預算、修改次數、權利歸屬與驗收標準，應徵前就知道要做到什麼。</p>
      {backend === 'down' && (
        <div className="notice warn">目前連不到伺服器，以下為<strong>示範資料</strong>。</div>
      )}

      <form className="card filter-bar" onSubmit={apply}>
        <label>類別
          <select value={draft.category} onChange={set('category')}>
            <option value="">全部</option>
            {CATEGORIES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </label>
        <label className="grow">關鍵字
          <input value={draft.keyword} onChange={set('keyword')} placeholder="例如：形象網站、Logo" />
        </label>
        <label>預算至少
          <input type="number" min="0" value={draft.minBudget} onChange={set('minBudget')} placeholder="不限" />
        </label>
        <label>預算最多
          <input type="number" min="0" value={draft.maxBudget} onChange={set('maxBudget')} placeholder="不限" />
        </label>
        <div className="filter-actions">
          <button className="btn primary">查詢</button>
          <button type="button" className="btn ghost" onClick={reset}>清除</button>
        </div>
      </form>

      {error && <p className="form-error">{error}</p>}
      {!jobs ? <p className="muted">{backend === 'checking' ? '正在連線伺服器…第一次開啟最多約需 1 分鐘' : '載入中…'}</p>
        : jobs.length === 0 ? <p className="empty">沒有符合條件的案件。</p>
        : (
          <>
            <p className="muted small">共 {jobs.length} 件</p>
            <div className="grid two">{jobs.map((j) => <JobCard key={j.id} job={j} />)}</div>
          </>
        )}
    </>
  )
}
