/**
 * ==========================================
 * Private Connections
 * Utils.gs
 * ==========================================
 */

/**
 * Retorna uma resposta JSON para o frontend.
 */
function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Formata datas no padrão do sistema.
 */
function formatDate(date) {
  return Utilities.formatDate(
    new Date(date),
    CONFIG.timezone,
    "MMM dd, yyyy, hh:mm a"
  );
}

/**
 * Registra erros no Apps Script.
 */
function logError(context, error) {
  const message =
    error && error.stack
      ? error.stack
      : String(error);

  Logger.log(`[${context}] ${message}`);
}

/**
 * Gera um ID no formato:
 * PC-000001
 */
function formatConnectionId(id) {
  return "PC-" + String(id).padStart(6, "0");
}

/**
 * Retorna a extensão de um arquivo.
 */
function getFileExtension(fileName) {
  if (!fileName) return "";

  const index = fileName.lastIndexOf(".");

  if (index === -1) return "";

  return fileName.substring(index + 1).toLowerCase();
}

/**
 * Verifica se o tamanho do arquivo está dentro do limite.
 */
function validateAttachmentSize(size) {
  if (size > CONFIG.maxFileSize) {
    throw new Error(
      "Attachment exceeds the maximum allowed size."
    );
  }
}

/**
 * Testa se a configuração foi carregada corretamente.
 */
function testConfiguration() {
  validateConfiguration();

  Logger.log("Environment: " + CONFIG.environment);
  Logger.log("Spreadsheet: " + CONFIG.spreadsheetId);
  Logger.log("Storage: " + CONFIG.storageFolderId);
  Logger.log("Email: " + CONFIG.emailTo);
  Logger.log("Telegram Chat: " + CONFIG.telegramChatId);

  return true;
}