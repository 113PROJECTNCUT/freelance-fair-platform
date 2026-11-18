# Proposal

## Why

前端 Demo 已上線，但所有資料都是寫死的假資料。正式網站要分辨「誰是接案者、誰是發案方」，才能做刊登、投標、合約與里程碑，所以第一步先做會員註冊與登入。

## What Changes

- 新增 Spring Boot 後端（`server/`），提供註冊、登入、取得目前使用者三支 API。
- 密碼以 BCrypt 雜湊儲存；登入成功發 JWT，之後的 API 以 `Authorization: Bearer` 驗證。
- 開發時預設使用 H2 記憶體資料庫，只要裝 JDK 就能啟動；`mysql` profile 改連 MySQL。
- 前端新增登入、註冊頁，導覽列顯示登入狀態。
- 不包含：忘記密碼、Email 驗證、第三方登入、管理員後台（後續 change）。

## Capabilities

### New Capabilities
- `member-auth`: 會員以 Email＋密碼註冊（選擇接案者或發案方角色）、登入取得 JWT、以 JWT 取得自己的資料。

### Modified Capabilities
（無）

## Impact

- 新增 `server/`（Spring Boot 3、Spring Security、Spring Data JPA、jjwt、H2／MySQL）。
- 新增 `.github/workflows/server-ci.yml`：push 時自動跑後端測試。
- 前端新增 `web/src/api/`、`web/src/auth/` 與兩個頁面。GitHub Pages 上的 Demo 沒有後端，登入頁會提示需在本機啟動後端。
