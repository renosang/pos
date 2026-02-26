"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ShoppingCart, Receipt, Package, Folder, BarChart3, ClipboardCheck, Truck, Building2, TrendingUp } from "lucide-react";

export default function SideNav({ session }: { session: any }) {
    const pathname = usePathname();

    const menuItems = [
        {
            group: "Tổng quan", items: [
                { href: "/", icon: <LayoutDashboard size={20} />, label: "Bàn làm việc" },
                { href: "/pos", icon: <ShoppingCart size={20} />, label: "Bán hàng (POS)" },
                { href: "/sales", icon: <Receipt size={20} />, label: "Hóa đơn" },
            ]
        },
        {
            group: "Quản lý kho", items: [
                { href: "/products", icon: <Package size={20} />, label: "Sản phẩm" },
                { href: "/products/categories", icon: <Folder size={20} />, label: "Danh mục" },
                { href: "/inventory", icon: <BarChart3 size={20} />, label: "Tồn kho" },
                { href: "/inventory/adjustment", icon: <ClipboardCheck size={20} />, label: "Kiểm kê" },
            ]
        },
        {
            group: "Kinh doanh", items: [
                { href: "/purchases", icon: <Truck size={20} />, label: "Nhập hàng" },
                { href: "/suppliers", icon: <Building2 size={20} />, label: "Nhà cung cấp" },
                { href: "/reports", icon: <TrendingUp size={20} />, label: "Báo cáo" },
            ]
        }
    ];

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <div className="logo">
                    Shop <span>Ngọc Vân</span>
                </div>
                <p className="slogan">Mặc đẹp theo cách của bạn</p>
            </div>

            <nav className="sidebar-scroll">
                {menuItems.map((group, idx) => (
                    <div key={idx} className="nav-group">
                        <label>{group.group}</label>
                        {group.items.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link key={item.href} href={item.href} className={`nav-link ${isActive ? 'active' : ''}`}>
                                    <span className="icon">{item.icon}</span>
                                    <span>{item.label}</span>
                                </Link>
                            );
                        })}
                    </div>
                ))}
            </nav>

            <div className="sidebar-footer">
                <div className="user-pill">
                    <div className="avatar">{(session?.user?.name?.[0] || 'U').toUpperCase()}</div>
                    <div className="user-info">
                        <p className="name">{session?.user?.name || 'Administrator'}</p>
                        <p className="role">Quản lý</p>
                    </div>
                </div>
            </div>

        </aside>
    );
}
