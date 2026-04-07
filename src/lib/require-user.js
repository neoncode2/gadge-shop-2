import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getSafeRedirectTo } from "./redirect";
import { getRoleHomePath, isAdminRole } from "./roles";

export async function requireUser(pathname = "/account", { allowAdmin = false } = {}) {
  const session = await auth();

  if (!session?.user) {
    redirect(`/login?redirectTo=${encodeURIComponent(getSafeRedirectTo(pathname))}`);
  }

  if (!allowAdmin && isAdminRole(session.user.role)) {
    redirect(getRoleHomePath(session.user.role));
  }

  return session;
}
