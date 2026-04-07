import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AccountSidebar from "@/components/AccountSidebar";
import AccountAddressManager from "@/components/AccountAddressManager";
import { requireUser } from "@/lib/require-user";
import { getUserDefaultAddressById } from "@/lib/users";

export default async function AddressPage() {
  const session = await requireUser("/account/address");
  const savedAddress = await getUserDefaultAddressById(session.user.id);

  return (
    <div>
      <Header />
      <main className="mx-auto mt-8 grid w-[calc(100%-32px)] max-w-[1240px] grid-cols-1 gap-8 lg:grid-cols-[260px_1fr]">
        <AccountSidebar active="My Address" />
        <AccountAddressManager initialAddress={savedAddress} />
      </main>
      <Footer />
    </div>
  );
}
