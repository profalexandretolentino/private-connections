/**
 * ==========================================
 * Private Connections
 * TelegramService.gs
 * ==========================================
 */

/**
 * Envia uma notificação para o Telegram.
 */
function sendConnectionTelegram(payload) {
  try {

    const url =
      "https://api.telegram.org/bot" +
      CONFIG.telegramToken +
      "/sendMessage";

    const environmentLabel =
      CONFIG.environment === "production"
        ? ""
        : "🧪 DEVELOPMENT\n\n";

    const message =
`${environmentLabel}❤️ Private Connections

A new private connection has arrived.

🆔 ${payload.connectionId}

📅 ${formatDate(payload.timestamp)}

💌 Message
${payload.message || "(No message)"}

📎 Attachment
${payload.attachmentType}

📄 File
${payload.fileName || "(No file)"}

🔗 Drive
${payload.driveUrl || "(No Drive file)"}

📊 Stats

Total:
${payload.stats.totalConnections}

First:
${payload.stats.firstConnection}

Last:
${payload.stats.lastConnection}

Something special may happen...`;

    const response = UrlFetchApp.fetch(url, {
      method: "post",
      payload: {
        chat_id: CONFIG.telegramChatId,
        text: message
      },
      muteHttpExceptions: true
    });

    const code = response.getResponseCode();

    Logger.log("Telegram HTTP: " + code);
    Logger.log(response.getContentText());

    return code === 200;

  } catch (error) {

    logError("TELEGRAM", error);

    return false;

  }
}

/**
 * Testa apenas o serviço do Telegram.
 */
function testTelegram() {

  const result =
    sendConnectionTelegram({

      connectionId: "DEV-TG-001",

      timestamp: new Date(),

      message:
        "Telegram Service Test",

      attachmentType:
        "No attachment",

      fileName: "",

      driveUrl: "",

      stats: {

        totalConnections: 0,

        firstConnection: "--",

        lastConnection: "--"

      }

    });

  Logger.log(
    "Telegram sent: " + result
  );

}