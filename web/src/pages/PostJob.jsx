import { useState } from 'react'
import { Link } from 'react-router-dom'
import { jobsApi } from '../api/client.js'
import { useAuth } from '../auth/AuthContext.jsx'
import { useBackendStatus } from '../auth/BackendNotice.jsx'
import { CATEGORIES, IP_LABEL } from '../data/jobs.js'
import { generateChecklist } from '../engine/checklist.js'

const SAMPLE = {
  title: '公司形象網站（3 頁＋聯絡表單）', category: 'WEB',
  description: '製作公司形象網站，包含首頁、關於我們、服務介紹三個頁面。首頁需要輪播圖。需要聯絡我們表單，客戶送出後我要收到通知。',
  budgetMin: '30000', budgetMax: '50000',
  deadline: new Date(Date.now() + 30 * 864e5).toISOString().slice(0, 10),
  revisionLimit: '2', ipOwnership: 'CLIENT_OWNS', portfolioAllowed: true,
}
const EMPTY = {
  title: '', category: 'WEB', description: '', budgetMin: '', budgetMax: '', deadline: '',
  revisionLimit: '2', ipOwnership: 'CLIENT_OWNS', portfolioAllowed: true,
}
const tomorrow = () => new Date(Date.now() + 864e5).toISOString().slice(0, 10)

