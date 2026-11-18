// 需求轉驗收清單（示範版：規則式）
// 正式版改由 LLM 生成，輸出同樣是 { id, text, source } 陣列。

const TEMPLATES = [
  { kw: /(網站|網頁|官網|形象站)/, items: ['網站支援手機與桌機（RWD）正常瀏覽', '於 Chrome、Safari、Edge 最新版正常顯示', '交付網站原始碼與部署說明'] },
  { kw: /(Logo|LOGO|logo|標誌|商標)/, items: ['提供 AI／SVG 向量原始檔與 PNG 透明背景檔', '提供彩色、黑白兩種版本'] },
  { kw: /(App|APP|app|應用程式)/, items: ['可於 iOS 與 Android 安裝並正常執行', '交付原始碼與建置說明'] },
  { kw: /(翻譯|中翻英|英翻中|譯)/, items: ['譯文字數與原文段落一一對應', '專有名詞依雙方確認的詞彙表翻譯'] },
  { kw: /(影片|剪輯|動畫)/, items: ['交付 1080p 以上 MP4 檔', '片長與分鏡符合雙方確認的腳本'] },
  { kw: /(後台|管理介面|CMS)/, items: ['管理者可自行新增、修改、刪除內容'] },
  { kw: /(表單|聯絡我們|報名)/, items: ['表單送出後管理者可收到通知並查看資料'] },
]

export function generateChecklist({ description, days, revisions }) {
  const items = []
  const add = (text, source) => {
    if (!items.some((i) => i.text === text)) items.push({ id: items.length + 1, text, source })
  }

  // 1) 需求描述逐句轉為交付項目
  String(description)
    .split(/[。；;\n！!？?]+/)
    .map((s) => s.replace(/^[\s\-•・*\d.、]+/, '').trim())
    .filter((s) => s.length >= 4)
    .forEach((s) => add(`完成：${s}`, '需求描述'))

  // 2) 依案件類型補上常見驗收項目
  for (const t of TEMPLATES) if (t.kw.test(description)) t.items.forEach((x) => add(x, '類型建議'))

  // 3) 交期與修改次數
  if (days) add(`於簽約後 ${days} 日內完成交付`, '交期')
  if (revisions !== '' && revisions != null) add(`包含 ${revisions} 次免費修改，超過另計費用`, '修改次數')
  add('交付後 7 日內未提出書面異議，視為驗收通過', '平台預設')

  return items
}
