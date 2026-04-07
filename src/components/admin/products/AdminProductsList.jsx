"use client";

import { Pencil, Search, Trash2 } from "lucide-react";
import { formatPrice } from "@/lib/format";

export default function AdminProductsList({
  error,
  loading,
  onDelete,
  onEdit,
  onSearchChange,
  onSearchSubmit,
  products,
  search,
}) {
  return (
    <section className="rounded-[28px] bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">Inventory</p>
          <h2 className="mt-1 text-2xl font-semibold text-slate-900">Manage products</h2>
        </div>

        <form onSubmit={onSearchSubmit} className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2">
          <Search size={16} className="text-slate-400" />
          <input
            value={search}
            onChange={onSearchChange}
            placeholder="Search products..."
            className="w-52 bg-transparent text-sm outline-none"
          />
          <button className="rounded-full bg-black px-3 py-1.5 text-xs font-semibold text-white">
            Search
          </button>
        </form>
      </div>

      {error && (
        <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
          {error}
        </p>
      )}

      <div className="mt-5 overflow-hidden rounded-[24px] border border-slate-200">
        {loading ? (
          <div className="px-5 py-10 text-center text-sm text-slate-500">Loading products...</div>
        ) : products.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-slate-500">No products found.</div>
        ) : (
          <div className="divide-y divide-slate-200">
            {products.map((product) => (
              <div key={product.id} className="flex flex-col gap-3 px-5 py-4 lg:flex-row lg:items-center">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">{product.name}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {product.id} • {product.category} • {product.brand}
                  </p>
                </div>
                <div className="flex items-center justify-between gap-3 lg:ml-auto">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                      Stock {product.stock}
                    </span>
                    <span className="whitespace-nowrap text-sm font-semibold text-slate-900">
                      {formatPrice(product.price)}
                    </span>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onEdit(product)}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 text-slate-700 transition-colors hover:bg-slate-50"
                      aria-label={`Edit ${product.name}`}
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(product.id)}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-red-200 text-red-600 transition-colors hover:bg-red-50"
                      aria-label={`Delete ${product.name}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
