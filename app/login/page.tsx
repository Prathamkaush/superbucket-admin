"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";
import BrandMark from "@/components/BrandMark";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const login = async () => {
    if (!email || !password) {
      setError("Email and password are required");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await api.post("/auth/admin/login", { email, password });

      localStorage.setItem("admin_token", res.data.token);
      localStorage.setItem("admin_user", JSON.stringify(res.data.user));
      document.cookie = `admin_token=${res.data.token}; path=/;`;

      window.location.href = "/dashboard";
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid admin credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-brandCream px-4 py-8 text-brandBlack">
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(0,87,184,0.14),transparent_36%),linear-gradient(0deg,rgba(227,6,19,0.08),transparent_44%)]" />
      <div className="absolute inset-x-0 top-0 h-28 bg-white" />

      <main className="relative z-10 mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center justify-center">
        <section className="w-full max-w-md rounded-md border border-blue-100 bg-white p-6 shadow-xl md:p-8">
          <div className="mb-8">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div className="rounded-md border border-blue-100 bg-brandBlue/5 px-4 py-3">
                <BrandMark />
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-md border border-brandRed/20 bg-brandRed/10">
                <ShieldCheck className="text-brandRed" size={25} />
              </div>
            </div>

            <p className="mb-2 text-[10px] font-black uppercase tracking-[0.28em] text-brandRed">
              Admin Secure
            </p>
            <h1 className="text-3xl font-black uppercase tracking-tight text-brandBlack">
              Command <span className="text-brandRed">Access</span>
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Manage products, categories, stock, orders, and customers.
            </p>
          </div>

          {error && (
            <div className="mb-5 rounded-md border border-brandRed/30 bg-brandRed/10 px-4 py-3 text-sm font-bold text-red-100">
              {error}
            </div>
          )}

          <div className="space-y-5">
            <div>
              <label className="admin-label mb-2 block">Email</label>
              <input
                type="email"
                placeholder="admin@intiseva.com"
                className="admin-field px-4 py-3"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="admin-label mb-2 block">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  className="admin-field px-4 py-3 pr-11"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && login()}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-brandBlue"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              onClick={login}
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-md bg-brandBlue px-6 py-4 text-[11px] font-black uppercase tracking-[0.24em] text-white transition hover:bg-brandRed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Signing in...
                </>
              ) : (
                "Login"
              )}
            </button>
          </div>

          <div className="mt-8 flex items-center justify-between border-t border-blue-100 pt-5 text-[10px] font-black uppercase tracking-widest text-slate-500">
            <span>IntiSeva Admin</span>
            <span>{new Date().getFullYear()}</span>
          </div>
        </section>
      </main>
    </div>
  );
}
