import { describe, expect, it } from 'vitest'
import { validateApplication } from './applications.js'

const ok = { message: '我做過五個形象網站，熟悉 RWD。', quotedPrice: '30000', estimatedDays: '14' }

describe('應徵表單驗證（與後端規則一致）', () => {
  it('合格的應徵沒有錯誤', () => {
    expect(validateApplication(ok)).toEqual({})
  })
  it('報價為 0', () => {
    expect(validateApplication({ ...ok, quotedPrice: '0' })).toHaveProperty('quotedPrice')
  })
  it('自我推薦太短', () => {
    expect(validateApplication({ ...ok, message: '我可以' })).toHaveProperty('message')
  })
  it('預計天數超過 365', () => {
    expect(validateApplication({ ...ok, estimatedDays: '400' })).toHaveProperty('estimatedDays')
  })
  it('報價不是整數', () => {
    expect(validateApplication({ ...ok, quotedPrice: '12.5' })).toHaveProperty('quotedPrice')
  })
})
