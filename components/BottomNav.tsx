"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    LayoutDashboard,
    Receipt,
    Scan,
    Package,
    MoreHorizontal,
    Box,
    Truck,
    Building2,
    TrendingUp,
    Folder,
    ClipboardCheck,
    X
} from "lucide-react";

export default function BottomNav({ session }: { session: any }) {
    const pathname = usePathname();
    const router = useRouter();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!session || !isMounted) return null;

    const mainNavItems = [
        { href: "/", icon: <LayoutDashboard size={22} />, label: "Tổng quan" },
        { href: "/sales", icon: <Receipt size={22} />, label: "Hóa đơn" },
        { id: "scan", icon: <Scan size={28} />, label: "Quét mã", isCenter: true },
        { href: "/inventory", icon: <Box size={22} />, label: "Tồn kho" },
        { id: "more", icon: <MoreHorizontal size={22} />, label: "Thêm" },
    ];

    const moreItems = [
        { href: "/products", icon: <Package size={20} />, label: "Sản phẩm" },
        { href: "/products/categories", icon: <Folder size={20} />, label: "Danh mục" },
        { href: "/inventory/adjustment", icon: <ClipboardCheck size={20} />, label: "Kiểm kê" },
        { href: "/purchases", icon: <Truck size={20} />, label: "Nhập hàng" },
        { href: "/suppliers", icon: <Building2 size={20} />, label: "Nhà cung cấp" },
        { href: "/reports", icon: <TrendingUp size={20} />, label: "Báo cáo" },
    ];

    const handleNavClick = (item: any) => {
        if (item.id === "more") {
            setIsMenuOpen(!isMenuOpen);
        } else if (item.id === "scan") {
            router.push("/pos?scanner=true");
            setIsMenuOpen(false);
        } else {
            setIsMenuOpen(false);
        }
    };

    return (
        <>
            {/* More Menu Overlay */}
            <div className={`more-menu-overlay ${isMenuOpen ? 'open' : ''}`} onClick={() => setIsMenuOpen(false)}>
                <div className="more-menu-content" onClick={e => e.stopPropagation()}>
                    <div className="menu-header">
                        <h3>Chức năng khác</h3>
                        <button onClick={() => setIsMenuOpen(false)} className="close-btn">
                            <X size={24} />
                        </button>
                    </div>
                    <div className="menu-grid">
                        {moreItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`menu-item ${pathname === item.href ? 'active' : ''}`}
                                onClick={() => setIsMenuOpen(false)}
                            >
                                <div className="menu-icon">{item.icon}</div>
                                <span>{item.label}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            <nav className="bottom-nav show-mobile">
                {/* Curved background indicator would go here if using a complex SVG, 
                    but we'll implement the "jump-out" effect via CSS on the items */}
                <div className="nav-items-container">
                    {mainNavItems.map((item, idx) => {
                        const isActive = item.href ? pathname === item.href : false;
                        const isScanActive = item.id === "scan" && pathname === "/pos";

                        if (item.href) {
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`nav-item ${isActive ? 'active' : ''}`}
                                    onClick={() => handleNavClick(item)}
                                >
                                    <div className="icon-wrapper">
                                        {item.icon}
                                    </div>
                                    <span>{item.label}</span>
                                </Link>
                            );
                        }

                        return (
                            <button
                                key={item.id}
                                className={`nav-item ${item.isCenter ? 'center-btn' : ''} ${isScanActive || (item.id === "more" && isMenuOpen) ? 'active' : ''}`}
                                onClick={() => handleNavClick(item)}
                            >
                                <div className="icon-wrapper">
                                    {item.icon}
                                </div>
                                <span>{item.label}</span>
                            </button>
                        );
                    })}
                </div>
            </nav>

            <style jsx>{`
                .bottom-nav {
                    position: fixed;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    height: 85px;
                    background: white;
                    border-top: 1px solid rgba(0,0,0,0.05);
                    box-shadow: 0 -10px 30px rgba(0,0,0,0.08);
                    z-index: 1000;
                    padding-bottom: env(safe-area-inset-bottom);
                    border-top-left-radius: 24px;
                    border-top-right-radius: 24px;
                }

                .nav-items-container {
                    display: grid;
                    grid-template-columns: repeat(5, 1fr);
                    height: 100%;
                    position: relative;
                }

                .nav-item {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                    color: #94a3b8;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    position: relative;
                    background: none;
                    border: none;
                    padding: 0;
                }

                .nav-item.active {
                    color: var(--primary);
                }

                .nav-item .icon-wrapper {
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .nav-item.active .icon-wrapper {
                    transform: translateY(-8px);
                }

                .nav-item span {
                    font-size: 0.65rem;
                    font-weight: 700;
                    transition: all 0.3s;
                }

                .nav-item.active span {
                    opacity: 1;
                    transform: translateY(-4px);
                }

                /* Center Button (Scan) */
                .center-btn {
                    margin-top: -45px;
                    height: 70px;
                    z-index: 1001;
                }

                .center-btn .icon-wrapper {
                    width: 60px;
                    height: 60px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, var(--primary), var(--accent));
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 8px 16px rgba(99, 102, 241, 0.4);
                    border: 5px solid white;
                }

                .center-btn.active .icon-wrapper {
                    transform: scale(1.1) translateY(-5px);
                    box-shadow: 0 12px 24px rgba(99, 102, 241, 0.5);
                }

                .center-btn span {
                    margin-top: 4px;
                    color: var(--text-main);
                    font-weight: 800;
                }

                /* More Menu */
                .more-menu-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(15, 23, 42, 0.5);
                    backdrop-filter: blur(4px);
                    z-index: 2000;
                    opacity: 0;
                    visibility: hidden;
                    transition: all 0.3s ease;
                    display: flex;
                    align-items: flex-end;
                }

                .more-menu-overlay.open {
                    opacity: 1;
                    visibility: visible;
                }

                .more-menu-content {
                    width: 100%;
                    background: white;
                    border-top-left-radius: 32px;
                    border-top-right-radius: 32px;
                    padding: 2rem;
                    transform: translateY(100%);
                    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                }

                .more-menu-overlay.open .more-menu-content {
                    transform: translateY(0);
                }

                .menu-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 2rem;
                }

                .menu-header h3 {
                    font-size: 1.25rem;
                    font-weight: 900;
                    color: var(--text-main);
                }

                .close-btn {
                    color: var(--text-muted);
                    padding: 8px;
                    background: var(--surface-secondary);
                    border-radius: 50%;
                }

                .menu-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 1.5rem;
                }

                .menu-item {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 0.75rem;
                    text-decoration: none;
                    color: var(--text-soft);
                    transition: 0.2s;
                }

                .menu-item:active {
                    transform: scale(0.95);
                }

                .menu-icon {
                    width: 54px;
                    height: 54px;
                    border-radius: 16px;
                    background: var(--surface-secondary);
                    color: var(--text-main);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: 0.2s;
                }

                .menu-item.active .menu-icon {
                    background: var(--primary);
                    color: white;
                }

                .menu-item span {
                    font-size: 0.75rem;
                    font-weight: 700;
                    text-align: center;
                }

                @media (min-width: 769px) {
                    .bottom-nav, .more-menu-overlay {
                        display: none !important;
                    }
                }
            `}</style>
        </>
    );
}
