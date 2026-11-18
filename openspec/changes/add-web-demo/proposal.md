# Proposal

## Why

專題報告需要一個可以實際操作的 Demo，讓老師和同學看到「雙方對等」的四道保障如何串成一次完整交易。Spring Boot 後端與 LLM 尚未完成，因此先做一個可部署在 GitHub Pages 的前端 Demo，AI 功能以瀏覽器端規則式引擎模擬。

## What Changes

- 新增 React（Vite）前端，五個頁面：首頁、刊登案件、挑選接案者、雙向合約健檢、里程碑託管。
- 新增瀏覽器端引擎：雙向合約審查、需求轉驗收清單、接案者信用評分。
- 新增 GitHub Actions：push 到 main 後自動測試、建置並部署到 GitHub Pages。
- 不包含：Spring Boot 後端、MySQL、會員登入、真實金流、LLM 串接（後續 change）。

## Capabilities

### New Capabilities
- `contract-review`: 雙向合約審查，標示條款對誰不利、風險等級、白話說明與修改建議。
- `acceptance-checklist`: 將發案需求轉為可增修、可確認的驗收清單。
- `credit-score`: 依交易紀錄計算接案者信用分數並顯示明細。
- `milestone-escrow`: 里程碑款項託管與 6% 手續費試算。

### Modified Capabilities
（無）

## Impact

- 新增 `web/`（React + Vite + Vitest）與 `.github/workflows/deploy.yml`。
- 引擎輸出格式即為未來後端 API 的回應格式，接上 Spring Boot + LLM 時前端不需改動。
