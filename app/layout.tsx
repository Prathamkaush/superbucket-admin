import "./globals.css";

export const metadata = {
  title: "IntiSeva Admin",
  description: "IntiSeva commerce management dashboard",
  icons: {
    icon: "/intiseva-app-icon.png",
    shortcut: "/intiseva-app-icon.png",
    apple: "/intiseva-app-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-brandBlack text-white antialiased overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
