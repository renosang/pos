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
        { id: "home", href: "/", icon: <LayoutDashboard size={24} />, label: "Tổng quan" },
        { id: "sales", href: "/sales", icon: <Receipt size={24} />, label: "Hóa đơn" },
        { id: "scan", icon: <Scan size={28} />, label: "Quét mã" },
        { id: "inventory", href: "/inventory", icon: <Box size={24} />, label: "Tồn kho" },
        { id: "more", icon: <MoreHorizontal size={24} />, label: "Thêm" },
    ];

    const getActiveIndex = () => {
        if (isMenuOpen) return 4;
        if (pathname === "/pos" || pathname.includes("/pos")) return 2;
        if (pathname === "/sales") return 1;
        if (pathname === "/inventory" || pathname.includes("/inventory")) return 3;
        if (pathname === "/" || pathname === "/dashboard") return 0;
        if (pathname.includes("/products")) return 3;
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
                            { href: "/products", icon: <Package size={20} />, label: "Sản phẩm" },
                            { href: "/products/categories", icon: <Folder size={20} />, label: "Danh mục" },
                            { href: "/inventory/adjustment", icon: <ClipboardCheck size={20} />, label: "Kiểm kê" },
                            { href: "/purchases", icon: <Truck size={20} />, label: "Nhập hàng" },
                            { href: "/suppliers", icon: <Building2 size={20} />, label: "Nhà cung cấp" },
                            { href: "/reports", icon: <TrendingUp size={20} />, label: "Báo cáo" },
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
                <div className="m-nav-wrapper">
                    {/* SVG background with dynamic convex wave (bulge) */}
                    <div className="m-nav-bg">
                        <svg viewBox="0 0 100 30" preserveAspectRatio="none">
                            <path
                                d={activeIndex === -1 ? "M 0,30 L 0,10 L 100,10 L 100,30 Z" :
                                    `M 0,30 L 0,10 
                                    H ${activeIndex * 20 + 1.5}
                                    C ${activeIndex * 20 + 5},10 ${activeIndex * 20 + 6},-2 ${activeIndex * 20 + 10},-2
                                    C ${activeIndex * 20 + 14},-2 ${activeIndex * 20 + 15},10 ${activeIndex * 20 + 18.5},10
                                    H 100
                                    L 100,30 Z`}
                                fill="white"
                            />
                        </svg>
                    </div>

                    <div className="m-nav-items">
                        {navItems.map((item, idx) => {
                            const isActive = activeIndex === idx;

                            const content = (
                                <>
                                    <div className="m-icon-container">
                                        <div className="m-icon-circle">
                                            {item.icon}
                                        </div>
                                    </div>
                                    <span className="m-label">{item.label}</span>
                                </>
                            );

                            if (item.href && item.id !== "scan") {
                                return (
                                    <Link
                                        key={item.id}
                                        href={item.href}
                                        className={`m-nav-slot ${isActive ? 'active' : ''}`}
                                        onClick={() => handleNavClick(item)}
                                    >
                                        {content}
                                    </Link>
                                );
                            }

                            return (
                                <button
                                    key={item.id}
                                    className={`m-nav-slot ${isActive ? 'active' : ''}`}
                                    onClick={() => handleNavClick(item)}
                                >
                                    {content}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </nav>

            <style jsx>{`
                .bottom-nav {
                    position: fixed;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    height: calc(85px + env(safe-area-inset-bottom));
                    z-index: 1000;
                    display: flex;
                    justify-content: center;
                    pointer-events: none;
                }

                .m-nav-wrapper {
                    width: 100%;
                    height: 100%;
                    position: relative;
                    pointer-events: auto;
                }

                .m-nav-bg {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    filter: drop-shadow(0 -10px 25px rgba(0,0,0,0.1));
                }

                .m-nav-bg svg {
                    width: 100%;
                    height: 100%;
                }

                .m-nav-bg path {
                    transition: d 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }

                .m-nav-items {
                    display: grid;
                    grid-template-columns: repeat(5, 1fr);
                    height: 100%;
                    position: relative;
                    z-index: 2;
                    padding-bottom: env(safe-area-inset-bottom);
                }

                .m-nav-slot {
                    display: flex !important;
                    flex-direction: column !important;
                    align-items: center !important;
                    justify-content: flex-end !important;
                    padding: 0 0 15px 0 !important;
                    background: none !important;
                    border: none !important;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    text-decoration: none !important;
                    color: #94a3b8 !important;
                    width: 100%;
                    position: relative;
                }

                .m-icon-container {
                    position: relative;
                    height: 48px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 2px;
                }

                .m-icon-circle {
                    width: 48px;
                    height: 48px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    background: transparent;
                }

                .m-nav-slot.active .m-icon-circle {
                    transform: translateY(-50px);
                    background: var(--primary);
                    color: white;
                    box-shadow: 0 15px 30px rgba(99, 102, 241, 0.4);
                    border: 4px solid white;
                }

                .m-nav-slot:nth-child(3).active .m-icon-circle {
                    background: linear-gradient(135deg, var(--primary), var(--accent));
                }

                .m-label {
                    font-size: 0.65rem !important;
                    font-weight: 800 !important;
                    transition: all 0.3s !important;
                    color: #64748b !important;
                    white-space: nowrap !important;
                    display: block !important;
                    text-align: center !important;
                }

                .m-nav-slot.active .m-label {
                    color: var(--primary) !important;
                    font-weight: 950 !important;
                    transform: translateY(-12px);
                }

                /* More Menu Styling */
                .more-menu-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(15, 23, 42, 0.6);
                    backdrop-filter: blur(12px);
                    -webkit-backdrop-filter: blur(12px);
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
                    box-shadow: 0 -20px 50px rgba(0,0,0,0.15);
                }

                .more-menu-overlay.open .more-menu-content {
                    transform: translateY(0);
                }

                .menu-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 2.5rem;
                    padding: 0 0.5rem;
                }

                .menu-header h3 {
                    font-size: 1.5rem;
                    font-weight: 950;
                    color: var(--text-main);
                    letter-spacing: -0.02em;
                }

                .close-btn {
                    color: var(--text-muted);
                    padding: 10px;
                    background: var(--surface-secondary);
                    border-radius: 50%;
                    transition: 0.2s;
                }

                .close-btn:active {
                    transform: scale(0.9);
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

                .menu-item:active {
                    transform: scale(0.95);
                }

                .menu-icon {
                    width: 64px;
                    height: 64px;
                    border-radius: 22px;
                    background: var(--surface-secondary);
                    color: var(--text-main);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 4px 10px rgba(0,0,0,0.03);
                    transition: all 0.2s;
                }

                .menu-item.active .menu-icon {
                    background: var(--primary);
                    color: white;
                    box-shadow: 0 10px 20px rgba(99, 102, 241, 0.25);
                }

                .menu-item span {
                    font-size: 0.8125rem;
                    font-weight: 850;
                    text-align: center;
                    line-height: 1.2;
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
