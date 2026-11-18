# Spec Delta

## Purpose

讓使用者以接案者或發案方身分建立帳號並登入，作為平台所有交易功能的身分基礎。

## ADDED Requirements

### Requirement: 註冊
系統 SHALL 允許使用者以 Email、密碼、顯示名稱與角色（`FREELANCER` 接案者或 `CLIENT` 發案方）註冊；成功時回傳 HTTP 201 與使用者資料，且回應 MUST NOT 包含密碼或密碼雜湊。

#### Scenario: 註冊成功
- **WHEN** 使用者以未註冊過的 Email、合格密碼、名稱與角色 `FREELANCER` 送出註冊
- **THEN** 回傳 201，內容包含 id、email、displayName、role，不含密碼

#### Scenario: Email 重複
- **WHEN** 使用者以已註冊的 Email 再次註冊
- **THEN** 回傳 409，訊息說明此 Email 已被註冊

#### Scenario: 不允許自行註冊為管理員
- **WHEN** 使用者送出 role 為 `ADMIN` 的註冊
- **THEN** 回傳 400，不建立帳號

### Requirement: 輸入驗證
系統 MUST 驗證 Email 格式、密碼至少 8 碼且同時包含英文字母與數字、顯示名稱 1–30 字；不符合時回傳 400 並指出是哪個欄位。

#### Scenario: 密碼太弱
- **WHEN** 使用者以密碼 `abc` 註冊
- **THEN** 回傳 400，錯誤欄位為 password

### Requirement: 密碼安全儲存
系統 SHALL 以 BCrypt 雜湊儲存密碼，資料庫中 MUST NOT 出現明文密碼。

#### Scenario: 資料庫不存明文
- **WHEN** 使用者以密碼 `secret123` 註冊成功
- **THEN** 資料庫中該使用者的密碼欄位不等於 `secret123`，且可通過 BCrypt 比對

### Requirement: 登入
系統 SHALL 在 Email 與密碼正確時回傳 JWT 與使用者資料；Email 不存在或密碼錯誤時 MUST 回傳相同的 401 訊息，不透露是哪一項錯誤。

#### Scenario: 登入成功
- **WHEN** 使用者以正確的 Email 與密碼登入
- **THEN** 回傳 200，包含 token 與使用者資料

#### Scenario: 密碼錯誤
- **WHEN** 使用者以錯誤密碼登入
- **THEN** 回傳 401，訊息為「Email 或密碼錯誤」

### Requirement: 取得目前使用者
系統 SHALL 以 `Authorization: Bearer <token>` 驗證身分並回傳目前使用者；沒有 token、token 無效或過期時 MUST 回傳 401。

#### Scenario: 帶有效 token
- **WHEN** 使用者以登入取得的 token 呼叫取得目前使用者
- **THEN** 回傳 200 與該使用者資料

#### Scenario: 沒帶 token
- **WHEN** 使用者未帶 token 呼叫取得目前使用者
- **THEN** 回傳 401
