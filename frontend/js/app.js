import { CONFIG } from "./config.js";
import { $, getVisitorId } from "./utils.js";
import { validateFile } from "./upload.js";

import {
  sendConnectionRequest,
  loadDashboard
} from "./api.js";

import { trackEvent } from "./tracking.js";

import {
  showScreen,
  addLocalMemoryPreview,
  setConnectButtonLoading,
  resetForm,
  runConnectionSequence,
  renderDashboard
} from "./ui.js";

const visitorId = getVisitorId();
const video = $("mainVideo");
const progressMarks = new Set();

function track(eventName, extra = {}) {
  trackEvent({
    endpoint: CONFIG.endpoint,
    appName: CONFIG.appName,
    version: CONFIG.version,
    eventName,
    visitorId,
    extra
  });
}

async function refreshDashboard() {
  try {
    const dashboard = await loadDashboard({
      endpoint: CONFIG.endpoint,
      visitorId,
      limit: CONFIG.historyLimit
    });

    renderDashboard(dashboard);
  } catch (error) {
    console.error(
      "Dashboard refresh failed:",
      error
    );
  }
}

window.addEventListener("load", () => {
  track("page_opened");
  refreshDashboard();
});

$("startBtn").addEventListener("click", () => {
  track("start_clicked");
  showScreen(CONFIG.screens, "videoScreen");
});

$("skipBtn").addEventListener("click", () => {
  track("video_skipped");
  showScreen(CONFIG.screens, "finalGift");
});

video.addEventListener("play", () => {
  track("video_started");
});

video.addEventListener("ended", () => {
  track("video_ended");
  showScreen(CONFIG.screens, "finalGift");
});

video.addEventListener("timeupdate", () => {
  if (!video.duration) return;

  const percentage = Math.floor(
    (video.currentTime / video.duration) * 100
  );

  CONFIG.progressMarks.forEach((mark) => {
    if (
      percentage >= mark &&
      !progressMarks.has(mark)
    ) {
      progressMarks.add(mark);

      track(`video_${mark}_percent`, {
        seconds: Math.round(video.currentTime)
      });
    }
  });
});

$("connectBtn").addEventListener("click", async () => {
  const message =
    $("heartMessage").value.trim();

  const file =
    $("heartFile").files?.[0] || null;

  if (
    message.length > CONFIG.maxMessageLength
  ) {
    alert(
      `Please keep your message under ${CONFIG.maxMessageLength} characters.`
    );

    return;
  }

  try {
    validateFile(
      file,
      CONFIG.maxFileSize
    );

    setConnectButtonLoading(true);

    showScreen(
      CONFIG.screens,
      "loading"
    );

    await sendConnectionRequest({
      endpoint: CONFIG.endpoint,
      appName: CONFIG.appName,
      version: CONFIG.version,
      visitorId,
      message,
      file
    });

    /*
     * Mostra imediatamente a memória enviada,
     * antes de consultar novamente o banco.
     */
    addLocalMemoryPreview(
      message,
      file
    );

    /*
     * Aguarda o Apps Script concluir a gravação
     * antes de consultar o dashboard.
     */
    await new Promise((resolve) => {
      setTimeout(
        resolve,
        CONFIG.dashboardRefreshDelay
      );
    });

    await refreshDashboard();

    runConnectionSequence({
      screens: CONFIG.screens,
      connectionDelay:
        CONFIG.connectionDelay,
      loadingDelay:
        CONFIG.loadingDelay
    });
  } catch (error) {
    console.error(error);

    alert(
      error.message ||
      "The connection could not be sent."
    );

    showScreen(
      CONFIG.screens,
      "finalGift"
    );
  } finally {
    setConnectButtonLoading(false);
  }
});

$("tryAgainBtn").addEventListener("click", () => {
  track("experience_restarted");

  video.pause();
  video.currentTime = 0;

  progressMarks.clear();
  resetForm();

  showScreen(
    CONFIG.screens,
    "intro"
  );
});