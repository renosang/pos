"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    LayoutDashboard,
    Receipt,
    Scan,
    Box,
    MoreHorizontal,
    Package,
    Folder,
    ClipboardCheck,
    Truck,
    Building2,
    TrendingUp,
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

    const navItems = [
        { id: "sales", href: "/sales", icon: <Receipt strokeWidth={1.5} size={24} />, label: "Hóa đơn" },
        { id: "inventory", href: "/inventory", icon: <Box strokeWidth={1.5} size={24} />, label: "Tồn kho" },
        { id: "home", href: "/", icon: <LayoutDashboard strokeWidth={1.5} size={24} />, label: "Tổng quan" },
        { id: "scan", icon: <Scan strokeWidth={1.5} size={24} />, label: "Quét mã" },
        { id: "more", icon: <MoreHorizontal strokeWidth={1.5} size={24} />, label: "Thêm" },
    ];

    const getActiveIndex = () => {
        if (isMenuOpen) return 4;
        if (pathname === "/pos" || pathname.includes("/pos")) return 3;
        if (pathname === "/sales") return 0;
        if (pathname === "/inventory" || pathname.includes("/inventory")) return 1;
        if (pathname === "/" || pathname === "/dashboard") return 2;
        if (pathname.includes("/products")) return 1;
        if (pathname.includes("/purchases")) return 4;
        return -1;
    };

    const activeIndex = getActiveIndex();

    const handleNavClick = (item: any) => {
        if (item.id === "more") {
            setIsMenuOpen(!isMenuOpen);
        } else {
            setIsMenuOpen(false);
            if (item.id === "scan") {
                router.push("/pos?scanner=true");
            }
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
                        {[
                            { href: "/products", icon: <Package strokeWidth={1.5} size={22} />, label: "Sản phẩm" },
                            { href: "/products/categories", icon: <Folder strokeWidth={1.5} size={22} />, label: "Danh mục" },
                            { href: "/inventory/adjustment", icon: <ClipboardCheck strokeWidth={1.5} size={22} />, label: "Kiểm kê" },
                            { href: "/purchases", icon: <Truck strokeWidth={1.5} size={22} />, label: "Nhập hàng" },
                            { href: "/suppliers", icon: <Building2 strokeWidth={1.5} size={22} />, label: "Nhà cung cấp" },
                            { href: "/reports", icon: <TrendingUp strokeWidth={1.5} size={22} />, label: "Báo cáo" },
                        ].map((item) => (
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
                <div className="minimal-nav-container">
                    <div className="nav-items-grid">
                        {navItems.map((item, idx) => {
                            const isActive = activeIndex === idx;

                            const content = (
                                <>
                                    <div className="nav-icon-wrapper">
                                        <div className="nav-icon-circle">
                                            {item.icon}
                                        </div>
                                    </div>
                                    <span className="nav-text-label">{item.label}</span>
                                </>
                            );

                            return (
                                <div key={item.id} className={`nav-item-slot ${isActive ? 'active' : ''}`}>
                                    {item.href && item.id !== "scan" ? (
                                        <Link href={item.href} className="nav-action-area" onClick={() => handleNavClick(item)}>
                                            {content}
                                        </Link>
                                    ) : (
                                        <button className="nav-action-area" onClick={() => handleNavClick(item)}>
                                            {content}
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                    {/* iOS style home indicator stub */}
                    <div className="home-indicator"></div>
                </div>
            </nav>

            <style jsx>{`
                .bottom-nav {
                    position: fixed;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    z-index: 1000;
                    background: transparent;
                    display: flex;
                    justify-content: center;
                    padding: 0 16px 12px 16px;
                }

                .minimal-nav-container {
                    width: 100%;
                    max-width: 500px;
                    background: rgba(255, 255, 255, 0.95);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    border-radius: 28px;
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
                    border: 1px solid rgba(255, 255, 255, 0.3);
                    padding-bottom: 8px;
                    position: relative;
                }

                .nav-items-grid {
                    display: grid;
                    grid-template-columns: repeat(5, 1fr);
                    height: 80px;
                    position: relative;
                }

                .nav-item-slot {
                    position: relative;
                    display: flex;
                    justify-content: center;
                }

                .nav-action-area {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    width: 100%;
                    background: none;
                    border: none;
                    padding: 0;
                    text-decoration: none;
                    gap: 6px;
                    transition: all 0.3s ease;
                }

                .nav-icon-wrapper {
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .nav-icon-circle {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.4s cubic-bezier(0.19, 1, 0.22, 1);
                    color: #94a3b8;
                }

                .nav-item-slot.active .nav-icon-circle {
                    background: var(--primary);
                    color: white;
                    transform: translateY(-24px);
                    box-shadow: 0 8px 16px rgba(99, 102, 241, 0.3);
                    width: 54px;
                    height: 54px;
                    border: 4px solid white;
                }

                .nav-item-slot:nth-child(3).active .nav-icon-circle {
                    background: linear-gradient(135deg, var(--primary), var(--accent));
                }

                .nav-text-label {
                    font-size: 0.65rem;
                    font-weight: 500;
                    color: #64748b;
                    transition: all 0.3s ease;
                }

                .nav-item-slot.active .nav-text-label {
                    color: var(--primary);
                    font-weight: 700;
                    transform: translateY(-8px);
                }

                .home-indicator {
                    width: 40px;
                    height: 4px;
                    background: rgba(0, 0, 0, 0.1);
                    border-radius: 2px;
                    margin: 2px auto 6px auto;
                }

                /* More Menu Styling */
                .more-menu-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(15, 23, 42, 0.4);
                    backdrop-filter: blur(10px);
                    -webkit-backdrop-filter: blur(10px);
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
                    border-top-left-radius: 40px;
                    border-top-right-radius: 40px;
                    padding: 3.5rem 2rem;
                    transform: translateY(100%);
                    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                    box-shadow: 0 -20px 50px rgba(0,0,0,0.1);
                }

                .more-menu-overlay.open .more-menu-content {
                    transform: translateY(0);
                }

                .menu-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 2.5rem;
                }

                .menu-header h3 {
                    font-size: 1.5rem;
                    font-weight: 800;
                    color: var(--text-main);
                    letter-spacing: -0.02em;
                }

                .close-btn {
                    color: var(--text-muted);
                    padding: 10px;
                    background: var(--surface-secondary);
                    border-radius: 50%;
                }

                .menu-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 2rem 1.5rem;
                }

                .menu-item {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 0.875rem;
                    text-decoration: none;
                    color: #64748b;
                    transition: all 0.2s;
                }

                .menu-icon {
                    width: 60px;
                    height: 60px;
                    border-radius: 20px;
                    background: var(--surface-secondary);
                    color: var(--text-main);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s;
                }

                .menu-item.active .menu-icon {
                    background: var(--primary);
                    color: white;
                }

                .menu-item span {
                    font-size: 0.8125rem;
                    font-weight: 600;
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
