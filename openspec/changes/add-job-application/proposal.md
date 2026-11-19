# Proposal

## Why

簡報需求 F2（接案者瀏覽並應徵案件）與 C3（發案方瀏覽接案者資料並邀請或選擇接案者）目前只完成「瀏覽」；案件刊登後沒有人能應徵，發案方也無法決定由誰承接，後續合約審查與里程碑託管都缺少「這個案件的接案者是誰」這個起點。

## What Changes

- 會員可對招募中（`OPEN`）的案件送出應徵：自我推薦、報價、預計天數；同一案件只能應徵一次，不能應徵自己刊登的案件。
- 發案方可查看自己案件的所有應徵，並選定其中一位：被選定的應徵成為「已錄取」，其餘自動「未錄取」，案件改為「進行中」（`IN_PROGRESS`），不再出現在公開列表、也不再接受應徵。
- 發案方可從接案者公開檔案邀請對方應徵自己的招募中案件；受邀者在帳號頁看到邀請，透過應徵回應。
- 會員可查看自己送出的應徵與狀態、收到的邀請。
- 案件詳情回傳應徵人數。
- 前端：案件詳情頁加入應徵表單（非發案方）與應徵列表、選定按鈕（發案方）；接案者公開檔案加入「邀請應徵」；帳號頁加入「我的應徵」「收到的邀請」。
- 不包含：撤回應徵、編輯應徵、拒絕邀請、站內通知／Email、取消已選定的接案者（後續 change 視需要再加）。

## Capabilities

### New Capabilities
- `job-application`: 會員應徵案件、發案方查看應徵並選定接案者、發案方邀請接案者應徵。

### Modified Capabilities
（無。案件公開列表原本就只列 `OPEN`，選定後改為 `IN_PROGRESS` 自然不再列出，`job-posting` 的需求不變。）

## Impact

- `server/`：新增 `application` 套件（`JobApplication`、`JobInvitation` 實體與 API）；`JobResponse` 加入 `applicationCount`；`Job` 加入狀態變更方法。
- API：`POST /api/jobs/{id}/applications`、`GET /api/jobs/{id}/applications`、`POST /api/jobs/{id}/applications/{applicationId}/accept`、`GET /api/me/applications`、`POST /api/jobs/{id}/invitations`、`GET /api/me/invitations`。
- `web/`：`JobDetail`、`MemberProfile`、`Account` 頁與 `api/client.js`。
- 文件：README API 表、`docs/requirements.md` 的 F2、C3 狀態。
