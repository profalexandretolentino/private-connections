const SPREADSHEET_ID = "sua-planilha-bd";

const CONFIG = {
  sheetName: "Connections",
  emailTo: "your-email",

  telegramToken: "your-token",
  telegramChatId: "10digit",

  rootFolderName: "private-connections",
  imagesFolderName: "img",
  videosFolderName: "video",
  audioFolderName: "audio"
};

function doGet(e) {
  const params = e && e.parameter ? e.parameter : {};
  const event = params.event || "";

  if (event !== "connect_clicked") {
    return ContentService
      .createTextOutput(JSON.stringify({
        status: "ignored",
        event: event
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  const result = saveConnection(params);

  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

function getSheet() {
  return SpreadsheetApp
    .openById(SPREADSHEET_ID)
    .getSheetByName(CONFIG.sheetName);
}

function saveConnection(data) {
  const sheet = getSheet();
  getOrCreateFolders();

  const lastRow = sheet.getLastRow();
  const nextId = lastRow;
  const connectionId = "PC-" + String(nextId).padStart(6, "0");
  const timestamp = new Date();

  const message = data.message || "";
  const hasFile = data.hasFile || "no";
  const fileName = data.fileName || "";
  const fileType = data.fileType || "";
  const attachmentType = getAttachmentType(fileType, hasFile);

  sheet.appendRow([
    nextId,
    timestamp,
    "Private connection",
    message,
    attachmentType,
    fileName,
    "",
    data.visitorId || "",
    data.timezone || "",
    data.userAgent || "",
    data.page || "",
    "SUCCESS",
    connectionId,
    "PENDING",
    "PENDING"
  ]);

  const stats = getStats(sheet);

  const emailSent = sendEmailNotification({
    connectionId,
    timestamp,
    message,
    attachmentType,
    fileName,
    stats
  });

function sendTelegramNotification(payload) {
  try {
    const url = `https://api.telegram.org/bot${CONFIG.telegramToken}/sendMessage`;

    const message =
`❤️ Private Connections

A new private connection has arrived.

🆔 ${payload.connectionId}
📅 ${formatDate(payload.timestamp)}

💌 Message:
${payload.message || "(No message)"}

📎 Attachment:
${payload.attachmentType}
${payload.fileName || ""}

📊 Stats:
Total connections: ${payload.stats.totalConnections}
First connection: ${payload.stats.firstConnection}
Last connection: ${payload.stats.lastConnection}

Something special may happen...`;

    const response = UrlFetchApp.fetch(url, {
      method: "post",
      payload: {
        chat_id: CONFIG.telegramChatId,
        text: message
      },
      muteHttpExceptions: true
    });

    Logger.log("Telegram response code: " + response.getResponseCode());
    Logger.log("Telegram response body: " + response.getContentText());

    return response.getResponseCode() === 200;
  } catch (error) {
    Logger.log("Telegram error: " + error);
    return false;
  }
}

  const row = sheet.getLastRow();
  sheet.getRange(row, 14).setValue(emailSent ? "YES" : "NO");
  sheet.getRange(row, 15).setValue(telegramSent ? "YES" : "NO");

  return {
    status: "success",
    connectionId,
    totalConnections: stats.totalConnections,
    firstConnection: stats.firstConnection,
    lastConnection: stats.lastConnection
  };
}

function getAttachmentType(fileType, hasFile) {
  if (hasFile !== "yes") return "No attachment";
  if (fileType.startsWith("image/")) return "Image";
  if (fileType.startsWith("video/")) return "Video";
  if (fileType.startsWith("audio/")) return "Audio";
  return "File";
}

function getStats(sheet) {
  const lastRow = sheet.getLastRow();

  if (lastRow <= 1) {
    return {
      totalConnections: 0,
      firstConnection: "--",
      lastConnection: "--"
    };
  }

  const timestamps = sheet
    .getRange(2, 2, lastRow - 1, 1)
    .getValues()
    .flat()
    .filter(Boolean);

  return {
    totalConnections: timestamps.length,
    firstConnection: formatDate(timestamps[0]),
    lastConnection: formatDate(timestamps[timestamps.length - 1])
  };
}

function formatDate(date) {
  return Utilities.formatDate(
    new Date(date),
    Session.getScriptTimeZone(),
    "MMM dd, yyyy, hh:mm a"
  );
}

function sendEmailNotification(payload) {
  try {
    const subject = "❤️ Private Connection Requested";

    const body =
`Private Connection requested.

Connection ID: ${payload.connectionId}
Date: ${formatDate(payload.timestamp)}

Message:
${payload.message || "(No message)"}

Attachment:
${payload.attachmentType}
${payload.fileName || ""}

Stats:
Total connections: ${payload.stats.totalConnections}
First connection: ${payload.stats.firstConnection}
Last connection: ${payload.stats.lastConnection}

Something special may happen...`;

    MailApp.sendEmail(CONFIG.emailTo, subject, body);
    return true;
  } catch (error) {
    return false;
  }
}

function getOrCreateFolders() {
  const root = getOrCreateFolder(CONFIG.rootFolderName);

  return {
    root,
    images: getOrCreateFolder(CONFIG.imagesFolderName, root),
    videos: getOrCreateFolder(CONFIG.videosFolderName, root),
    audio: getOrCreateFolder(CONFIG.audioFolderName, root)
  };
}

function getOrCreateFolder(name, parent) {
  const folderIterator = parent
    ? parent.getFoldersByName(name)
    : DriveApp.getFoldersByName(name);

  if (folderIterator.hasNext()) {
    return folderIterator.next();
  }

  return parent ? parent.createFolder(name) : DriveApp.createFolder(name);
}

function sendTelegramNotification(payload) {
  try {
    const url = `https://api.telegram.org/bot${CONFIG.telegramToken}/sendMessage`;

    const message =
`❤️ Private Connections

A new private connection has arrived.

🆔 ${payload.connectionId}
📅 ${formatDate(payload.timestamp)}

💌 Message:
${payload.message || "(No message)"}

📎 Attachment:
${payload.attachmentType}
${payload.fileName || ""}

📊 Stats:
Total connections: ${payload.stats.totalConnections}
First connection: ${payload.stats.firstConnection}
Last connection: ${payload.stats.lastConnection}

Something special may happen...`;

    const response = UrlFetchApp.fetch(url, {
      method: "post",
      payload: {
        chat_id: CONFIG.telegramChatId,
        text: message
      },
      muteHttpExceptions: true
    });

    return response.getResponseCode() === 200;
  } catch (error) {
    return false;
  }
}

function testTelegram() {
  const ok = sendTelegramNotification({
    connectionId: "TEST-000001",
    timestamp: new Date(),
    message: "Telegram test from Private Connections",
    attachmentType: "No attachment",
    fileName: "",
    stats: {
      totalConnections: 0,
      firstConnection: "--",
      lastConnection: "--"
    }
  });

  Logger.log("Telegram sent: " + ok);
}

function testTelegramDirect() {
  const url = `https://api.telegram.org/bot${CONFIG.telegramToken}/sendMessage`;

  const response = UrlFetchApp.fetch(url, {
    method: "post",
    payload: {
      chat_id: "7610764460",
      text: "✅ Private Connections Telegram test"
    },
    muteHttpExceptions: true
  });

  Logger.log(response.getResponseCode());
  Logger.log(response.getContentText());
}