# Proposal

## Why

簡報需求 C2（發案方刊登案件並填寫驗收標準、修改次數上限與權利歸屬）、V1、V2（訪客瀏覽與查詢案件）是後續應徵、簽約、里程碑的起點。目前刊登頁只是前端示範，資料不會保存。

## What Changes

- 後端新增案件（Job）資料表與 API：刊登（限發案方）、公開列表與查詢、案件詳情、我的案件。
- 刊登必填：標題、類別、需求描述、預算區間、截止日、修改次數上限、權利歸屬、驗收標準（1–20 項）。
- 前端新增案件列表頁（類別／預算／關鍵字篩選）與詳情頁；刊登頁改為送到後端；帳號頁顯示我的案件。
- 不包含：編輯／下架案件、應徵（後續 change）。

## Capabilities

### New Capabilities
- `job-posting`: 發案方刊登案件；任何人可瀏覽與依類別、預算、關鍵字查詢公開案件。

### Modified Capabilities
（無）

## Impact

- `server/`：新增 `job` 套件、SecurityConfig 開放 GET 案件 API。
- `web/`：新增 Jobs、JobDetail 頁，修改 PostJob、Account、導覽列。
