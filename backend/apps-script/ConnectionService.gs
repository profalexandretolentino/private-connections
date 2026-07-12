/**
 * ==========================================
 * Private Connections
 * ConnectionService.gs
 * ==========================================
 */

/**
 * Cria e registra uma nova conexão.
 *
 * Fluxo:
 * 1. Valida os dados.
 * 2. Salva o anexo no Drive, quando existir.
 * 3. Registra a conexão na planilha.
 * 4. Calcula as estatísticas.
 * 5. Envia e-mail.
 * 6. Envia Telegram.
 * 7. Atualiza os status na planilha.
 * 8. Retorna os dados ao frontend.
 */
function createConnection(data) {
  const sheet = getConnectionsSheet();
  const storageFolders = getStorageFolders();

  const timestamp = new Date();

  const numericId = getNextConnectionId(sheet);
  const connectionId = formatConnectionId(numericId);

  const message = String(
    data.message || ""
  ).trim();

  let attachment = {
    type: "No attachment",
    fileName: "",
    driveUrl: "",
    saved: false
  };

  if (
    data.attachment &&
    data.attachment.base64
  ) {
    attachment = saveAttachment({
      attachment: data.attachment,
      folders: storageFolders,
      timestamp
    });
  }

  const connection = {
    id: numericId,
    timestamp,
    title: "Private connection",
    message,

    attachmentType: attachment.type,
    fileName: attachment.fileName,
    driveUrl: attachment.driveUrl,

    visitorId: data.visitorId || "",
    timezone: data.timezone || "",
    userAgent: data.userAgent || "",
    page: data.page || "",

    status: "SUCCESS",
    connectionId,

    emailSent: "PENDING",
    telegramSent: "PENDING"
  };

  const rowNumber = appendConnection(
    sheet,
    connection
  );

  const stats = getConnectionStats(sheet);

  const notificationPayload = {
    connectionId,
    timestamp,
    message,

    attachmentType: attachment.type,
    fileName: attachment.fileName,
    driveUrl: attachment.driveUrl,

    stats
  };

  const emailSent = sendConnectionEmail(
    notificationPayload
  );

  const telegramSent = sendConnectionTelegram(
    notificationPayload
  );

  updateNotificationStatus({
    sheet,
    rowNumber,
    emailSent,
    telegramSent
  });

  return {
    status: "success",
    environment: CONFIG.environment,

    connectionId,

    emailSent,
    telegramSent,

    attachmentSaved: attachment.saved,
    attachmentType: attachment.type,
    fileName: attachment.fileName,
    driveUrl: attachment.driveUrl,

    totalConnections:
      stats.totalConnections,

    firstConnection:
      stats.firstConnection,

    lastConnection:
      stats.lastConnection
  };
}

/**
 * Cria uma conexão de teste sem anexo.
 *
 * Essa função grava de verdade no banco DEV,
 * envia e-mail e envia Telegram.
 */
function testCreateConnection() {
  validateConfiguration();

  const result = createConnection({
    event: "connect_clicked",

    message:
      "Complete modular backend test.",

    visitorId:
      "development-test",

    timezone:
      "America/Sao_Paulo",

    userAgent:
      "Apps Script manual test",

    page:
      "private-connections-backend-dev",

    attachment:
      null
  });

  Logger.log(
    JSON.stringify(result, null, 2)
  );
}