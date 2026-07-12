/**
 * ==========================================
 * Private Connections
 * DashboardService.gs
 * ==========================================
 */

function getPublicDashboard(visitorId, limit) {
  const sheet = getConnectionsSheet();
  const lastRow = sheet.getLastRow();

  if (lastRow <= 1) {
    return {
      totalConnections: 0,
      firstConnection: "--",
      lastConnection: "--",
      history: []
    };
  }

  const rows = sheet
    .getRange(2, 1, lastRow - 1, 15)
    .getValues();

  const connections = rows
    .filter((row) => {
      const timestamp = row[1];
      const storedVisitorId = String(row[7] || "");

      const hasValidDate =
        timestamp instanceof Date &&
        !isNaN(timestamp.getTime());

      return (
        hasValidDate &&
        (!visitorId || storedVisitorId === visitorId)
      );
    })
    .map((row) => ({
      id: row[0],
      timestamp: row[1],
      title: String(row[2] || "Private connection"),
      attachmentType: String(
        row[4] || "No attachment"
      )
    }));

  if (connections.length === 0) {
    return {
      totalConnections: 0,
      firstConnection: "--",
      lastConnection: "--",
      history: []
    };
  }

  const safeLimit = Math.min(
    Math.max(Number(limit) || 6, 1),
    20
  );

  const history = connections
    .slice(-safeLimit)
    .reverse()
    .map((connection) => ({
      date: formatDate(connection.timestamp),
      title: getPublicMemoryTitle(
        connection.attachmentType
      ),
      attachmentType:
        connection.attachmentType,
      icon: getAttachmentIcon(
        connection.attachmentType
      )
    }));

  return {
    totalConnections: connections.length,

    firstConnection: formatDate(
      connections[0].timestamp
    ),

    lastConnection: formatDate(
      connections[
        connections.length - 1
      ].timestamp
    ),

    history
  };
}

function getPublicMemoryTitle(attachmentType) {
  switch (attachmentType) {
    case "Image":
      return "A new image was shared";

    case "Video":
      return "A new video was shared";

    case "Audio":
      return "A new audio memory was shared";

    default:
      return "Private connection";
  }
}

function getAttachmentIcon(attachmentType) {
  switch (attachmentType) {
    case "Image":
      return "📷";

    case "Video":
      return "🎥";

    case "Audio":
      return "🎵";

    default:
      return "💌";
  }
}