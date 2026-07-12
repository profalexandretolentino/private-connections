/**
 * ==========================================
 * Private Connections
 * EmailService.gs
 * ==========================================
 */

/**
 * Envia a notificação por e-mail.
 */
function sendConnectionEmail(payload) {
  try {
    const environmentLabel =
      CONFIG.environment === "production"
        ? ""
        : "[DEV] ";

    const subject =
      `${environmentLabel}❤️ Private Connection Requested`;

    const body =
`${environmentLabel}Private Connection requested.

Connection ID:
${payload.connectionId}

Date:
${formatDate(payload.timestamp)}

Message:
${payload.message || "(No message)"}

Attachment:
${payload.attachmentType}

File:
${payload.fileName || "(No file)"}

Drive link:
${payload.driveUrl || "(No Drive file)"}

Stats:
Total connections:
${payload.stats.totalConnections}

First connection:
${payload.stats.firstConnection}

Last connection:
${payload.stats.lastConnection}

Something special may happen...`;

    MailApp.sendEmail(
      CONFIG.emailTo,
      subject,
      body
    );

    return true;
  } catch (error) {
    logError("EMAIL", error);
    return false;
  }
}

/**
 * Testa o envio de e-mail no ambiente atual.
 */
function testEmail() {
  const result = sendConnectionEmail({
    connectionId: "DEV-EMAIL-TEST",
    timestamp: new Date(),
    message: "Email service test.",
    attachmentType: "No attachment",
    fileName: "",
    driveUrl: "",
    stats: {
      totalConnections: 0,
      firstConnection: "--",
      lastConnection: "--"
    }
  });

  Logger.log(
    "Email sent: " + result
  );
}