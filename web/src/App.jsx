import { NavLink, Route, Routes } from 'react-router-dom'
import Home from './pages/Home.jsx'
import Review from './pages/Review.jsx'
import PostJob from './pages/PostJob.jsx'
import Freelancers from './pages/Freelancers.jsx'
import Milestones from './pages/Milestones.jsx'

const NAV = [
  ['/', '首頁'],
  ['/post', '刊登案件'],
  ['/freelancers', '挑選接案者'],
  ['/review', '雙向合約健檢'],
  ['/milestones', '里程碑託管'],
]

export default function App() {
  return (
    <>
      <header className="topbar">
        <div className="wrap topbar-inner">
          <NavLink to="/" className="brand">
            <span className="brand-mark">✓</span> 公平接案平台
          </NavLink>
          <nav>
            {NAV.map(([to, label]) => (
              <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => (isActive ? 'active' : '')}>
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <div className="demo-banner">
        示範版：AI 功能目前以瀏覽器端規則式引擎模擬，正式版將串接 Spring Boot 後端與大語言模型 API。
      </div>
      <main className="wrap">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/post" element={<PostJob />} />
          <Route path="/freelancers" element={<Freelancers />} />
          <Route path="/review" element={<Review />} />
          <Route path="/milestones" element={<Milestones />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
      <footer className="footer wrap">
        勤益科大 資管系 專題｜具 AI 智慧合約風險審查之自由接案媒合平台｜指導老師：廖文忠 老師｜組員：方瑞鈞、王宏哲、洪翊盛
      </footer>
    </>
  )
}
