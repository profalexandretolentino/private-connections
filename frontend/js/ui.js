import {
  $,
  escapeHtml,
  formatConnectionDate
} from "./utils.js";

import {
  getAttachmentLabel
} from "./upload.js";

export function showScreen(screenIds, screenId) {
  screenIds.forEach((id) => {
    const screen = $(id);

    if (screen) {
      screen.classList.toggle(
        "active",
        id === screenId
      );
    }
  });
}

export function updateDashboard(result) {
  if (
    result.totalConnections !== null &&
    result.totalConnections !== undefined
  ) {
    $("totalConnections").textContent =
      result.totalConnections;
  }

  if (
    result.firstConnection !== null &&
    result.firstConnection !== undefined
  ) {
    $("firstConnection").textContent =
      result.firstConnection;
  }

  if (
    result.lastConnection !== null &&
    result.lastConnection !== undefined
  ) {
    $("lastConnection").textContent =
      result.lastConnection;
  }
}

export function renderMemoryItem(memory) {
  const historyList = $("historyList");

  if (!historyList) return;

  const item = document.createElement("div");
  item.className = "history-item";

  item.innerHTML = `
    <strong>${escapeHtml(memory.date)}</strong>
    <span>❤️ ${escapeHtml(memory.title)}</span>
    <small>${escapeHtml(memory.message)}</small>
    <small>📎 ${escapeHtml(memory.attachment)}</small>
  `;

  historyList.prepend(item);
}

export function addLocalMemoryPreview(message, file) {
  renderMemoryItem({
    date: formatConnectionDate(),
    title: "Private connection",
    message: `“${message || "Connection requested."}”`,
    attachment: getAttachmentLabel(file)
  });
}

export function setConnectButtonLoading(isLoading) {
  const button = $("connectBtn");

  if (!button) return;

  button.disabled = isLoading;
  button.textContent = isLoading
    ? "SENDING..."
    : "CONNECT";
}

export function resetForm() {
  const message = $("heartMessage");
  const file = $("heartFile");

  if (message) {
    message.value = "";
  }

  if (file) {
    file.value = "";
  }
}

export function runConnectionSequence({
  screens,
  connectionDelay,
  loadingDelay
}) {
  const logs = $("logs");
  const bar = $("progressBar");
  const line = $("loadingLine");

  const steps = [
    [
      "Loading your private connection...",
      "Brazil region: online",
      18
    ],
    [
      "Opening a private channel...",
      "Japan region: online",
      38
    ],
    [
      "Checking distance...",
      "Distance: 16,000 km",
      56
    ],
    [
      "Looking for Alexandre...",
      "Searching for the best route",
      64
    ],
    [
      "Passing through the Philippines...",
      "Route found: attempting to establish connection",
      75
    ],
    [
      "Searching Alexandre instance...",
      "Status: Alexandre located",
      86
    ],
    [
      "Sending connection request...",
      "Request delivered",
      92
    ],
    [
      "Waiting for response...",
      "Do not close this window",
      100
    ]
  ];

  logs.innerHTML = "";
  bar.style.width = "0%";

  let index = 0;

  const timer = setInterval(() => {
    const [main, detail, progress] =
      steps[index];

    line.textContent = main;

    logs.innerHTML += `
      <div>✓ ${escapeHtml(detail)}</div>
    `;

    bar.style.width = `${progress}%`;

    index += 1;

    if (index >= steps.length) {
      clearInterval(timer);

      setTimeout(() => {
        showScreen(
          screens,
          "connected"
        );

        setTimeout(() => {
          showScreen(
            screens,
            "connectionHistory"
          );
        }, loadingDelay);
      }, connectionDelay);
    }
  }, connectionDelay);
}

export function renderDashboard(result) {
  updateDashboard(result);

  renderDashboardHistory(
    result.history || []
  );
}

export function renderDashboardHistory(history) {
  const historyList = $("historyList");

  if (!historyList) return;

  historyList.innerHTML = "";

  if (history.length === 0) {
    const empty =
      document.createElement("p");

    empty.className = "history-empty";

    empty.textContent =
      "Your first memory will appear here.";

    historyList.appendChild(empty);
    return;
  }

  history.forEach((memory) => {
    const item =
      document.createElement("article");

    item.className =
      "history-item compact";

    item.innerHTML = `
      <span class="history-icon">
        ${escapeHtml(memory.icon || "💌")}
      </span>

      <div class="history-content">
        <strong>
          Memory #${escapeHtml(memory.number)} ·
          ${escapeHtml(memory.title)}
        </strong>

        <small>
          ${escapeHtml(memory.date)}
        </small>
      </div>
    `;

    historyList.appendChild(item);
  });
}