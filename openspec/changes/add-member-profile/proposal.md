# Proposal

## Why

簡報需求 F1（接案者修改基本資料與作品集）、C1（發案方修改基本資料）、V3（訪客查看接案者公開檔案與作品集）、V4（訪客查詢接案者）。目前「挑選接案者」頁是寫死的假資料，會員也無法修改任何資料。這也是之後「應徵」與「選擇接案者」的前提：發案方要能看到應徵者的檔案。

## What Changes

- 會員可修改顯示名稱、自我介紹、技能標籤，並切換「開放接案」。
- 會員可新增、刪除作品集項目（標題、說明、選填連結）。
- 任何人可查看會員公開檔案（不含 Email）。
- 任何人可查詢「開放接案」的會員，依關鍵字或技能篩選。
- 前端：帳號頁改為會員中心；「挑選接案者」改為真實查詢；新增公開檔案頁；案件詳情的發案方名稱可點進檔案。原本的信用評分示範移到獨立頁面保留。
- 不包含：頭像上傳、作品集圖片上傳、評價（後續 change）。

## Capabilities

### New Capabilities
- `member-profile`: 會員個人資料與作品集維護、公開檔案、接案者查詢。

### Modified Capabilities
（無）

## Impact

- `server/`：`User` 新增 bio、skills、openForWork；新增 `PortfolioItem` 實體與 `profile` 套件；SecurityConfig 開放 GET 會員 API。
- `web/`：Account、Freelancers 頁改寫；新增 MemberProfile 頁。
- 資料庫：`users` 新增欄位、新增 `user_skills`、`portfolio_items` 表（`ddl-auto=update` 自動建立）。
