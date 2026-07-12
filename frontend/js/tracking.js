export function trackEvent({
  endpoint,
  appName,
  version,
  eventName,
  visitorId,
  extra = {}
}) {
  if (!endpoint) return;

  const params = new URLSearchParams({
    appName,
    version,
    event: eventName,
    visitorId,
    page: location.href,
    userAgent: navigator.userAgent,
    language: navigator.language,
    timezone:
      Intl.DateTimeFormat().resolvedOptions().timeZone,
    ...extra
  });

  const beacon = new Image();
  beacon.src = `${endpoint}?${params.toString()}`;
}