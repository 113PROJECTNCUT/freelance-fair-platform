# Proposal

## Why

原本註冊時要選「接案者」或「發案方」，一個帳號只能做其中一邊。目標使用者（學生、青年接案者）常常兩邊都做，例如自己接網站案、又把 Logo 外包出去，被迫用兩個 Email 開兩個帳號並不合理。

身分其實由「這個案件」決定：刊登案件的人是該案的發案方，應徵的人是接案者。

## What Changes

- 註冊不再選身分，所有一般使用者都是「會員」（`MEMBER`）。**BREAKING**：註冊 API 不再接受 `role`。
- 任何已登入會員都可以刊登案件（原本限發案方）。
- 管理員（`ADMIN`）保留，仍不能自行註冊。
- 既有帳號（`FREELANCER`／`CLIENT`）啟動時自動轉為 `MEMBER`。
- 之後的應徵、驗收等權限以「與案件的關係」判斷（例如不能應徵自己的案件），不以帳號身分判斷。

## Capabilities

### New Capabilities
（無）

### Modified Capabilities
- `member-auth`: 註冊不選身分；角色只分會員與管理員。
- `job-posting`: 刊登案件由「限發案方」改為「任何會員」。

## Impact

- `server/`：`Role`、`User`、`RegisterRequest`、`AuthService`、`JobService`、新增 `RoleColumnMigration`；測試更新。
- `web/`：註冊頁移除身分選擇；導覽列、帳號頁、刊登頁調整。
- CI 與雲端冒煙測試改檢查 `MEMBER`。
