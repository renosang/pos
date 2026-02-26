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
                <div className="nav-container">
                    {/* SVG background centered to the container */}
                    <div className="nav-bg-layer">
                        <svg viewBox="0 0 100 30" preserveAspectRatio="none">
                            <path
                                d={activeIndex === -1 ? "M 0,30 L 0,10 L 100,10 L 100,30 Z" :
                                    `M 0,30 L 0,10 
                                    H ${activeIndex * 20 + 2.5}
                                    Q ${activeIndex * 20 + 5},10 ${activeIndex * 20 + 7},6
                                    C ${activeIndex * 20 + 8.5},2 ${activeIndex * 20 + 11.5},2 ${activeIndex * 20 + 13},6
                                    Q ${activeIndex * 20 + 15},10 ${activeIndex * 20 + 17.5},10
                                    H 100
                                    L 100,30 Z`}
                                fill="white"
                            />
                        </svg>
                    </div>

                    <div className="nav-links">
                        {navItems.map((item, idx) => {
                            const isActive = activeIndex === idx;
                            const isScan = item.id === "scan";

                            return (
                                <div key={item.id} className={`nav-slot ${isActive ? 'active' : ''}`}>
                                    {item.href && !isScan ? (
                                        <Link href={item.href} onClick={() => handleNavClick(item)} className="nav-link">
                                            <div className="icon-box">{item.icon}</div>
                                            <span className="label">{item.label}</span>
                                        </Link>
                                    ) : (
                                        <button onClick={() => handleNavClick(item)} className="nav-link">
                                            <div className="icon-box">{item.icon}</div>
                                            <span className="label">{item.label}</span>
                                        </button>
                                    )}
                                </div>
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
                    height: calc(75px + env(safe-area-inset-bottom));
                    z-index: 1000;
                    display: flex;
                    justify-content: center;
                    pointer-events: none;
                }

                .nav-container {
                    width: 100%;
                    height: 100%;
                    position: relative;
                    pointer-events: auto;
                }

                .nav-bg-layer {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    filter: drop-shadow(0 -8px 20px rgba(0,0,0,0.06));
                }

                .nav-bg-layer svg {
                    width: 100%;
                    height: 100%;
                }

                .nav-bg-layer path {
                    transition: d 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .nav-links {
                    display: grid;
                    grid-template-columns: repeat(5, 1fr);
                    height: 100%;
                    position: relative;
                    z-index: 2;
                    padding-bottom: env(safe-area-inset-bottom);
                }

                .nav-slot {
                    display: flex;
                    justify-content: center;
                    align-items: flex-end;
                    padding-bottom: 12px;
                }

                .nav-link {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    background: none;
                    border: none;
                    padding: 0;
                    gap: 4px;
                    color: #94a3b8;
                    text-decoration: none;
                    transition: all 0.3s;
                    width: 100%;
                }

                .icon-box {
                    width: 44px;
                    height: 44px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    background: transparent;
                }

                .nav-slot.active .icon-box {
                    transform: translateY(-38px);
                    background: var(--primary);
                    color: white;
                    box-shadow: 0 10px 20px rgba(99, 102, 241, 0.3);
                }

                .nav-slot:nth-child(3).active .icon-box {
                    background: linear-gradient(135deg, var(--primary), var(--accent));
                }

                .label {
                    font-size: 0.65rem;
                    font-weight: 800;
                    transition: all 0.3s;
                    color: #64748b;
                }

                .nav-slot.active .label {
                    color: var(--primary);
                    transform: translateY(-6px);
                    opacity: 1;
                    font-weight: 900;
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
                    margin-bottom: 2.5rem;
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
                    width: 60px;
                    height: 60px;
                    border-radius: 20px;
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
                    box-shadow: 0 8px 15px rgba(99, 102, 241, 0.2);
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
