# Spec Delta

## Purpose

讓會員維護自己的資料與作品集，讓發案方與訪客能找到並了解接案者。

## ADDED Requirements

### Requirement: 修改基本資料
系統 SHALL 讓已登入會員查看並修改自己的顯示名稱（1–30 字）、自我介紹（最多 500 字）、技能標籤（最多 10 個，每個 1–20 字，重複者合併）與是否開放接案；未登入 MUST 回傳 401。

#### Scenario: 修改成功
- **WHEN** 會員送出新的顯示名稱、自我介紹、技能「React, Figma」並開放接案
- **THEN** 回傳 200 與更新後資料，之後取得目前使用者時顯示新名稱

#### Scenario: 技能太多
- **WHEN** 會員送出 11 個技能
- **THEN** 回傳 400，錯誤欄位為 skills

#### Scenario: 未登入
- **WHEN** 未登入者修改資料
- **THEN** 回傳 401

### Requirement: 作品集管理
系統 SHALL 讓會員新增作品集項目（標題 1–60 字、說明最多 500 字、選填連結），連結 MUST 以 `http://` 或 `https://` 開頭；每位會員最多 20 項；會員只能刪除自己的項目。

#### Scenario: 新增作品
- **WHEN** 會員新增標題「咖啡店官網」、連結 `https://example.com` 的作品
- **THEN** 回傳 201，作品出現在該會員的公開檔案

#### Scenario: 不合法連結
- **WHEN** 會員新增連結為 `javascript:alert(1)` 的作品
- **THEN** 回傳 400，錯誤欄位為 link

#### Scenario: 刪除別人的作品
- **WHEN** 會員刪除不屬於自己的作品 id
- **THEN** 回傳 404，作品不被刪除

### Requirement: 公開檔案
系統 SHALL 讓任何人（含訪客）以會員 id 查看公開檔案：顯示名稱、自我介紹、技能、是否開放接案、作品集與加入時間；公開檔案 MUST NOT 包含 Email；不存在回 404。

#### Scenario: 訪客查看檔案
- **WHEN** 訪客查看某會員的公開檔案
- **THEN** 回傳 200，包含作品集，不包含 email

### Requirement: 查詢接案者
系統 SHALL 讓任何人列出「開放接案」的會員，並可依關鍵字（比對顯示名稱與自我介紹）與技能（不分大小寫完全相符）篩選；未開放接案的會員 MUST NOT 出現在結果中。

#### Scenario: 依技能查詢
- **WHEN** 訪客以技能「figma」查詢
- **THEN** 結果只包含開放接案且技能含 Figma 的會員

#### Scenario: 未開放接案不出現
- **WHEN** 某會員關閉開放接案
- **THEN** 查詢接案者的結果不包含該會員
