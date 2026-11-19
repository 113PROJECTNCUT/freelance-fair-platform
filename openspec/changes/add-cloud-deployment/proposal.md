# Proposal

## Why

會員與案件功能原本只能在本機啟動後端使用，GitHub Pages 上的網站無法註冊、登入或刊登。展示給老師與組員時，需要一個不必在自己電腦開伺服器、任何人打開網址就能操作的版本。

## What Changes

- 後端以 Docker 部署到 Render 免費方案（`server/Dockerfile`）。
- 資料改存 Aiven 免費 MySQL，連線資訊與 JWT 金鑰全部以環境變數提供，不寫進程式碼。
- GitHub Pages 前端建置時以 `VITE_API_BASE` 指向雲端後端。
- 前端在伺服器喚醒中顯示提示（免費方案閒置 15 分鐘會休眠）。
- 新增 `Cloud smoke test` workflow：從外部實際呼叫雲端後端驗證可用。

## Capabilities

### New Capabilities
- `cloud-deployment`: 雲端後端可公開存取、資料持久保存、只接受本平台前端的跨網域呼叫，並在休眠時給使用者清楚提示。

### Modified Capabilities
（無）

## Impact

- 新增 `server/Dockerfile`、`.dockerignore`；`application.yml` 讀 `PORT`；`application-mysql.yml` 連線池、必填 `JWT_SECRET`。
- `.github/workflows/deploy.yml` 加 `VITE_API_BASE`；新增 `.github/workflows/cloud-smoke.yml`；Server CI 驗證 Docker 可建置。
- 外部服務：Render（Web Service）、Aiven（MySQL 8）。帳號由組員自行管理。
