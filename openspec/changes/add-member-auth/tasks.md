# Tasks

## 1. 後端骨架

- [x] 1.1 建立 Spring Boot 3 專案（Web、JPA、Security、Validation、H2、MySQL、jjwt）（驗證：GitHub Actions `mvn test` 綠燈）
- [x] 1.2 `application.yml` 預設 H2；`application-mysql.yml` 連 MySQL；`docker-compose.yml` 提供 MySQL（驗證：本機 `mvn spring-boot:run` 可啟動）

## 2. 會員功能

- [x] 2.1 User 實體、Role（FREELANCER／CLIENT／ADMIN）、UserRepository（驗證：測試「資料庫不存明文」通過）
- [x] 2.2 註冊 API 與輸入驗證（驗證：註冊成功、Email 重複、不允許 ADMIN、密碼太弱 情境通過）
- [x] 2.3 登入 API 與 JWT 簽發（驗證：登入成功、密碼錯誤 情境通過）
- [x] 2.4 JWT 驗證 filter 與取得目前使用者 API（驗證：帶有效 token、沒帶 token 情境通過）

## 3. 前端

- [x] 3.1 API client、AuthContext、登入／註冊頁、導覽列登入狀態（驗證：本機前後端同時啟動可註冊並登入）

## 4. CI

- [x] 4.1 新增 `server-ci.yml`（驗證：push 後 Actions 綠燈）

## Workflow follow-up

- 報告完成後執行 `openspec archive add-member-auth`
