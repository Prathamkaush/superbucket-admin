"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Folder,
  Package,
  ShoppingCart,
  MessageSquare,
  Percent,
  Star,
  Settings,
  Menu,
  X,
  PenIcon,
  PersonStanding,
  SplinePointer,
  Phone,
  ShieldCheck,
  Dumbbell,
  Building,
  Wrench,
  UsersRound,
  ClipboardList,
  BarChart3,
  Store,
  Bell,
  BadgePercent,
  Megaphone,
} from "lucide-react";
import BrandMark from "./BrandMark";
import { clearStoredAdmin, getStoredAdminRole } from "@/lib/auth";
import { api } from "@/lib/api";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useEffect(() => {
    setRole(getStoredAdminRole());
    const loadUnread = () => api.get("/notifications/my", { params: { page: 1, limit: 1 } })
      .then((response) => setUnreadNotifications(Number(response.data.unread || 0)))
      .catch(() => undefined);
    loadUnread();
    const timer = window.setInterval(loadUnread, 30000);
    return () => window.clearInterval(timer);
  }, []);

  const canSee = (allowed: string[]) => Boolean(role && allowed.includes(role));

  const LinkItem = (href: string, label: string, Icon: React.ElementType, badge = 0) => (
    <Link
      href={href}
      onClick={() => setOpen(false)}
      className={`
        flex items-center gap-3 px-4 py-3 rounded-md text-[11px] font-black uppercase tracking-widest transition-all duration-300
        ${
          pathname === href
            ? "bg-brandBlue text-white shadow-lg shadow-brandBlue/20"
            : "text-slate-600 hover:bg-brandBlue/5 hover:text-brandBlue"
        }
      `}
    >
      <Icon size={16} />
      <span>{label}</span>
      {badge > 0 ? <span className="ml-auto rounded-full bg-brandRed px-2 py-0.5 text-[9px] text-white">{badge > 99 ? "99+" : badge}</span> : null}
    </Link>
  );

  return (
    <>
      {/* MOBILE HEADER */}
      <div className="fixed left-0 right-0 top-0 z-40 flex h-16 items-center border-b border-blue-100 bg-white px-4 shadow-sm md:hidden">
        <button onClick={() => setOpen(true)} className="p-2 text-brandBlue" aria-label="Open menu">
          <Menu size={24} />
        </button>
        <BrandMark compact className="ml-2" />
      </div>

      {/* OVERLAY */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-brandBlueDeep/20 backdrop-blur-sm md:hidden"
        />
      )}

      {/* SIDEBAR CONTAINER */}
      <aside
        className={`
          fixed left-0 top-0 z-50 flex h-screen w-64 flex-col border-r border-blue-100 bg-white text-brandBlack shadow-xl
          transform transition-transform duration-500 ease-in-out
          ${open ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
      >
        {/* TOP: BRANDING */}
        <div className="relative border-b border-blue-100 p-6">
          <button
            onClick={() => setOpen(false)}
            className="absolute right-4 top-6 text-slate-500 md:hidden"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>

          <BrandMark />
        </div>

        {/* MIDDLE: SCROLLABLE NAVIGATION */}
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1 custom-scrollbar">
          {canSee(["ADMIN"]) && LinkItem("/dashboard", "Dashboard", LayoutDashboard)}
          {canSee(["ADMIN"]) && LinkItem("/properties", "Properties", Building)}
          {canSee(["ADMIN"]) && LinkItem("/services", "Home Services", Wrench)}
          <div className="mx-2 my-4 h-px bg-blue-100" />
          {canSee(["ADMIN"]) && LinkItem("/categories", "Categories", Folder)}
          {canSee(["ADMIN"]) && LinkItem("/products", "Supplements", Dumbbell)}
          {canSee(["ADMIN", "SUB_ADMIN"]) && LinkItem("/inventory", "Inventory", ClipboardList)}
          {canSee(["SUB_ADMIN"]) && LinkItem("/shops", "Shop Settings", Store)}
          {canSee(["ADMIN", "SUB_ADMIN", "PICKER"]) && LinkItem("/orders", "Orders", ShoppingCart)}
          {canSee(["ADMIN", "SUB_ADMIN"]) && LinkItem("/staff", "Staff", UsersRound)}
          {canSee(["ADMIN", "SUB_ADMIN"]) && LinkItem("/picker-reports", "Picker Reports", BarChart3)}
          {canSee(["ADMIN"]) && LinkItem("/homepage", "Edit Home", PenIcon)}
          {canSee(["ADMIN"]) && LinkItem("/offers", "Offers", BadgePercent)}
          {canSee(["ADMIN"]) && LinkItem("/business-ads", "Business Ads", Megaphone)}
          {canSee(["ADMIN"]) && LinkItem("/coupons", "Coupons", SplinePointer)}
          {canSee(["ADMIN"]) && LinkItem("/feedback", "Feedback", MessageSquare)}
          {canSee(["ADMIN"]) && LinkItem("/contacts", "Contacts", Phone)}
          {canSee(["ADMIN"]) && LinkItem("/users", "Users", PersonStanding)}
          {canSee(["ADMIN", "SUB_ADMIN", "PICKER"]) && LinkItem("/notifications", "Notifications", Bell, unreadNotifications)}
          {canSee(["ADMIN"]) && LinkItem("/discounts", "Discounts", Percent)}
          {canSee(["ADMIN"]) && LinkItem("/trending", "Trending", Star)}
          {canSee(["ADMIN"]) && LinkItem("/reviews", "Reviews", Star)}
          {canSee(["ADMIN"]) && LinkItem("/settings", "Settings", Settings)}
        </div>

        {/* BOTTOM: FIXED LOGOUT */}
        <div className="border-t border-blue-100 bg-brandBlue/5 p-6">
          <div className="mb-4 flex items-center gap-3 rounded-md border border-blue-100 bg-white p-3">
            <ShieldCheck size={18} className="text-brandRed" />
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-brandBlack">Admin Secure</p>
              <p className="text-[9px] font-semibold uppercase tracking-widest text-slate-500">IntiSeva</p>
            </div>
          </div>
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full rounded-md bg-brandBlue px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-white transition-all hover:bg-brandRed active:scale-95"
          >
            Logout Session
          </button>
        </div>
      </aside>

      {/* LOGOUT CONFIRM MODAL */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-brandBlueDeep/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-md border border-blue-100 bg-white p-8 shadow-2xl">
            <h3 className="mb-2 text-sm font-black uppercase tracking-widest text-brandBlack">
              Confirm Logout
            </h3>
            <p className="mb-8 text-[11px] font-medium uppercase tracking-tight text-slate-500">
              You will need to re-authenticate to access the admin portal.
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => {
                  clearStoredAdmin();
                  router.push("/login");
                }}
                className="w-full rounded bg-brandRed py-4 text-[10px] font-black uppercase tracking-widest text-white transition-all hover:bg-brandBlueDark"
              >
                Logout Now
              </button>
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="w-full py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 transition-colors hover:text-brandBlue"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
