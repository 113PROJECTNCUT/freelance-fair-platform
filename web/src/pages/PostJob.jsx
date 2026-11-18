import { useState } from 'react'
import { Link } from 'react-router-dom'
import { generateChecklist } from '../engine/checklist.js'

const SAMPLE = '製作公司形象網站，包含首頁、關於我們、服務介紹三個頁面。首頁需要輪播圖。需要聯絡我們表單，客戶送出後我要收到通知。'

export default function PostJob() {
  const [form, setForm] = useState({ title: '', description: '', budget: '', days: '', revisions: '2' })
  const [items, setItems] = useState(null)
  const [newItem, setNewItem] = useState('')
  const [confirmed, setConfirmed] = useState(false)
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const generate = () => {
    setItems(generateChecklist(form))
    setConfirmed(false)
  }
  const remove = (id) => setItems(items.filter((i) => i.id !== id))
  const add = () => {
    if (!newItem.trim()) return
    setItems([...items, { id: Date.now(), text: newItem.trim(), source: '自行新增' }])
    setNewItem('')
  }

  return (
    <>
      <h1 className="page-title">刊登案件</h1>
      <p className="page-sub">寫下需求，系統幫你轉成可逐項勾選的驗收清單，簽約前先跟接案者對齊。</p>
      <div className="grid two">
        <section className="card">
          <h3>① 案件需求</h3>
          <label>案件名稱<input value={form.title} onChange={set('title')} placeholder="例如：公司形象網站" /></label>
          <label>需求描述
            <textarea className="short" value={form.description} onChange={set('description')} placeholder="越具體越好，一句一個需求" />
          </label>
          <div className="row three">
            <label>預算（元）<input type="number" value={form.budget} onChange={set('budget')} /></label>
            <label>工期（天）<input type="number" value={form.days} onChange={set('days')} /></label>
            <label>免費修改次數<input type="number" value={form.revisions} onChange={set('revisions')} /></label>
          </div>
          <div className="row">
            <button className="btn primary" onClick={generate} disabled={!form.description.trim()}>產生驗收清單</button>
            <button className="btn ghost" onClick={() => setForm({ title: '公司形象網站', description: SAMPLE, budget: '50000', days: '30', revisions: '2' })}>填入範例</button>
          </div>
        </section>

        <section className="card">
          <h3>② AI 驗收清單</h3>
          {!items ? (
            <p className="empty">填寫需求後按「產生驗收清單」。</p>
          ) : (
            <>
              <ol className="checklist">
                {items.map((i) => (
                  <li key={i.id}>
                    <span className="box">☐</span>
                    <span className="txt">{i.text}</span>
                    <span className="src">{i.source}</span>
                    {!confirmed && <button className="x" onClick={() => remove(i.id)} title="刪除">×</button>}
                  </li>
                ))}
              </ol>
              {!confirmed && (
                <div className="row">
                  <input value={newItem} onChange={(e) => setNewItem(e.target.value)} placeholder="新增驗收項目" onKeyDown={(e) => e.key === 'Enter' && add()} />
                  <button className="btn ghost" onClick={add}>新增</button>
                </div>
              )}
              {confirmed ? (
                <div className="ok-box">
                  ✓ 已確認 {items.length} 項驗收標準。接案者投標前會先看到這份清單，交付與驗收都以它為準。
                  <Link to="/freelancers" className="btn primary small">下一步：挑選接案者 →</Link>
                </div>
              ) : (
                <button className="btn primary block" onClick={() => setConfirmed(true)}>確認清單並刊登</button>
              )}
            </>
          )}
        </section>
      </div>
    </>
  )
}
