import AdminProductsClient from "@/components/admin/AdminProductsClient";

export default function AdminProductsPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-slate-500">Catalog</p>
        <h2 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">
          Product management
        </h2>
      </div>
      <AdminProductsClient />
    </div>
  );
}
