"use client";

import { useEffect, useState } from "react";
import AdminProductForm from "./products/AdminProductForm";
import AdminProductsList from "./products/AdminProductsList";
import {
  createAdminProductFormState,
  toAdminProductFormState,
} from "./products/formState";
import api, { getApiErrorMessage } from "@/lib/api";

const PLACEHOLDER_IMAGE = "/images/product.webp";

export default function AdminProductsClient() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState(() => createAdminProductFormState());
  const [editingId, setEditingId] = useState("");

  const loadProducts = async (searchValue = "") => {
    setLoading(true);
    setError("");

    try {
      const { data } = await api.get(`/api/admin/products${searchValue ? `?search=${encodeURIComponent(searchValue)}` : ""}`);

      setProducts(data.products || []);
      setCategories(data.categories || []);
      setBrands(data.brands || []);
    } catch (loadError) {
      setError(getApiErrorMessage(loadError, "Unable to load products."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    loadProducts(search.trim());
  };

  const updateField = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const updateImages = (updater) => {
    setForm((current) => {
      const currentImages = Array.isArray(current.images) ? current.images.filter(Boolean) : [];
      const nextImages = Array.from(new Set(updater(currentImages))).filter(Boolean);

      return {
        ...current,
        images: nextImages,
        image: nextImages[0] || PLACEHOLDER_IMAGE,
      };
    });
  };

  const startEditing = (product) => {
    setEditingId(product.id);
    setForm(toAdminProductFormState(product));
    setError("");
  };

  const resetForm = () => {
    setEditingId("");
    setForm(createAdminProductFormState());
  };

  const handleImageUpload = async (files) => {
    const selectedFiles = Array.from(files || []).filter(Boolean);
    if (selectedFiles.length === 0) return;

    setUploadingImage(true);
    setError("");

    try {
      const uploadedUrls = [];

      for (const file of selectedFiles) {
        const uploadPayload = new FormData();
        uploadPayload.append("image", file);

        const { data } = await api.post("/api/admin/uploads/imgbb", uploadPayload, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        if (data.imageUrl) {
          uploadedUrls.push(data.imageUrl);
        }
      }

      if (uploadedUrls.length > 0) {
        updateImages((currentImages) => [...currentImages, ...uploadedUrls]);
      }
    } catch (uploadError) {
      setError(getApiErrorMessage(uploadError, "Unable to upload image to ImgBB."));
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = (imageToRemove) => {
    updateImages((currentImages) => currentImages.filter((image) => image !== imageToRemove));
  };

  const handleDelete = async (productId) => {
    const confirmed = window.confirm("Delete this product?");
    if (!confirmed) return;

    try {
      await api.delete(`/api/admin/products/${encodeURIComponent(productId)}`);

      if (editingId === productId) {
        resetForm();
      }

      await loadProducts(search.trim());
    } catch (deleteError) {
      setError(getApiErrorMessage(deleteError, "Unable to delete product."));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (uploadingImage) {
      setError("Please wait for the image upload to finish.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const isEditing = Boolean(editingId);
      const endpoint = isEditing
        ? `/api/admin/products/${encodeURIComponent(editingId)}`
        : "/api/admin/products";

      if (isEditing) {
        await api.patch(endpoint, form);
      } else {
        await api.post(endpoint, form);
      }

      resetForm();
      await loadProducts(search.trim());
    } catch (saveError) {
      setError(getApiErrorMessage(saveError, "Unable to save product."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1.25fr_0.95fr]">
      <AdminProductsList
        error={error}
        loading={loading}
        onDelete={handleDelete}
        onEdit={startEditing}
        onSearchChange={(event) => setSearch(event.target.value)}
        onSearchSubmit={handleSearchSubmit}
        products={products}
        search={search}
      />

      <AdminProductForm
        brands={brands}
        categories={categories}
        editingId={editingId}
        form={form}
        onFieldChange={updateField}
        onImageUpload={handleImageUpload}
        onRemoveImage={handleRemoveImage}
        onReset={resetForm}
        onSubmit={handleSubmit}
        saving={saving}
        uploadingImage={uploadingImage}
      />
    </div>
  );
}
