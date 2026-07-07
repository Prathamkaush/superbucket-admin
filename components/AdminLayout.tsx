import AdminSidebarClient from "./AdminSidebarClient";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-brandCream text-brandBlack">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(0,87,184,0.10),transparent_34%),linear-gradient(0deg,rgba(227,6,19,0.05),transparent_42%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-white" />

      <div className="relative z-10 flex min-h-screen">
        <AdminSidebarClient />

        <main className="admin-content flex-1 ml-0 md:ml-64 p-4 pt-20 md:p-8 md:pt-8 min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
}
