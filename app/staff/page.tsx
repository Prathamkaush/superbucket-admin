"use client";

import { useEffect, useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { api } from "@/lib/api";
import { getStoredAdminRole } from "@/lib/auth";
import { ShieldPlus, UserPlus, UsersRound } from "lucide-react";

const ROLES = [
  { value: "SUB_ADMIN", label: "Sub Admin" },
  { value: "PICKER", label: "Picker" },
];

export default function StaffPage() {
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [currentRole, setCurrentRole] = useState<string | null>(null);
  const roleOptions = currentRole === "SUB_ADMIN"
    ? ROLES.filter((role) => role.value === "PICKER")
    : ROLES;
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "PICKER",
  });

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/staff");
      setStaff(res.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentRole(getStoredAdminRole());
    load();
  }, []);

  const createStaff = async () => {
    try {
      setSaving(true);
      setError("");
      await api.post("/admin/staff", form);
      setForm({ name: "", email: "", phone: "", password: "", role: "PICKER" });
      await load();
    } catch (err: any) {
      setError(err.response?.data?.message || "Could not create staff member");
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
              Staff <span className="text-brandRed">Control</span>
            </h1>
            <p className="admin-hero-subtitle">
              Create sub-admins and pickers for order fulfillment.
            </p>
          </div>
          <div className="admin-dark-button pointer-events-none">
            <UsersRound size={16} /> Team
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
          <div className="admin-surface p-5">
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-md bg-brandRed/10 p-3 text-brandRed">
                <UserPlus size={20} />
              </div>
              <div>
                <h2 className="text-sm font-black uppercase tracking-widest text-white">
                  Add Staff
                </h2>
                <p className="text-[11px] text-zinc-500">
                  Admin creates sub-admins. Sub-admin creates pickers.
                </p>
              </div>
            </div>

            {error ? (
              <div className="mb-4 rounded-md border border-brandRed/30 bg-brandRed/10 p-3 text-xs font-bold text-red-100">
                {error}
              </div>
            ) : null}

            <div className="space-y-4">
              <Field label="Name" value={form.name} onChange={(name: string) => setForm({ ...form, name })} />
              <Field label="Email" value={form.email} onChange={(email: string) => setForm({ ...form, email })} />
              <Field label="Phone" value={form.phone} onChange={(phone: string) => setForm({ ...form, phone })} />
              <Field label="Password" type="password" value={form.password} onChange={(password: string) => setForm({ ...form, password })} />

              <div>
                <label className="admin-label mb-2 block">Role</label>
                <select
                  className="admin-field"
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                >
                  {roleOptions.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={createStaff}
                disabled={saving}
                className="flex w-full items-center justify-center gap-2 rounded-md bg-brandRed px-5 py-3 text-[10px] font-black uppercase tracking-widest text-white transition hover:bg-white hover:text-brandBlack disabled:opacity-60"
              >
                <ShieldPlus size={16} />
                {saving ? "Creating..." : "Create Staff"}
              </button>
            </div>
          </div>

          <div className="admin-surface overflow-hidden">
            <div className="border-b border-white/10 p-5">
              <h2 className="text-sm font-black uppercase tracking-widest text-white">
                Staff Members
              </h2>
            </div>

            {loading ? (
              <div className="p-8 text-sm text-zinc-500">Loading staff...</div>
            ) : (
              <div className="divide-y divide-white/10">
                {staff.map((item) => (
                  <div key={item.id} className="flex flex-col gap-3 p-5 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="font-black text-white">{item.name}</p>
                      <p className="text-xs text-zinc-500">{item.email}</p>
                      <p className="mt-1 text-[10px] uppercase tracking-widest text-zinc-600">
                        Created by {item.createdBy?.name || "Admin"}
                      </p>
                    </div>
                    <span className="w-fit rounded-md bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white">
                      {item.role.replace("_", " ")}
                    </span>
                  </div>
                ))}

                {!staff.length ? (
                  <div className="p-10 text-center text-sm text-zinc-500">
                    No staff members yet.
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

function Field({ label, value, onChange, type = "text" }: any) {
  return (
    <div>
      <label className="admin-label mb-2 block">{label}</label>
      <input
        className="admin-field"
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
