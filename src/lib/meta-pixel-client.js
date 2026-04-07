const DEFAULT_PIXEL_SETTINGS = {
  enabled: false,
  pixelId: "",
};

let pixelSettingsPromise = null;

function normalizePixelSettings(input = {}) {
  const pixelId = String(input.pixelId || "").replace(/\D/g, "");

  return {
    enabled: Boolean(input.enabled && pixelId),
    pixelId,
  };
}

function getStoredPixelSettings() {
  if (typeof window === "undefined") {
    return DEFAULT_PIXEL_SETTINGS;
  }

  return normalizePixelSettings(window.__publicPixelSettings || DEFAULT_PIXEL_SETTINGS);
}

export function setStoredPixelSettings(input = {}) {
  const nextSettings = normalizePixelSettings(input);

  if (typeof window !== "undefined") {
    window.__publicPixelSettings = nextSettings;
  }

  return nextSettings;
}

export async function fetchPublicPixelSettings({ force = false } = {}) {
  if (typeof window === "undefined") {
    return DEFAULT_PIXEL_SETTINGS;
  }

  if (!force && pixelSettingsPromise) {
    return pixelSettingsPromise;
  }

  pixelSettingsPromise = fetch("/api/pixel-settings", {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  })
    .then(async (response) => {
      if (!response.ok) {
        throw new Error("Unable to load pixel settings.");
      }

      const data = await response.json();
      return setStoredPixelSettings(data?.pixelSettings || DEFAULT_PIXEL_SETTINGS);
    })
    .catch(() => setStoredPixelSettings(getStoredPixelSettings()));

  return pixelSettingsPromise;
}

function ensureMetaPixelBase() {
  if (typeof window === "undefined") return null;

  if (window.fbq) {
    return window.fbq;
  }

  ((f, b, e, v, n, t, s) => {
    if (f.fbq) return;
    n = f.fbq = function fbqProxy() {
      if (n.callMethod) {
        n.callMethod.apply(n, arguments);
      } else {
        n.queue.push(arguments);
      }
    };
    if (!f._fbq) {
      f._fbq = n;
    }
    n.push = n;
    n.loaded = true;
    n.version = "2.0";
    n.queue = [];
    t = b.createElement(e);
    t.async = true;
    t.src = v;
    s = b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t, s);
  })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");

  return window.fbq || null;
}

export function initializeMetaPixel(pixelId) {
  const fbq = ensureMetaPixelBase();

  if (!fbq || !pixelId || typeof window === "undefined") {
    return null;
  }

  if (!window.__metaPixelInitializedIds) {
    window.__metaPixelInitializedIds = {};
  }

  if (!window.__metaPixelInitializedIds[pixelId]) {
    fbq("init", pixelId);
    window.__metaPixelInitializedIds[pixelId] = true;
  }

  return fbq;
}

async function getActiveMetaPixel() {
  const storedSettings = getStoredPixelSettings();
  const nextSettings = storedSettings.enabled && storedSettings.pixelId
    ? storedSettings
    : await fetchPublicPixelSettings();

  if (!nextSettings.enabled || !nextSettings.pixelId) {
    return null;
  }

  const fbq = initializeMetaPixel(nextSettings.pixelId);

  if (!fbq) {
    return null;
  }

  return {
    fbq,
    pixelId: nextSettings.pixelId,
  };
}

export async function trackMetaPixelEvent(eventName, payload = {}) {
  if (typeof window === "undefined") {
    return false;
  }

  const activeMetaPixel = await getActiveMetaPixel();

  if (!activeMetaPixel?.fbq) {
    return false;
  }

  activeMetaPixel.fbq("track", eventName, payload);
  return true;
}

export async function trackMetaPixelPageView(routeKey) {
  if (typeof window === "undefined" || !routeKey) {
    return false;
  }

  const activeMetaPixel = await getActiveMetaPixel();

  if (!activeMetaPixel?.fbq) {
    return false;
  }

  if (
    window.__lastTrackedMetaPixelPath === routeKey &&
    window.__lastTrackedMetaPixelId === activeMetaPixel.pixelId
  ) {
    return false;
  }

  activeMetaPixel.fbq("track", "PageView");
  window.__lastTrackedMetaPixelPath = routeKey;
  window.__lastTrackedMetaPixelId = activeMetaPixel.pixelId;

  return true;
}
