import { createAttachment } from "./upload.js";

export async function sendConnectionRequest({
  endpoint,
  appName,
  version,
  visitorId,
  message,
  file
}) {
  const attachment = await createAttachment(file);

  const payload = {
    appName,
    version,
    event: "connect_clicked",
    visitorId,
    page: location.href,
    userAgent: navigator.userAgent,
    language: navigator.language,
    timezone:
      Intl.DateTimeFormat().resolvedOptions().timeZone,
    message,
    attachment
  };

  await fetch(endpoint, {
    method: "POST",
    mode: "no-cors",
    headers: {
      "Content-Type": "text/plain;charset=utf-8"
    },
    body: JSON.stringify(payload)
  });

  /*
   * no-cors returns an opaque response.
   * The browser cannot read the JSON returned by Apps Script,
   * but the POST is still sent to the backend.
   */
  return {
    status: "success",
    totalConnections: null,
    firstConnection: null,
    lastConnection: null
  };
}

export function loadDashboard({
  endpoint,
  visitorId,
  limit = 6
}) {
  return new Promise((resolve, reject) => {
    const callbackName =
      `privateConnectionsDashboard_${Date.now()}`;

    const script =
      document.createElement("script");

    const timeout = setTimeout(() => {
      cleanup();
      reject(
        new Error(
          "Dashboard request timed out."
        )
      );
    }, 10000);

    function cleanup() {
      clearTimeout(timeout);
      script.remove();
      delete window[callbackName];
    }

    window[callbackName] = (data) => {
      cleanup();
      resolve(data);
    };

    const params = new URLSearchParams({
      action: "dashboard",
      visitorId,
      limit: String(limit),
      callback: callbackName
    });

    script.src =
      `${endpoint}?${params.toString()}`;

    script.onerror = () => {
      cleanup();

      reject(
        new Error(
          "The dashboard could not be loaded."
        )
      );
    };

    document.body.appendChild(script);
  });
}