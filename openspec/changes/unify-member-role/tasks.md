# Tasks

## 1. 後端

- [x] 1.1 `Role` 改為 MEMBER／ADMIN；`User.role` 存 VARCHAR；註冊不收 role（驗證：註冊成功、不允許自行註冊為管理員）
- [x] 1.2 刊登案件不限身分（驗證：會員刊登成功、未登入不能刊登）
- [x] 1.3 `RoleColumnMigration`：MySQL ENUM→VARCHAR、舊角色轉 MEMBER（驗證：雲端部署後冒煙測試與舊帳號登入）

## 2. 前端

- [x] 2.1 註冊頁移除身分選擇；導覽列、帳號頁、刊登頁調整

## 3. 驗證

- [x] 3.1 Server CI、Pages、Cloud smoke test 綠燈
- [ ] 3.2 以改版前註冊的帳號登入成功（組員確認）

## Workflow follow-up

- 報告完成後依序 archive：add-member-auth → add-job-posting → unify-member-role → add-cloud-deployment
