"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ShoppingCart, Package, Users, Settings } from "lucide-react";

export default function BottomNav({ session }: { session: any }) {
    const pathname = usePathname();

    if (!session) return null;

    const navItems = [
        { href: "/", icon: <LayoutDashboard size={22} />, label: "Tổng quan" },
        { href: "/pos", icon: <ShoppingCart size={22} />, label: "Bán hàng" },
        { href: "/products", icon: <Package size={22} />, label: "Sản phẩm" },
        { href: "/suppliers", icon: <Users size={22} />, label: "Đối tác" },
    ];

    return (
        <nav className="bottom-nav show-mobile">
            {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                    <Link key={item.href} href={item.href} className={`nav-item ${isActive ? 'active' : ''}`}>
                        <div className="icon-wrapper">
                            {item.icon}
                        </div>
                        <span>{item.label}</span>
                    </Link>
                );
            })}

        </nav>
    );
}
