# Design

## Decisions

1. **權限檢查放在 service**：讀資料庫裡的最新角色判斷是否為發案方，回 403；未登入由 Spring Security 回 401。
2. **我的案件用 `/api/me/jobs`**：避免與 `/api/jobs/{id}` 路徑衝突，也讓「GET /api/jobs/** 公開」的規則保持單純。
3. **驗收標準用 `@ElementCollection`**：存成 `job_acceptance_items` 子表並保留順序；目前不需要對單一項目做額外操作，不必獨立成實體。
4. **預算用區間**：發案方常給範圍；查詢「最高預算 X」等於篩出預算下限 ≤ X 的案件，「最低預算 Y」篩出預算上限 ≥ Y。
5. **權利歸屬兩種**：`CLIENT_OWNS`（著作財產權歸發案方）、`FREELANCER_LICENSES`（接案者保留、授權發案方使用），另以 `portfolioAllowed` 表示接案者能否放作品集；對應合約審查中的智財條款。
6. **前端沒有後端時用示範資料**：GitHub Pages 展示仍看得到案件列表，並標明是示範資料。

## Risks / Trade-offs

- [關鍵字用 LIKE 查詢，資料量大會慢] → 專題規模足夠；之後可改全文檢索。
- [列表暫不分頁，最多回 100 筆] → 之後資料多再加分頁。
