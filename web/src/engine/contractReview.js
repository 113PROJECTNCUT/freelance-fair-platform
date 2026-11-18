// 雙向合約審查引擎（示範版：規則式）
// 正式版將以 LLM 取代 detect()，輸出格式維持不變，前端不需修改。

export const ENGINE = 'rule-based-demo-v1'
export const DISCLAIMER = '本結果由系統自動產生，僅供參考，不構成法律意見；重要合約請諮詢專業律師。'

// 對誰不利
export const FREELANCER = 'freelancer' // 接案者（乙方）
export const CLIENT = 'client' // 發案方（甲方）

const CLAUSE_MARKER =
  /^\s*(第\s*[一二三四五六七八九十百零〇\d]+\s*條|[一二三四五六七八九十]+\s*、|\d+\s*[.、．]|[（(][一二三四五六七八九十\d]+[)）])/

export function splitClauses(text) {
  const lines = String(text)
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
  const hasMarkers = lines.some((l) => CLAUSE_MARKER.test(l))
  let chunks = lines
  if (hasMarkers) {
    chunks = []
    for (const line of lines) {
      if (CLAUSE_MARKER.test(line) || chunks.length === 0) chunks.push(line)
      else chunks[chunks.length - 1] += line
    }
  }
  return chunks.map((t, i) => ({ index: i + 1, text: t }))
}

const NEGATION_BEFORE = /(不得|不可|不應|禁止|無須|毋須|免於)\s*(要求|請求|約定|主張)?\s*$/

function hit(text, pattern) {
  const flags = pattern.flags.includes('g') ? pattern.flags : pattern.flags + 'g'
  const re = new RegExp(pattern.source, flags)
  let m
  while ((m = re.exec(text)) !== null) {
    const before = text.slice(Math.max(0, m.index - 6), m.index)
    if (!NEGATION_BEFORE.test(before)) return m
  }
  return null
}

