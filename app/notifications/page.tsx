"use client";

import { useState } from "react";
import { Bell, Image as ImageIcon, Send } from "lucide-react";
import { api } from "@/lib/api";
import AdminLayout from "@/components/AdminLayout";

const AUDIENCES = [
  { value: "ALL", label: "Everyone" },
  { value: "USERS", label: "Customers" },
  { value: "DELIVERY_PARTNERS", label: "Delivery Partners" },
  { value: "PROPERTY_OWNERS", label: "Property Owners" },
];

export default function NotificationsPage() {
  const [audience, setAudience] = useState("ALL");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canSend = title.trim().length > 0 && body.trim().length > 0 && !sending;

  async function sendNotification() {
    if (!canSend) return;
    setSending(true);
    setResult(null);
    setError(null);
    try {
      const response = await api.post("/admin/notifications/broadcast", {
        audience,
        title: title.trim(),
        body: body.trim(),
        imageUrl: imageUrl.trim() || undefined,
      });
      setResult(`Sent to ${response.data.recipients} recipient(s).`);
      setTitle("");
      setBody("");
      setImageUrl("");
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Could not send notification");
    } finally {
      setSending(false);
    }
  }

  return (
        <AdminLayout>
    <main className="min-h-screen bg-zinc-950 px-6 py-8 text-white md:px-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-md bg-brandRed">
            <Bell size={20} />
          </div>
          <div>
            <h1 className="text-xl font-black uppercase tracking-widest">Push Notifications</h1>
            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
              Send image and text campaigns to app users
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <section className="rounded-md border border-white/10 bg-white/[0.03] p-6">
            <div className="mb-6">
              <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-zinc-400">
                Audience
              </label>
              <div className="grid gap-2 sm:grid-cols-4">
                {AUDIENCES.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setAudience(item.value)}
                    className={`rounded-md border px-3 py-3 text-[10px] font-black uppercase tracking-widest transition ${
                      audience === item.value
                        ? "border-brandRed bg-brandRed text-white"
                        : "border-white/10 bg-zinc-900 text-zinc-400 hover:border-white/30 hover:text-white"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-5">
              <Field label="Title">
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  maxLength={120}
                  className="w-full rounded-md border border-white/10 bg-zinc-900 px-4 py-3 text-sm font-bold text-white outline-none transition focus:border-brandRed"
                  placeholder="Big sale is live"
                />
              </Field>

              <Field label="Message">
                <textarea
                  value={body}
                  onChange={(event) => setBody(event.target.value)}
                  maxLength={800}
                  rows={6}
                  className="w-full resize-none rounded-md border border-white/10 bg-zinc-900 px-4 py-3 text-sm font-semibold text-white outline-none transition focus:border-brandRed"
                  placeholder="Tell users what is new, urgent, or useful."
                />
              </Field>

              <Field label="Image URL">
                <div className="flex items-center gap-3 rounded-md border border-white/10 bg-zinc-900 px-4 py-3 focus-within:border-brandRed">
                  <ImageIcon size={16} className="text-zinc-500" />
                  <input
                    value={imageUrl}
                    onChange={(event) => setImageUrl(event.target.value)}
                    className="w-full bg-transparent text-sm font-semibold text-white outline-none"
                    placeholder="https://..."
                  />
                </div>
              </Field>

              {result ? <p className="text-xs font-bold text-emerald-400">{result}</p> : null}
              {error ? <p className="text-xs font-bold text-red-400">{error}</p> : null}

              <button
                type="button"
                disabled={!canSend}
                onClick={sendNotification}
                className="flex w-full items-center justify-center gap-2 rounded-md bg-brandRed px-5 py-4 text-[11px] font-black uppercase tracking-widest text-white transition hover:bg-white hover:text-brandBlack disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Send size={16} />
                {sending ? "Sending..." : "Send Notification"}
              </button>
            </div>
          </section>

          <aside className="rounded-md border border-white/10 bg-white p-4 text-brandBlack">
            <p className="mb-3 text-[10px] font-black uppercase tracking-widest text-zinc-500">Preview</p>
            {imageUrl ? (
              <img
                src={imageUrl}
                alt=""
                className="mb-4 aspect-[16/9] w-full rounded-md object-cover"
              />
            ) : (
              <div className="mb-4 flex aspect-[16/9] w-full items-center justify-center rounded-md bg-zinc-100">
                <ImageIcon size={24} className="text-zinc-400" />
              </div>
            )}
            <h2 className="text-base font-black">{title || "Notification title"}</h2>
            <p className="mt-2 text-sm font-medium leading-5 text-zinc-600">
              {body || "Your notification message will appear here before sending."}
            </p>
            <div className="mt-4 rounded-md bg-zinc-100 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-zinc-500">
              {AUDIENCES.find((item) => item.value === audience)?.label}
            </div>
          </aside>
        </div>
      </div>
    </main>
    </AdminLayout>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[10px] font-black uppercase tracking-widest text-zinc-400">
        {label}
      </span>
      {children}
    </label>
  );
}
