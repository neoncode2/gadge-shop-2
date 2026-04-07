"use client";

import { Loader2, Plus, Save, Trash2, Upload } from "lucide-react";

export default function AdminProductForm({
  brands,
  categories,
  editingId,
  form,
  onFieldChange,
  onImageUpload,
  onRemoveImage,
  onReset,
  onSubmit,
  saving,
  uploadingImage,
}) {
  const submitDisabled = saving || uploadingImage;
  const previewImages =
    Array.isArray(form.images) && form.images.length > 0 ? form.images : [form.image || "/images/product.webp"];

  return (
    <section className="rounded-[28px] bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{editingId ? "Edit" : "Create"}</p>
          <h2 className="mt-1 text-2xl font-semibold text-slate-900">
            {editingId ? "Update product" : "New product"}
          </h2>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 text-slate-700 transition-colors hover:bg-slate-50"
          aria-label="Reset form"
        >
          <Plus size={18} />
        </button>
      </div>

      <form onSubmit={onSubmit} className="mt-5 space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <input value={form.name} onChange={(event) => onFieldChange("name", event.target.value)} placeholder="Product name" className="h-11 rounded-2xl border border-slate-200 px-4 text-sm outline-none" />
          <input value={form.brand} onChange={(event) => onFieldChange("brand", event.target.value)} placeholder="Brand" list="admin-brands" className="h-11 rounded-2xl border border-slate-200 px-4 text-sm outline-none" />
          <input value={form.category} onChange={(event) => onFieldChange("category", event.target.value)} placeholder="Primary category" list="admin-categories" className="h-11 rounded-2xl border border-slate-200 px-4 text-sm outline-none" />
          <input value={form.categories} onChange={(event) => onFieldChange("categories", event.target.value)} placeholder="Extra categories, comma separated" className="h-11 rounded-2xl border border-slate-200 px-4 text-sm outline-none" />
          <input value={form.price} onChange={(event) => onFieldChange("price", event.target.value)} placeholder="Price" className="h-11 rounded-2xl border border-slate-200 px-4 text-sm outline-none" />
          <input value={form.oldPrice} onChange={(event) => onFieldChange("oldPrice", event.target.value)} placeholder="Old price" className="h-11 rounded-2xl border border-slate-200 px-4 text-sm outline-none" />
          <input value={form.stock} onChange={(event) => onFieldChange("stock", event.target.value)} placeholder="Stock" className="h-11 rounded-2xl border border-slate-200 px-4 text-sm outline-none" />
          <input value={form.rating} onChange={(event) => onFieldChange("rating", event.target.value)} placeholder="Rating" className="h-11 rounded-2xl border border-slate-200 px-4 text-sm outline-none" />
        </div>

        <div className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 flex-wrap gap-2">
              {previewImages.map((imageSrc, index) => (
                <div
                  key={`${imageSrc}-${index}`}
                  className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border bg-white ${
                    index === 0 ? "border-slate-900" : "border-slate-200"
                  }`}
                >
                  <img
                    src={imageSrc}
                    alt={`${form.name || "Product"} preview ${index + 1}`}
                    className="h-full w-full object-cover"
                  />

                  {Array.isArray(form.images) && form.images.length > 0 && (
                    <button
                      type="button"
                      onClick={() => onRemoveImage(imageSrc)}
                      className="absolute right-1 top-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/95 text-slate-600 shadow-sm transition-colors hover:text-red-600"
                      aria-label={`Remove image ${index + 1}`}
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <label
              className={`inline-flex h-11 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 ${
                submitDisabled ? "pointer-events-none opacity-60" : ""
              }`}
            >
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                disabled={submitDisabled}
                onChange={async (event) => {
                  const files = event.target.files;
                  event.target.value = "";

                  if (!files?.length) return;

                  await onImageUpload(files);
                }}
              />
              {uploadingImage ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
              <span>{uploadingImage ? "Uploading..." : "Add"}</span>
            </label>
          </div>
        </div>

        <input value={form.tag} onChange={(event) => onFieldChange("tag", event.target.value)} placeholder="Tag" className="h-11 w-full rounded-2xl border border-slate-200 px-4 text-sm outline-none" />
        <input value={form.sections} onChange={(event) => onFieldChange("sections", event.target.value)} placeholder="Sections, comma separated" className="h-11 w-full rounded-2xl border border-slate-200 px-4 text-sm outline-none" />
        <input value={form.colors} onChange={(event) => onFieldChange("colors", event.target.value)} placeholder="Colors, comma separated" className="h-11 w-full rounded-2xl border border-slate-200 px-4 text-sm outline-none" />
        <input value={form.strapSizes} onChange={(event) => onFieldChange("strapSizes", event.target.value)} placeholder="Sizes, comma separated" className="h-11 w-full rounded-2xl border border-slate-200 px-4 text-sm outline-none" />

        <textarea value={form.shortDescription} onChange={(event) => onFieldChange("shortDescription", event.target.value)} placeholder="Short description" className="min-h-[96px] w-full rounded-[22px] border border-slate-200 px-4 py-3 text-sm outline-none" />
        <textarea value={form.descriptionPoints} onChange={(event) => onFieldChange("descriptionPoints", event.target.value)} placeholder="Description points, one per line" className="min-h-[120px] w-full rounded-[22px] border border-slate-200 px-4 py-3 text-sm outline-none" />
        <textarea value={form.specs} onChange={(event) => onFieldChange("specs", event.target.value)} placeholder="Specs format: Label: Value" className="min-h-[120px] w-full rounded-[22px] border border-slate-200 px-4 py-3 text-sm outline-none" />

        <button
          type="submit"
          disabled={submitDisabled}
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-black text-sm font-semibold text-white disabled:opacity-60"
        >
          <Save size={16} />
          <span>
            {uploadingImage
              ? "Uploading image..."
              : saving
                ? "Saving..."
                : editingId
                  ? "Update Product"
                  : "Create Product"}
          </span>
        </button>

        <datalist id="admin-categories">
          {categories.map((category) => (
            <option key={category} value={category} />
          ))}
        </datalist>
        <datalist id="admin-brands">
          {brands.map((brand) => (
            <option key={brand} value={brand} />
          ))}
        </datalist>
      </form>
    </section>
  );
}
