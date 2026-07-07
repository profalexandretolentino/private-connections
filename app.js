// 1) Paste your Google Apps Script Web App URL here after deployment.
const TRACKING_ENDPOINT = "PASTE_YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE";

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

const visitorId = localStorage.getItem("pj8_visitor_id") || crypto.randomUUID();
localStorage.setItem("pj8_visitor_id", visitorId);

function show(screenId) {
  screens.forEach((id) => $(id).classList.toggle("active", id === screenId));
}

function track(eventName, extra = {}) {
  if (!TRACKING_ENDPOINT || TRACKING_ENDPOINT.includes("PASTE_YOUR")) {
    console.log("TRACK", eventName, extra);
    return;
  }

  const params = new URLSearchParams({
    event: eventName,
    visitorId,
    page: location.href,
    userAgent: navigator.userAgent,
    language: navigator.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    ...extra,
  });

  // Image beacon avoids CORS problems on GitHub Pages.
  const img = new Image();
  img.src = `${TRACKING_ENDPOINT}?${params.toString()}`;
}

window.addEventListener("load", () => track("page_opened"));

$("startBtn").addEventListener("click", () => {
  track("start_clicked");
  show("videoScreen");
  video.play().catch(() => {});
});

$("skipBtn").addEventListener("click", () => {
  track("video_skipped");
  show("finalGift");
});

video.addEventListener("play", () => track("video_started"));

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

$("connectBtn").addEventListener("click", () => {
  const heartMessage = $("heartMessage")?.value.trim() || "";
  const heartFile = $("heartFile")?.files?.[0];

  track("connect_clicked", {
    message: heartMessage,
    hasFile: heartFile ? "yes" : "no",
    fileName: heartFile ? heartFile.name : "",
    fileType: heartFile ? heartFile.type : "",
    fileSize: heartFile ? heartFile.size : ""
  });

  show("loading");
  runConnectionSequence();
});

$("tryAgainBtn").addEventListener("click", () => {

    track("experience_restarted");

    video.pause();
    video.currentTime = 0;

    progressMarks.clear();

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
    ["Waiting for response...", "Do not close this window", 100],
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
        }, 7000);

      }, 3300);
    }
  }, 3300);
}