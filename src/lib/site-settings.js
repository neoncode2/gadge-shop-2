import { getDatabase } from "@/lib/mongodb";

const SITE_SETTINGS_COLLECTION = "site_settings";
const SITE_SETTINGS_KEY = "global-site-settings";

function sanitizePixelId(value) {
  return String(value || "").replace(/\D/g, "").slice(0, 32);
}

export function getDefaultPixelSettings() {
  return {
    enabled: false,
    pixelId: "",
    updatedAt: "",
    updatedBy: "",
  };
}

function normalizePixelSettings(input = {}) {
  const pixelId = sanitizePixelId(input.pixelId);

  return {
    enabled: Boolean(input.enabled && pixelId),
    pixelId,
  };
}

export async function getSiteSettingsDocument() {
  const db = await getDatabase();

  return db.collection(SITE_SETTINGS_COLLECTION).findOne({ key: SITE_SETTINGS_KEY });
}

export async function getPixelSettings() {
  const document = await getSiteSettingsDocument();

  return {
    ...getDefaultPixelSettings(),
    ...(document?.pixelSettings || {}),
  };
}

export async function savePixelSettings(input = {}, user = {}) {
  const nextSettings = normalizePixelSettings(input);
  const updatedAt = new Date().toISOString();
  const updatedBy = user?.email || user?.name || "";
  const db = await getDatabase();

  await db.collection(SITE_SETTINGS_COLLECTION).updateOne(
    { key: SITE_SETTINGS_KEY },
    {
      $set: {
        key: SITE_SETTINGS_KEY,
        pixelSettings: {
          ...nextSettings,
          updatedAt,
          updatedBy,
        },
        updatedAt,
      },
      $setOnInsert: {
        createdAt: updatedAt,
      },
    },
    { upsert: true }
  );

  return {
    ...getDefaultPixelSettings(),
    ...nextSettings,
    updatedAt,
    updatedBy,
  };
}
