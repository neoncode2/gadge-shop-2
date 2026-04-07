import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/require-admin";

export const runtime = "nodejs";

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

export async function POST(request) {
  const admin = await requireAdminApi();
  if (!admin.ok) {
    return admin.response;
  }

  const apiKey = process.env.IMGBB_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { ok: false, message: "IMGBB_API_KEY is not configured on the server." },
      { status: 500 }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("image");

    if (!file || typeof file.arrayBuffer !== "function") {
      return NextResponse.json(
        { ok: false, message: "Please choose an image file to upload." },
        { status: 400 }
      );
    }

    if (file.type && !String(file.type).startsWith("image/")) {
      return NextResponse.json(
        { ok: false, message: "Only image files are allowed." },
        { status: 400 }
      );
    }

    if (Number(file.size || 0) > MAX_IMAGE_SIZE) {
      return NextResponse.json(
        { ok: false, message: "Image size must be 10MB or smaller." },
        { status: 400 }
      );
    }

    const imageBase64 = Buffer.from(await file.arrayBuffer()).toString("base64");
    const uploadFormData = new FormData();
    const sanitizedName = String(file.name || "product-image")
      .replace(/\.[^.]+$/, "")
      .trim()
      .slice(0, 60);

    uploadFormData.set("image", imageBase64);

    if (sanitizedName) {
      uploadFormData.set("name", sanitizedName);
    }

    const response = await fetch(
      `https://api.imgbb.com/1/upload?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        body: uploadFormData,
        cache: "no-store",
      }
    );

    const data = await response.json().catch(() => null);

    if (!response.ok || !data?.success || !data?.data?.url) {
      return NextResponse.json(
        {
          ok: false,
          message:
            data?.error?.message ||
            data?.message ||
            "Unable to upload image to ImgBB.",
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      ok: true,
      imageUrl: data.data.url,
      displayUrl: data.data.display_url || data.data.url,
      thumbUrl: data.data.thumb?.url || data.data.medium?.url || data.data.url,
      deleteUrl: data.data.delete_url || null,
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: error.message || "Unable to upload image." },
      { status: 500 }
    );
  }
}
