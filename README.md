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
  src/pages/         頁面（含 Login / Register / Account）
  src/api/client.js  呼叫後端的共用函式
  src/auth/          登入狀態（AuthContext）
server/              Spring Boot 後端
  src/main/java/tw/freelancefair/
    auth/            註冊、登入 API
    user/            User 實體與資料表
    security/        JWT、Spring Security 設定
    common/          統一錯誤格式
  src/test/          MockMvc 測試（對應 OpenSpec 的 Scenario）
openspec/changes/add-web-demo/     Demo 的 OpenSpec 規格
openspec/changes/add-member-auth/  會員註冊／登入規格
.github/workflows/deploy.yml       GitHub Pages 自動部署
.github/workflows/server-ci.yml    後端測試
```

## 雲端版

- 網站：<https://s845taiwan.github.io/freelance-fair-platform/>
- 後端：<https://freelance-fair-platform.onrender.com>（Render 免費方案，Docker 部署）
- 資料庫：Aiven 免費 MySQL

免費主機閒置 15 分鐘會休眠，第一次開啟要等約 1 分鐘，展示前先打開一次網站。
Render 的環境變數：`SPRING_PROFILES_ACTIVE=mysql`、`DB_URL`、`DB_USER`、`DB_PASSWORD`、`JWT_SECRET`（規格與說明見 `openspec/changes/add-cloud-deployment/`）。
GitHub Actions 的 **Cloud smoke test** 每天會實際呼叫雲端後端檢查一次，也可以在 Actions 頁面手動執行。

## 會員系統（Spring Boot 後端）

`server/` 是正式版後端，目前完成 **會員註冊／登入**、**刊登與查詢案件**（規格：`openspec/changes/add-member-auth/`、`add-job-posting/`）。

| API | 說明 |
|---|---|
| `POST /api/auth/register` | 註冊：`{email, password, displayName}`，不選身分，同一帳號可發案也可接案 |
| `POST /api/auth/login` | 登入：回傳 `{token, user}` |
| `GET /api/auth/me` | 帶 `Authorization: Bearer <token>`，回傳自己的資料 |
| `GET /api/health` | 後端是否啟動 |
| `POST /api/jobs` | 刊登案件（需登入，刊登者即該案發案方） |
| `GET /api/jobs` | 公開案件列表，可帶 `category`、`keyword`、`minBudget`、`maxBudget` |
| `GET /api/jobs/{id}` | 案件詳情 |
| `GET /api/me/jobs` | 我刊登的案件 |
| `GET` / `PUT /api/me/profile` | 我的資料：顯示名稱、自我介紹、技能、開放接案 |
| `POST /api/me/portfolio`、`DELETE /api/me/portfolio/{id}` | 新增／刪除作品 |
| `GET /api/members` | 找接案者（只列開放接案），可帶 `keyword`、`skill` |
| `GET /api/members/{id}` | 會員公開檔案（不含 Email） |

完整需求進度見 [`docs/requirements.md`](docs/requirements.md)（對照專題簡報的需求描述）。

### 第一次安裝（電腦什麼都沒有的話）

1. **Node.js LTS**：<https://nodejs.org> 下載安裝（前端用）
2. **IntelliJ IDEA Community**（免費）：<https://www.jetbrains.com/idea/download/>
   內建 Maven，也能直接幫你下載 JDK，不用另外裝 Java。
3. **Git**：<https://git-scm.com>，然後 `git clone https://github.com/S845Taiwan/freelance-fair-platform.git`

### 在本機啟動後端

1. IntelliJ → Open → 選 `server` 資料夾（裡面有 `pom.xml`）
2. 右上角若提示缺 JDK：File → Project Structure → SDK → Download JDK → 選 **21**（Temurin）
3. 打開 `src/main/java/tw/freelancefair/FairGigApplication.java`，按 `main` 旁的綠色 ▶
4. 看到 `Started FairGigApplication` 就好了，打開 <http://localhost:8080/api/health> 應顯示 `{"status":"ok"}`

預設用 **H2 記憶體資料庫**，不用裝 MySQL；缺點是重開後帳號會清空。
資料庫內容可在 <http://localhost:8080/h2-console> 查看（JDBC URL：`jdbc:h2:mem:fairgig`，帳號 `sa`，密碼留空）。

### 前後端一起跑

後端開著，另開終端機：

```bash
cd web
npm install
npm run dev
```

打開 <http://localhost:5173>，右上角「登入／註冊」。Vite 會把 `/api` 轉給 `localhost:8080`。

> GitHub Pages 上的展示版沒有後端，登入頁會顯示「後端尚未連線」，這是正常的。

### 改用 MySQL（之後部署／報告展示用）

有 Docker 的話：`cd server && docker compose up -d`，然後用 `mysql` profile 啟動
（IntelliJ：Run → Edit Configurations → Active profiles 填 `mysql`）。
沒有 Docker 就裝 MySQL 8，建立資料庫 `fairgig` 與使用者 `fairgig`／`fairgig123`。

### 測試

IntelliJ 對 `src/test` 按右鍵 → Run Tests。每次 push 到 GitHub，**Server CI** 也會自動跑測試，並實際啟動一次後端。

## 下一步

- ~~會員註冊／登入~~（完成）
- ~~刊登與查詢案件~~（完成）
- ~~會員中心：修改資料、作品集、接案者公開檔案~~（完成）
- 應徵與選擇接案者（下一個 OpenSpec change）
- 合約、里程碑 REST API ＋ MySQL
- 合約審查改呼叫 LLM API，輸出維持 `reviewContract()` 的格式
- 第三方金流沙箱串接託管與撥款
