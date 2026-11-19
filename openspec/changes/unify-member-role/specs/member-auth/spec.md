# Spec Delta

## MODIFIED Requirements

### Requirement: 註冊
系統 SHALL 允許使用者以 Email、密碼與顯示名稱註冊，不需選擇身分；成功時回傳 HTTP 201 與使用者資料，角色為 `MEMBER`，且回應 MUST NOT 包含密碼或密碼雜湊。

#### Scenario: 註冊成功
- **WHEN** 使用者以未註冊過的 Email、合格密碼與名稱送出註冊
- **THEN** 回傳 201，內容包含 id、email、displayName，role 為 MEMBER，不含密碼

#### Scenario: Email 重複
- **WHEN** 使用者以已註冊的 Email 再次註冊
- **THEN** 回傳 409，訊息說明此 Email 已被註冊

#### Scenario: 不允許自行註冊為管理員
- **WHEN** 使用者在註冊資料中夾帶 role 為 `ADMIN`
- **THEN** 建立的帳號角色仍為 MEMBER

## ADDED Requirements

### Requirement: 既有帳號轉換
系統 SHALL 在啟動時將舊版角色 `FREELANCER`、`CLIENT` 的帳號轉為 `MEMBER`，轉換後原帳號密碼 MUST 仍可登入。

#### Scenario: 舊帳號登入
- **WHEN** 舊版以接案者身分註冊的使用者，在新版啟動後登入
- **THEN** 登入成功，角色為 MEMBER