// ---------------------------------------------------------------- 條款層級規則
const RULES = [
  // ===== 對接案者不利 =====
  {
    id: 'unlimited-revision', label: '無限修改', against: FREELANCER,
    check(t) {
      const m = hit(t, /(無限次?|不限次數|無次數限制|次數不限)\s*(之|的)?\s*(免費)?\s*修改|修改\s*(次數)?\s*(無上限|不設限|不限)/)
      return m && { severity: 'high', plain: `要求「${m[0]}」，沒有修改上限，可能一直做白工。`, fix: '明訂免費修改次數（例如 2 次），超過依次數或工時另計費用。' }
    },
  },
  {
    id: 'vague-acceptance', label: '驗收標準模糊', against: FREELANCER,
    check(t) {
      const m = hit(t, /(直到|至)?\s*(甲方|業主|委託人)?\s*滿意為止|以(甲方|業主)(主觀)?(滿意|認定)為(準|驗收標準)|驗收(標準|方式|期限)?\s*由(甲方|業主)(另行|自行)?(決定|認定|通知)/)
      return m && { severity: 'medium', plain: `驗收條件為「${m[0].trim()}」，沒有客觀標準，發案方可以一直不驗收。`, fix: '附上驗收清單，並約定「交付後 7 日內未提出書面異議視為驗收通過」。' }
    },
  },
  {
    id: 'ip-buyout-indemnity', label: '智財買斷＋無上限賠償', against: FREELANCER,
    check(t) {
      if (!/(智慧財產權|著作權|智財權?).{0,20}(歸(屬)?(於)?(甲方|業主)|移轉(予|給)?(甲方|業主)|讓與|買斷)/.test(t)) return null
      const m = hit(t, /(負擔?|承擔|賠償).{0,8}(一切|全部|所有).{0,6}(責任|損害|損失|賠償)|賠償.{0,4}無上限/)
      return m && { severity: 'high', plain: '成果權利全歸發案方，接案者還要負擔一切賠償，責任無上限。', fix: '款項付清後才移轉權利；賠償以本案總金額為上限，且限可歸責於接案者的事由。' }
    },
  },
  {
    id: 'excessive-penalty', label: '逾期違約金過高', against: FREELANCER,
    check(t) {
      if (!/(違約金|罰|扣)/.test(t)) return null
      const daily = /(每|按)\s*(逾期)?\s*(一)?\s*(日|天)/.test(t)
      const capped = /(上限|最高|至多|為限|不超過)/.test(t)
      const pct = t.match(/(\d+(?:\.\d+)?)\s*[%％]/)
      if (daily && !capped) return { severity: 'high', plain: '逾期按日計罰且沒有上限，延誤幾天就可能把報酬扣光。', fix: '違約金總額以總價 10% 為上限，並排除因發案方延遲提供資料造成的逾期。' }
      if (pct && Number(pct[1]) >= 20) return { severity: 'high', plain: `違約金高達 ${pct[1]}%，明顯偏高。`, fix: '將違約金調整為總價 10% 以內，並以實際損失為限。' }
      return null
    },
  },
  {
    id: 'payment-risk', label: '付款條件不明', against: FREELANCER,
    check(t) {
      const m = hit(t, /(付款|支付|撥款|尾款|報酬|款項).{0,15}(另行約定|另議|視.{0,8}情況|由(甲方|業主)(另行)?決定|不定期)/)
      if (m) return { severity: 'high', plain: `付款時間「${m[0]}」，沒有期限，尾款可能被無限期拖欠。`, fix: '明訂付款期限（例如驗收後 7 日內），並改用平台里程碑託管。' }
      if (/(全部|全額|所有)\s*(款項|報酬|費用|價金).{0,20}驗收/.test(t)) return { severity: 'medium', plain: '全部款項在最後驗收才一次付清，前期沒有任何訂金或階段款。', fix: '改為訂金 30%、期中 40%、驗收 30% 的里程碑分期。' }
      return null
    },
  },
  // ===== 對發案方不利 =====
  {
    id: 'ip-retained', label: '成果權利歸接案者', against: CLIENT,
    check(t) {
      const m = hit(t, /(智慧財產權|著作權|智財權?).{0,20}(歸(屬)?(於)?乙方|由乙方(保留|所有|享有))|乙方保留.{0,10}(著作權|智慧財產權)/)
      return m && { severity: 'medium', plain: '成果的權利留在接案者手上，發案方之後可能不能自由修改或商用。', fix: '約定尾款付清後移轉權利，或明確寫出授權範圍（用途、期間、地區）。' }
    },
  },
  {
    id: 'unilateral-spec', label: '交付內容由接案者決定', against: CLIENT,
    check(t) {
      const m = hit(t, /(依|由)乙方(之)?(專業)?(判斷|決定|自行(決定|調整)?).{0,10}(規格|內容|方式|設計|功能)|乙方得(自行|任意)(調整|變更).{0,8}(規格|內容|功能)/)
      return m && { severity: 'medium', plain: '交付內容可由接案者自行決定，發案方事後很難主張「做的跟講的不一樣」。', fix: '以驗收清單列明交付項目，規格變更需經雙方書面同意。' }
    },
  },
  {
    id: 'no-warranty', label: '接案者不負瑕疵責任', against: CLIENT,
    check(t) {
      const m = hit(t, /乙方(不負|不承擔|免除|免負).{0,8}(任何|一切)?.{0,4}(責任|保固|瑕疵|擔保)/)
      return m && { severity: 'high', plain: '接案者對成果瑕疵完全不負責，交付後出問題只能自己處理。', fix: '約定保固期（例如驗收後 30 日）內免費修補瑕疵。' }
    },
  },
  {
    id: 'subcontract', label: '可任意轉包', against: CLIENT,
    check(t) {
      if (/甲方(書面)?同意/.test(t)) return null
      const m = hit(t, /乙方得(將本案|將本合約)?.{0,6}(轉包|轉委託|委託第三人|外包)/)
      return m && { severity: 'medium', plain: '接案者可以把案子轉給別人做，品質和保密都難掌握。', fix: '轉包須經發案方書面同意，且接案者仍對成果負全部責任。' }
    },
  },
  {
    id: 'no-refund-exit', label: '可隨時解約不退款', against: CLIENT,
    check(t) {
      const m = hit(t, /乙方得(隨時|任意).{0,4}(終止|解除)|(訂金|預付款|首期款).{0,12}(不予退還|概不退還|不退)/)
      return m && { severity: 'high', plain: '接案者可以單方面解約，或已付款項一律不退，發案方可能錢付了卻拿不到成果。', fix: '約定解約時依已完成的里程碑比例結算，未完成部分退款。' }
    },
  },
]

