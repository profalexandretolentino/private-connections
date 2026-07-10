const CONFIG = {
  appName: "Private Connections",
  version: "0.2.0",
  loadingDelay: 7000,
  connectionDelay: 3300,
  maxMessageLength: 180,
  maxFileSize: 8 * 1024 * 1024
};

const TRACKING_ENDPOINT =
  "https://script.google.com/macros/s/AKfycbz9Hs01tluXk4-Pjry3YoUNucDhIvlLxgud9bQ5TnA3S9eYwZ8OPGBMnjE0qTVhx6O5/exec";

const $ = (id) => document.getElementById(id);

const screens = [
  "intro",
  "videoScreen",
  "finalGift",
  "loading",
  "connected",
  "connectionHistory"
];

const video = $("mainVideo");
const progressMarks = new Set();

const visitorId =
  localStorage.getItem("pc_visitor_id") || crypto.randomUUID();

localStorage.setItem("pc_visitor_id", visitorId);

function show(screenId) {
  screens.forEach((id) => {
    const screen = $(id);
    if (screen) {
      screen.classList.toggle("active", id === screenId);
    }
  });
}

function formatConnectionDate(date = new Date()) {
  return date.toLocaleString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  });
}

function track(eventName, extra = {}) {
  if (!TRACKING_ENDPOINT || TRACKING_ENDPOINT.includes("PASTE_YOUR")) {
    console.log("TRACK", eventName, extra);
    return;
  }

  const params = new URLSearchParams({
    appName: CONFIG.appName,
    version: CONFIG.version,
    event: eventName,
    visitorId,
    page: location.href,
    userAgent: navigator.userAgent,
    language: navigator.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    ...extra
  });

  const beacon = new Image();
  beacon.src = `${TRACKING_ENDPOINT}?${params.toString()}`;
}

function renderMemoryItem(memory) {
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

function getAttachmentLabel(file) {
  if (!file) return "No attachment";

  if (file.type.startsWith("image/")) return "📷 Image received";
  if (file.type.startsWith("video/")) return "🎥 Video received";
  if (file.type.startsWith("audio/")) return "🎵 Audio received";

  return "File received";
}

function addLocalMemoryPreview() {
  const heartMessage =
    $("heartMessage")?.value.trim() || "Connection requested.";

  const heartFile = $("heartFile")?.files?.[0] || null;

  renderMemoryItem({
    date: formatConnectionDate(),
    title: "Private connection",
    message: `“${heartMessage}”`,
    attachment: getAttachmentLabel(heartFile)
  });
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const result = String(reader.result || "");
      const base64 = result.includes(",") ? result.split(",")[1] : result;
      resolve(base64);
    };

    reader.onerror = () => {
      reject(new Error("The selected file could not be read."));
    };

    reader.readAsDataURL(file);
  });
}

async function sendConnectionRequest({ message = "", file = null } = {}) {
  if (!TRACKING_ENDPOINT || TRACKING_ENDPOINT.includes("PASTE_YOUR")) {
    console.log("CONNECT", { message, file });
    return null;
  }

  let attachment = null;

  if (file) {
    attachment = {
      originalName: file.name,
      mimeType: file.type || "application/octet-stream",
      size: file.size,
      base64: await fileToBase64(file)
    };
  }

  const payload = {
    appName: CONFIG.appName,
    version: CONFIG.version,
    event: "connect_clicked",
    visitorId,
    page: location.href,
    userAgent: navigator.userAgent,
    language: navigator.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    message,
    attachment
  };

  try {
    const response = await fetch(TRACKING_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: JSON.stringify(payload)
    });

    const text = await response.text();

    try {
      return JSON.parse(text);
    } catch {
      console.error("Invalid backend response:", text);
      return null;
    }
  } catch (error) {
    console.error("Connection request failed:", error);
    return null;
  }
}

