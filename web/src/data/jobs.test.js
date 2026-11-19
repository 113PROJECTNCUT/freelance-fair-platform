import { describe, expect, it } from 'vitest'
import { SAMPLE_JOBS, filterJobs, formatBudget } from './jobs.js'

// 規則與後端 GET /api/jobs 相同（spec: job-posting「瀏覽與查詢案件」）
describe('filterJobs（示範資料篩選）', () => {
  it('不給條件時列出全部', () => {
    expect(filterJobs(SAMPLE_JOBS)).toHaveLength(SAMPLE_JOBS.length)
  })
  it('依類別', () => {
    const r = filterJobs(SAMPLE_JOBS, { category: 'DESIGN' })
    expect(r.length).toBeGreaterThan(0)
    expect(r.every((j) => j.category === 'DESIGN')).toBe(true)
  })
  it('關鍵字比對標題與描述', () => {
    expect(filterJobs(SAMPLE_JOBS, { keyword: '輪播' }).map((j) => j.id)).toEqual(['demo-1'])
  })
  it('最高預算：預算下限不超過它', () => {
    const r = filterJobs(SAMPLE_JOBS, { maxBudget: '10000' })
    expect(r.every((j) => j.budgetMin <= 10000)).toBe(true)
    expect(r.some((j) => j.id === 'demo-5')).toBe(false)
  })
  it('最低預算：預算上限至少到它', () => {
    const r = filterJobs(SAMPLE_JOBS, { minBudget: '100000' })
    expect(r.map((j) => j.id)).toEqual(['demo-5'])
  })
})

describe('formatBudget', () => {
  it('區間與單一金額', () => {
    expect(formatBudget(30000, 50000)).toBe('NT$ 30,000 – 50,000')
    expect(formatBudget(6000, 6000)).toBe('NT$ 6,000')
  })
})
