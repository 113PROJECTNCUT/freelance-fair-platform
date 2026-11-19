// 應徵相關的顯示文字與前端驗證（規則與後端 ApplyRequest 一致）

export const JOB_STATUS_LABEL = { OPEN: '招募中', IN_PROGRESS: '進行中', CLOSED: '已結案' }
export const APPLICATION_STATUS_LABEL = { PENDING: '待審', ACCEPTED: '已錄取', REJECTED: '未錄取' }

export const APPLY_LIMITS = { messageMin: 10, messageMax: 1000, priceMax: 10_000_000, daysMax: 365 }

/** 回傳 { field: 訊息 }，沒有錯誤時是空物件 */
export function validateApplication({ message, quotedPrice, estimatedDays }) {
  const e = {}
  const msg = (message ?? '').trim()
  if (!msg) e.message = '請輸入自我推薦'
  else if (msg.length < APPLY_LIMITS.messageMin || msg.length > APPLY_LIMITS.messageMax) e.message = '自我推薦需 10–1000 字'
  const price = Number(quotedPrice)
  if (quotedPrice === '' || quotedPrice == null) e.quotedPrice = '請輸入報價'
  else if (!Number.isInteger(price) || price < 1) e.quotedPrice = '報價至少 1 元'
  else if (price > APPLY_LIMITS.priceMax) e.quotedPrice = '報價過高'
  const days = Number(estimatedDays)
  if (estimatedDays === '' || estimatedDays == null) e.estimatedDays = '請輸入預計天數'
  else if (!Number.isInteger(days) || days < 1 || days > APPLY_LIMITS.daysMax) e.estimatedDays = '預計天數需 1–365 天'
  return e
}
