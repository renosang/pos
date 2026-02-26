import type { Metadata, Viewport } from "next";
import "./globals.css";
import { auth } from "@/auth";
import SideNav from "@/components/SideNav";
import BottomNav from "@/components/BottomNav";

export const metadata: Metadata = {
  title: "Shop Ngọc Vân - Quản lý bán hàng",
  description: "Hệ thống quản lý bán hàng cao cấp - Mặc đẹp theo cách của bạn",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Ngọc Vân",
  },
  icons: {
    apple: "/icons/icon-192x192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#4f46e5",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="vi">
      <head>
        <link rel="icon" href="/icons/icon-192x192.png" />
      </head>
      <body>
        <div className="layout-wrapper">
          {session && (
            <aside className="hide-mobile">
              <SideNav session={session} />
            </aside>
          )}

          <main className="main-content">
            <div className="main-wrapper page-enter">
              {children}
            </div>
          </main>

          {session && <BottomNav session={session} />}
        </div>
      </body>
    </html>
  );
}
