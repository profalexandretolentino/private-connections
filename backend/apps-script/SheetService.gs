/**
 * ==========================================
 * Private Connections
 * SheetService.gs
 * ==========================================
 */

/**
 * Abre a aba Connections configurada no ambiente atual.
 */
function getConnectionsSheet() {
  const spreadsheet = SpreadsheetApp.openById(
    CONFIG.spreadsheetId
  );

  const sheet = spreadsheet.getSheetByName(
    CONFIG.sheetName
  );

  if (!sheet) {
    throw new Error(
      `Sheet "${CONFIG.sheetName}" was not found.`
    );
  }

  return sheet;
}

/**
 * Retorna o próximo ID numérico.
 *
 * A linha 1 contém os cabeçalhos.
 * Portanto, com apenas o cabeçalho, o primeiro ID será 1.
 */
function getNextConnectionId(sheet) {
  return Math.max(1, sheet.getLastRow());
}

/**
 * Insere uma conexão na planilha.
 *
 * Retorna o número da linha criada.
 */
function appendConnection(sheet, connection) {
  sheet.appendRow([
    connection.id,
    connection.timestamp,
    connection.title,
    connection.message,
    connection.attachmentType,
    connection.fileName,
    connection.driveUrl,
    connection.visitorId,
    connection.timezone,
    connection.userAgent,
    connection.page,
    connection.status,
    connection.connectionId,
    connection.emailSent,
    connection.telegramSent
  ]);

  return sheet.getLastRow();
}

/**
 * Atualiza o resultado do envio por e-mail e Telegram.
 *
 * Coluna N = Email Sent
 * Coluna O = Telegram Sent
 */
function updateNotificationStatus({
  sheet,
  rowNumber,
  emailSent,
  telegramSent
}) {
  sheet
    .getRange(rowNumber, 14)
    .setValue(emailSent ? "YES" : "NO");

  sheet
    .getRange(rowNumber, 15)
    .setValue(telegramSent ? "YES" : "NO");
}

/**
 * Calcula as três estatísticas exibidas no frontend.
 */
function getConnectionStats(sheet) {
  const lastRow = sheet.getLastRow();

  if (lastRow <= 1) {
    return emptyConnectionStats();
  }

  const timestamps = sheet
    .getRange(
      2,
      2,
      lastRow - 1,
      1
    )
    .getValues()
    .flat()
    .filter(Boolean);

  if (timestamps.length === 0) {
    return emptyConnectionStats();
  }

  return {
    totalConnections: timestamps.length,
    firstConnection: formatDate(timestamps[0]),
    lastConnection: formatDate(
      timestamps[timestamps.length - 1]
    )
  };
}

/**
 * Retorno padrão para uma base ainda vazia.
 */
function emptyConnectionStats() {
  return {
    totalConnections: 0,
    firstConnection: "--",
    lastConnection: "--"
  };
}

/**
 * Testa o acesso à planilha de desenvolvimento.
 */
function testSheetConnection() {
  const sheet = getConnectionsSheet();

  Logger.log(
    "Sheet connected: " + sheet.getName()
  );

  Logger.log(
    "Current rows: " + sheet.getLastRow()
  );

  const stats = getConnectionStats(sheet);

  Logger.log(
    "Total connections: " +
    stats.totalConnections
  );

  Logger.log(
    "First connection: " +
    stats.firstConnection
  );

  Logger.log(
    "Last connection: " +
    stats.lastConnection
  );
}