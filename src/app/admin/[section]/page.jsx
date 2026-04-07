import { notFound } from "next/navigation";
import AdminComingSoonPage from "@/components/admin/AdminComingSoonPage";
import { getAdminFeatureBySlug } from "@/lib/admin-navigation";

export default async function AdminFutureSectionPage({ params }) {
  const resolvedParams = await params;
  const item = getAdminFeatureBySlug(resolvedParams?.section);

  if (!item) {
    notFound();
  }

  return <AdminComingSoonPage item={item} />;
}