export default function PostJob() {
  const { user } = useAuth()
  const backend = useBackendStatus()
  const [form, setForm] = useState(EMPTY)
  const [items, setItems] = useState(null)
  const [newItem, setNewItem] = useState('')
  const [errors, setErrors] = useState({})
  const [busy, setBusy] = useState(false)
  const [published, setPublished] = useState(null)
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value })

  const canPublish = backend === 'up' && Boolean(user)

  const generate = () => {
    const list = generateChecklist({ description: form.description, days: '', revisions: form.revisionLimit })
    if (form.deadline) list.splice(list.length - 1, 0, { id: Date.now(), text: `於 ${form.deadline} 前完成交付`, source: '交期' })
    setItems(list)
    setPublished(null)
  }
  const remove = (id) => setItems(items.filter((i) => i.id !== id))
  const add = () => {
    if (!newItem.trim()) return
    setItems([...items, { id: Date.now(), text: newItem.trim(), source: '自行新增' }])
    setNewItem('')
  }

  function validate() {
    const e = {}
    const t = form.title.trim().length
    if (t < 5 || t > 60) e.title = '標題需 5–60 字'
    const d = form.description.trim().length
    if (d < 20 || d > 3000) e.description = '需求描述需 20–3000 字'
    const min = Number(form.budgetMin), max = Number(form.budgetMax)
    if (!form.budgetMin || min < 1) e.budgetMin = '請輸入預算下限'
    if (!form.budgetMax || max < 1) e.budgetMax = '請輸入預算上限'
    else if (min > max) e.budgetMax = '預算上限不可低於下限'
    if (!form.deadline || form.deadline < tomorrow()) e.deadline = '截止日需在今天之後'
    if (!items?.length) e.acceptanceCriteria = '請至少保留一項驗收標準'
    return e
  }

  async function publish() {
    const e = validate()
    setErrors(e)
    if (Object.keys(e).length) return
    setBusy(true)
    try {
      const job = await jobsApi.create({
        ...form,
        title: form.title.trim(),
        description: form.description.trim(),
        budgetMin: Number(form.budgetMin),
        budgetMax: Number(form.budgetMax),
        revisionLimit: Number(form.revisionLimit),
        acceptanceCriteria: items.map((i) => i.text.slice(0, 200)),
      })
      setPublished(job)
    } catch (err) {
      const fe = {}
      for (const { field, message } of err.errors ?? []) fe[field.replace(/\[.*$/, '')] = message
      if (!Object.keys(fe).length) fe.form = err.message
      setErrors(fe)
    } finally {
      setBusy(false)
    }
  }

  const Err = ({ k }) => (errors[k] ? <small className="form-error">{errors[k]}</small> : null)

  return (
    <>
      <h1 className="page-title">刊登案件</h1>
      <p className="page-sub">寫清楚預算、修改次數與權利歸屬，系統幫你把需求轉成驗收清單，簽約前先跟接案者對齊。</p>
      {backend === 'down' && <div className="notice warn">目前連不到伺服器：可以試用驗收清單產生，但無法正式刊登。</div>}
      {backend === 'up' && !user && <div className="notice warn">要正式刊登，請先 <Link to="/login">登入</Link>。</div>}

      <div className="grid two">
        <section className="card">
          <h3>① 案件需求與條件</h3>
          <label>案件名稱<input value={form.title} onChange={set('title')} placeholder="例如：公司形象網站" maxLength={60} /><Err k="title" /></label>
          <label>類別
            <select value={form.category} onChange={set('category')}>
              {CATEGORIES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </label>
          <label>需求描述
            <textarea className="short" value={form.description} onChange={set('description')} placeholder="越具體越好，一句一個需求" />
            <Err k="description" />
          </label>
          <div className="row">
            <label>預算下限（元）<input type="number" min="1" value={form.budgetMin} onChange={set('budgetMin')} /><Err k="budgetMin" /></label>
            <label>預算上限（元）<input type="number" min="1" value={form.budgetMax} onChange={set('budgetMax')} /><Err k="budgetMax" /></label>
          </div>
          <div className="row">
            <label>截止日<input type="date" min={tomorrow()} value={form.deadline} onChange={set('deadline')} /><Err k="deadline" /></label>
            <label>免費修改次數上限<input type="number" min="0" max="10" value={form.revisionLimit} onChange={set('revisionLimit')} /></label>
          </div>
          <label>權利歸屬
            <select value={form.ipOwnership} onChange={set('ipOwnership')}>
              {Object.entries(IP_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </label>
          <label className="check">
            <input type="checkbox" checked={form.portfolioAllowed} onChange={set('portfolioAllowed')} />
            允許接案者將成果放入作品集
          </label>
          <div className="row">
            <button className="btn primary" onClick={generate} disabled={!form.description.trim()}>產生驗收清單</button>
            <button className="btn ghost" onClick={() => { setForm(SAMPLE); setItems(null); setPublished(null) }}>填入範例</button>
          </div>
        </section>

        <section className="card">
          <h3>② 驗收清單</h3>
          {!items ? (
            <p className="empty">填寫需求後按「產生驗收清單」，可再自行增刪。</p>
          ) : (
            <>
              <ol className="checklist">
                {items.map((i) => (
                  <li key={i.id}>
                    <span className="box">☐</span>
                    <span className="txt">{i.text}</span>
                    <span className="src">{i.source}</span>
                    {!published && <button className="x" onClick={() => remove(i.id)} title="刪除">×</button>}
                  </li>
                ))}
              </ol>
              <Err k="acceptanceCriteria" />
              {!published && (
                <div className="row">
                  <input value={newItem} onChange={(e) => setNewItem(e.target.value)} placeholder="新增驗收項目" maxLength={200}
                    onKeyDown={(e) => e.key === 'Enter' && add()} />
                  <button className="btn ghost" onClick={add}>新增</button>
                </div>
              )}
              {errors.form && <p className="form-error">{errors.form}</p>}
              {published ? (
                <div className="ok-box">
                  ✓ 已刊登「{published.title}」，共 {published.acceptanceCriteria.length} 項驗收標準。
                  <Link to={`/jobs/${published.id}`} className="btn primary small">查看案件 →</Link>
                </div>
              ) : (
                <button className="btn primary block" onClick={publish} disabled={!canPublish || busy}>
                  {busy ? '刊登中…' : canPublish ? '確認清單並刊登' : '登入後才能刊登'}
                </button>
              )}
            </>
          )}
        </section>
      </div>
    </>
  )
}
