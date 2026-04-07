import AdminShell from "@/components/admin/AdminShell";
import { requireAdmin } from "@/lib/require-admin";

export default async function AdminLayout({ children }) {
  const session = await requireAdmin("/admin");

  return (
    <AdminShell user={session.user}>{children}</AdminShell>
  );
}
