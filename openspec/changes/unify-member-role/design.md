# Design

## Decisions

1. **身分跟著案件，不跟著帳號**：`Role` 只剩 `MEMBER`、`ADMIN`。發案方＝`Job.client`；之後的應徵記錄會有接案者欄位。權限判斷改看「你是不是這個案子的發案方／接案者」。
2. **評價與信用評分之後分兩組**：接案評價（別人雇用你）與發案評價（你雇用別人）分開計算，不混在一起。
3. **舊資料轉換（RoleColumnMigration）**：Hibernate 6 在 MySQL 會把 `@Enumerated(STRING)` 建成 `ENUM('ADMIN','CLIENT','FREELANCER')` 欄位，`ddl-auto=update` 不會修改既有欄位型別，直接改 enum 會讓舊帳號讀不出來、新帳號寫不進去。因此：
   - `User.role` 加 `@JdbcTypeCode(SqlTypes.VARCHAR)`，之後新增角色不再受 ENUM 限制。
   - 啟動時若資料庫是 MySQL 且 `users.role` 仍是 ENUM，執行 `ALTER TABLE users MODIFY role VARCHAR(20) NOT NULL`；接著把 `FREELANCER`／`CLIENT` 更新為 `MEMBER`。兩步都可重複執行。
   - H2（開發與測試）每次都是新建資料庫，不需轉換。
4. **註冊夾帶 role 直接忽略**：Spring Boot 預設忽略未知 JSON 欄位，帳號一律是 MEMBER，不必回 400。

## Risks / Trade-offs

- [轉換在應用程式啟動後才執行，啟動瞬間若有請求讀到舊值會失敗] → 免費方案流量極低且部署期間 Render 不導流量，可接受；之後導入 Flyway 時改為正式 migration。
- [日後若需要「只看接案者」的列表] → 以是否有作品集或接案紀錄篩選，而非帳號身分。
