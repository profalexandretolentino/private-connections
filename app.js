const CONFIG = {
  appName: "Private Connections",
  version: "0.1.0",
  loadingDelay: 7000,
  connectionDelay: 3300,
  maxMessageLength: 180
};

// Paste your Google Apps Script Web App URL here after deployment.
const TRACKING_ENDPOINT = "https://script.google.com/macros/s/AKfycbzy253oes6E7uHMoLoLUx_G5B2Qwn8R2-up3SFy04sCEzhpjMyl5XFysKmITsSBqHgx/exec"

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

const visitorId = localStorage.getItem("pc_visitor_id") || crypto.randomUUID();
localStorage.setItem("pc_visitor_id", visitorId);

function show(screenId) {
  screens.forEach((id) => {
    $(id).classList.toggle("active", id === screenId);
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

  const img = new Image();
  img.src = `${TRACKING_ENDPOINT}?${params.toString()}`;
}

function renderMemoryItem(memory) {
  const historyList = $("historyList");

  const item = document.createElement("div");
  item.className = "history-item";

  item.innerHTML = `
    <strong>${memory.date}</strong>
    <span>❤️ ${memory.title}</span>
    <small>${memory.message}</small>
    <small>📎 ${memory.attachment}</small>
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

  const heartFile = $("heartFile")?.files?.[0];

  renderMemoryItem({
    date: formatConnectionDate(),
    title: "Private connection",
    message: `“${heartMessage}”`,
    attachment: getAttachmentLabel(heartFile)
  });
}

window.addEventListener("load", () => {
  track("page_opened");
});

$("startBtn").addEventListener("click", () => {
  track("start_clicked");
  show("videoScreen");
  video.play().catch(() => {});
});

$("skipBtn").addEventListener("click", () => {
  track("video_skipped");
  show("finalGift");
});

video.addEventListener("play", () => {
  track("video_started");
});

video.addEventListener("ended", () => {
  track("video_ended");
  show("finalGift");
});

video.addEventListener("timeupdate", () => {
  if (!video.duration) return;

  const pct = Math.floor((video.currentTime / video.duration) * 100);

  [25, 50, 75, 95].forEach((mark) => {
    if (pct >= mark && !progressMarks.has(mark)) {
      progressMarks.add(mark);

      track(`video_${mark}_percent`, {
        seconds: Math.round(video.currentTime)
      });
    }
  });
});

$("connectBtn").addEventListener("click", async () => {
  const heartMessage = $("heartMessage")?.value.trim() || "";
  const heartFile = $("heartFile")?.files?.[0];

  addLocalMemoryPreview();
  show("loading");

  const result = await sendConnectionRequest({
    message: heartMessage,
    hasFile: heartFile ? "yes" : "no",
    fileName: heartFile ? heartFile.name : "",
    fileType: heartFile ? heartFile.type : "",
    fileSize: heartFile ? heartFile.size : ""
  });

  if (result && result.status === "success") {
    $("totalConnections").textContent = result.totalConnections ?? "--";
    $("firstConnection").textContent = result.firstConnection ?? "--";
    $("lastConnection").textContent = result.lastConnection ?? "--";
  }

  runConnectionSequence();
});

$("tryAgainBtn").addEventListener("click", () => {
  track("experience_restarted");

  video.pause();
  video.currentTime = 0;
  progressMarks.clear();

  $("heartMessage").value = "";
  $("heartFile").value = "";

  show("intro");
});

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

  let i = 0;

  const timer = setInterval(() => {
    const [main, detail, progress] = steps[i];

    line.textContent = main;
    logs.innerHTML += `<div>✓ ${detail}</div>`;
    bar.style.width = `${progress}%`;

    i++;

    if (i >= steps.length) {
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

async function sendConnectionRequest(extra = {}) {
  if (!TRACKING_ENDPOINT || TRACKING_ENDPOINT.includes("PASTE_YOUR")) {
    console.log("CONNECT", extra);
    return null;
  }

  const params = new URLSearchParams({
    appName: CONFIG.appName,
    version: CONFIG.version,
    event: "connect_clicked",
    visitorId,
    page: location.href,
    userAgent: navigator.userAgent,
    language: navigator.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    ...extra
  });

  try {
    const response = await fetch(`${TRACKING_ENDPOINT}?${params.toString()}`);
    return await response.json();
  } catch (error) {
    console.error("Connection request failed:", error);
    return null;
  }
}