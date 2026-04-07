import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RegisterClient from "@/components/auth/RegisterClient";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getSafeRedirectTo } from "@/lib/redirect";
import { getRoleHomePath } from "@/lib/roles";

export default async function RegisterPage({ searchParams }) {
  const params = await searchParams;
  const hasCustomRedirect = typeof params?.redirectTo === "string";
  const redirectTo = hasCustomRedirect
    ? getSafeRedirectTo(params?.redirectTo, "/auth/continue")
    : "/auth/continue";
  const session = await auth();

  if (session?.user) {
    redirect(hasCustomRedirect ? redirectTo : getRoleHomePath(session.user.role));
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="bg-white px-4 py-8 sm:px-6 sm:py-10">
        <div className="mx-auto flex w-full max-w-[960px] justify-center">
          <RegisterClient redirectTo={redirectTo} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
