import { NextResponse } from "next/server";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getSafeRedirectTo } from "./redirect";
import { getRoleHomePath, isAdminRole } from "./roles";

export async function requireAdmin(pathname = "/admin") {
  const session = await auth();

  if (!session?.user) {
    redirect(`/login?redirectTo=${encodeURIComponent(getSafeRedirectTo(pathname, "/admin"))}`);
  }

  if (!isAdminRole(session.user.role)) {
    redirect(getRoleHomePath(session.user.role));
  }

  return session;
}

export async function requireAdminApi() {
  const session = await auth();

  if (!session?.user) {
    return {
      ok: false,
      response: NextResponse.json(
        { ok: false, message: "Unauthorized." },
        { status: 401 }
      ),
    };
  }

  if (!isAdminRole(session.user.role)) {
    return {
      ok: false,
      response: NextResponse.json(
        { ok: false, message: "Admin access required." },
        { status: 403 }
      ),
    };
  }

  return {
    ok: true,
    session,
  };
}
