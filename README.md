# 公平接案平台（Demo）

**具 AI 智慧合約風險審查之自由接案媒合平台** 的前端 Demo。
指導老師：廖文忠 老師｜組員：方瑞鈞、王宏哲、洪翊盛

> 示範版：AI 功能目前以瀏覽器端規則式引擎模擬，正式版將串接 Spring Boot 後端與大語言模型 API。

## 功能

| 頁面 | 角色 | 說明 |
|---|---|---|
| 刊登案件 | 發案方 | 需求描述 → AI 驗收清單，可增修後確認 |
| 挑選接案者 | 發案方 | 信用評分（準時 40％＋一次驗收 30％＋互評 20％＋爭議 10％）與明細 |
| 雙向合約健檢 | 雙方 | 逐條標示「對誰不利」、風險等級、白話說明、修改建議，並檢查缺漏條款 |
| 里程碑託管 | 雙方 | 分期託管、驗收／退回／仲裁流轉，撥款扣 6% 手續費 |

## 本機執行

```bash
cd web
npm install
npm run dev      # http://localhost:5173
npm test         # 引擎單元測試
npm run build    # 輸出到 web/dist
```

## 部署到 GitHub Pages

1. 在 GitHub 建立一個 **public** repo（例如 `freelance-fair-platform`）
2. 把這個資料夾 push 上去：
   ```bash
   git remote add origin https://github.com/<你的帳號>/freelance-fair-platform.git
   git push -u origin main
   ```
3. repo 的 **Settings → Pages → Build and deployment → Source** 選 **GitHub Actions**
4. 到 **Actions** 分頁等「Deploy demo to GitHub Pages」跑完（約 1 分鐘）
5. 網址：`https://<你的帳號>.github.io/freelance-fair-platform/`

之後每次 push 到 main 都會自動「測試 → 建置 → 部署」，測試沒過就不會上線。

## 專案結構

```
web/
  src/engine/        規則式引擎（之後改由 Spring Boot + LLM 提供，輸出格式不變）
    contractReview.js  雙向合約審查
    checklist.js       需求轉驗收清單
    creditScore.js     信用評分
    engine.test.js     單元測試（對應 OpenSpec 的 Scenario）
  src/pages/         五個頁面
openspec/changes/add-web-demo/   這次 Demo 的 OpenSpec 規格
.github/workflows/deploy.yml     GitHub Pages 自動部署
```

## 下一步

- Spring Boot 後端：會員、案件、合約、里程碑 REST API ＋ MySQL
- 合約審查改呼叫 LLM API，輸出維持 `reviewContract()` 的格式
- 第三方金流沙箱串接託管與撥款
