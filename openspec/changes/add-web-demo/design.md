# Design

## Context

後端（Spring Boot）與 LLM 尚未開發，Demo 需要能放在 GitHub Pages（只能放靜態檔案）。

## Goals / Non-Goals

**Goals:** 一個網址就能操作完整流程；引擎有單元測試；輸出格式與未來 API 一致。
**Non-Goals:** 不做登入、資料庫、真實金流、LLM。

## Decisions

1. **引擎放在前端 `web/src/engine/`**：GitHub Pages 無法執行後端。引擎是純函式，之後可原樣移植到 Spring Boot，或改為呼叫 API。
2. **HashRouter**：GitHub Pages 不支援 SPA 路由改寫，用 `#/review` 形式避免重新整理時 404。
3. **Vite `base: './'`**：網站部署在 `https://<帳號>.github.io/<repo>/` 子路徑下也能正常載入資源。
4. **GitHub Actions 部署**：每次 push 到 main 先跑測試再部署，測試沒過就不會上線。

## Risks / Trade-offs

- [規則式引擎只認得寫好的句型] → 畫面明確標示「示範版」，正式版改用 LLM。
- [Demo 資料寫死在前端] → 只用於展示，接上後端後改由 API 提供。
