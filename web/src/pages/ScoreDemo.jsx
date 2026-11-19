import { useState } from 'react'
import { Link } from 'react-router-dom'
import { creditScore, FREELANCERS, WEIGHTS } from '../engine/creditScore.js'

const PART_LABEL = { onTime: '準時交付率', firstPass: '一次驗收通過率', rating: '雙方互評', dispute: '爭議紀錄' }

export default function ScoreDemo() {
  const [open, setOpen] = useState(1)
  const list = FREELANCERS.map((f) => ({ ...f, credit: creditScore(f) })).sort(
    (a, b) => (b.credit.score ?? -1) - (a.credit.score ?? -1),
  )

  return (
    <>
      <h1 className="page-title">信用評分示範</h1>
      <p className="notice warn">示範資料：正式評分會在評價功能完成後，依真實交易紀錄計算。</p>
      <p className="page-sub">「公司形象網站」收到 {list.length} 份投標。信用分數由平台依過往交易紀錄計算，點開可看明細。</p>
      <div className="stack">
        {list.map((f) => (
          <div key={f.id} className="card bidder">
            <div className="bidder-main" onClick={() => setOpen(open === f.id ? null : f.id)}>
              <div className={`score grade-${f.credit.grade}`}>
                {f.credit.score ?? '—'}
                <small>{f.credit.label}</small>
              </div>
              <div className="who">
                <b>{f.name}</b>
                <div>{f.skills.map((s) => <span key={s} className="tag">{s}</span>)}</div>
                <div className="muted small">已完成 {f.completed} 件・平均評價 {f.ratingAvg.toFixed(1)}・爭議 {f.disputes} 件</div>
              </div>
              <div className="quote">
                <span className="muted small">報價</span>
                <b>NT$ {f.quote.toLocaleString()}</b>
              </div>
              <span className="chev">{open === f.id ? '▲' : '▼'}</span>
            </div>
            {open === f.id && (
              <div className="bidder-detail">
                {f.credit.parts ? (
                  Object.entries(f.credit.parts).map(([k, v]) => (
                    <div key={k} className="bar-row">
                      <span>{PART_LABEL[k]}</span>
                      <div className="bar"><div style={{ width: `${(v / WEIGHTS[k]) * 100}%` }} /></div>
                      <span className="num">{v.toFixed(1)} / {WEIGHTS[k]}</span>
                    </div>
                  ))
                ) : (
                  <p className="muted">完成案件少於 3 件，資料不足以計算信用分數。可參考作品集，或先從小型里程碑開始合作。</p>
                )}
                <Link to="/review" className="btn primary small">選定並產生合約草案 →</Link>
              </div>
            )}
          </div>
        ))}
      </div>
      <p className="muted small">計算方式：準時交付率 40%＋一次驗收通過率 30%＋雙方互評 20%＋爭議紀錄 10%（爭議率 20% 以上該項為 0）。</p>
    </>
  )
}
