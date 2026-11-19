# Design

## Decisions

1. **「開放接案」開關取代帳號身分**：延續 `unify-member-role`，任何會員打開開關就會出現在「找接案者」；發案不需要開關。
2. **技能用 `@ElementCollection`（`user_skills`）**：只需要字串清單與查詢比對，不需獨立實體；儲存前 trim、去除大小寫重複。查詢以 join＋distinct 比對 `lower(skill)`。
3. **作品集獨立成 `PortfolioItem` 實體**：之後要加圖片、排序、刪除單一項目，用實體較好處理。
4. **連結只允許 http(s)**：前端會把連結放在 `<a href>`，限制協定可避免 `javascript:` 之類的 XSS。
5. **刪除別人的作品回 404 而非 403**：不透露該 id 是否存在。
6. **公開檔案不含 Email**：聯絡一律透過平台（之後的應徵與訊息功能）。
7. **API**：`GET/PUT /api/me/profile`、`POST /api/me/portfolio`、`DELETE /api/me/portfolio/{id}`、`GET /api/members?keyword=&skill=`、`GET /api/members/{id}`。

## Risks / Trade-offs

- [`users` 新增 NOT NULL 欄位 `open_for_work`] → MySQL `ALTER TABLE ADD COLUMN` 會以預設值 0 填入既有資料，舊帳號預設不開放接案。
- [列表暫不分頁，最多 100 筆] → 與案件列表相同，之後再加分頁。
- [信用評分示範頁不在簡報需求內] → 移到 `/freelancers/score-demo` 保留，正式評分等評價功能（C7）完成後再做。
