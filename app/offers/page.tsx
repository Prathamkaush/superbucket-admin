"use client";

import { FormEvent, useEffect, useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { api } from "@/lib/api";
import {
  FiEdit3,
  FiGift,
  FiPlus,
  FiSave,
  FiTag,
  FiTrash2,
  FiX,
} from "react-icons/fi";

type HomeOffer = {
  id: number;
  title: string;
  subtitle: string;
  buttonLabel?: string | null;
  code?: string | null;
  icon?: string | null;
  color?: string | null;
  sortOrder: number;
  isActive: boolean;
  startsAt?: string | null;
  expiresAt?: string | null;
};

const emptyForm = {
  title: "",
  subtitle: "",
  buttonLabel: "Claim",
  code: "",
  icon: "gift",
  color: "#E30613",
  sortOrder: "0",
  startsAt: "",
  expiresAt: "",
};

export default function OffersPage() {
  const [offers, setOffers] = useState<HomeOffer[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");

  const loadOffers = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/home-offers");
      setOffers(res.data || []);
    } catch (error) {
      setNotice("Could not load offers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOffers();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const editOffer = (offer: HomeOffer) => {
    setEditingId(offer.id);
    setForm({
      title: offer.title || "",
      subtitle: offer.subtitle || "",
      buttonLabel: offer.buttonLabel || "Claim",
      code: offer.code || "",
      icon: offer.icon || "gift",
      color: offer.color || "#E30613",
      sortOrder: String(offer.sortOrder || 0),
      startsAt: toDateInput(offer.startsAt),
      expiresAt: toDateInput(offer.expiresAt),
    });
  };

  const saveOffer = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setNotice("");

    const payload = {
      title: form.title,
      subtitle: form.subtitle,
      buttonLabel: form.buttonLabel,
      code: form.code || null,
      icon: form.icon || "gift",
      color: form.color || "#E30613",
      sortOrder: Number(form.sortOrder || 0),
      startsAt: form.startsAt || null,
      expiresAt: form.expiresAt || null,
    };

    try {
      if (editingId) {
        await api.patch(`/admin/home-offers/${editingId}`, payload);
        setNotice("Offer updated.");
      } else {
        await api.post("/admin/home-offers", payload);
        setNotice("Offer created.");
      }
      resetForm();
      loadOffers();
    } catch (error: any) {
      setNotice(error.response?.data?.message || "Could not save offer.");
    } finally {
      setSaving(false);
    }
  };

  const toggleOffer = async (id: number) => {
    await api.put(`/admin/home-offers/${id}/toggle`);
    setOffers((items) =>
      items.map((item) =>
        item.id === id ? { ...item, isActive: !item.isActive } : item
      )
    );
  };

  const deleteOffer = async (id: number) => {
    if (!confirm("Delete this offer card?")) return;
    await api.delete(`/admin/home-offers/${id}`);
    setOffers((items) => items.filter((item) => item.id !== id));
  };

  return (
    <AdminLayout>
      <div className="admin-page">
        <div className="admin-hero">
          <div>
            <h1 className="admin-hero-title">
              Home <span className="text-brandRed">Offers</span>
            </h1>
            <p className="admin-hero-subtitle">
              Create offer cards shown in the user app Offers for You section.
            </p>
          </div>
          <div className="admin-dark-button pointer-events-none">
            <FiGift size={16} /> {offers.length} Cards
          </div>
        </div>

        {notice && (
          <div className="rounded-md border border-blue-100 bg-white p-4 text-xs font-bold text-brandBlue">
            {notice}
          </div>
        )}

        <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
          <form onSubmit={saveOffer} className="rounded-md border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-sm font-black uppercase tracking-widest text-brandBlack">
                {editingId ? "Edit Offer" : "Create Offer"}
              </h2>
              {editingId && (
                <button type="button" onClick={resetForm} className="text-zinc-400 hover:text-brandRed">
                  <FiX size={18} />
                </button>
              )}
            </div>

            <Field label="Title">
              <input
                className="admin-field text-black"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="10% Cashback"
                required
              />
            </Field>

            <Field label="Subtitle">
              <input
                className="admin-field text-black"
                value={form.subtitle}
                onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                placeholder="On first order"
                required
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Button">
                <input
                  className="admin-field text-black"
                  value={form.buttonLabel}
                  onChange={(e) => setForm({ ...form, buttonLabel: e.target.value })}
                  placeholder="Claim"
                />
              </Field>
              <Field label="Coupon Code">
                <input
                  className="admin-field text-black uppercase"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  placeholder="FIRST10"
                />
              </Field>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <Field label="Icon">
                <select
                  className="admin-field text-black"
                  value={form.icon}
                  onChange={(e) => setForm({ ...form, icon: e.target.value })}
                >
                  <option value="gift">Gift</option>
                  <option value="wallet">Wallet</option>
                  <option value="truck">Delivery</option>
                  <option value="tag">Tag</option>
                  <option value="users">Refer</option>
                </select>
              </Field>
              <Field label="Color">
                <input
                  type="color"
                  className="h-12 w-full rounded-md border border-zinc-200 bg-white p-1"
                  value={form.color}
                  onChange={(e) => setForm({ ...form, color: e.target.value })}
                />
              </Field>
              <Field label="Order">
                <input
                  type="number"
                  className="admin-field text-black"
                  value={form.sortOrder}
                  onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Starts">
                <input
                  type="datetime-local"
                  className="admin-field text-black"
                  value={form.startsAt}
                  onChange={(e) => setForm({ ...form, startsAt: e.target.value })}
                />
              </Field>
              <Field label="Expires">
                <input
                  type="datetime-local"
                  className="admin-field text-black"
                  value={form.expiresAt}
                  onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                />
              </Field>
            </div>

            <button disabled={saving} className="admin-red-button mt-4 w-full justify-center">
              {editingId ? <FiSave size={14} /> : <FiPlus size={14} />}
              {saving ? "Saving..." : editingId ? "Update Offer" : "Create Offer"}
            </button>
          </form>

          <div className="admin-table overflow-hidden">
            {loading ? (
              <div className="p-10 text-center text-xs font-bold uppercase tracking-widest text-zinc-300">
                Loading offers...
              </div>
            ) : offers.length === 0 ? (
              <div className="p-10 text-center text-xs font-bold uppercase tracking-widest text-zinc-300">
                No offers created yet.
              </div>
            ) : (
              <div className="divide-y divide-zinc-100">
                {offers.map((offer) => (
                  <div key={offer.id} className="flex flex-col gap-4 p-5 md:flex-row md:items-center">
                    <div
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md text-white"
                      style={{ backgroundColor: offer.color || "#E30613" }}
                    >
                      <FiTag size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-black text-brandBlack">{offer.title}</h3>
                        <span className={`rounded-full px-2 py-1 text-[9px] font-black uppercase ${
                          offer.isActive ? "bg-emerald-50 text-emerald-700" : "bg-zinc-100 text-zinc-500"
                        }`}>
                          {offer.isActive ? "Active" : "Hidden"}
                        </span>
                      </div>
                      <p className="mt-1 text-xs font-semibold text-zinc-500">{offer.subtitle}</p>
                      {offer.code && (
                        <p className="mt-2 font-mono text-[10px] font-black uppercase tracking-widest text-brandRed">
                          Code: {offer.code}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleOffer(offer.id)}
                        className="rounded-md border border-zinc-200 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-zinc-600"
                      >
                        {offer.isActive ? "Hide" : "Show"}
                      </button>
                      <button
                        onClick={() => editOffer(offer)}
                        className="rounded-md bg-red-50 p-2 text-brandRed"
                      >
                        <FiEdit3 size={16} />
                      </button>
                      <button
                        onClick={() => deleteOffer(offer.id)}
                        className="rounded-md bg-zinc-100 p-2 text-zinc-600"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="mb-4 block">
      <span className="mb-2 block text-[10px] font-black uppercase tracking-widest text-zinc-400">
        {label}
      </span>
      {children}
    </label>
  );
}

function toDateInput(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 16);
}
