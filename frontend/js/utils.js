export const $ = (id) => document.getElementById(id);

export function formatConnectionDate(date = new Date()) {
  return date.toLocaleString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  });
}

export function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function getVisitorId() {
  const storageKey = "pc_visitor_id";

  const visitorId =
    localStorage.getItem(storageKey) ||
    crypto.randomUUID();

  localStorage.setItem(storageKey, visitorId);

  return visitorId;
}