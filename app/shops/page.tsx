"use client";

import { useEffect, useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { api } from "@/lib/api";
import { LocateFixed, MapPin, RefreshCw, Save, Store } from "lucide-react";

type ShopForm = {
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  latitude: string;
  longitude: string;
  radiusKm: string;
};

const emptyForm: ShopForm = {
  name: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
  latitude: "",
  longitude: "",
  radiusKm: "5",
};

const toText = (value: unknown) => (value == null ? "" : String(value));

export default function ShopsPage() {
  const [form, setForm] = useState<ShopForm>(emptyForm);
  const [shop, setShop] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const loadShop = async () => {
    try {
      setLoading(true);
      setNotice(null);
      const res = await api.get("/admin/shops");
      const currentShop = res.data?.[0] || null;
      setShop(currentShop);
      setForm(currentShop ? {
        name: toText(currentShop.name),
        phone: toText(currentShop.phone),
        address: toText(currentShop.address),
        city: toText(currentShop.city),
        state: toText(currentShop.state),
        pincode: toText(currentShop.pincode),
        latitude: toText(currentShop.latitude),
        longitude: toText(currentShop.longitude),
        radiusKm: toText(currentShop.radiusKm || 5),
      } : emptyForm);
    } catch (err: any) {
      setNotice({ type: "error", text: err.response?.data?.message || "Could not load shop settings." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadShop();
  }, []);

  const updateField = (field: keyof ShopForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const detectCurrentLocation = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setNotice({ type: "error", text: "Location detection is not available in this browser." });
      return;
    }

    setDetectingLocation(true);
    setNotice(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setForm((current) => ({
          ...current,
          latitude: position.coords.latitude.toFixed(7),
          longitude: position.coords.longitude.toFixed(7),
        }));
        setNotice({ type: "success", text: "Location detected. Review the coordinates and save the shop." });
        setDetectingLocation(false);
      },
      (error) => {
        const message =
          error.code === error.PERMISSION_DENIED
            ? "Allow location permission and try again while you are at the shop."
            : "Could not detect location. Check GPS/internet and try again at the shop.";
        setNotice({ type: "error", text: message });
        setDetectingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
  };

  const saveShop = async () => {
    try {
      setSaving(true);
      setNotice(null);
      await api.post("/admin/shops", {
        name: form.name.trim(),
        phone: form.phone.trim() || undefined,
        address: form.address.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        pincode: form.pincode.trim(),
        latitude: form.latitude ? Number(form.latitude) : undefined,
        longitude: form.longitude ? Number(form.longitude) : undefined,
        radiusKm: form.radiusKm ? Number(form.radiusKm) : 5,
      });
      setNotice({ type: "success", text: "Shop saved. You can now create pickers for this shop." });
      await loadShop();
    } catch (err: any) {
      setNotice({ type: "error", text: err.response?.data?.message || "Could not save shop settings." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="admin-page">
        <div className="admin-hero">
          <div>
            <h1 className="admin-hero-title">
              Shop <span className="text-brandRed">Settings</span>
            </h1>
            <p className="admin-hero-subtitle">
              Add your store location so orders, inventory, and picker staff can be linked correctly.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={loadShop}
              disabled={loading || saving}
              className="admin-dark-button disabled:opacity-60"
            >
              <RefreshCw size={14} /> Refresh
            </button>
            <button
              type="button"
              onClick={saveShop}
              disabled={loading || saving}
              className="admin-red-button disabled:opacity-60"
            >
              {saving ? <Store size={14} /> : <Save size={14} />}
              {saving ? "Saving" : "Save Shop"}
            </button>
          </div>
        </div>

        {notice ? (
          <div className={`rounded-md border px-4 py-3 text-sm font-bold ${
            notice.type === "success"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
              : "border-brandRed/30 bg-brandRed/10 text-red-100"
          }`}>
            {notice.text}
          </div>
        ) : null}

        <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
          <section className="admin-surface p-5 md:p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-md bg-brandRed/10 p-3 text-brandRed">
                <Store size={20} />
              </div>
              <div>
                <h2 className="text-sm font-black uppercase tracking-widest text-white">Store Details</h2>
                <p className="text-xs text-zinc-500">This is the operational shop assigned to your sub-admin account.</p>
              </div>
            </div>

            {loading ? (
              <div className="py-12 text-sm text-zinc-500">Loading shop settings...</div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Shop Name" value={form.name} onChange={(value) => updateField("name", value)} />
                <Field label="Phone" value={form.phone} onChange={(value) => updateField("phone", value)} />
                <Field label="Address" className="md:col-span-2" value={form.address} onChange={(value) => updateField("address", value)} />
                <Field label="City" value={form.city} onChange={(value) => updateField("city", value)} />
                <Field label="State" value={form.state} onChange={(value) => updateField("state", value)} />
                <Field label="Pincode" value={form.pincode} onChange={(value) => updateField("pincode", value)} />
                <Field label="Delivery Radius (km)" type="number" value={form.radiusKm} onChange={(value) => updateField("radiusKm", value)} />

                <div className="md:col-span-2 rounded-md border border-white/10 bg-white/5 p-4">
                  <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-widest text-white">Exact Shop Location</h3>
                      <p className="mt-1 text-xs leading-5 text-zinc-500">
                        Use this while standing at the shop to fill latitude and longitude automatically.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={detectCurrentLocation}
                      disabled={detectingLocation || saving}
                      className="inline-flex items-center justify-center gap-2 rounded-md bg-white px-4 py-3 text-[10px] font-black uppercase tracking-widest text-brandBlack transition hover:bg-brandRed hover:text-white disabled:opacity-60"
                    >
                      <LocateFixed size={14} />
                      {detectingLocation ? "Detecting" : "Use Current Location"}
                    </button>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Latitude" type="number" value={form.latitude} onChange={(value) => updateField("latitude", value)} />
                    <Field label="Longitude" type="number" value={form.longitude} onChange={(value) => updateField("longitude", value)} />
                  </div>
                </div>
              </div>
            )}
          </section>

          <aside className="admin-surface p-5">
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-md bg-white/10 p-3 text-white">
                <MapPin size={20} />
              </div>
              <div>
                <h2 className="text-sm font-black uppercase tracking-widest text-white">Current Shop</h2>
                <p className="text-xs text-zinc-500">{shop ? "Linked and active" : "No shop linked yet"}</p>
              </div>
            </div>

            {shop ? (
              <div className="space-y-4 text-sm">
                <Info label="Name" value={shop.name} />
                <Info label="Location" value={`${shop.city}, ${shop.state} ${shop.pincode}`} />
                <Info label="Staff" value={`${shop._count?.staff || 0} members`} />
                <Info label="Orders" value={`${shop._count?.orders || 0} assigned`} />
              </div>
            ) : (
              <p className="text-sm leading-6 text-zinc-400">
                Save this form once before creating pickers. Picker accounts are attached to this shop automatically.
              </p>
            )}
          </aside>
        </div>
      </div>
    </AdminLayout>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  className = "",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  className?: string;
}) {
  return (
    <label className={`space-y-2 ${className}`}>
      <span className="admin-label">{label}</span>
      <input
        className="admin-field"
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-white/10 bg-white/5 p-3">
      <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{label}</p>
      <p className="mt-1 font-bold text-white">{value}</p>
    </div>
  );
}
