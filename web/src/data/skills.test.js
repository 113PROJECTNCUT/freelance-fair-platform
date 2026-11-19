import { describe, expect, it } from 'vitest'
import { parseSkills } from './skills.js'

describe('parseSkills', () => {
  it('支援半形、全形逗號與頓號', () => {
    expect(parseSkills('React, Figma，Logo設計、剪輯')).toEqual(['React', 'Figma', 'Logo設計', '剪輯'])
  })
  it('不分大小寫去重複，保留第一次的寫法', () => {
    expect(parseSkills('React, react, REACT')).toEqual(['React'])
  })
  it('空白與空字串', () => {
    expect(parseSkills('  ,  ，')).toEqual([])
    expect(parseSkills(undefined)).toEqual([])
  })
})
