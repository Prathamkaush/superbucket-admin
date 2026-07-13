"use client";

import { FormEvent, useEffect, useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { API_URL, api } from "@/lib/api";
import { FiCheck, FiClock, FiEdit2, FiPause, FiPlay, FiPlus, FiTrash2, FiX } from "react-icons/fi";

type Plan = { id: number; name: string; price: number; durationDays: number; description?: string | null; isActive: boolean; sortOrder: number };
type Ad = { id: number; businessName: string; category?: string; description: string; address: string; phone: string; offerText?: string; imageUrl?: string; status: string; priceSnapshot: number; durationDaysSnapshot: number; rejectionReason?: string; daysRemaining?: number | null; views: number; clicks: number; createdAt: string; user?: { name?: string; phone?: string; email?: string }; plan?: Plan };

const emptyPlan = { name: "", price: "", durationDays: "", description: "", sortOrder: "0", isActive: true };

export default function BusinessAdsPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [ads, setAds] = useState<Ad[]>([]);
  const [form, setForm] = useState(emptyPlan);
  const [editingPlanId, setEditingPlanId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      const [planResponse, adResponse] = await Promise.all([
        api.get("/admin/home-offers/business-ad-plans"),
        api.get("/admin/home-offers/business-ads/campaigns"),
      ]);
      setPlans(planResponse.data || []);
      setAds(adResponse.data || []);
    } catch (error: any) {
      setNotice(error.response?.data?.message || "Could not load advertising data.");
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const savePlan = async (event: FormEvent) => {
    event.preventDefault();
    const payload = { ...form, price: Number(form.price), durationDays: Number(form.durationDays), sortOrder: Number(form.sortOrder) };
    try {
      if (editingPlanId) await api.patch(`/admin/home-offers/business-ad-plans/${editingPlanId}`, payload);
      else await api.post("/admin/home-offers/business-ad-plans", payload);
      setForm(emptyPlan); setEditingPlanId(null); setNotice("Advertising package saved."); await load();
    } catch (error: any) { setNotice(error.response?.data?.message || "Could not save package."); }
  };

  const editPlan = (plan: Plan) => {
    setEditingPlanId(plan.id);
    setForm({ name: plan.name, price: String(plan.price), durationDays: String(plan.durationDays), description: plan.description || "", sortOrder: String(plan.sortOrder), isActive: plan.isActive });
  };

  const review = async (ad: Ad, decision: "APPROVED" | "REJECTED") => {
    const reason = decision === "REJECTED" ? window.prompt("Tell the advertiser what needs to change:") : "";
    if (decision === "REJECTED" && !reason?.trim()) return;
    await api.patch(`/admin/home-offers/business-ads/campaigns/${ad.id}/review`, { decision, reason });
    await load();
  };

  const pause = async (ad: Ad) => { await api.put(`/admin/home-offers/business-ads/campaigns/${ad.id}/pause`); await load(); };
  const archive = async (ad: Ad) => {
    if (!confirm(`Archive ${ad.businessName}? This does not automatically refund payment.`)) return;
    await api.delete(`/admin/home-offers/business-ads/campaigns/${ad.id}`); await load();
  };

  return (
    <AdminLayout>
      <div className="admin-page">
        <div className="admin-hero"><div><h1 className="admin-hero-title">Business <span className="text-brandRed">Advertising</span></h1><p className="admin-hero-subtitle">Manage packages, review creatives, and monitor active campaigns.</p></div><div className="admin-dark-button pointer-events-none">{ads.length} Campaigns</div></div>
        {notice ? <div className="rounded-md border border-blue-100 bg-white p-4 text-xs font-bold text-brandBlue">{notice}</div> : null}

        <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
          <form onSubmit={savePlan} className="admin-surface p-6 space-y-4">
            <div className="flex items-center justify-between"><h2 className="text-xs font-black uppercase tracking-widest text-white">{editingPlanId ? "Edit package" : "New package"}</h2>{editingPlanId ? <button type="button" onClick={() => { setEditingPlanId(null); setForm(emptyPlan); }}><FiX /></button> : null}</div>
            <Field label="Package name"><input className="admin-field" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Starter" /></Field>
            <div className="grid grid-cols-2 gap-3"><Field label="Price (Rs)"><input className="admin-field" required type="number" min="1" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></Field><Field label="Duration days"><input className="admin-field" required type="number" min="1" max="365" value={form.durationDays} onChange={(e) => setForm({ ...form, durationDays: e.target.value })} /></Field></div>
            <Field label="Description"><textarea className="admin-field min-h-24" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
            <label className="flex items-center gap-3 text-xs font-bold text-zinc-300"><input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} /> Available to users</label>
            <button className="admin-red-button w-full justify-center"><FiPlus /> {editingPlanId ? "Update package" : "Create package"}</button>
            <div className="border-t border-white/10 pt-4 space-y-2">{plans.map((plan) => <button type="button" key={plan.id} onClick={() => editPlan(plan)} className="w-full rounded-md border border-white/10 p-3 text-left hover:border-brandRed"><div className="flex justify-between"><span className="text-xs font-black text-white">{plan.name}</span><FiEdit2 className="text-brandRed" /></div><p className="mt-1 text-[10px] text-zinc-400">Rs {Number(plan.price).toFixed(0)} · {plan.durationDays} days · {plan.isActive ? "Active" : "Hidden"}</p></button>)}</div>
          </form>

          <div className="space-y-4">
            {loading ? <div className="admin-surface p-10 text-center text-zinc-400">Loading campaigns...</div> : ads.map((ad) => <div key={ad.id} className="admin-surface p-5">
              <div className="flex flex-col gap-4 md:flex-row">
                {ad.imageUrl ? <img src={imageUrl(ad.imageUrl)} alt="" className="h-28 w-full rounded-md object-cover md:w-44" /> : <div className="flex h-28 w-full items-center justify-center rounded-md bg-white/5 text-zinc-500 md:w-44">No poster</div>}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2"><h3 className="text-lg font-black text-white">{ad.businessName}</h3><Status value={ad.status} /></div>
                  <p className="mt-1 text-xs text-zinc-400">{ad.user?.name || ad.user?.phone || ad.user?.email} · {ad.category || "Local business"}</p>
                  <p className="mt-3 text-sm text-zinc-300">{ad.offerText || ad.description}</p>
                  <div className="mt-3 flex flex-wrap gap-4 text-[10px] font-black uppercase tracking-widest text-zinc-500"><span>Rs {Number(ad.priceSnapshot).toFixed(0)}</span><span>{ad.durationDaysSnapshot} days</span><span>{ad.daysRemaining ?? "—"} left</span><span>{ad.views || 0} views</span><span>{ad.clicks || 0} clicks</span></div>
                  {ad.rejectionReason ? <p className="mt-3 rounded-md bg-rose-950/30 p-3 text-xs text-rose-300">{ad.rejectionReason}</p> : null}
                </div>
              </div>
              <div className="mt-4 flex flex-wrap justify-end gap-2 border-t border-white/10 pt-4">
                {ad.status === "PENDING_REVIEW" ? <><button onClick={() => review(ad, "REJECTED")} className="admin-dark-button"><FiX /> Reject</button><button onClick={() => review(ad, "APPROVED")} className="admin-red-button"><FiCheck /> Approve</button></> : null}
                {["ACTIVE", "PAUSED"].includes(ad.status) ? <button onClick={() => pause(ad)} className="admin-dark-button">{ad.status === "ACTIVE" ? <FiPause /> : <FiPlay />} {ad.status === "ACTIVE" ? "Pause" : "Resume"}</button> : null}
                <button onClick={() => archive(ad)} className="admin-dark-button text-rose-300"><FiTrash2 /> Archive</button>
              </div>
            </div>)}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block"><span className="admin-label mb-2 block">{label}</span>{children}</label>; }
function Status({ value }: { value: string }) { const tone: Record<string, string> = { PENDING_REVIEW: "bg-amber-500/15 text-amber-300", APPROVED_AWAITING_PAYMENT: "bg-blue-500/15 text-blue-300", ACTIVE: "bg-emerald-500/15 text-emerald-300", REJECTED: "bg-rose-500/15 text-rose-300", PAUSED: "bg-purple-500/15 text-purple-300", EXPIRED: "bg-zinc-500/15 text-zinc-300", ARCHIVED: "bg-zinc-700 text-zinc-400" }; return <span className={`rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-widest ${tone[value] || tone.ARCHIVED}`}>{value.replaceAll("_", " ")}</span>; }
function imageUrl(value: string) { return /^https?:\/\//i.test(value) ? value : `${API_URL.replace(/\/$/, "")}${value.startsWith("/") ? "" : "/"}${value}`; }
