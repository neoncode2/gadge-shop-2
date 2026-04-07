import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/require-admin";
import { listUsers } from "@/lib/users";

export const runtime = "nodejs";

export async function GET(request) {
  const admin = await requireAdminApi();
  if (!admin.ok) {
    return admin.response;
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  const users = await listUsers({ search });

  return NextResponse.json({
    ok: true,
    users,
  });
}
