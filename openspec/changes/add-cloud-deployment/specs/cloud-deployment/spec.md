# Spec Delta

## Purpose

讓平台在雲端可公開使用，不需要在組員電腦上啟動伺服器。

## ADDED Requirements

### Requirement: 雲端後端可公開存取
系統 SHALL 部署於公開網址，健康檢查 `GET /api/health` 回傳 `{"status":"ok"}`。

#### Scenario: 健康檢查
- **WHEN** 任何人呼叫雲端後端的 `/api/health`
- **THEN** 回傳 200 與 `{"status":"ok"}`

### Requirement: 資料持久保存
系統 SHALL 將會員與案件存於雲端 MySQL，後端重新部署、重啟或休眠後資料 MUST 仍然存在。

#### Scenario: 重新部署後帳號仍在
- **WHEN** 使用者註冊後，後端重新部署
- **THEN** 使用者仍可用原帳號密碼登入

### Requirement: 機密不進版本控制
資料庫帳密與 JWT 金鑰 MUST 只以環境變數提供；正式環境未設定 `JWT_SECRET` 時後端 MUST 拒絕啟動。

#### Scenario: 缺少 JWT_SECRET
- **WHEN** 以 `mysql` profile 啟動且沒有設定 `JWT_SECRET`
- **THEN** 後端啟動失敗，不會使用開發用預設金鑰

### Requirement: 跨網域只允許本平台前端
系統 SHALL 允許來自 `https://113projectncut.github.io` 的跨網域呼叫，其他來源 MUST NOT 取得 CORS 允許標頭。

#### Scenario: GitHub Pages 呼叫登入
- **WHEN** 瀏覽器自 `https://113projectncut.github.io` 對 `/api/auth/login` 送出 CORS 預檢
- **THEN** 回應包含 `Access-Control-Allow-Origin: https://s845taiwan.github.io`

### Requirement: 休眠喚醒提示
前端在確認伺服器狀態期間 SHALL 顯示「正在連線伺服器」並說明第一次開啟最多約需 1 分鐘；確認連不到時 SHALL 提示稍後再試，案件列表改顯示標明的示範資料。

#### Scenario: 伺服器休眠中開啟網站
- **WHEN** 使用者在伺服器休眠時開啟登入頁
- **THEN** 頁面顯示正在連線的提示，伺服器醒來後可正常登入
