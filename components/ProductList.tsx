"use client";

import { useState, useMemo, useRef } from "react";
import Link from "next/link";
import HelpTooltip from "./HelpTooltip";
import { importProductsFromCSV } from "@/app/actions/product";

export default function ProductList({ products }: { products: any[] }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [importing, setImporting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const filteredProducts = useMemo(() => {
        if (!searchTerm.trim()) return products;
        const lowSearch = searchTerm.toLowerCase();
        return products.filter(p =>
            p.name.toLowerCase().includes(lowSearch) ||
            (p.skuCode && p.skuCode.toLowerCase().includes(lowSearch)) ||
            p.variants.some((v: any) =>
                (v.barcode && v.barcode.toLowerCase().includes(lowSearch))
            )
        );
    }, [products, searchTerm]);

    const handleExport = () => {
        const headers = ["Tên sản phẩm", "SKU", "Thương hiệu", "Nhóm", "Màu sắc", "Kích cỡ", "Barcode", "Giá vốn", "Giá bán", "Tồn hiện tại"];
        const rows = products.flatMap(p =>
            p.variants.map((v: any) => [
                p.name,
                p.skuCode,
                p.brand || "",
                p.category?.name || "",
                v.color || "",
                v.size || "",
                v.barcode || "",
                v.costPrice,
                v.salePrice,
                v.onHand
            ])
        );

        const csvContent = [
            headers.join(","),
            ...rows.map(row => row.map((cell: any) => `"${cell}"`).join(","))
        ].join("\n");

        const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `danh_sach_san_pham_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setImporting(true);
        const reader = new FileReader();
        reader.onload = async (event) => {
            const text = event.target?.result as string;
            const lines = text.split("\n").filter(l => l.trim());
            const data = lines.slice(1).map(line => {
                const cells = line.split(",").map((c: string) => c.replace(/^"|"$/g, '').trim());
                return {
                    name: cells[0],
                    skuCode: cells[1],
                    brand: cells[2],
                    categoryName: cells[3],
                    color: cells[4],
                    size: cells[5],
                    barcode: cells[6],
                    costPrice: parseFloat(cells[7]),
                    salePrice: parseFloat(cells[8]),
                    initStock: parseInt(cells[9] || "0")
                };
            });

            try {
                await importProductsFromCSV(data);
                alert("Import thành công!");
                window.location.reload();
            } catch (err) {
                alert("Lỗi khi import dữ liệu. Vui lòng kiểm tra định dạng file.");
            } finally {
                setImporting(false);
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="animate-fade-in" style={{ position: 'relative' }}>
            {/* Search & Actions Bar */}
            <div className="glass-card" style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap', padding: '1rem 1.5rem' }}>
                <div style={{ flex: 1, position: 'relative', minWidth: '300px' }}>
                    <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>🔍</span>
                    <input
                        className="input"
                        placeholder="Tìm theo tên sản phẩm, SKU hoặc Barcode..."
                        style={{ paddingLeft: '2.5rem' }}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button className="btn" style={{ background: 'rgba(99, 102, 241, 0.05)', color: 'var(--text-main)' }} onClick={handleExport}>
                        <span style={{ color: 'var(--primary)' }}>📤</span> Xuất CSV
                    </button>
                    <button className="btn" style={{ background: 'rgba(99, 102, 241, 0.05)', color: 'var(--text-main)' }} onClick={() => fileInputRef.current?.click()} disabled={importing}>
                        <span style={{ color: 'var(--primary)' }}>📥</span> {importing ? "Đang xử lý..." : "Nhập CSV"}
                    </button>
                    <input type="file" ref={fileInputRef} hidden accept=".csv" onChange={handleImport} />

                    <Link href="/products/new" className="btn btn-primary">
                        + Thêm sản phẩm
                    </Link>
                </div>
            </div>

            <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            <th style={{ textAlign: 'left', width: '80px' }}>Ảnh</th>
                            <th style={{ textAlign: 'left' }}>Sản phẩm</th>
                            <th style={{ textAlign: 'left' }}>Mã SKU</th>
                            <th style={{ textAlign: 'left' }}>Tồn kho</th>
                            <th style={{ textAlign: 'left' }}>Nhóm</th>
                            <th style={{ textAlign: 'center' }}>Trạng thái</th>
                            <th style={{ textAlign: 'right' }}>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProducts.length === 0 ? (
                            <tr>
                                <td colSpan={7} style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                                    {searchTerm ? "Không tìm thấy sản phẩm nào khớp với từ khóa." : "Chưa có sản phẩm nào."}
                                </td>
                            </tr>
                        ) : (
                            filteredProducts.map((product: any) => (
                                <tr key={product.id} className="p-row" style={{ borderBottom: '1px solid var(--surface-border)' }}>
                                    <td style={{ padding: '1rem' }}>
                                        {product.images?.length > 0 ? (
                                            <img src={product.images[0]} alt={product.name} style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }} />
                                        ) : (
                                            <div style={{ width: '48px', height: '48px', background: 'var(--background)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>📦</div>
                                        )}
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <button
                                            onClick={() => setSelectedProduct(product)}
                                            style={{ display: 'block', textAlign: 'left' }}
                                        >
                                            <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.9375rem' }}>{product.name}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{product.brand || "Không có thương hiệu"}</div>
                                        </button>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <code className="sku-code">{product.skuCode}</code>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <span style={{ fontSize: '1rem', fontWeight: 800, color: product.totalStock <= 5 ? 'var(--danger)' : 'var(--text)' }}>
                                                {product.totalStock}
                                            </span>
                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>trong {product.variants.length} biến thể</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{ fontSize: '0.875rem' }}>{product.category?.name}</span>
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                                        <span className={`badge ${product.status === 'ACTIVE' ? 'active' : 'archived'}`}>
                                            {product.status === 'ACTIVE' ? 'Đang bán' : 'Không kích hoạt'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                                        <Link href={`/products/${product.id}`} className="btn-edit-clean">
                                            ⚙️
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Quick Summary Popup */}
            {selectedProduct && (
                <div className="popup-overlay" onClick={() => setSelectedProduct(null)}>
                    <div className="popup-content" onClick={e => e.stopPropagation()}>
                        <div className="popup-header">
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                {selectedProduct.images?.[0] ?
                                    <img src={selectedProduct.images[0]} style={{ width: '60px', height: '60px', borderRadius: '12px' }} />
                                    : <div style={{ width: '60px', height: '60px', background: '#f1f5f9', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📦</div>
                                }
                                <div>
                                    <h2 style={{ margin: 0, fontSize: '1.25rem' }}>{selectedProduct.name}</h2>
                                    <div style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.9rem' }}>SKU: {selectedProduct.skuCode}</div>
                                </div>
                            </div>
                            <button className="close-popup" onClick={() => setSelectedProduct(null)}>×</button>
                        </div>
                        <div className="popup-body">
                            <div className="summary-section">
                                <h4>Thông tin biến thể</h4>
                                <div className="variants-list">
                                    {selectedProduct.variants.map((v: any) => (
                                        <div key={v.id} className="v-summary-item">
                                            <span style={{ fontWeight: 600 }}>{v.color || "-"} / {v.size || "-"}</span>
                                            <span>Barcode: {v.barcode || "---"}</span>
                                            <span style={{ color: v.onHand <= v.minStock ? 'var(--danger)' : 'var(--success)', fontWeight: 800 }}>
                                                Tồn: {v.onHand}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
                                <Link href={`/products/${selectedProduct.id}`} className="btn btn-primary" style={{ flex: 1, padding: '0.8rem' }}>
                                    ✨ Chỉnh sửa chi tiết
                                </Link>
                                <button className="btn" style={{ flex: 1 }} onClick={() => setSelectedProduct(null)}>Đóng</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                .p-row:hover { background: #f8fafc; }
                .sku-code { background: #f1f5f9; padding: 0.25rem 0.5rem; border-radius: 6px; font-size: 0.8rem; color: var(--text); font-weight: 600; }
                .btn-edit-clean { display: inline-flex; align-items: center; justify-content: center; width: 36px; height: 36px; border-radius: 8px; background: #f1f5f9; text-decoration: none; font-size: 1.1rem; transition: all 0.2s; }
                .btn-edit-clean:hover { background: var(--primary-low); transform: scale(1.05); }
                .popup-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 2000; animation: fadeIn 0.2s; }
                .popup-content { background: white; width: 100%; max-width: 500px; border-radius: 16px; box-shadow: 0 20px 50px rgba(0,0,0,0.15); animation: zoomIn 0.3s cubic-bezier(0, 0, 0.2, 1); overflow: hidden; }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes zoomIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
                .popup-header { padding: 1.5rem; border-bottom: 1px solid var(--surface-border); display: flex; justify-content: space-between; align-items: center; }
                .close-popup { background: #f1f5f9; border: none; width: 32px; height: 32px; border-radius: 50%; cursor: pointer; font-size: 1.25rem; display: flex; align-items: center; justify-content: center; }
                .popup-body { padding: 1.5rem; }
                .v-summary-item { display: grid; grid-template-columns: 1fr 1fr 80px; padding: 0.75rem; border-bottom: 1px dashed var(--surface-border); font-size: 0.9rem; }
                .v-summary-item:last-child { border-bottom: none; }
                h4 { margin: 0 0 1rem 0; font-size: 0.9rem; text-transform: uppercase; color: var(--text-muted); letter-spacing: 0.05em; }
            `}</style>
        </div>
    );
}