function updateDashboard(result) {
  if (!result || result.status !== "success") return;

  if ($("totalConnections")) {
    $("totalConnections").textContent = result.totalConnections ?? "--";
  }

  if ($("firstConnection")) {
    $("firstConnection").textContent = result.firstConnection ?? "--";
  }

  if ($("lastConnection")) {
    $("lastConnection").textContent = result.lastConnection ?? "--";
  }
}

function runConnectionSequence() {
  const logs = $("logs");
  const bar = $("progressBar");
  const line = $("loadingLine");

  const steps = [
    ["Loading your private connection...", "Brazil region: online", 18],
    ["Opening a private channel...", "Japan region: online", 38],
    ["Checking distance...", "Distance: 16,000 km", 56],
    ["Looking for Alexandre...", "Searching for the best route", 64],
    ["Passing through the Philippines...", "Route found: attempting to establish connection", 75],
    ["Searching Alexandre instance...", "Status: Alexandre located", 86],
    ["Sending connection request...", "Request delivered", 92],
    ["Waiting for response...", "Do not close this window", 100]
  ];

  logs.innerHTML = "";
  bar.style.width = "0%";

  let index = 0;

  const timer = setInterval(() => {
    const [main, detail, progress] = steps[index];

    line.textContent = main;
    logs.innerHTML += `<div>✓ ${escapeHtml(detail)}</div>`;
    bar.style.width = `${progress}%`;

    index += 1;

    if (index >= steps.length) {
      clearInterval(timer);

      setTimeout(() => {
        show("connected");

        setTimeout(() => {
          show("connectionHistory");
        }, CONFIG.loadingDelay);
      }, CONFIG.connectionDelay);
    }
  }, CONFIG.connectionDelay);
}

window.addEventListener("load", () => {
  track("page_opened");
});

$("startBtn")?.addEventListener("click", () => {
  track("start_clicked");
  show("videoScreen");
});

$("skipBtn")?.addEventListener("click", () => {
  track("video_skipped");
  show("finalGift");
});

video?.addEventListener("play", () => {
  track("video_started");
});

video?.addEventListener("ended", () => {
  track("video_ended");
  show("finalGift");
});

video?.addEventListener("timeupdate", () => {
  if (!video.duration) return;

  const percentage = Math.floor((video.currentTime / video.duration) * 100);

  [25, 50, 75, 95].forEach((mark) => {
    if (percentage >= mark && !progressMarks.has(mark)) {
      progressMarks.add(mark);
      track(`video_${mark}_percent`, {
        seconds: Math.round(video.currentTime)
      });
    }
  });
});

$("connectBtn")?.addEventListener("click", async () => {
  const connectButton = $("connectBtn");
  const heartMessage = $("heartMessage")?.value.trim() || "";
  const heartFile = $("heartFile")?.files?.[0] || null;

  if (heartMessage.length > CONFIG.maxMessageLength) {
    alert(`Please keep your message under ${CONFIG.maxMessageLength} characters.`);
    return;
  }

  if (heartFile && heartFile.size > CONFIG.maxFileSize) {
    alert("Please choose a file smaller than 8 MB.");
    return;
  }

  connectButton.disabled = true;
  connectButton.textContent = "SENDING...";

  show("loading");

  let result = null;

  try {
    result = await sendConnectionRequest({
      message: heartMessage,
      file: heartFile
    });
  } catch (error) {
    console.error("Upload error:", error);
  }

  connectButton.disabled = false;
  connectButton.textContent = "CONNECT";

  if (!result || result.status !== "success") {
    console.error("Connection failed:", result);
    alert("The connection could not be sent. Please try again.");
    show("finalGift");
    return;
  }

  addLocalMemoryPreview();
  updateDashboard(result);
  runConnectionSequence();
});

$("tryAgainBtn")?.addEventListener("click", () => {
  track("experience_restarted");

  video.pause();
  video.currentTime = 0;
  progressMarks.clear();

  if ($("heartMessage")) {
    $("heartMessage").value = "";
  }

  if ($("heartFile")) {
    $("heartFile").value = "";
  }

  show("intro");
});
