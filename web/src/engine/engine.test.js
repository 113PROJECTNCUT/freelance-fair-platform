import { describe, it, expect } from 'vitest'
import { reviewContract, splitClauses, SAMPLE_CONTRACT, SAMPLE_FAIR, FREELANCER, CLIENT } from './contractReview.js'
import { creditScore } from './creditScore.js'
import { generateChecklist } from './checklist.js'

const ids = (r) => [...r.clauses.flatMap((c) => c.findings), ...r.missing].map((f) => f.id)

describe('合約條款切分', () => {
  it('依條號切分', () => {
    expect(splitClauses('第一條 A。\n第二條 B。\n第三條 C。')).toHaveLength(3)
  })
})

describe('雙向合約審查', () => {
  it('範例合約同時抓到對雙方不利的條款', () => {
    const r = reviewContract(SAMPLE_CONTRACT)
    const all = r.clauses.flatMap((c) => c.findings)
    expect(all.some((f) => f.against === FREELANCER)).toBe(true)
    expect(all.some((f) => f.against === CLIENT)).toBe(true)
    expect(ids(r)).toEqual(expect.arrayContaining([
      'unlimited-revision', 'vague-acceptance', 'ip-buyout-indemnity', 'payment-risk',
      'unilateral-spec', 'no-warranty', 'no-refund-exit', 'missing-deadline', 'missing-delay-liability',
    ]))
  })

  it('對接案者不利：無限修改為高風險', () => {
    const f = reviewContract('第一條 乙方應配合無限次修改。').clauses[0].findings[0]
    expect(f).toMatchObject({ id: 'unlimited-revision', against: FREELANCER, severity: 'high' })
  })

  it('對發案方不利：接案者不負瑕疵責任', () => {
    const f = reviewContract('第一條 交付後乙方不負任何責任。').clauses[0].findings[0]
    expect(f).toMatchObject({ id: 'no-warranty', against: CLIENT, severity: 'high' })
  })

  it('否定句不誤報', () => {
    const r = reviewContract('第一條 甲方不得要求無限次修改。')
    expect(r.clauses[0].findings).toHaveLength(0)
  })

  it('經甲方同意的轉包不報', () => {
    const r = reviewContract('第一條 乙方經甲方書面同意後，得將本案部分工作轉包。')
    expect(r.clauses[0].findings).toHaveLength(0)
  })

  it('條款齊全的合約，兩方皆為安全', () => {
    const ok = `第一條 乙方應於簽約後 30 日內交付網站。
第二條 免費修改以 2 次為限。
第三條 交付後 7 日內甲方依驗收清單驗收。
第四條 乙方逾期交付，每日扣總價 0.5% 違約金，上限 10%。
第五條 甲方應於驗收合格後 7 日內支付尾款。`
    const r = reviewContract(ok)
    expect(r.summary.freelancer.level).toBe('safe')
    expect(r.summary.client.level).toBe('safe')
  })
})

describe('公平範例', () => {
  it('較公平的範例合約，兩方皆為安全且無風險項目', () => {
    const r = reviewContract(SAMPLE_FAIR)
    expect(r.summary.findingsCount).toBe(0)
    expect(r.summary.freelancer.level).toBe('safe')
  })
})

describe('信用評分', () => {
  it('完成案件少於 3 件為新進接案者', () => {
    expect(creditScore({ completed: 2, onTime: 2, firstPass: 2, ratingAvg: 5, disputes: 0 }).grade).toBe('new')
  })
  it('全部滿分為 100', () => {
    expect(creditScore({ completed: 10, onTime: 10, firstPass: 10, ratingAvg: 5, disputes: 0 }).score).toBe(100)
  })
  it('爭議率 20% 以上，爭議項為 0', () => {
    expect(creditScore({ completed: 5, onTime: 5, firstPass: 5, ratingAvg: 5, disputes: 1 }).parts.dispute).toBe(0)
  })
})

describe('需求轉驗收清單', () => {
  it('包含需求句、類型建議、交期與修改次數', () => {
    const items = generateChecklist({ description: '製作公司形象網站，包含首頁與聯絡我們表單。', days: 30, revisions: 2 })
    const texts = items.map((i) => i.text)
    expect(texts.some((t) => t.includes('RWD'))).toBe(true)
    expect(texts.some((t) => t.includes('通知'))).toBe(true)
    expect(texts).toContain('於簽約後 30 日內完成交付')
    expect(texts).toContain('包含 2 次免費修改，超過另計費用')
  })
})
