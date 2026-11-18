import { useState } from 'react'
import { reviewContract, SAMPLE_CONTRACT, SAMPLE_FAIR, FREELANCER, CLIENT } from '../engine/contractReview.js'

const SEV = { high: '高風險', medium: '中風險', low: '低風險', safe: '安全' }
const WHO = { [FREELANCER]: '對接案者不利', [CLIENT]: '對發案方不利', both: '雙方皆不利' }

function Gauge({ title, data }) {
  return (
    <div className={`gauge lv-${data.level}`}>
      <div className="gauge-title">{title}</div>
      <div className="gauge-score">{data.score}</div>
      <div className="gauge-level">{SEV[data.level]}</div>
      <div className="gauge-sub">{data.count} 個風險項目</div>
    </div>
  )
}

function Finding({ f }) {
  return (
    <div className={`finding sev-${f.severity}`}>
      <div className="finding-head">
        <span className={`pill sev-${f.severity}`}>{SEV[f.severity]}</span>
        <span className={`pill who-${f.against}`}>{WHO[f.against]}</span>
        <b>{f.label}</b>
      </div>
      <p>{f.plain}</p>
      <p className="fix">建議修改：{f.fix}</p>
    </div>
  )
}

export default function Review() {
  const [text, setText] = useState('')
  const [result, setResult] = useState(null)
  const [filter, setFilter] = useState('all')
  const [error, setError] = useState('')

  const run = () => {
    if (!text.trim()) return setError('請先貼上合約內容。')
    if (text.length > 20000) return setError('合約內容超過 20,000 字上限。')
    setError('')
    setResult(reviewContract(text))
  }

  const show = (f) => filter === 'all' || f.against === filter || f.against === 'both'

  return (
    <>
      <h1 className="page-title">雙向合約健檢</h1>
      <p className="page-sub">同一份合約，同時檢查對接案者與對發案方不利的條款。</p>
      <div className="grid two">
        <section className="card">
          <h3>① 貼上合約內容</h3>
          <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder={'第一條 …\n第二條 …'} />
          <div className="row">
            <button className="btn primary" onClick={run}>開始健檢</button>
            <button className="btn ghost" onClick={() => { setText(SAMPLE_CONTRACT); setResult(null) }}>範例：問題合約</button>
            <button className="btn ghost" onClick={() => { setText(SAMPLE_FAIR); setResult(null) }}>範例：公平合約</button>
            <span className="muted right">{text.length.toLocaleString()} / 20,000 字</span>
          </div>
          {error && <p className="error">{error}</p>}
        </section>

        <section className="card">
          <h3>② 審查結果</h3>
          {!result ? (
            <p className="empty">貼上合約後按「開始健檢」，結果會顯示在這裡。</p>
          ) : (
            <>
              <div className="gauges">
                <Gauge title="接案者風險" data={result.summary.freelancer} />
                <Gauge title="發案方風險" data={result.summary.client} />
              </div>
              <div className="tabs">
                {[['all', '全部'], [FREELANCER, '對接案者不利'], [CLIENT, '對發案方不利']].map(([k, l]) => (
                  <button key={k} className={filter === k ? 'on' : ''} onClick={() => setFilter(k)}>{l}</button>
                ))}
              </div>

              {result.missing.filter(show).length > 0 && (
                <div className="clause missing">
                  <div className="clause-no">整份合約缺少的約定</div>
                  {result.missing.filter(show).map((f) => <Finding key={f.id} f={f} />)}
                </div>
              )}

              {result.clauses.map((c) => {
                const fs = c.findings.filter(show)
                if (filter !== 'all' && fs.length === 0) return null
                return (
                  <div key={c.index} className={`clause ${fs.length ? 'risky' : ''}`}>
                    <div className="clause-no">第 {c.index} 條{fs.length ? '' : '・未發現風險'}</div>
                    <p className="clause-text">{c.text}</p>
                    {fs.map((f) => <Finding key={f.id} f={f} />)}
                  </div>
                )
              })}
              <p className="muted small">偵測引擎：{result.engine}　{result.disclaimer}</p>
            </>
          )}
        </section>
      </div>
    </>
  )
}
