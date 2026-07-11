"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, CheckCheck, Image as ImageIcon, Send } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { api } from "@/lib/api";
import { getStoredAdminRole } from "@/lib/auth";

const AUDIENCES = [
  { value: "ALL", label: "Everyone" },
  { value: "USERS", label: "Customers" },
  { value: "DELIVERY_PARTNERS", label: "Delivery Partners" },
  { value: "PROPERTY_OWNERS", label: "Property Owners" },
];

export default function NotificationsPage() {
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [items, setItems] = useState<any[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const [audience, setAudience] = useState("ALL");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");

  const loadInbox = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const response = await api.get("/notifications/my", { params: { page: 1, limit: 50 } });
      setItems(response.data.items || []);
      setUnread(Number(response.data.unread || 0));
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    setRole(getStoredAdminRole());
    loadInbox();
    const timer = window.setInterval(() => loadInbox(true), 30000);
    return () => window.clearInterval(timer);
  }, [loadInbox]);

  async function openNotification(item: any) {
    if (!item.readAt) {
      await api.patch(`/notifications/${item.id}/read`).catch(() => undefined);
      setItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, readAt: new Date().toISOString() } : entry));
      setUnread((value) => Math.max(0, value - 1));
    }
    const target = notificationTarget(item.data, role);
    if (target) router.push(target);
  }

  async function markAllRead() {
    await api.patch("/notifications/read-all");
    setItems((current) => current.map((item) => ({ ...item, readAt: item.readAt || new Date().toISOString() })));
    setUnread(0);
  }

  async function sendNotification() {
    if (!title.trim() || !body.trim() || sending) return;
    try {
      setSending(true);
      setMessage("");
      const response = await api.post("/admin/notifications/broadcast", {
        audience, title: title.trim(), body: body.trim(), imageUrl: imageUrl.trim() || undefined,
      });
      setMessage(`Sent to ${response.data.recipients} recipient(s).`);
      setTitle(""); setBody(""); setImageUrl("");
      await loadInbox(true);
    } catch (error: any) {
      setMessage(error?.response?.data?.message || "Could not send notification");
    } finally {
      setSending(false);
    }
  }

  return (
    <AdminLayout>
      <div className="admin-page max-w-6xl">
        <div className="admin-hero">
          <div>
            <h1 className="admin-hero-title">Notification <span className="text-brandRed">Center</span></h1>
            <p className="admin-hero-subtitle">Orders, staff, property, service, and account activity.</p>
          </div>
          <div className="rounded-md bg-brandRed px-4 py-3 text-xs font-black text-white">{unread} unread</div>
        </div>

        <div className={`grid gap-6 ${role === "ADMIN" ? "xl:grid-cols-[1fr_390px]" : ""}`}>
          <section className="admin-surface overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/10 p-5">
              <div className="flex items-center gap-3"><Bell className="text-brandRed" size={20} /><h2 className="text-sm font-black uppercase tracking-widest text-white">Your inbox</h2></div>
              <button disabled={!unread} onClick={markAllRead} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white disabled:opacity-40"><CheckCheck size={15} /> Mark all read</button>
            </div>
            {loading ? <div className="p-12 text-center text-xs font-black uppercase text-zinc-500">Loading notifications...</div> : items.length ? (
              <div className="divide-y divide-white/10">
                {items.map((item) => (
                  <button key={item.id} onClick={() => openNotification(item)} className={`block w-full p-5 text-left transition hover:bg-white/5 ${item.readAt ? "bg-transparent" : "bg-brandRed/10"}`}>
                    <div className="flex items-start gap-3">
                      <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${item.readAt ? "bg-zinc-700" : "bg-brandRed"}`} />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-2"><p className="text-sm font-black text-white">{item.title}</p><span className="text-[9px] font-bold uppercase text-zinc-600">{new Date(item.createdAt).toLocaleString()}</span></div>
                        <p className="mt-2 text-xs font-medium leading-5 text-zinc-400">{item.body}</p>
                        <p className="mt-2 text-[9px] font-black uppercase tracking-widest text-brandRed">{String(item.type || "Activity").replaceAll("_", " ")}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : <div className="p-12 text-center text-xs font-black uppercase text-zinc-500">No notifications yet</div>}
          </section>

          {role === "ADMIN" ? (
            <aside className="admin-surface h-fit p-6">
              <h2 className="mb-5 flex items-center gap-2 text-sm font-black uppercase tracking-widest text-white"><Send size={17} className="text-brandRed" /> Send campaign</h2>
              <div className="grid grid-cols-2 gap-2">{AUDIENCES.map((item) => <button key={item.value} onClick={() => setAudience(item.value)} className={`rounded-md border px-2 py-3 text-[9px] font-black uppercase ${audience === item.value ? "border-brandRed bg-brandRed text-white" : "border-white/10 text-zinc-400"}`}>{item.label}</button>)}</div>
              <input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={120} placeholder="Notification title" className="admin-field mt-4" />
              <textarea value={body} onChange={(event) => setBody(event.target.value)} maxLength={800} rows={5} placeholder="Message" className="admin-field mt-3 resize-none" />
              <div className="admin-field mt-3 flex items-center gap-2"><ImageIcon size={15} /><input value={imageUrl} onChange={(event) => setImageUrl(event.target.value)} placeholder="Optional image URL" className="min-w-0 flex-1 bg-transparent outline-none" /></div>
              {message ? <p className="mt-3 text-xs font-bold text-zinc-400">{message}</p> : null}
              <button disabled={!title.trim() || !body.trim() || sending} onClick={sendNotification} className="mt-4 w-full rounded-md bg-brandRed px-5 py-4 text-[10px] font-black uppercase tracking-widest text-white disabled:opacity-50">{sending ? "Sending..." : "Send notification"}</button>
            </aside>
          ) : null}
        </div>
      </div>
    </AdminLayout>
  );
}

function notificationTarget(data: any, role: string | null) {
  if (!data || typeof data !== "object") return null;
  if (data.orderId) return `/orders/${data.orderId}`;
  if (role === "PICKER") return null;
  if (data.screen === "Staff") return "/staff";
  if (data.screen === "Properties") return "/properties";
  if (data.screen === "Services") return "/services";
  if (data.screen === "Users") return "/users";
  return null;
}
