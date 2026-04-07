import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AccountSidebar from "@/components/AccountSidebar";
import AccountReviewsList from "@/components/AccountReviewsList";
import { requireUser } from "@/lib/require-user";
import { listReviewsByUserId } from "@/lib/reviews";

export default async function AccountReviewsPage() {
  const session = await requireUser("/account/reviews");
  const reviews = await listReviewsByUserId(session.user.id, { limit: 50 });

  return (
    <div>
      <Header />
      <main className="mx-auto mt-8 grid w-[calc(100%-32px)] max-w-[1240px] grid-cols-1 gap-8 lg:grid-cols-[260px_1fr]">
        <AccountSidebar active="My Reviews" />

        <section className="space-y-5">
          <div className="rounded-[22px] bg-white p-6 shadow-[0_14px_34px_rgba(15,23,42,0.08)]">
            <div className="mb-5">
              <h1 className="text-2xl font-semibold text-ink-900">My Reviews</h1>
              <p className="mt-1 text-sm text-ink-500">
                All reviews submitted from your account are listed here.
              </p>
            </div>

            <AccountReviewsList
              reviews={reviews}
              emptyTitle="You have not reviewed any product yet."
              emptyDescription="Once you submit a review from a product details page, it will appear here."
            />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
