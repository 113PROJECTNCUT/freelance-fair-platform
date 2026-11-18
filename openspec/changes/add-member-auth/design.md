# Design

## Context

目前只有前端 Demo（GitHub Pages）。技術選型已定為 React＋Spring Boot＋MySQL。組員電腦尚未安裝 MySQL。

## Goals / Non-Goals

**Goals:** 可在本機一鍵啟動的後端；註冊／登入／取得目前使用者；自動化測試；之後的 API 可以直接沿用驗證機制。
**Non-Goals:** 忘記密碼、Email 驗證、OAuth、Refresh token、管理員介面。

## Decisions

1. **JWT（無狀態）而非 Session**：前後端分離、前端在 GitHub Pages 與後端不同網域，JWT 放在 `Authorization` header 比 Cookie Session 單純，也不需處理 CSRF。代價是無法立即撤銷 token，以 2 小時過期時間降低風險。
2. **預設 H2、`mysql` profile 切換 MySQL**：讓沒裝 MySQL 的組員只要有 JDK 就能跑；JPA 讓兩者共用同一份程式。正式部署與報告展示用 MySQL。
3. **登入失敗統一訊息**：避免攻擊者藉由不同錯誤訊息探測哪些 Email 已註冊。
4. **ADMIN 不可自行註冊**：管理員帳號之後由資料庫初始化或後台建立。
5. **測試在 GitHub Actions 執行**：push 時跑 `mvn test`，測試沒過就看得到紅燈。

## Risks / Trade-offs

- [JWT 簽章金鑰外洩] → 開發用預設金鑰只在 dev profile；正式環境以環境變數 `JWT_SECRET` 提供。
- [H2 與 MySQL 行為差異] → 只用標準 JPA 功能；MySQL 測試留到部署前以 `mysql` profile 驗證。
