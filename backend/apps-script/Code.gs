const SPREADSHEET_ID =
  "1YrekGjHBKmdlOmV092YrvP9IuJFq6k5P1bhsN7beOB4";

const CONFIG = {
  sheetName: "Connections",
  emailTo: "job.ale@gmail.com",
  telegramToken: "COLE_SEU_TOKEN_AQUI",
  telegramChatId: "7610764460",
  rootFolderName: "private-connections",
  imagesFolderName: "img",
  videosFolderName: "video",
  audioFolderName: "audio",
  maxFileSize: 8 * 1024 * 1024,
  timezone: "America/Sao_Paulo"
};

function doGet(e) {
  const params = e && e.parameter ? e.parameter : {};
  const event = params.event || "";

  if (event !== "connect_clicked") {
    return jsonResponse({ status: "ignored", event });
  }

  try {
    return jsonResponse(saveConnection(params));
  } catch (error) {
    Logger.log("GET ERROR: " + error.stack);
    return jsonResponse({ status: "error", message: String(error) });
  }
}

function doPost(e) {
  try {
    const rawBody = e && e.postData ? e.postData.contents : "{}";
    const data = JSON.parse(rawBody);

    if (data.event !== "connect_clicked") {
      return jsonResponse({
        status: "ignored",
        event: data.event || ""
      });
    }

    return jsonResponse(saveConnection(data));
  } catch (error) {
    Logger.log("POST ERROR: " + error.stack);
    return jsonResponse({ status: "error", message: String(error) });
  }
}

