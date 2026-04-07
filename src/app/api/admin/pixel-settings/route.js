import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/require-admin";
import { getPixelSettings, savePixelSettings } from "@/lib/site-settings";

export const runtime = "nodejs";

export async function GET() {
  const admin = await requireAdminApi();
  if (!admin.ok) {
    return admin.response;
  }

  try {
    const pixelSettings = await getPixelSettings();

    return NextResponse.json({
      ok: true,
      pixelSettings,
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: error.message || "Unable to load pixel settings." },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  const admin = await requireAdminApi();
  if (!admin.ok) {
    return admin.response;
  }

  try {
    const body = await request.json();
    const pixelId = String(body?.pixelId || "").trim();

    if (pixelId && !/^\d+$/.test(pixelId)) {
      return NextResponse.json(
        { ok: false, message: "Pixel ID should contain numbers only." },
        { status: 400 }
      );
    }

    const pixelSettings = await savePixelSettings(
      {
        enabled: Boolean(body?.enabled),
        pixelId,
      },
      admin.session?.user
    );

    return NextResponse.json({
      ok: true,
      message: pixelSettings.enabled
        ? "Meta Pixel has been saved and activated."
        : "Meta Pixel settings have been saved.",
      pixelSettings,
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: error.message || "Unable to save pixel settings." },
      { status: 500 }
    );
  }
}
