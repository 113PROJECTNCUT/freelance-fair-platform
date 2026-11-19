/** 把「React, Figma、Logo設計」這類輸入拆成技能陣列：去空白、去重複（不分大小寫） */
export function parseSkills(text) {
  const seen = new Map()
  for (const raw of String(text ?? '').split(/[,，、\n]+/)) {
    const s = raw.trim()
    if (s && !seen.has(s.toLowerCase())) seen.set(s.toLowerCase(), s)
  }
  return [...seen.values()]
}

export const MAX_SKILLS = 10
export const MAX_SKILL_LENGTH = 20
