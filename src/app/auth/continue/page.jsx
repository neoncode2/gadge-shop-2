import { auth } from "@/auth";
import { getRoleHomePath } from "@/lib/roles";
import { redirect } from "next/navigation";

export default async function AuthContinuePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  redirect(getRoleHomePath(session.user.role));
}
