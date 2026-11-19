# Design

## Decisions

1. **Render＋Docker**：Render 沒有內建 Java 執行環境，用多階段 Dockerfile（Maven 建置 → JRE 執行）。免費方案 512MB RAM，以 `-XX:MaxRAMPercentage=70 -XX:+UseSerialGC` 控制記憶體。
2. **Aiven MySQL 而非 Render Postgres**：專題技術選型是 MySQL；Aiven 免費方案不需信用卡、不會到期。Render 免費服務檔案系統是暫時的，不能沿用 H2。
3. **環境變數**：`SPRING_PROFILES_ACTIVE=mysql`、`DB_URL`（`jdbc:mysql://…?sslMode=REQUIRED`）、`DB_USER`、`DB_PASSWORD`、`JWT_SECRET`（Render 產生）。`mysql` profile 的 `app.jwt.secret` 沒有預設值，缺少即啟動失敗。
4. **連線池 5 條**：免費資料庫連線數有限。
5. **驗證方式**：Server CI 確認 Docker 映像檔可建置；`Cloud smoke test` 從 GitHub Actions 對雲端後端跑健康檢查、CORS 預檢、註冊→登入→取得自己→查詢案件，可手動執行，也每天自動跑一次。

## Risks / Trade-offs

- [免費方案閒置 15 分鐘休眠，喚醒約 1 分鐘] → 前端顯示提示；展示前先開一次網站喚醒。
- [Render 免費時數 750 小時／月由同帳號所有免費服務共用] → 帳號內其他免費服務需留意時數。
- [CI 冒煙測試會在正式資料庫留下測試帳號 `smoke*@example.com`] → 之後管理員後台完成時可批次清除。