// ---------------------------------------------------------------- 合約整體缺漏
const MISSING = [
  {
    id: 'missing-deadline', label: '未約定交付期限', against: 'both', severity: 'medium',
    present: /(\d+\s*(日|天|週|周|個月)內|交付期限|完成日|截止日|於.{0,8}(前|以前)交付)/,
    plain: '整份合約沒有交付期限，雙方對「何時要完成」沒有共同依據。',
    fix: '加入各里程碑的交付日期。',
  },
  {
    id: 'missing-acceptance', label: '未約定驗收方式', against: 'both', severity: 'medium',
    present: /驗收/,
    plain: '整份合約沒有提到驗收，交付後是否合格容易各說各話。',
    fix: '附上雙方確認的驗收清單，並約定驗收期限。',
  },
  {
    id: 'missing-delay-liability', label: '未約定遲延責任', against: CLIENT, severity: 'medium',
    present: /(逾期|遲延|延遲|延誤).{0,15}(違約金|扣|賠償|責任|解約|終止)/,
    plain: '接案者延遲交付時沒有任何責任，發案方只能一直等。',
    fix: '約定合理的逾期違約金（例如每日 0.5%，上限 10%）或逾期可解約。',
  },
]

const POINTS = { high: 35, medium: 20, low: 10 }

function level(score) {
  if (score >= 60) return 'high'
  if (score >= 30) return 'medium'
  return 'safe'
}

export function reviewContract(text) {
  const clauses = splitClauses(text).map((c) => ({
    ...c,
    findings: RULES.map((r) => {
      const res = r.check(c.text)
      return res ? { id: r.id, label: r.label, against: r.against, ...res } : null
    }).filter(Boolean),
  }))

  const missing = MISSING.filter((m) => !m.present.test(text)).map(({ present, ...m }) => m)

  const all = [...clauses.flatMap((c) => c.findings), ...missing]
  const sideScore = (side) =>
    Math.min(100, all.filter((f) => f.against === side || f.against === 'both').reduce((s, f) => s + POINTS[f.severity], 0))

  const freelancerScore = sideScore(FREELANCER)
  const clientScore = sideScore(CLIENT)

  return {
    engine: ENGINE,
    disclaimer: DISCLAIMER,
    summary: {
      clauseCount: clauses.length,
      findingsCount: all.length,
      freelancer: { score: freelancerScore, level: level(freelancerScore), count: all.filter((f) => f.against !== CLIENT).length },
      client: { score: clientScore, level: level(clientScore), count: all.filter((f) => f.against !== FREELANCER).length },
    },
    clauses,
    missing,
  }
}

export const SAMPLE_CONTRACT = `第一條 委託內容：乙方為甲方開發品牌形象網站一式，含首頁及五個內頁，網站版面依乙方專業判斷決定設計方式。
第二條 修改：乙方應配合甲方需求無限次修改，直到甲方滿意為止，不另收費。
第三條 智慧財產權：本案成果之智慧財產權全部歸屬甲方，如有侵權爭議，乙方應負擔一切賠償責任。
第四條 付款：總價新台幣 6 萬元，甲方於簽約時支付訂金 50%，該訂金概不退還；尾款支付時間由甲方視營運情況另行約定。
第五條 瑕疵：網站上線後如有任何問題，乙方不負任何責任。
第六條 保密：雙方對本合約內容負保密義務，期間為合約終止後一年。`

export const SAMPLE_FAIR = `第一條 委託內容：乙方為甲方開發品牌形象網站一式，交付項目以雙方確認之驗收清單為準。
第二條 期限：乙方應於簽約後 45 日內交付。
第三條 修改：免費修改以 2 次為限，超過部分依次另計費用。
第四條 驗收：甲方應於交付後 7 日內依驗收清單驗收，逾期未提出書面異議視為驗收通過。
第五條 付款：款項分三期託管於平台，各期驗收通過後 3 日內撥款。
第六條 遲延：乙方逾期交付，每日扣總價 0.5% 違約金，上限 10%。
第七條 智慧財產權：尾款付清後，成果之著作財產權移轉予甲方，乙方保留作品集展示權利。
第八條 保固：驗收通過後 30 日內，乙方負責免費修補瑕疵。`
