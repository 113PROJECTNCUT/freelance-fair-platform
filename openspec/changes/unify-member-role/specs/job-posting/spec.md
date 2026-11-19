# Spec Delta

## MODIFIED Requirements

### Requirement: 刊登案件
系統 SHALL 允許任何已登入會員刊登案件，內容包含標題、類別、需求描述、預算下限與上限、截止日、修改次數上限、權利歸屬與驗收標準；成功回傳 201 與案件資料，狀態為 `OPEN`，刊登者即為該案的發案方。

#### Scenario: 會員刊登成功
- **WHEN** 已登入的會員送出完整且合格的案件
- **THEN** 回傳 201，包含案件 id、狀態 OPEN、發案方名稱與驗收標準

#### Scenario: 未登入不能刊登
- **WHEN** 未登入者送出刊登
- **THEN** 回傳 401
