# Tasks

## 1. 後端：應徵與選定

- [x] 1.1 `JobApplication` 實體（unique job+applicant）、狀態 enum、Repository；`JobRepository` 加悲觀鎖查詢；`Job` 加狀態變更方法（驗證：Server CI 編譯通過）
- [x] 1.2 `POST /api/jobs/{id}/applications` 與驗證（驗證：應徵成功、未登入、自己的案件、重複應徵、案件已不在招募、案件不存在、報價為 0、自我推薦太短）
- [x] 1.3 `GET /api/jobs/{id}/applications`、`POST …/{applicationId}/accept`、`GET /api/me/applications`（驗證：發案方查看應徵列表、非發案方不能查看、選定成功、非發案方不能選定、已選定過不能再選、應徵不屬於這個案件、查看我的應徵與結果）
- [x] 1.4 `JobResponse.applicationCount`（驗證：應徵後人數增加）

## 2. 後端：邀請

- [x] 2.1 `JobInvitation` 實體、`POST /api/jobs/{id}/invitations`、`GET /api/me/invitations`（驗證：邀請成功、重複邀請、不能邀請未開放接案的會員、非發案方不能邀請、受邀者應徵後）

## 3. 前端

- [x] 3.1 `api/client.js` 加應徵／邀請 API（驗證：`npm test` 通過）
- [ ] 3.2 案件詳情頁：應徵表單、我的應徵狀態、發案方應徵列表與選定（驗證：`npm run build` 成功，雲端網站手動操作一次）
- [ ] 3.3 接案者公開檔案「邀請應徵」；帳號頁「我的應徵」「收到的邀請」（驗證：`npm run build` 成功，雲端網站手動操作一次）

## 4. 文件與驗證

- [x] 4.1 README API 表、`docs/requirements.md` F2、C3 狀態更新
- [ ] 4.2 Server CI 綠燈；雲端以兩個帳號實際走一次「刊登 → 邀請 → 應徵 → 選定」（組員確認）

## Workflow follow-up

- 報告完成後執行 `openspec archive add-job-application`
