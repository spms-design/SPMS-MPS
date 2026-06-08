const SHEET_HEADERS = {
  "批次总表": ["批次ID", "批次名称", "批次编号", "入库日期"],
  "面料颜色": ["面料ID", "批次名称", "颜色", "色值", "米数", "公斤", "状态", "备注"],
  "面料可生产产品": ["批次名称", "面料颜色", "产品名称", "数量", "单位"],
  "月度日计划": ["计划ID", "月份", "日计划", "统一交货时间", "ETD", "ETA", "交货状态", "紧急", "备注"],
  "日计划产品": ["月份", "日计划", "交货状态", "紧急", "交货时间", "ETD", "ETA", "产品名称", "产品尺码", "产品颜色", "产品数量"],
  "产品SKU": ["SKUID", "SKU编号", "产品名称", "产品尺码", "产品颜色", "备注", "图片事项数"],
  "SKU图片事项": ["SKU编号", "产品名称", "图片", "标注信息"],
  "备份日志": ["备份时间", "来源", "原因", "批次数", "面料颜色数", "日计划数", "SKU数"]
};

function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ ok: true, service: "SPMS-MPS Sheets Backup" }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const payload = JSON.parse((e.postData && e.postData.contents) || "{}");
    const sheets = payload.sheets || {};
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    Object.keys(SHEET_HEADERS).forEach(name => {
      if (name === "备份日志") return;
      writeSheet_(ss, name, SHEET_HEADERS[name], sheets[name] || []);
    });

    appendLog_(ss, sheets["备份日志"] || [{
      "备份时间": new Date().toISOString(),
      "来源": payload.source || "SPMS-MPS",
      "原因": payload.reason || "save",
      "批次数": payload.summary?.batches || 0,
      "面料颜色数": payload.summary?.fabrics || 0,
      "日计划数": payload.summary?.planGroups || 0,
      "SKU数": payload.summary?.skus || 0
    }]);

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true, updatedAt: new Date().toISOString() }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(error) }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function writeSheet_(ss, name, headers, rows) {
  const sheet = ss.getSheetByName(name) || ss.insertSheet(name);
  sheet.clear();
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);

  if (rows.length) {
    const values = rows.map(row => headers.map(header => row[header] ?? ""));
    sheet.getRange(2, 1, values.length, headers.length).setValues(values);
  }

  formatSheet_(sheet, headers.length);
}

function appendLog_(ss, rows) {
  const name = "备份日志";
  const headers = SHEET_HEADERS[name];
  const sheet = ss.getSheetByName(name) || ss.insertSheet(name);
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    formatSheet_(sheet, headers.length);
  }

  const values = rows.map(row => headers.map(header => row[header] ?? ""));
  if (values.length) {
    sheet.getRange(sheet.getLastRow() + 1, 1, values.length, headers.length).setValues(values);
  }
}

function formatSheet_(sheet, columnCount) {
  const header = sheet.getRange(1, 1, 1, columnCount);
  header.setFontWeight("bold");
  header.setBackground("#111827");
  header.setFontColor("#ffffff");
  sheet.setFrozenRows(1);
  sheet.autoResizeColumns(1, columnCount);
}
