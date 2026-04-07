import AdminUsersClient from "@/components/admin/AdminUsersClient";

export default function AdminUsersPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-slate-500">Accounts</p>
        <h2 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">
          Registered users
        </h2>
      </div>
      <AdminUsersClient />
    </div>
  );
}
