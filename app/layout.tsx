import type { Metadata, Viewport } from "next";
import "./globals.css";
import { auth } from "@/auth";
import SideNav from "@/components/SideNav";

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
        {session ? (
          <div className="layout-wrapper" style={{ display: 'flex', minHeight: '100vh', flexDirection: 'column' }}>
            <div style={{ display: 'flex', flex: 1 }}>
              <SideNav session={session} />
              <main style={{
                flex: 1,
                background: '#f8fafc',
                overflowY: 'auto',
                marginLeft: 'var(--sidebar-width)',
                transition: 'margin-left 0.3s ease'
              }} className="main-content">
                <div style={{ padding: '2rem', minHeight: '100%' }} className="p-mobile-1">
                  {children}
                </div>
              </main>
            </div>
          </div>
        ) : (
          children
        )}
        <style dangerouslySetInnerHTML={{
          __html: `
          .nav-link {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 0.75rem 1rem;
            color: #475569;
            text-decoration: none;
            border-radius: 12px;
            font-size: 0.9375rem;
            font-weight: 500;
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          }
          .nav-link:hover {
            color: var(--primary);
            background: #f1f5f9;
            transform: translateX(4px);
          }
          .nav-section-label {
            margin-top: 1.5rem;
            margin-bottom: 0.5rem;
            padding: 0 1rem;
            font-size: 0.75rem;
            font-weight: 800;
            color: #94a3b8;
            text-transform: uppercase;
            letter-spacing: 0.1em;
          }

          @media (max-width: 768px) {
            .main-content {
              margin-left: 0 !important;
              padding-top: 0;
            }
            .layout-wrapper {
              flex-direction: column;
            }
          }
        `}} />
      </body>
    </html>
  );
}
