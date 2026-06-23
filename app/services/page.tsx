"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import AdminLayout from "@/components/AdminLayout";

type Package = { id: number; name: string; description?: string; price: string; durationMinutes: number; platformFeePercent: string; isActive: boolean };
type Category = { id: number; name: string; slug: string; isActive: boolean; packages: Package[] };
type Provider = { id: number; status: string; city?: string; experienceYears: number; user: { name?: string; phone?: string; email?: string }; services: { category: Category }[] };

export default function ServicesAdminPage() {
  const [catalog, setCatalog] = useState<Category[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [tab, setTab] = useState<"catalog" | "providers">("catalog");
  const [error, setError] = useState("");
  const [categoryForm, setCategoryForm] = useState({ name: "", slug: "" });
  const [packageForm, setPackageForm] = useState({ categoryId: "", name: "", price: "", durationMinutes: "60", platformFeePercent: "20" });

  const load = useCallback(async () => {
    try {
      setError("");
      const [catalogResult, providerResult] = await Promise.all([
        api.get("/services/admin/catalog"),
        api.get("/services/admin/providers"),
      ]);
      setCatalog(catalogResult.data);
      setProviders(providerResult.data);
    } catch (e: any) {
      setError(e?.response?.data?.message || e.message || "Unable to load services");
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const createCategory = async (event: React.FormEvent) => {
    event.preventDefault();
    await api.post("/services/admin/categories", { ...categoryForm, sortOrder: catalog.length + 1 });
    setCategoryForm({ name: "", slug: "" });
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
          <p className="admin-hero-subtitle">Manage customer pricing, platform fees, service availability, and provider approvals.</p>
        </div>
        <button onClick={load} className="admin-dark-button">Refresh</button>
      </div>

      {error && <div className="admin-surface border border-red-500/40 p-4 text-red-300">{error}</div>}

      <div className="flex gap-2">
        <button className={tab === "catalog" ? "admin-red-button" : "admin-dark-button"} onClick={() => setTab("catalog")}>Catalog & Pricing</button>
        <button className={tab === "providers" ? "admin-red-button" : "admin-dark-button"} onClick={() => setTab("providers")}>Providers ({providers.filter((p) => p.status === "PENDING").length} pending)</button>
      </div>

      {tab === "catalog" ? (
        <div className="space-y-6">
          <div className="grid gap-5 lg:grid-cols-2">
            <form className="admin-surface p-6 space-y-4" onSubmit={createCategory}>
              <h2 className="text-lg font-black">Add service category</h2>
              <input className="admin-field" placeholder="Category name" required value={categoryForm.name} onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })} />
              <input className="admin-field" placeholder="URL slug (e.g. appliance-repair)" required value={categoryForm.slug} onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-") })} />
              <button className="admin-red-button" type="submit">Create category</button>
            </form>
            <form className="admin-surface p-6 space-y-4" onSubmit={createPackage}>
              <h2 className="text-lg font-black">Add fixed-price package</h2>
              <select className="admin-field" required value={packageForm.categoryId} onChange={(e) => setPackageForm({ ...packageForm, categoryId: e.target.value })}><option value="">Choose category</option>{catalog.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>
              <input className="admin-field" placeholder="Package name" required value={packageForm.name} onChange={(e) => setPackageForm({ ...packageForm, name: e.target.value })} />
              <div className="grid grid-cols-3 gap-3"><input className="admin-field" type="number" min="0" placeholder="Price ₹" required value={packageForm.price} onChange={(e) => setPackageForm({ ...packageForm, price: e.target.value })} /><input className="admin-field" type="number" min="15" placeholder="Minutes" required value={packageForm.durationMinutes} onChange={(e) => setPackageForm({ ...packageForm, durationMinutes: e.target.value })} /><input className="admin-field" type="number" min="0" max="100" placeholder="Fee %" required value={packageForm.platformFeePercent} onChange={(e) => setPackageForm({ ...packageForm, platformFeePercent: e.target.value })} /></div>
              <button className="admin-red-button" type="submit">Create package</button>
            </form>
          </div>

          {catalog.map((category) => <section key={category.id} className="admin-surface overflow-hidden"><div className="flex items-center justify-between border-b border-white/10 p-5"><div><h2 className="font-black text-lg">{category.name}</h2><p className="text-xs text-zinc-500">/{category.slug}</p></div><span className={category.isActive ? "text-emerald-400" : "text-zinc-500"}>{category.isActive ? "ACTIVE" : "HIDDEN"}</span></div><div className="overflow-x-auto"><table className="w-full"><thead><tr className="admin-table-head"><th className="admin-th text-left">Package</th><th className="admin-th text-center">Duration</th><th className="admin-th text-center">Customer price</th><th className="admin-th text-center">Provider earning</th><th className="admin-th text-right">Actions</th></tr></thead><tbody>{category.packages.map((item) => { const earning = Number(item.price) * (1 - Number(item.platformFeePercent) / 100); return <tr key={item.id} className="admin-row"><td className="admin-td font-bold">{item.name}</td><td className="admin-td text-center">{item.durationMinutes} min</td><td className="admin-td text-center font-black text-brandRed">₹{Number(item.price).toFixed(0)}</td><td className="admin-td text-center text-emerald-400">₹{earning.toFixed(0)}</td><td className="admin-td text-right space-x-2"><button className="admin-dark-button" onClick={() => editPrice(item)}>Edit price</button><button className="admin-dark-button" onClick={() => togglePackage(item)}>{item.isActive ? "Hide" : "Activate"}</button></td></tr>; })}</tbody></table></div></section>)}
        </div>
      ) : (
        <div className="admin-table overflow-x-auto"><table className="w-full"><thead><tr className="admin-table-head"><th className="admin-th text-left">Provider</th><th className="admin-th text-left">Services</th><th className="admin-th text-center">Experience</th><th className="admin-th text-center">Status</th><th className="admin-th text-right">Actions</th></tr></thead><tbody>{providers.map((provider) => <tr key={provider.id} className="admin-row"><td className="admin-td"><p className="font-black">{provider.user.name || "Unnamed provider"}</p><p className="text-xs text-zinc-500">{provider.user.phone || provider.user.email} · {provider.city || "City not set"}</p></td><td className="admin-td">{provider.services.map((item) => item.category.name).join(", ")}</td><td className="admin-td text-center">{provider.experienceYears} years</td><td className="admin-td text-center font-black">{provider.status}</td><td className="admin-td text-right space-x-2">{provider.status !== "APPROVED" && <button className="admin-red-button" onClick={() => setProviderStatus(provider, "APPROVED")}>Approve</button>}{provider.status !== "REJECTED" && <button className="admin-dark-button" onClick={() => setProviderStatus(provider, "REJECTED")}>Reject</button>}{provider.status === "APPROVED" && <button className="admin-dark-button" onClick={() => setProviderStatus(provider, "SUSPENDED")}>Suspend</button>}</td></tr>)}</tbody></table></div>
      )}
    </div>
    </AdminLayout>
  );
}
