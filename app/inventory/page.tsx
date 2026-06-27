"use client";

import { useEffect, useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { api } from "@/lib/api";
import { Boxes, Save } from "lucide-react";

export default function InventoryPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [stockById, setStockById] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/products", { params: { limit: 50 } });
      const list = res.data.products || [];
      setProducts(list);
      setStockById(Object.fromEntries(list.map((p: any) => [p.id, String(p.stock ?? 0)])));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const saveStock = async (id: number) => {
    setSavingId(id);
    try {
      await api.patch(`/products/${id}/stock`, { stock: Number(stockById[id] || 0) });
      await load();
    } finally {
      setSavingId(null);
    }
  };

  return (
    <AdminLayout>
      <div className="admin-page">
        <div className="admin-hero">
          <div>
            <h1 className="admin-hero-title">
              Inventory <span className="text-brandRed">Manager</span>
            </h1>
            <p className="admin-hero-subtitle">
              Update live stock counts like oranges left, grocery units, and supplements.
            </p>
          </div>
          <div className="admin-dark-button pointer-events-none">
            <Boxes size={16} /> Stock
          </div>
        </div>

        <div className="admin-surface overflow-hidden">
          <div className="grid grid-cols-[1fr_130px_110px] gap-4 border-b border-white/10 p-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">
            <span>Product</span>
            <span>Stock Left</span>
            <span>Action</span>
          </div>

          {loading ? (
            <div className="p-8 text-sm text-zinc-500">Loading inventory...</div>
          ) : (
            <div className="divide-y divide-white/10">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="grid grid-cols-1 gap-4 p-4 md:grid-cols-[1fr_130px_110px] md:items-center"
                >
                  <div>
                    <p className="font-black text-white">{product.title}</p>
                    <p className="text-xs text-zinc-500">
                      {product.category?.name || "Product"} · {product.variants?.length || 0} variants
                    </p>
                  </div>

                  <input
                    className="admin-field"
                    type="number"
                    min={0}
                    value={stockById[product.id] ?? ""}
                    onChange={(e) => setStockById({ ...stockById, [product.id]: e.target.value })}
                  />

                  <button
                    onClick={() => saveStock(product.id)}
                    disabled={savingId === product.id}
                    className="inline-flex items-center justify-center gap-2 rounded-md bg-brandRed px-4 py-3 text-[10px] font-black uppercase tracking-widest text-white transition hover:bg-white hover:text-brandBlack disabled:opacity-60"
                  >
                    <Save size={14} />
                    {savingId === product.id ? "Saving" : "Save"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
