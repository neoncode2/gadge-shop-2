"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, MapPin, Save, Trash2 } from "lucide-react";
import { bangladeshDistricts } from "@/data/districts";
import api, { getApiErrorMessage } from "@/lib/api";

const emptyForm = {
  name: "",
  phone: "",
  district: "",
  address: "",
  note: "",
};

function formatUpdatedAt(value) {
  if (!value) return "Not saved yet";

  return new Date(value).toLocaleString("en-BD", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function AccountAddressManager({ initialAddress = null }) {
  const [savedAddress, setSavedAddress] = useState(initialAddress);
  const [form, setForm] = useState(initialAddress || emptyForm);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const updateField = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");
    setIsSaving(true);

    try {
      const { data } = await api.put("/api/account/address", form);
      const nextAddress = data?.address || null;

      setSavedAddress(nextAddress);
      setForm(nextAddress || emptyForm);
      setMessage(data?.message || "Delivery address saved.");
    } catch (saveError) {
      setError(getApiErrorMessage(saveError, "Unable to save your address right now."));
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemove = async () => {
    setMessage("");
    setError("");
    setIsRemoving(true);

    try {
      const { data } = await api.delete("/api/account/address");
      setSavedAddress(null);
      setForm(emptyForm);
      setMessage(data?.message || "Saved address removed.");
    } catch (removeError) {
      setError(getApiErrorMessage(removeError, "Unable to remove your address right now."));
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <section className="space-y-5">
      <div className="rounded-[22px] bg-white p-6 shadow-[0_14px_34px_rgba(15,23,42,0.08)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-ink-900">Delivery Address</h1>
            <p className="mt-1 text-sm leading-6 text-ink-500">
              Save your default delivery address here. Checkout will automatically pick it up
              when you place an order.
            </p>
          </div>

          <Link
            href="/checkout"
            className="inline-flex min-h-10 items-center justify-center rounded-[10px] border border-[#979797] px-4 text-sm font-semibold text-[#111111] transition-colors hover:bg-[#f7f7f7]"
          >
            Go to checkout
          </Link>
        </div>

        {savedAddress ? (
          <div className="mt-5 rounded-[18px] border border-emerald-100 bg-emerald-50/70 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-emerald-700 shadow-[0_6px_18px_rgba(16,185,129,0.12)]">
                    <MapPin size={18} />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-ink-900">Default delivery address</p>
                    <p className="text-xs text-ink-500">
                      Last updated {formatUpdatedAt(savedAddress.updatedAt)}
                    </p>
                  </div>
                </div>

                <div className="mt-4 space-y-1 text-sm text-ink-700">
                  <p className="font-semibold text-ink-900">{savedAddress.name}</p>
                  <p>{savedAddress.phone}</p>
                  <p>{savedAddress.district}</p>
                  <p className="leading-6">{savedAddress.address}</p>
                  {savedAddress.note ? (
                    <p className="text-xs text-ink-500">Note: {savedAddress.note}</p>
                  ) : null}
                </div>
              </div>

              <button
                type="button"
                onClick={handleRemove}
                disabled={isRemoving}
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-[10px] border border-rose-200 bg-white px-4 text-sm font-semibold text-rose-600 transition-colors hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isRemoving ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                <span>Remove</span>
              </button>
            </div>
          </div>
        ) : null}

        <form onSubmit={handleSave} className="mt-5 space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-ink-700">Full name</label>
              <input
                value={form.name}
                onChange={(event) => updateField("name", event.target.value)}
                className="mt-2 h-11 w-full rounded-[12px] border border-slate-200 px-3 text-sm text-ink-700 outline-none transition-colors focus:border-slate-400"
                placeholder="Your full name"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-ink-700">Phone number</label>
              <input
                value={form.phone}
                onChange={(event) => updateField("phone", event.target.value)}
                className="mt-2 h-11 w-full rounded-[12px] border border-slate-200 px-3 text-sm text-ink-700 outline-none transition-colors focus:border-slate-400"
                placeholder="01XXXXXXXXX"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-ink-700">District</label>
            <select
              value={form.district}
              onChange={(event) => updateField("district", event.target.value)}
              className="mt-2 h-11 w-full rounded-[12px] border border-slate-200 bg-white px-3 text-sm text-ink-700 outline-none transition-colors focus:border-slate-400"
            >
              <option value="">Select district</option>
              {bangladeshDistricts.map((district) => (
                <option key={district} value={district}>
                  {district}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-ink-700">Complete address</label>
            <textarea
              value={form.address}
              onChange={(event) => updateField("address", event.target.value)}
              className="mt-2 min-h-[118px] w-full rounded-[12px] border border-slate-200 px-3 py-3 text-sm leading-6 text-ink-700 outline-none transition-colors focus:border-slate-400"
              placeholder="House, road, area, thana, landmark"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-ink-700">Delivery note</label>
            <input
              value={form.note}
              onChange={(event) => updateField("note", event.target.value)}
              className="mt-2 h-11 w-full rounded-[12px] border border-slate-200 px-3 text-sm text-ink-700 outline-none transition-colors focus:border-slate-400"
              placeholder="Optional note for your rider"
            />
          </div>

          {error ? (
            <p className="rounded-[12px] bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</p>
          ) : null}

          {message ? (
            <p className="rounded-[12px] bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</p>
          ) : null}

          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[12px] bg-slate-950 px-5 text-sm font-semibold text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            <span>{savedAddress ? "Update address" : "Save address"}</span>
          </button>
        </form>
      </div>
    </section>
  );
}