function saveConnection(data) {
  const sheet = getSheet();
  const folders = getOrCreateFolders();

  const lastRow = sheet.getLastRow();
  const nextId = Math.max(1, lastRow);
  const connectionId = "PC-" + String(nextId).padStart(6, "0");
  const timestamp = new Date();
  const message = String(data.message || "").trim();

  let attachmentType = "No attachment";
  let storedFileName = "";
  let driveUrl = "";
  let attachmentSaved = false;

  if (data.attachment && data.attachment.base64) {
    const savedAttachment = saveAttachment(
      data.attachment,
      folders,
      timestamp
    );

    attachmentType = savedAttachment.type;
    storedFileName = savedAttachment.fileName;
    driveUrl = savedAttachment.driveUrl;
    attachmentSaved = true;
  }

  sheet.appendRow([
    nextId,
    timestamp,
    "Private connection",
    message,
    attachmentType,
    storedFileName,
    driveUrl,
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

  const notificationPayload = {
    connectionId,
    timestamp,
    message,
    attachmentType,
    fileName: storedFileName,
    driveUrl,
    stats
  };

  const emailSent = sendEmailNotification(notificationPayload);
  const telegramSent = sendTelegramNotification(notificationPayload);

  const row = sheet.getLastRow();
  sheet.getRange(row, 14).setValue(emailSent ? "YES" : "NO");
  sheet.getRange(row, 15).setValue(telegramSent ? "YES" : "NO");

  return {
    status: "success",
    connectionId,
    emailSent,
    telegramSent,
    attachmentSaved,
    attachmentType,
    fileName: storedFileName,
    driveUrl,
    totalConnections: stats.totalConnections,
    firstConnection: stats.firstConnection,
    lastConnection: stats.lastConnection
  };
}

function getSheet() {
  const sheet = SpreadsheetApp
    .openById(SPREADSHEET_ID)
    .getSheetByName(CONFIG.sheetName);

  if (!sheet) {
    throw new Error(`Sheet "${CONFIG.sheetName}" not found.`);
  }

  return sheet;
}

function saveAttachment(attachment, folders, timestamp) {
  const mimeType = String(
    attachment.mimeType || "application/octet-stream"
  );

  const originalName = String(
    attachment.originalName || "attachment"
  );

  const declaredSize = Number(attachment.size || 0);

  if (declaredSize > CONFIG.maxFileSize) {
    throw new Error("Attachment exceeds the 8 MB limit.");
  }

  const bytes = Utilities.base64Decode(String(attachment.base64));

  if (bytes.length > CONFIG.maxFileSize) {
    throw new Error("Decoded attachment exceeds the 8 MB limit.");
  }

  const destination = getAttachmentDestination(mimeType, folders);
  const counter = countFiles(destination.folder) + 1;
  const extension = getFileExtension(originalName, mimeType);

  const datePart = Utilities.formatDate(
    timestamp,
    CONFIG.timezone,
    "yyyy-MM-dd_HH-mm-ss"
  );

  const fileName =
    `${datePart}_${destination.prefix}-${String(counter)
      .padStart(3, "0")}.${extension}`;

  const blob = Utilities.newBlob(bytes, mimeType, fileName);
  const file = destination.folder.createFile(blob);

  return {
    type: destination.label,
    fileName,
    driveUrl: file.getUrl()
  };
}

function getAttachmentDestination(mimeType, folders) {
  if (mimeType.startsWith("image/")) {
    return {
      folder: folders.images,
      label: "Image",
      prefix: "img"
    };
  }

  if (mimeType.startsWith("video/")) {
    return {
      folder: folders.videos,
      label: "Video",
      prefix: "video"
    };
  }

  if (mimeType.startsWith("audio/")) {
    return {
      folder: folders.audio,
      label: "Audio",
      prefix: "audio"
    };
  }

  throw new Error("Unsupported attachment type.");
}

function countFiles(folder) {
  const files = folder.getFiles();
  let total = 0;

  while (files.hasNext()) {
    files.next();
    total += 1;
  }

  return total;
}

function getFileExtension(originalName, mimeType) {
  const cleanName = originalName.split("?")[0];
  const lastDot = cleanName.lastIndexOf(".");

  if (lastDot > -1 && lastDot < cleanName.length - 1) {
    const extension = cleanName
      .slice(lastDot + 1)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");

    if (extension) {
      return extension;
    }
  }

  const mimeExtensions = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "video/mp4": "mp4",
    "video/webm": "webm",
    "audio/mpeg": "mp3",
    "audio/mp4": "m4a",
    "audio/wav": "wav",
    "audio/ogg": "ogg"
  };

  return mimeExtensions[mimeType] || "bin";
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
    CONFIG.timezone,
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

Drive link:
${payload.driveUrl || "(No Drive file)"}

Stats:
Total connections: ${payload.stats.totalConnections}
First connection: ${payload.stats.firstConnection}
Last connection: ${payload.stats.lastConnection}

Something special may happen...`;

    MailApp.sendEmail(CONFIG.emailTo, subject, body);
    return true;
  } catch (error) {
    Logger.log("EMAIL ERROR: " + error.stack);
    return false;
  }
}

function sendTelegramNotification(payload) {
  try {
    const url =
      "https://api.telegram.org/bot" +
      CONFIG.telegramToken +
      "/sendMessage";

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

🔗 Drive:
${payload.driveUrl || "(No Drive file)"}

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

    Logger.log("TELEGRAM CODE: " + response.getResponseCode());
    Logger.log("TELEGRAM BODY: " + response.getContentText());

    return response.getResponseCode() === 200;
  } catch (error) {
    Logger.log("TELEGRAM ERROR: " + error.stack);
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
  const folders = parent
    ? parent.getFoldersByName(name)
    : DriveApp.getFoldersByName(name);

  if (folders.hasNext()) {
    return folders.next();
  }

  return parent ? parent.createFolder(name) : DriveApp.createFolder(name);
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function testUploadConfiguration() {
  const folders = getOrCreateFolders();
  Logger.log("Root folder: " + folders.root.getName());
  Logger.log("Image folder: " + folders.images.getName());
  Logger.log("Video folder: " + folders.videos.getName());
  Logger.log("Audio folder: " + folders.audio.getName());
}
