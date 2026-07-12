/**
 * ==========================================
 * Private Connections
 * Config.gs
 * ==========================================
 */
 
const SCRIPT_PROPERTIES =
  PropertiesService.getScriptProperties();

const CONFIG = {
  environment:
    SCRIPT_PROPERTIES.getProperty("ENVIRONMENT") ||
    "development",

  spreadsheetId:
    SCRIPT_PROPERTIES.getProperty("SPREADSHEET_ID") ||
    "",

  storageFolderId:
    SCRIPT_PROPERTIES.getProperty("STORAGE_FOLDER_ID") ||
    "",

  emailTo:
    SCRIPT_PROPERTIES.getProperty("EMAIL_TO") ||
    "",

  telegramToken:
    SCRIPT_PROPERTIES.getProperty("TELEGRAM_TOKEN") ||
    "",

  telegramChatId:
    SCRIPT_PROPERTIES.getProperty("TELEGRAM_CHAT_ID") ||
    "",

  sheetName: "Connections",

  folders: {
    images: "img",
    videos: "video",
    audio: "audio"
  },

  maxFileSize: 8 * 1024 * 1024,

  timezone: "America/Sao_Paulo"
};

function validateConfiguration() {
  const requiredProperties = [
    "spreadsheetId",
    "storageFolderId",
    "emailTo",
    "telegramToken",
    "telegramChatId"
  ];

  const missingProperties =
    requiredProperties.filter(
      (propertyName) => !CONFIG[propertyName]
    );

  if (missingProperties.length > 0) {
    throw new Error(
      "Missing configuration: " +
      missingProperties.join(", ")
    );
  }
}