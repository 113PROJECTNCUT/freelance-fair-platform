import { useEffect, useState } from 'react'
import { backendAvailable } from '../api/client.js'

/** 後端沒開時（例如 GitHub Pages 上）顯示說明，避免使用者以為壞掉 */
export function useBackendStatus() {
  const [status, setStatus] = useState('checking')
  useEffect(() => {
    let alive = true
    backendAvailable().then((ok) => alive && setStatus(ok ? 'up' : 'down'))
    return () => { alive = false }
  }, [])
  return status
}

export default function BackendNotice({ status }) {
  if (status === 'checking') {
    return (
      <div className="notice">正在連線伺服器…免費主機閒置後會休眠，第一次開啟最多約需 1 分鐘。</div>
    )
  }
  if (status !== 'down') return null
  return (
    <div className="notice warn">
      <strong>後端尚未連線。</strong>
      目前連不到伺服器，請稍後重新整理頁面再試一次。
    </div>
  )
}
