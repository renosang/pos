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

    const navItems = [
        { href: "/", icon: <LayoutDashboard size={24} />, label: "Tổng quan" },
        { href: "/sales", icon: <Receipt size={24} />, label: "Hóa đơn" },
        { href: "/pos", id: "scan", icon: <Scan size={28} />, label: "Quét mã" },
        { href: "/inventory", icon: <Box size={24} />, label: "Tồn kho" },
        { id: "more", icon: <MoreHorizontal size={24} />, label: "Thêm" },
    ];

    const moreItems = [
        { href: "/products", icon: <Package size={20} />, label: "Sản phẩm" },
        { href: "/products/categories", icon: <Folder size={20} />, label: "Danh mục" },
        { href: "/inventory/adjustment", icon: <ClipboardCheck size={20} />, label: "Kiểm kê" },
        { href: "/purchases", icon: <Truck size={20} />, label: "Nhập hàng" },
        { href: "/suppliers", icon: <Building2 size={20} />, label: "Nhà cung cấp" },
        { href: "/reports", icon: <TrendingUp size={20} />, label: "Báo cáo" },
    ];

    // Determine the active index for the indicator
    const getActiveIndex = () => {
        if (isMenuOpen) return 4; // "Thêm" is active
        if (pathname === "/pos" || pathname.includes("/pos")) return 2;
        if (pathname === "/sales") return 1;
        if (pathname === "/inventory") return 3;
        if (pathname === "/") return 0;
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
                {/* SVG Background with dynamic cutout */}
                <div className="nav-background">
                    <svg viewBox="0 0 100 30" preserveAspectRatio="none">
                        <path
                            d={activeIndex === -1 ? "M 0,30 L 0,10 L 100,10 L 100,30 Z" :
                                `M 0,30 L 0,10 
                                H ${activeIndex * 20 + 2}
                                Q ${activeIndex * 20 + 5},10 ${activeIndex * 20 + 7},5
                                C ${activeIndex * 20 + 8.5},2 ${activeIndex * 20 + 11.5},2 ${activeIndex * 20 + 13},5
                                Q ${activeIndex * 20 + 15},10 ${activeIndex * 20 + 18},10
                                H 100
                                L 100,30 Z`}
                            fill="white"
                        />
                    </svg>
                </div>

                <div className="nav-items-container">
                    {navItems.map((item, idx) => {
                        const isActive = activeIndex === idx;
                        const isScan = item.id === "scan";

                        const content = (
                            <div className="nav-item-content">
                                <div className="icon-circle">
                                    {item.icon}
                                </div>
                                <span className="nav-label">{item.label}</span>
                            </div>
                        );

                        if (item.href && item.id !== "scan") {
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`nav-item ${isActive ? 'active' : ''}`}
                                    onClick={() => handleNavClick(item)}
                                >
                                    {content}
                                </Link>
                            );
                        }

                        return (
                            <button
                                key={item.id || item.href}
                                className={`nav-item ${isActive ? 'active' : ''} ${isScan ? 'scan-item' : ''}`}
                                onClick={() => handleNavClick(item)}
                            >
                                {content}
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
                    height: 80px;
                    z-index: 1000;
                    background: transparent;
                    padding-bottom: env(safe-area-inset-bottom);
                }

                .nav-background {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    filter: drop-shadow(0 -5px 15px rgba(0,0,0,0.08));
                }

                .nav-background svg {
                    width: 100%;
                    height: 100%;
                }

                .nav-background path {
                    transition: d 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .nav-items-container {
                    display: grid;
                    grid-template-columns: repeat(5, 1fr);
                    height: 100%;
                    position: relative;
                    z-index: 2;
                }

                .nav-item {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: flex-end;
                    background: none;
                    border: none;
                    padding: 0 0 12px 0;
                    position: relative;
                    color: #94a3b8;
                    text-decoration: none;
                    transition: all 0.3s;
                }

                .nav-item-content {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 2px;
                }

                .icon-circle {
                    width: 42px;
                    height: 42px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                    position: relative;
                    z-index: 5;
                }

                .nav-item.active .icon-circle {
                    transform: translateY(-35px);
                    background: var(--primary);
                    color: white;
                    box-shadow: 0 10px 20px rgba(99, 102, 241, 0.3);
                }

                .scan-item.active .icon-circle {
                    background: linear-gradient(135deg, var(--primary), var(--accent));
                }

                .nav-label {
                    font-size: 0.65rem;
                    font-weight: 800;
                    transition: all 0.3s;
                    color: #64748b;
                }

                .nav-item.active .nav-label {
                    color: var(--primary);
                    font-weight: 900;
                    transform: translateY(-2px);
                }

                /* More Menu */
                .more-menu-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(15, 23, 42, 0.5);
                    backdrop-filter: blur(8px);
                    -webkit-backdrop-filter: blur(8px);
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
                    padding: 2.5rem 2rem;
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
                    font-weight: 950;
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
                    color: #64748b;
                    transition: 0.2s;
                }

                .menu-icon {
                    width: 58px;
                    height: 58px;
                    border-radius: 20px;
                    background: var(--surface-secondary);
                    color: var(--text-main);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: 0.2s;
                    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
                }

                .menu-item.active .menu-icon {
                    background: var(--primary);
                    color: white;
                    box-shadow: 0 8px 15px rgba(99, 102, 241, 0.25);
                }

                .menu-item span {
                    font-size: 0.75rem;
                    font-weight: 800;
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
