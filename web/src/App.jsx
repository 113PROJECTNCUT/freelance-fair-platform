import { NavLink, Route, Routes } from 'react-router-dom'
import Home from './pages/Home.jsx'
import Review from './pages/Review.jsx'
import PostJob from './pages/PostJob.jsx'
import Freelancers from './pages/Freelancers.jsx'
import Milestones from './pages/Milestones.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Account from './pages/Account.jsx'
import { ROLE_LABEL, useAuth } from './auth/AuthContext.jsx'

const NAV = [
  ['/', '首頁'],
  ['/post', '刊登案件'],
  ['/freelancers', '挑選接案者'],
  ['/review', '雙向合約健檢'],
  ['/milestones', '里程碑託管'],
]

function UserMenu() {
  const { user } = useAuth()
  if (user) {
    return (
      <NavLink to="/account" className="user-chip" title="我的帳號">
        {user.displayName}<small>{ROLE_LABEL[user.role]}</small>
      </NavLink>
    )
  }
  return (
    <NavLink to="/login" className={({ isActive }) => `login-link${isActive ? ' active' : ''}`}>
      登入／註冊
    </NavLink>
  )
}

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
          <UserMenu />
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
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/account" element={<Account />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
      <footer className="footer wrap">
        勤益科大 資管系 專題｜具 AI 智慧合約風險審查之自由接案媒合平台｜指導老師：廖文忠 老師｜組員：方瑞鈞、王宏哲、洪翊盛
      </footer>
    </>
  )
}
