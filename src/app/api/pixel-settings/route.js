import { NextResponse } from "next/server";
import { getDefaultPixelSettings, getPixelSettings } from "@/lib/site-settings";

export const runtime = "nodejs";

export async function GET() {
  try {
    const pixelSettings = await getPixelSettings();

    return NextResponse.json({
      ok: true,
      pixelSettings: {
        enabled: Boolean(pixelSettings.enabled && pixelSettings.pixelId),
        pixelId: pixelSettings.pixelId || "",
      },
    });
  } catch (error) {
    const pixelSettings = getDefaultPixelSettings();

    return NextResponse.json({
      ok: true,
      pixelSettings: {
        enabled: pixelSettings.enabled,
        pixelId: pixelSettings.pixelId,
      },
    });
  }
}
