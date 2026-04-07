"use client";

import { useEffect, useMemo, useState } from "react";
import { BookOpen, CheckCircle2, Copy, Save, ShieldCheck } from "lucide-react";
import api, { getApiErrorMessage } from "@/lib/api";

const INITIAL_FORM = {
  enabled: false,
  pixelId: "",
};

const PIXEL_SETUP_STEPS = [
  "Open Meta Events Manager and create or open your Pixel.",
  "Copy the numeric Pixel ID from Meta.",
  "Go to this admin page, paste the Pixel ID, and save settings.",
  "Open your storefront and verify with Meta Pixel Helper or Test Events.",
];

export default function AdminPixelSetupClient() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [copied, setCopied] = useState(false);

  const loadPixelSettings = async () => {
    setLoading(true);
    setError("");

    try {
      const { data } = await api.get("/api/admin/pixel-settings");

      setForm({
        enabled: Boolean(data?.pixelSettings?.enabled),
        pixelId: String(data?.pixelSettings?.pixelId || ""),
      });
    } catch (loadError) {
      setError(getApiErrorMessage(loadError, "Unable to load pixel setup."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPixelSettings();
  }, []);

  const generatedGuide = useMemo(() => {
    const activePixelId = form.pixelId.trim() || "YOUR_PIXEL_ID";

    return [
      "Meta Pixel is already wired into this website.",
      "No code change is needed after project delivery.",
      `Saved Pixel ID: ${activePixelId}`,
      "Automatic events: PageView, AddToCart, InitiateCheckout, Purchase",
    ].join("\n");
  }, [form.pixelId]);

  const updateField = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
    setError("");
    setSuccess("");
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const { data } = await api.patch("/api/admin/pixel-settings", {
        enabled: form.enabled,
        pixelId: form.pixelId.trim(),
      });

      setForm({
        enabled: Boolean(data?.pixelSettings?.enabled),
        pixelId: String(data?.pixelSettings?.pixelId || ""),
      });
      setSuccess(data?.message || "Pixel settings saved.");
    } catch (saveError) {
      setError(getApiErrorMessage(saveError, "Unable to save pixel settings."));
    } finally {
      setSaving(false);
    }
  };

  const handleDisable = async () => {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const { data } = await api.patch("/api/admin/pixel-settings", {
        enabled: false,
        pixelId: "",
      });

      setForm({
        enabled: Boolean(data?.pixelSettings?.enabled),
        pixelId: String(data?.pixelSettings?.pixelId || ""),
      });
      setSuccess("Meta Pixel has been disabled.");
    } catch (saveError) {
      setError(getApiErrorMessage(saveError, "Unable to disable pixel settings."));
    } finally {
      setSaving(false);
    }
  };

  const handleCopyGuide = async () => {
    try {
      await navigator.clipboard.writeText(generatedGuide);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch (copyError) {
      setError("Unable to copy the setup notes.");
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
      <section className="rounded-[32px] border border-slate-200 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.12),transparent_42%),linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(248,250,252,0.98)_100%)] p-6 shadow-[0_24px_60px_rgba(15,23,42,0.10)] sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-700 ring-1 ring-sky-100">
              <ShieldCheck size={22} />
            </span>
            <div>
              <p className="text-sm font-medium text-slate-500">Meta Pixel Control</p>
              <h2 className="mt-1 text-2xl font-semibold text-slate-950">Save Pixel ID from admin</h2>
            </div>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${
              form.enabled && form.pixelId
                ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                : "bg-slate-100 text-slate-600 ring-slate-200"
            }`}
          >
            {form.enabled && form.pixelId ? "Pixel active" : "Pixel inactive"}
          </span>
        </div>

        <form onSubmit={handleSave} className="mt-6 space-y-5">
          <div className="rounded-[24px] border border-slate-200 bg-white/90 p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-900">Enable Meta Pixel tracking</p>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Turn this on after adding a valid Pixel ID.
                </p>
              </div>
              <button
                type="button"
                onClick={() => updateField("enabled", !form.enabled)}
                className={`relative inline-flex h-8 w-14 shrink-0 rounded-full transition-colors ${
                  form.enabled ? "bg-sky-600" : "bg-slate-300"
                }`}
                aria-pressed={form.enabled}
              >
                <span
                  className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow-sm transition-transform ${
                    form.enabled ? "translate-x-7" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="rounded-[24px] border border-slate-200 bg-white/90 p-5">
            <label className="block text-sm font-semibold text-slate-900" htmlFor="pixel-id">
              Meta Pixel ID
            </label>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              Paste only the numeric Pixel ID. No extra code is required anywhere else.
            </p>
            <input
              id="pixel-id"
              type="text"
              inputMode="numeric"
              value={form.pixelId}
              onChange={(event) => updateField("pixelId", event.target.value.replace(/[^\d]/g, ""))}
              placeholder="123456789012345"
              className="mt-4 h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition-colors focus:border-sky-400 focus:bg-white"
            />
          </div>

          {(error || success) && (
            <div
              className={`rounded-[20px] px-4 py-3 text-sm font-medium ${
                error
                  ? "border border-rose-200 bg-rose-50 text-rose-700"
                  : "border border-emerald-200 bg-emerald-50 text-emerald-700"
              }`}
            >
              {error || success}
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={saving || loading}
              className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save size={16} />
              {saving ? "Saving..." : "Save Pixel Settings"}
            </button>

            <button
              type="button"
              onClick={handleDisable}
              disabled={saving || loading}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Disable Pixel
            </button>
          </div>
        </form>

        <div className="mt-6 rounded-[24px] border border-emerald-200 bg-[linear-gradient(180deg,rgba(236,253,245,0.9)_0%,rgba(255,255,255,1)_100%)] p-5">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200">
              <ShieldCheck size={18} />
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-900">No code edit needed after delivery</p>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Once a buyer adds the Pixel ID here, this website starts loading Meta Pixel
                automatically and tracks page views, add to cart, checkout start, and purchase.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="rounded-[32px] border border-slate-200 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.10),transparent_42%),linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(248,250,252,0.98)_100%)] p-6 shadow-[0_24px_60px_rgba(15,23,42,0.10)] sm:p-7">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-slate-500">Setup Guide</p>
              <h3 className="mt-1 text-2xl font-semibold text-slate-950">Buyer-friendly instructions</h3>
            </div>
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-50 text-sky-700">
              <BookOpen size={18} />
            </span>
          </div>

          <div className="mt-6 space-y-3">
            {PIXEL_SETUP_STEPS.map((step, index) => (
              <div
                key={step}
                className="flex items-start gap-3 rounded-[24px] border border-slate-200 bg-white/90 px-4 py-4"
              >
                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-xs font-semibold text-white">
                  {index + 1}
                </span>
                <p className="text-sm leading-6 text-slate-700">{step}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[32px] border border-slate-200 bg-[radial-gradient(circle_at_top_right,rgba(125,211,252,0.12),transparent_42%),linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(248,250,252,0.98)_100%)] p-6 shadow-[0_24px_60px_rgba(15,23,42,0.10)] sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-slate-500">Ready-to-share note</p>
              <h3 className="mt-1 text-2xl font-semibold text-slate-950">What the buyer needs to know</h3>
            </div>
            <button
              type="button"
              onClick={handleCopyGuide}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              <Copy size={15} />
              {copied ? "Copied" : "Copy notes"}
            </button>
          </div>

          <div className="mt-6 rounded-[24px] border border-slate-200 bg-slate-950 p-4 text-sm text-slate-100">
            <pre className="overflow-x-auto whitespace-pre-wrap font-mono leading-6">
              {generatedGuide}
            </pre>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-[24px] border border-slate-200 bg-white/90 px-4 py-4">
              <div className="flex items-center gap-2 text-slate-900">
                <CheckCircle2 size={16} className="text-emerald-600" />
                <p className="text-sm font-semibold">Automatic tracking</p>
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Page view events start automatically after saving a valid Pixel ID.
              </p>
            </div>

            <div className="rounded-[24px] border border-slate-200 bg-white/90 px-4 py-4">
              <div className="flex items-center gap-2 text-slate-900">
                <CheckCircle2 size={16} className="text-emerald-600" />
                <p className="text-sm font-semibold">Future-safe delivery</p>
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Buyers can change the Pixel ID from admin later without asking for a code update.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
