import AdminOrdersClient from "@/components/admin/AdminOrdersClient";

export default function AdminOrdersPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-slate-500">Operations</p>
        <h2 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">
          Order control center
        </h2>
      </div>
      <AdminOrdersClient />
    </div>
  );
}
