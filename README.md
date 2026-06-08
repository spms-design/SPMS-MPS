# SPMS-MPS

赣州市奥凡贸易有限公司排产实时确认系统。

## 数据同步

- 前端使用 Firebase Firestore 文档 `spms/mps-master-production-schedule` 做多人实时同步。
- 每次保存会把完整数据快照发送到 Google Apps Script Web App，并备份到 `MPS — Master Production Schedule` 表格。
- Firestore 规则按需求设置为公开读写：知道网页地址的人都可以进入页面修改数据。

## 部署前配置

1. 在 Firebase 项目 `spms-bom` 中创建 Web App。
2. 将 Firebase Web 配置填入 `index.html` 的 `FIREBASE_CONFIG`。
3. 在 Firestore 中发布 `firebase.rules` 中的规则。
4. 打开 Google 表格 `MPS — Master Production Schedule`，进入 Apps Script，粘贴 `google-apps-script.js`。
5. 将 Apps Script 部署为 Web App，访问权限选择 Anyone，然后把 Web App URL 填入 `index.html` 的 `GOOGLE_SHEETS_WEBAPP_URL`。
6. 将仓库 `SPMS-MPS` 导入 Vercel，框架选择 Other / Static。
