// 案件相關的顯示文字與示範資料（後端沒開時，例如 GitHub Pages，用來展示）

export const CATEGORIES = [
  ['WEB', '網站開發'],
  ['APP', 'App 開發'],
  ['DESIGN', '平面設計'],
  ['VIDEO', '影音剪輯'],
  ['TRANSLATION', '文字翻譯'],
  ['WRITING', '文案撰寫'],
  ['OTHER', '其他'],
]
export const CATEGORY_LABEL = Object.fromEntries(CATEGORIES)

export const IP_LABEL = {
  CLIENT_OWNS: '著作財產權歸發案方',
  FREELANCER_LICENSES: '接案者保留著作權，授權發案方使用',
}

export const formatBudget = (min, max) =>
  min === max ? `NT$ ${min.toLocaleString()}` : `NT$ ${min.toLocaleString()} – ${max.toLocaleString()}`

const daysFromNow = (n) => new Date(Date.now() + n * 864e5).toISOString().slice(0, 10)
const ago = (h) => new Date(Date.now() - h * 36e5).toISOString()

export const SAMPLE_JOBS = [
  {
    id: 'demo-1', title: '公司形象網站（3 頁＋聯絡表單）', category: 'WEB',
    description: '製作公司形象網站，包含首頁、關於我們、服務介紹三個頁面。首頁需要輪播圖，聯絡我們表單送出後要通知管理者。',
    budgetMin: 30000, budgetMax: 50000, deadline: daysFromNow(30), revisionLimit: 2,
    ipOwnership: 'CLIENT_OWNS', portfolioAllowed: true, status: 'OPEN',
    acceptanceCriteria: ['完成首頁、關於我們、服務介紹三頁', '首頁輪播圖可由管理者更換', '網站支援手機與桌機（RWD）', '聯絡表單送出後管理者收到 Email 通知', '交付原始碼與部署說明'],
    client: { id: 0, displayName: '晨光咖啡' }, createdAt: ago(3),
  },
  {
    id: 'demo-2', title: '手搖飲品牌 Logo 設計', category: 'DESIGN',
    description: '新開手搖飲店需要 Logo，風格清新、年輕，需能用在杯身、招牌與社群頭像。',
    budgetMin: 8000, budgetMax: 15000, deadline: daysFromNow(14), revisionLimit: 3,
    ipOwnership: 'CLIENT_OWNS', portfolioAllowed: true, status: 'OPEN',
    acceptanceCriteria: ['提供 3 款初稿供選擇', '提供 AI／SVG 向量原始檔與 PNG 透明背景檔', '提供彩色與單色兩種版本'],
    client: { id: 0, displayName: '小日子飲品' }, createdAt: ago(20),
  },
  {
    id: 'demo-3', title: '產品說明書中翻英（約 5,000 字）', category: 'TRANSLATION',
    description: '家電產品使用說明書中翻英，約五千字，需專業術語一致，交付 Word 檔。',
    budgetMin: 6000, budgetMax: 6000, deadline: daysFromNow(10), revisionLimit: 1,
    ipOwnership: 'CLIENT_OWNS', portfolioAllowed: false, status: 'OPEN',
    acceptanceCriteria: ['譯文段落與原文一一對應', '專有名詞依雙方確認的詞彙表', '交付可編輯的 Word 檔'],
    client: { id: 0, displayName: '永豐家電' }, createdAt: ago(30),
  },
  {
    id: 'demo-4', title: '社團成果影片剪輯（3 分鐘）', category: 'VIDEO',
    description: '社團期末成果影片，素材約 2 小時，剪成 3 分鐘精華並加上字幕與背景音樂。',
    budgetMin: 4000, budgetMax: 8000, deadline: daysFromNow(21), revisionLimit: 2,
    ipOwnership: 'FREELANCER_LICENSES', portfolioAllowed: true, status: 'OPEN',
    acceptanceCriteria: ['片長 3 分鐘 ±15 秒', '交付 1080p MP4', '全片中文字幕', '使用可商用授權音樂'],
    client: { id: 0, displayName: '勤益熱舞社' }, createdAt: ago(48),
  },
  {
    id: 'demo-5', title: '預約系統 App（iOS／Android）', category: 'APP',
    description: '美髮沙龍線上預約 App，客人可選設計師與時段，店家後台可管理班表與預約。',
    budgetMin: 120000, budgetMax: 180000, deadline: daysFromNow(75), revisionLimit: 2,
    ipOwnership: 'CLIENT_OWNS', portfolioAllowed: false, status: 'OPEN',
    acceptanceCriteria: ['可於 iOS 與 Android 安裝執行', '客人可選設計師與時段預約', '店家後台可管理班表與預約', '交付原始碼與建置說明'],
    client: { id: 0, displayName: 'Mori Hair' }, createdAt: ago(72),
  },
]

/** 示範資料用的篩選，規則與後端 GET /api/jobs 相同 */
export function filterJobs(jobs, { category, keyword, minBudget, maxBudget } = {}) {
  const kw = keyword?.trim().toLowerCase()
  return jobs.filter((j) =>
    j.status === 'OPEN' &&
    (!category || j.category === category) &&
    (!kw || j.title.toLowerCase().includes(kw) || j.description.toLowerCase().includes(kw)) &&
    (minBudget === '' || minBudget == null || j.budgetMax >= Number(minBudget)) &&
    (maxBudget === '' || maxBudget == null || j.budgetMin <= Number(maxBudget)))
}
