// 接案者信用評分
// 分數 = 準時交付率 40 + 一次驗收通過率 30 + 雙方互評 20 + 爭議紀錄 10（滿分 100）

export const WEIGHTS = { onTime: 40, firstPass: 30, rating: 20, dispute: 10 }
export const MIN_CASES = 3

export function creditScore({ completed, onTime, firstPass, ratingAvg, disputes }) {
  if (completed < MIN_CASES) {
    return { score: null, grade: 'new', label: '新進接案者', parts: null }
  }
  const onTimeRate = onTime / completed
  const firstPassRate = firstPass / completed
  const disputeRate = disputes / completed
  const parts = {
    onTime: WEIGHTS.onTime * onTimeRate,
    firstPass: WEIGHTS.firstPass * firstPassRate,
    rating: WEIGHTS.rating * Math.max(0, (ratingAvg - 1) / 4),
    // 爭議率 20% 以上此項為 0
    dispute: WEIGHTS.dispute * Math.max(0, 1 - disputeRate * 5),
  }
  const score = Math.round(Object.values(parts).reduce((a, b) => a + b, 0))
  const grade = score >= 85 ? 'excellent' : score >= 70 ? 'good' : 'caution'
  const label = { excellent: '優良', good: '良好', caution: '需留意' }[grade]
  return { score, grade, label, parts }
}

export const FREELANCERS = [
  { id: 1, name: '林小安', skills: ['React', 'UI 設計'], quote: 52000, completed: 18, onTime: 17, firstPass: 15, ratingAvg: 4.8, disputes: 0 },
  { id: 2, name: '陳柏宇', skills: ['WordPress', 'SEO'], quote: 38000, completed: 9, onTime: 6, firstPass: 5, ratingAvg: 3.9, disputes: 1 },
  { id: 3, name: '王思妤', skills: ['Vue', '後端 API'], quote: 61000, completed: 25, onTime: 22, firstPass: 20, ratingAvg: 4.5, disputes: 1 },
  { id: 4, name: '張皓', skills: ['React', 'Figma'], quote: 45000, completed: 2, onTime: 2, firstPass: 1, ratingAvg: 5, disputes: 0 },
]
