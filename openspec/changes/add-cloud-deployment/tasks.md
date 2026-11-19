# Tasks

## 1. 後端部署

- [x] 1.1 Dockerfile、`.dockerignore`；`server.port` 讀 `PORT`（驗證：Server CI `docker build` 成功）
- [x] 1.2 `mysql` profile：環境變數連線、連線池、必填 `JWT_SECRET`、指定 MySQLDialect（驗證：Render 部署 Live）
- [x] 1.3 Render Web Service 與 Aiven MySQL 建立、環境變數設定（組員操作）

## 2. 前端

- [x] 2.1 Pages 建置設定 `VITE_API_BASE`
- [x] 2.2 伺服器喚醒中／連不到的提示

## 3. 驗證

- [x] 3.1 `Cloud smoke test`：健康檢查、CORS、註冊→登入→取得自己→查詢案件（驗證：workflow 綠燈）
- [x] 3.2 重新部署後以既有帳號登入（驗證「資料持久保存」情境）

## Workflow follow-up

- 報告完成後執行 `openspec archive add-cloud-deployment`
