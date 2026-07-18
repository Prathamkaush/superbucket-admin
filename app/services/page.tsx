"use client";

import { useCallback, useEffect, useState } from "react";
import { API_URL, api } from "@/lib/api";
import AdminLayout from "@/components/AdminLayout";
import { FiImage } from "react-icons/fi";

type Package = { id: number; name: string; description?: string; price: string; durationMinutes: number; platformFeePercent: string; isActive: boolean };
type Category = { id: number; name: string; slug: string; image?: string | null; isActive: boolean; packages: Package[] };
type Provider = { id: number; status: string; city?: string; experienceYears: number; user: { name?: string; phone?: string; email?: string }; services: { category: Category }[] };
type Booking = { id: number; bookingNumber: string; serviceName: string; status: string; scheduledAt: string; cancellationReason?: string | null; cancelledAt?: string | null; revisitReason?: string | null; revisitRequestedAt?: string | null; revisitAcceptedAt?: string | null; customer?: { name?: string | null; phone?: string | null }; provider?: { name?: string | null; phone?: string | null } | null };
type Extension = { id: number; serviceName: string; customerName: string; problemImage1: string; problemImage2: string; solvedImage1: string; solvedImage2: string; durationMinutes: number; charge: string; createdAt: string; booking: Booking };

export default function ServicesAdminPage() {
  const [catalog, setCatalog] = useState<Category[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [extensions, setExtensions] = useState<Extension[]>([]);
  const [tab, setTab] = useState<"catalog" | "providers" | "bookings" | "extended">("catalog");
  const [error, setError] = useState("");
  const [categoryForm, setCategoryForm] = useState({ name: "", slug: "" });
  const [categoryImage, setCategoryImage] = useState<File | null>(null);
  const [packageForm, setPackageForm] = useState({ categoryId: "", name: "", price: "", durationMinutes: "60", platformFeePercent: "20" });

  const load = useCallback(async () => {
    try {
      setError("");
      const [catalogResult, providerResult, bookingResult, extensionResult] = await Promise.all([
        api.get("/services/admin/catalog"),
        api.get("/services/admin/providers"),
        api.get("/services/admin/bookings"),
        api.get("/services/admin/extensions"),
      ]);
      setCatalog(catalogResult.data);
      setProviders(providerResult.data);
      setBookings(bookingResult.data || []);
      setExtensions(extensionResult.data || []);
    } catch (e: any) {
      setError(e?.response?.data?.message || e.message || "Unable to load services");
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const createCategory = async (event: React.FormEvent) => {
    event.preventDefault();
    const form = new FormData();
    form.append("name", categoryForm.name);
    form.append("slug", categoryForm.slug);
    form.append("sortOrder", String(catalog.length + 1));
    if (categoryImage) form.append("image", categoryImage);
    await api.post("/services/admin/categories", form);
    setCategoryForm({ name: "", slug: "" });
    setCategoryImage(null);
    load();
  };

  const createPackage = async (event: React.FormEvent) => {
    event.preventDefault();
    await api.post("/services/admin/packages", {
      ...packageForm,
      categoryId: Number(packageForm.categoryId),
      price: Number(packageForm.price),
      durationMinutes: Number(packageForm.durationMinutes),
      platformFeePercent: Number(packageForm.platformFeePercent),
    });
    setPackageForm({ categoryId: "", name: "", price: "", durationMinutes: "60", platformFeePercent: "20" });
    load();
  };

  const editPrice = async (item: Package) => {
    const value = window.prompt(`Set customer price for ${item.name}`, String(item.price));
    if (value === null || !Number.isFinite(Number(value)) || Number(value) < 0) return;
    await api.patch(`/services/admin/packages/${item.id}`, { price: Number(value) });
    load();
  };

  const togglePackage = async (item: Package) => {
    await api.patch(`/services/admin/packages/${item.id}`, { isActive: !item.isActive });
    load();
  };

  const setProviderStatus = async (provider: Provider, status: "APPROVED" | "REJECTED" | "SUSPENDED") => {
    const rejectionReason = status === "REJECTED" ? window.prompt("Reason for rejection") || "Profile requirements not met" : undefined;
    await api.patch(`/services/admin/providers/${provider.id}/status`, { status, rejectionReason });
    load();
  };

  return (
    <AdminLayout>
      <div className="admin-page">
        <div className="admin-hero">
          <div>
            <p className="admin-page-kicker">Fixed-price marketplace</p>
            <h1 className="admin-hero-title">Home <span className="text-brandRed">Services</span></h1>
            <p className="admin-hero-subtitle">Manage customer pricing, platform fees, service availability, provider approvals, and revisit requests.</p>
          </div>
          <button onClick={load} className="admin-dark-button">Refresh</button>
        </div>

        {error && <div className="admin-surface border border-red-500/40 p-4 text-red-300">{error}</div>}

        <div className="flex flex-wrap gap-2">
          <button className={tab === "catalog" ? "admin-red-button" : "admin-dark-button"} onClick={() => setTab("catalog")}>Catalog & Pricing</button>
          <button className={tab === "providers" ? "admin-red-button" : "admin-dark-button"} onClick={() => setTab("providers")}>Providers ({providers.filter((p) => p.status === "PENDING").length} pending)</button>
          <button className={tab === "bookings" ? "admin-red-button" : "admin-dark-button"} onClick={() => setTab("bookings")}>Bookings ({bookings.length})</button>
          <button className={tab === "extended" ? "admin-red-button" : "admin-dark-button"} onClick={() => setTab("extended")}>Extended ({extensions.length})</button>
        </div>

        {tab === "catalog" ? (
          <div className="space-y-6">
            <div className="grid gap-5 lg:grid-cols-2">
              <form className="admin-surface p-6 space-y-4" onSubmit={createCategory}>
                <h2 className="text-lg font-black">Add service category</h2>
                <input className="admin-field" placeholder="Category name" required value={categoryForm.name} onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })} />
                <input className="admin-field" placeholder="URL slug (e.g. appliance-repair)" required value={categoryForm.slug} onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-") })} />
                <label className="admin-field flex cursor-pointer items-center gap-3">
                  <FiImage className="shrink-0 text-brandRed" size={18} />
                  <span className="min-w-0 flex-1 truncate text-sm text-zinc-400">{categoryImage ? categoryImage.name : "Upload service category image"}</span>
                  <input type="file" accept="image/*" className="hidden" onChange={(event) => setCategoryImage(event.target.files?.[0] || null)} />
                </label>
                {categoryImage ? <img src={URL.createObjectURL(categoryImage)} alt="Service preview" className="h-36 w-full rounded-md object-cover" /> : null}
                <button className="admin-red-button" type="submit">Create category</button>
              </form>
              <form className="admin-surface p-6 space-y-4" onSubmit={createPackage}>
                <h2 className="text-lg font-black">Add fixed-price package</h2>
                <select className="admin-field" required value={packageForm.categoryId} onChange={(e) => setPackageForm({ ...packageForm, categoryId: e.target.value })}>
                  <option value="">Choose category</option>
                  {catalog.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                </select>
                <input className="admin-field" placeholder="Package name" required value={packageForm.name} onChange={(e) => setPackageForm({ ...packageForm, name: e.target.value })} />
                <div className="grid grid-cols-3 gap-3">
                  <input className="admin-field" type="number" min="0" placeholder="Price Rs" required value={packageForm.price} onChange={(e) => setPackageForm({ ...packageForm, price: e.target.value })} />
                  <input className="admin-field" type="number" min="15" placeholder="Minutes" required value={packageForm.durationMinutes} onChange={(e) => setPackageForm({ ...packageForm, durationMinutes: e.target.value })} />
                  <input className="admin-field" type="number" min="0" max="100" placeholder="Fee %" required value={packageForm.platformFeePercent} onChange={(e) => setPackageForm({ ...packageForm, platformFeePercent: e.target.value })} />
                </div>
                <button className="admin-red-button" type="submit">Create package</button>
              </form>
            </div>

            {catalog.map((category) => (
              <section key={category.id} className="admin-surface overflow-hidden">
                <div className="flex items-center justify-between border-b border-white/10 p-5">
                  <div className="flex items-center gap-3">{category.image ? <img src={serviceImageUrl(category.image)} alt="" className="h-12 w-12 rounded-md object-cover" /> : null}<div><h2 className="font-black text-lg">{category.name}</h2><p className="text-xs text-zinc-500">/{category.slug}</p></div></div>
                  <span className={category.isActive ? "text-emerald-400" : "text-zinc-500"}>{category.isActive ? "ACTIVE" : "HIDDEN"}</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead><tr className="admin-table-head"><th className="admin-th text-left">Package</th><th className="admin-th text-center">Duration</th><th className="admin-th text-center">Customer price</th><th className="admin-th text-center">Provider earning</th><th className="admin-th text-right">Actions</th></tr></thead>
                    <tbody>{category.packages.map((item) => { const earning = Number(item.price) * (1 - Number(item.platformFeePercent) / 100); return <tr key={item.id} className="admin-row"><td className="admin-td font-bold">{item.name}</td><td className="admin-td text-center">{item.durationMinutes} min</td><td className="admin-td text-center font-black text-brandRed">Rs {Number(item.price).toFixed(0)}</td><td className="admin-td text-center text-emerald-400">Rs {earning.toFixed(0)}</td><td className="admin-td text-right space-x-2"><button className="admin-dark-button" onClick={() => editPrice(item)}>Edit price</button><button className="admin-dark-button" onClick={() => togglePackage(item)}>{item.isActive ? "Hide" : "Activate"}</button></td></tr>; })}</tbody>
                  </table>
                </div>
              </section>
            ))}
          </div>
        ) : tab === "providers" ? (
          <ProvidersTable providers={providers} setProviderStatus={setProviderStatus} />
        ) : tab === "bookings" ? (
          <BookingsTable bookings={bookings} />
        ) : (
          <ExtensionsTable extensions={extensions} />
        )}
      </div>
    </AdminLayout>
  );
}

function ExtensionsTable({ extensions }: { extensions: Extension[] }) {
  return <div className="space-y-5">
    {extensions.map((item) => <section key={item.id} className="admin-surface p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div><p className="text-xs font-black uppercase tracking-wider text-brandRed">{item.booking.bookingNumber}</p><h2 className="mt-1 text-xl font-black">{item.serviceName}</h2><p className="mt-1 text-sm text-zinc-400">Customer: {item.customerName} · Provider: {item.booking.provider?.name || "Provider"}</p></div>
        <div className="text-right"><p className="text-xl font-black text-emerald-400">Rs {Number(item.charge).toFixed(0)}</p><p className="text-xs text-zinc-500">{item.durationMinutes} minutes</p></div>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        {[item.problemImage1, item.problemImage2, item.solvedImage1, item.solvedImage2].map((image, index) => <a key={image} href={serviceImageUrl(image)} target="_blank" rel="noreferrer"><img src={serviceImageUrl(image)} alt={index < 2 ? `Problem ${index + 1}` : `Solved ${index - 1}`} className="h-40 w-full rounded-lg object-cover" /><p className="mt-1 text-center text-xs font-bold text-zinc-400">{index < 2 ? `Problem ${index + 1}` : `Solved ${index - 1}`}</p></a>)}
      </div>
      <p className="mt-4 text-xs text-zinc-500">Submitted {new Date(item.createdAt).toLocaleString()}</p>
    </section>)}
    {!extensions.length ? <div className="admin-surface p-10 text-center text-zinc-400">No extended services submitted yet.</div> : null}
  </div>;
}

function serviceImageUrl(value: string) {
  if (/^https?:\/\//i.test(value)) return value;
  return `${API_URL.replace(/\/$/, "")}${value.startsWith("/") ? "" : "/"}${value}`;
}

function ProvidersTable({ providers, setProviderStatus }: { providers: Provider[]; setProviderStatus: (provider: Provider, status: "APPROVED" | "REJECTED" | "SUSPENDED") => void }) {
  return (
    <div className="admin-table overflow-x-auto">
      <table className="w-full">
        <thead><tr className="admin-table-head"><th className="admin-th text-left">Provider</th><th className="admin-th text-left">Services</th><th className="admin-th text-center">Experience</th><th className="admin-th text-center">Status</th><th className="admin-th text-right">Actions</th></tr></thead>
        <tbody>
          {providers.map((provider) => (
            <tr key={provider.id} className="admin-row">
              <td className="admin-td"><p className="font-black">{provider.user.name || "Unnamed provider"}</p><p className="text-xs text-zinc-500">{provider.user.phone || provider.user.email} - {provider.city || "City not set"}</p></td>
              <td className="admin-td">{provider.services.map((item) => item.category.name).join(", ")}</td>
              <td className="admin-td text-center">{provider.experienceYears} years</td>
              <td className="admin-td text-center font-black">{provider.status}</td>
              <td className="admin-td text-right space-x-2">{provider.status !== "APPROVED" && <button className="admin-red-button" onClick={() => setProviderStatus(provider, "APPROVED")}>Approve</button>}{provider.status !== "REJECTED" && <button className="admin-dark-button" onClick={() => setProviderStatus(provider, "REJECTED")}>Reject</button>}{provider.status === "APPROVED" && <button className="admin-dark-button" onClick={() => setProviderStatus(provider, "SUSPENDED")}>Suspend</button>}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function BookingsTable({ bookings }: { bookings: Booking[] }) {
  return (
    <div className="admin-table overflow-x-auto">
      <table className="w-full">
        <thead><tr className="admin-table-head"><th className="admin-th text-left">Booking</th><th className="admin-th text-left">Customer</th><th className="admin-th text-left">Provider</th><th className="admin-th text-center">Status</th><th className="admin-th text-left">Issue / Reason</th></tr></thead>
        <tbody>
          {bookings.map((booking) => (
            <tr key={booking.id} className="admin-row">
              <td className="admin-td"><p className="font-black">{booking.serviceName}</p><p className="text-xs text-zinc-500">{booking.bookingNumber} - {new Date(booking.scheduledAt).toLocaleString()}</p></td>
              <td className="admin-td"><p className="font-semibold">{booking.customer?.name || "Customer"}</p><p className="text-xs text-zinc-500">{booking.customer?.phone || "No phone"}</p></td>
              <td className="admin-td"><p className="font-semibold">{booking.provider?.name || "Unassigned"}</p><p className="text-xs text-zinc-500">{booking.provider?.phone || ""}</p></td>
              <td className="admin-td text-center font-black">{booking.status.replaceAll("_", " ")}</td>
              <td className="admin-td">
                {booking.cancellationReason ? (
                  <div><p className="font-bold text-red-600">{booking.cancellationReason}</p><p className="text-xs text-zinc-500">Cancelled {booking.cancelledAt ? new Date(booking.cancelledAt).toLocaleString() : ""}</p></div>
                ) : booking.revisitReason ? (
                  <div><p className="font-bold text-amber-600">{booking.revisitReason}</p><p className="text-xs text-zinc-500">Requested {booking.revisitRequestedAt ? new Date(booking.revisitRequestedAt).toLocaleString() : ""}{booking.revisitAcceptedAt ? ` - Accepted ${new Date(booking.revisitAcceptedAt).toLocaleString()}` : ""}</p></div>
                ) : (
                  <span className="text-xs text-zinc-400">No issue reported</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
