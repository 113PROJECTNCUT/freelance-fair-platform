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
  if (status !== 'down') return null
  return (
    <div className="notice warn">
      <strong>後端尚未連線。</strong>
      會員功能需要 Spring Boot 後端。GitHub Pages 上的展示版沒有後端，請依 README「在本機啟動後端」的步驟操作。
    </div>
  )
}
