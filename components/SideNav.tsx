"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

export default function SideNav({ session }: { session: any }) {
    const [isOpen, setIsOpen] = useState(false);

    const toggleSidebar = () => setIsOpen(!isOpen);
    const closeSidebar = () => setIsOpen(false);

    return (
        <>
            {/* Mobile Header */}
            <header className="mobile-header show-mobile" style={{
                height: 'var(--header-height)',
                background: 'white',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                padding: '0 1rem',
                position: 'sticky',
                top: 0,
                zIndex: 40
            }}>
                <button onClick={toggleSidebar} style={{ background: 'none', border: 'none', padding: '0.5rem' }}>
                    <Menu size={24} />
                </button>
                <div style={{ marginLeft: '0.75rem', fontWeight: 900, fontSize: '1.1rem' }}>
                    Shop <span style={{ color: 'var(--primary)' }}>Ngọc Vân</span>
                </div>
            </header>

            {/* Backdrop for mobile */}
            {isOpen && (
                <div
                    onClick={closeSidebar}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0,0,0,0.3)',
                        backdropFilter: 'blur(4px)',
                        zIndex: 100,
                    }}
                />
            )}

            {/* Sidebar */}
            <aside className={`sidebar ${isOpen ? 'open' : ''}`} style={{
                width: 'var(--sidebar-width)',
                background: 'white',
                borderRight: '1px solid #e2e8f0',
                padding: '2rem 1.25rem',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '4px 0 24px rgba(0,0,0,0.02)',
                zIndex: 101,
                position: 'fixed',
                top: 0,
                bottom: 0,
                left: 0,
                transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}>
                <div className="brand-section" style={{ marginBottom: '2.5rem', padding: '0 0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 950, color: '#0f172a', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                            Shop <span style={{ color: 'var(--primary)' }}>Ngọc Vân</span>
                        </div>
                        <div style={{ fontSize: '0.8125rem', color: '#64748b', marginTop: '0.4rem', fontWeight: 500, fontStyle: 'italic', opacity: 0.9 }}>
                            Mặc đẹp theo cách của bạn
                        </div>
                    </div>
                    <button className="show-mobile" onClick={closeSidebar} style={{ background: 'none', border: 'none', padding: '0.5rem' }}>
                        <X size={20} />
                    </button>
                </div>

                <nav className="sidebar-nav" style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', flex: 1 }}>
                    <Link href="/" className="nav-link" onClick={closeSidebar}>🏠 Tổng quan</Link>
                    <Link href="/pos" className="nav-link" onClick={closeSidebar}>🛒 Bán hàng (POS)</Link>
                    <Link href="/sales" className="nav-link" onClick={closeSidebar}>📜 Hóa đơn & Giao dịch</Link>

                    <div className="nav-section-label">Quản lý kho</div>
                    <Link href="/products" className="nav-link" onClick={closeSidebar}>📦 Tất cả sản phẩm</Link>
                    <Link href="/products/categories" className="nav-link" onClick={closeSidebar}>📁 Nhóm sản phẩm</Link>
                    <Link href="/inventory" className="nav-link" onClick={closeSidebar}>📊 Tồn kho</Link>
                    <Link href="/inventory/adjustment" className="nav-link" onClick={closeSidebar}>📝 Kiểm kê & Điều chỉnh</Link>

                    <div className="nav-section-label">Đối tác & Kinh doanh</div>
                    <Link href="/purchases" className="nav-link" onClick={closeSidebar}>🚛 Nhập hàng</Link>
                    <Link href="/suppliers" className="nav-link" onClick={closeSidebar}>🏢 Nhà cung cấp</Link>
                    <Link href="/reports" className="nav-link" onClick={closeSidebar}>📈 Báo cáo báo biểu</Link>
                </nav>

                <div className="user-section" style={{ marginTop: 'auto', paddingTop: '1.5rem', borderTop: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                            width: '36px', height: '36px', borderRadius: '10px',
                            background: 'var(--primary)', color: 'white',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: 700, fontSize: '0.875rem'
                        }}>
                            {(session?.user?.name?.[0] || 'U').toUpperCase()}
                        </div>
                        <div style={{ overflow: 'hidden' }}>
                            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {session?.user?.name || 'Administrator'}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>
                                Quản lý cửa hàng
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            <style jsx>{`
                @media (max-width: 768px) {
                    .sidebar {
                        transform: translateX(-100%);
                    }
                    .sidebar.open {
                        transform: translateX(0);
                    }
                }
            `}</style>
        </>
    );
}
