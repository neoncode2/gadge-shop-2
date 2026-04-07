import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AccountSidebar from "@/components/AccountSidebar";
import { requireUser } from "@/lib/require-user";

export default async function SettingsPage() {
  await requireUser("/account/settings");

  return (
    <div>
      <Header />
      <main className="mx-auto mt-8 grid w-[calc(100%-32px)] max-w-[1240px] grid-cols-1 gap-8 lg:grid-cols-[260px_1fr]">
        <AccountSidebar active="Setting" />
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-6">
          <div className="rounded-[22px] bg-white p-6 shadow-[0_14px_34px_rgba(15,23,42,0.08)]">
            <h2 className="font-semibold text-ink-900">Password Manage</h2>
            <div className="mt-4 space-y-4">
              <input className="w-full rounded-2xl bg-white p-3 shadow-[0_10px_24px_rgba(15,23,42,0.08)]" placeholder="Enter your old password" />
              <input className="w-full rounded-2xl bg-white p-3 shadow-[0_10px_24px_rgba(15,23,42,0.08)]" placeholder="Enter your new password" />
              <input className="w-full rounded-2xl bg-white p-3 shadow-[0_10px_24px_rgba(15,23,42,0.08)]" placeholder="Confirm your password" />
              <button className="w-full bg-black text-white py-2 rounded-lg">Save & Changes</button>
            </div>
          </div>
          <div className="rounded-[22px] bg-white p-6 shadow-[0_14px_34px_rgba(15,23,42,0.08)]">
            <h2 className="font-semibold text-ink-900">Account Status</h2>
            <p className="text-sm text-ink-500 mt-2">
              Your account status is active. You can disable or inactive account below.
            </p>
            <textarea
              className="mt-4 h-32 w-full rounded-2xl bg-white p-3 shadow-[0_10px_24px_rgba(15,23,42,0.08)]"
              placeholder="Write Reason for inactive account"
            />
            <button className="mt-4 w-full bg-red-600 text-white py-2 rounded-lg">
              Deactivate Account
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
