"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
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
    Search,
    X
} from "lucide-react";

export default function BottomNav({ session }: { session: any }) {
    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!session || !isMounted) return null;

    const navItems = [
        { id: "sales", href: "/sales", icon: <Receipt strokeWidth={1.5} size={24} />, label: "Hóa đơn" },
        { id: "search", href: "/pos?focusSearch=true", icon: <Search strokeWidth={1.5} size={24} />, label: "Tìm kiếm" },
        { id: "home", href: "/", icon: <LayoutDashboard strokeWidth={1.5} size={24} />, label: "Tổng quan" },
        { id: "scan", icon: <Scan strokeWidth={1.5} size={24} />, label: "Quét mã" },
        { id: "more", icon: <MoreHorizontal strokeWidth={1.5} size={24} />, label: "Thêm" },
    ];

    const getActiveIndex = () => {
        if (isMenuOpen) return 4;
        const fs = searchParams?.get("focusSearch") === "true";

        if (pathname === "/pos" || pathname.includes("/pos")) {
            if (fs) return 1;
            return 3;
        }
        if (pathname === "/sales" || pathname.includes("/sales")) return 0;
        if (pathname === "/" || pathname === "/dashboard") return 2;
        if (pathname.includes("/inventory")) return 4;
        if (pathname.includes("/products")) return 4;
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
            } else if (item.href) {
                router.push(item.href);
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
                            { href: "/inventory", icon: <Box strokeWidth={1.5} size={22} />, label: "Tồn kho" },
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
                                <div key={item.id} className={`nav-item-slot ${isActive ? 'active' : ''}`}>
                                    <div className="nav-action-area" onClick={() => handleNavClick(item)}>
                                        <div className="nav-icon-wrapper">
                                            <div className="nav-icon-circle">
                                                {item.icon}
                                            </div>
                                        </div>
                                        <span className="nav-text-label">{item.label}</span>
                                    </div>
                                </div>
                            );

                            return content;
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
                    background: rgba(13, 17, 30, 0.88);
                    backdrop-filter: blur(28px);
                    -webkit-backdrop-filter: blur(28px);
                    border-radius: 32px;
                    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    padding-bottom: 8px;
                    position: relative;
                }

                .nav-items-grid {
                    display: flex;
                    justify-content: space-between;
                    align-items: stretch;
                    height: 72px;
                    position: relative;
                }

                .nav-item-slot {
                    position: relative;
                    display: flex;
                    justify-content: center;
                    height: 100%;
                }

                .nav-action-area {
                    display: flex !important;
                    flex-direction: column !important;
                    align-items: center !important;
                    justify-content: center !important;
                    width: 100%;
                    height: 100%;
                    cursor: pointer;
                    -webkit-tap-highlight-color: transparent;
                    box-sizing: border-box !important;
                    user-select: none;
                    gap: 2px;
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
                    color: rgba(255, 255, 255, 0.5);
                }

                .nav-item-slot.active .nav-icon-circle {
                    background: var(--primary);
                    color: white;
                    transform: translateY(-20px);
                    box-shadow: 0 10px 20px rgba(99, 102, 241, 0.4);
                    width: 54px;
                    height: 54px;
                    border: 5px solid #0d111e;
                }

                .nav-text-label {
                    font-size: 0.65rem;
                    font-weight: 500;
                    color: rgba(255, 255, 255, 0.45);
                    transition: all 0.3s ease;
                }

                .nav-item-slot.active .nav-text-label {
                    color: white;
                    font-weight: 700;
                    transform: translateY(-8px);
                }
                
                .nav-item-slot {
                    flex: 1;
                    min-width: 0;
                }

                .home-indicator {
                    width: 40px;
                    height: 4px;
                    background: rgba(255, 255, 255, 0.15);
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
                
                /* Alignment normalization for different element types */
                .nav-action-area * {
                    pointer-events: none;
                }
                
                .nav-icon-wrapper {
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .nav-text-label {
                    display: block;
                    line-height: 1;
                    height: 14px; /* Fixed height for text label row */
                }
            `}</style>
        </>
    );
}
