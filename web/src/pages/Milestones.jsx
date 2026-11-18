import { useState } from 'react'

export const FEE_RATE = 0.06
const STATUS = { pending: '待交付', review: '待驗收', paid: '已撥款', rejected: '退回修正', dispute: '仲裁中' }

export default function Milestones() {
  const [total, setTotal] = useState(60000)
  const [ms, setMs] = useState([
    { name: '設計稿確認', pct: 30, status: 'paid' },
    { name: '前端頁面完成', pct: 40, status: 'review' },
    { name: '上線與教學', pct: 30, status: 'pending' },
  ])
  const sumPct = ms.reduce((s, m) => s + Number(m.pct || 0), 0)
  const update = (i, patch) => setMs(ms.map((m, j) => (j === i ? { ...m, ...patch } : m)))

  const amount = (m) => Math.round((total * m.pct) / 100)
  const fee = (m) => Math.round(amount(m) * FEE_RATE)

  return (
    <>
      <h1 className="page-title">里程碑款項託管</h1>
      <p className="page-sub">發案方先把每一期款項託管在平台，驗收通過才撥給接案者；平台於撥款時抽取 6% 手續費。</p>

      <div className="card">
        <div className="row">
          <label className="inline">案件總金額（元）<input type="number" value={total} onChange={(e) => setTotal(Number(e.target.value) || 0)} /></label>
          {sumPct !== 100 && <span className="error">各期比例合計 {sumPct}%，應為 100%</span>}
        </div>
        <table className="ms-table">
          <thead>
            <tr><th>期別</th><th>里程碑</th><th>比例</th><th>託管金額</th><th>手續費 6%</th><th>接案者實收</th><th>狀態</th><th>示範操作</th></tr>
          </thead>
          <tbody>
            {ms.map((m, i) => (
              <tr key={i}>
                <td>第 {i + 1} 期</td>
                <td><input value={m.name} onChange={(e) => update(i, { name: e.target.value })} /></td>
                <td><input className="pct" type="number" value={m.pct} onChange={(e) => update(i, { pct: Number(e.target.value) })} />%</td>
                <td>{amount(m).toLocaleString()}</td>
                <td className="muted">{fee(m).toLocaleString()}</td>
                <td><b>{(amount(m) - fee(m)).toLocaleString()}</b></td>
                <td><span className={`pill st-${m.status}`}>{STATUS[m.status]}</span></td>
                <td className="ops">
                  {m.status === 'pending' && <button onClick={() => update(i, { status: 'review' })}>接案者交付</button>}
                  {m.status === 'rejected' && <button onClick={() => update(i, { status: 'review' })}>重新交付</button>}
                  {m.status === 'review' && (
                    <>
                      <button onClick={() => update(i, { status: 'paid' })}>驗收通過</button>
                      <button onClick={() => update(i, { status: 'rejected' })}>退回</button>
                      <button onClick={() => update(i, { status: 'dispute' })}>申請仲裁</button>
                    </>
                  )}
                  {m.status === 'dispute' && (
                    <>
                      <button onClick={() => update(i, { status: 'paid' })}>裁決撥款</button>
                      <button onClick={() => update(i, { status: 'rejected' })}>裁決修正</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={3}>合計</td>
              <td>{ms.reduce((s, m) => s + amount(m), 0).toLocaleString()}</td>
              <td className="muted">{ms.reduce((s, m) => s + fee(m), 0).toLocaleString()}</td>
              <td><b>{ms.reduce((s, m) => s + amount(m) - fee(m), 0).toLocaleString()}</b></td>
              <td colSpan={2} className="muted small">已撥款 {ms.filter((m) => m.status === 'paid').length} / {ms.length} 期</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </>
  )
}
