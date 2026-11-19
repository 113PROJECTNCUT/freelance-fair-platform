# Design

## Context

- 帳號已統一為 `MEMBER`（`unify-member-role`），「發案方／接案者」由與案件的關係決定：刊登者是發案方，應徵者是接案者。
- `Job.status` 已預留 `IN_PROGRESS`（選定接案者時使用）；公開列表只列 `OPEN`。
- 現有慣例：權限與業務規則在 service 檢查並丟 `ApiException`；欄位驗證用 Bean Validation，錯誤格式 `{message, errors:[{field, message}]}`；公開回應不含 Email；測試以 MockMvc 對應 spec Scenario。

## Decisions

1. **新增 `application` 套件**：`JobApplication`（應徵）與 `JobInvitation`（邀請）兩個實體，與 `job`、`profile` 平行，不塞進 `JobService`，避免案件服務越長越大。
2. **應徵欄位**：`message`（自我推薦 10–1000 字）、`quotedPrice`（報價 1–10,000,000）、`estimatedDays`（1–365）。報價不限制在案件預算區間內：接案者可能報高或報低，由發案方判斷；合約審查階段再談。
3. **唯一性用資料庫約束＋service 先查**：`job_applications(job_id, applicant_id)`、`job_invitations(job_id, invitee_id)` 加 unique constraint；service 先查回 409 給友善訊息，約束是最後防線。
4. **狀態**：應徵 `PENDING`／`ACCEPTED`／`REJECTED`。選定時在同一個 transaction 內：被選者 `ACCEPTED`、同案其他 `PENDING` → `REJECTED`、`Job.status` → `IN_PROGRESS`。選定時以悲觀鎖（`SELECT … FOR UPDATE`）讀取案件，避免兩個請求同時選定兩個人；不用 `@Version`，因為既有案件資料沒有版本欄位。
5. **HTTP 狀態碼**：未登入 401；與案件關係不對（應徵自己的案、非發案方看應徵／選定／邀請）403；資源不存在或應徵不屬於該案 404；狀態衝突（重複應徵、重複邀請、案件非 OPEN）409；邀請自己或未開放接案者是請求內容問題，400 並標 `freelancerId`。
6. **路徑**：`/api/jobs/{id}/applications`（POST 應徵、GET 發案方查看）、`/api/jobs/{id}/applications/{applicationId}/accept`（POST 選定）、`/api/jobs/{id}/invitations`（POST）、`/api/me/applications`、`/api/me/invitations`。這些都需登入；`SecurityConfig` 目前只公開 `GET /api/jobs` 與 `/api/jobs/*`，`/api/jobs/*/applications` 不會被誤公開。
7. **應徵人數**：`JobResponse` 加 `applicationCount`。列表一次查一個 count 會有 N+1，但列表最多 100 筆、專題規模可接受；之後需要再改成一次 group by 查詢。
8. **邀請不另做「接受／拒絕」**：受邀者以應徵回應；「收到的邀請」回傳 `applied` 讓前端顯示「已應徵」。
9. **前端**：
   - `JobDetail`：未登入顯示「登入後應徵」；非發案方且 `OPEN` 顯示應徵表單，已應徵則顯示自己的應徵狀態；發案方顯示應徵列表與「選定」按鈕（確認對話用畫面上的兩段式按鈕，不用 `window.confirm`）。
   - `MemberProfile`：登入者有 `OPEN` 案件且對方開放接案時，顯示「邀請應徵」（選案件＋訊息）。
   - `Account`：新增「我的應徵」「收到的邀請」；「我刊登的案件」狀態顯示中文。
   - 後端沒開（GitHub Pages 示範）時，應徵區塊顯示「需連線後端」，不做假資料應徵。

## Risks / Trade-offs

- [選定後無法取消] → 本 change 不做；若選錯只能等之後的「取消／重新招募」change。報告展示時要注意。
- [沒有通知] → 受邀者與應徵者要自己到帳號頁看；之後可加站內通知。
- [`ddl-auto: update` 自動建表] → 雲端 Aiven MySQL 會在部署後自動新增 `job_applications`、`job_invitations` 兩張表，不動既有資料表欄位。
