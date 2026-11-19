import { Link } from 'react-router-dom'

const FEATURES = [
  { to: '/post', color: 'blue', step: '1', title: 'AI 需求轉驗收清單', who: '發案方',
    desc: '把需求描述轉成可逐項勾選的驗收標準，雙方簽約前就先對齊「做到什麼才算完成」。' },
  { to: '/freelancers/score-demo', color: 'orange', step: '2', title: '接案者信用評分', who: '發案方',
    desc: '依準時交付率、一次驗收通過率、雙方互評與爭議紀錄計算分數，挑人不再靠感覺。' },
  { to: '/review', color: 'green', step: '3', title: '雙向 AI 合約健檢', who: '接案者＋發案方',
    desc: '逐條標示條款「對誰不利」與風險等級，附白話說明與對等修改範本。' },
  { to: '/milestones', color: 'navy', step: '4', title: '里程碑款項託管', who: '雙方',
    desc: '款項分期託管，依驗收清單通過後撥款；未通過可退回修正或申請平台仲裁。' },
]

export default function Home() {
  return (
    <>
      <section className="hero">
        <h1>簽約前先對齊，交付時有依據</h1>
        <p>結合 AI 合約審查的自由接案媒合平台，同時保障接案者與發案方。</p>
        <div className="hero-actions">
          <Link to="/review" className="btn primary">試用雙向合約健檢</Link>
          <Link to="/post" className="btn ghost">我是發案方，刊登案件</Link>
        </div>
      </section>

      <h2 className="section-title">交易流程中的四道保障</h2>
      <div className="grid four">
        {FEATURES.map((f) => (
          <Link key={f.to} to={f.to} className={`feature card border-${f.color}`}>
            <span className={`step bg-${f.color}`}>{f.step}</span>
            <h3>{f.title}</h3>
            <span className="tag">{f.who}</span>
            <p>{f.desc}</p>
            <span className="more">開始體驗 →</span>
          </Link>
        ))}
      </div>

      <div className="card note">
        <b>平台獲利模式：</b>每筆里程碑撥款時，平台抽取成交金額 6% 作為手續費。
      </div>
    </>
  )
}
