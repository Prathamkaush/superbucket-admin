"use client";

import { useEffect, useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { api } from "@/lib/api";
import { BarChart3, Trophy } from "lucide-react";

export default function PickerReportsPage() {
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/reports/pickers", { params: { month } });
      setReport(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [month]);

  const topPicker = report?.pickers?.[0];

  return (
    <AdminLayout>
      <div className="admin-page">
        <div className="admin-hero">
          <div>
            <h1 className="admin-hero-title">
              Picker <span className="text-brandRed">Reports</span>
            </h1>
            <p className="admin-hero-subtitle">
              Monthly accepted, dispatched, and fulfilled order performance.
            </p>
          </div>
          <div className="admin-dark-button pointer-events-none">
            <BarChart3 size={16} /> Monthly
          </div>
        </div>

        <div className="admin-surface p-5">
          <label className="admin-label mb-2 block">Report Month</label>
          <input
            type="month"
            className="admin-field max-w-xs"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
          />
        </div>

        {topPicker ? (
          <div className="admin-surface flex items-center gap-4 p-5">
            <div className="rounded-md bg-brandRed/10 p-3 text-brandRed">
              <Trophy size={22} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                Top picker this month
              </p>
              <p className="text-xl font-black text-white">
                {topPicker.name || topPicker.email}
              </p>
              <p className="text-xs text-zinc-500">
                {topPicker.fulfilled} fulfilled · {topPicker.dispatched} dispatched · {topPicker.accepted} accepted
              </p>
            </div>
          </div>
        ) : null}

        <div className="admin-surface overflow-hidden">
          <div className="grid grid-cols-[1fr_90px_100px_100px] gap-4 border-b border-white/10 p-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">
            <span>Picker</span>
            <span>Accepted</span>
            <span>Dispatched</span>
            <span>Fulfilled</span>
          </div>

          {loading ? (
            <div className="p-8 text-sm text-zinc-500">Loading report...</div>
          ) : (
            <div className="divide-y divide-white/10">
              {report?.pickers?.map((picker: any, index: number) => (
                <div
                  key={picker.id}
                  className="grid grid-cols-1 gap-3 p-4 md:grid-cols-[1fr_90px_100px_100px] md:items-center"
                >
                  <div>
                    <p className="font-black text-white">
                      #{index + 1} {picker.name || "Picker"}
                    </p>
                    <p className="text-xs text-zinc-500">{picker.email}</p>
                    <p className="mt-1 text-[10px] uppercase tracking-widest text-zinc-600">
                      Sub-admin: {picker.createdBy?.name || "Admin"}
                    </p>
                  </div>
                  <Metric value={picker.accepted} />
                  <Metric value={picker.dispatched} />
                  <Metric value={picker.fulfilled} highlight />
                </div>
              ))}

              {!report?.pickers?.length ? (
                <div className="p-10 text-center text-sm text-zinc-500">
                  No picker activity for this month.
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

function Metric({ value, highlight = false }: { value: number; highlight?: boolean }) {
  return (
    <span
      className={`w-fit rounded-md px-3 py-2 text-sm font-black ${
        highlight ? "bg-brandRed text-white" : "bg-white/10 text-zinc-200"
      }`}
    >
      {value}
    </span>
  );
}
