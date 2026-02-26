"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { createPurchase } from "@/app/actions/purchase";
import { createProduct } from "@/app/actions/product";
import ImageUpload from "./ImageUpload";
import { useRouter } from "next/navigation";
import { Search, Plus, Trash2, Save, ArrowLeft, Building2, Package, X, Check, Loader2 } from "lucide-react";

export default function PurchaseClient({ suppliers, variants, categories, userId }: { suppliers: any[], variants: any[], categories: any[], userId: string }) {
    const router = useRouter();
    const [selectedSupplierId, setSelectedSupplierId] = useState("");
    const [items, setItems] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(false);

    // Handle client-side portal target
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    // Quick Add Product state
    const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
    const [quickAddData, setQuickAddData] = useState({
        name: "",
        categoryId: "",
        color: "",
        size: "",
        costPrice: "",
        salePrice: "",
        images: [] as string[]
    });
    const [isCreatingProduct, setIsCreatingProduct] = useState(false);

    const filteredVariants = variants.filter(v =>
        v.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.barcode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.skuCode?.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 10);

    const addItem = (variant: any) => {
        const existingItem = items.find(i => i.variantId === variant.id);
        if (existingItem) {
            setItems(items.map(i => i.variantId === variant.id ? { ...i, quantity: i.quantity + 1 } : i));
        } else {
            setItems([...items, {
                variantId: variant.id,
                name: `${variant.product.name} (${variant.color}/${variant.size})`,
                quantity: 1,
                cost: variant.costPrice || 0
            }]);
        }
    };

    const removeItem = (variantId: string) => {
        setItems(items.filter(i => i.variantId !== variantId));
    };

    const updateItem = (variantId: string, field: string, value: any) => {
        setItems(items.map(i => i.variantId === variantId ? { ...i, [field]: value } : i));
    };

    const grandTotal = items.reduce((sum, i) => sum + (i.quantity * i.cost), 0);

    const handleQuickAdd = async () => {
        if (!quickAddData.name || !quickAddData.categoryId) return alert("Vui lòng nhập tên và chọn danh mục!");

        setIsCreatingProduct(true);
        try {
            const product = await createProduct({
                name: quickAddData.name,
                categoryId: quickAddData.categoryId,
                images: quickAddData.images,
                variants: [{
                    color: quickAddData.color || "N/A",
                    size: quickAddData.size || "N/A",
                    costPrice: quickAddData.costPrice || 0,
                    salePrice: quickAddData.salePrice || (parseFloat(quickAddData.costPrice) || 0) * 1.5,
                    minStock: 5
                }]
            }) as any;

            if (product && product.variants && product.variants[0]) {
                const variant = product.variants[0];
                addItem({
                    ...variant,
                    product: { name: product.name }
                });
                setIsQuickAddOpen(false);
                setQuickAddData({ name: "", categoryId: "", color: "", size: "", costPrice: "", salePrice: "", images: [] });
            }
        } catch (error) {
            console.error(error);
            alert("Lỗi khi tạo nhanh sản phẩm!");
        } finally {
            setIsCreatingProduct(false);
        }
    };

    const handleSubmit = async () => {
        if (!selectedSupplierId) return alert("Vui lòng chọn nhà cung cấp!");
        if (items.length === 0) return alert("Vui lòng thêm sản phẩm!");

        setLoading(true);
        try {
            await createPurchase({
                supplierId: selectedSupplierId,
                items,
                userId,
                grandTotal
            });
            router.push("/purchases");
            router.refresh();
        } catch (error) {
            console.error(error);
            alert("Lỗi khi tạo đơn nhập hàng!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="animate-fade-in" style={{ paddingBottom: '5rem' }}>
            <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <button onClick={() => router.back()} className="btn" style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.25rem 0.5rem' }}>
                        <ArrowLeft size={16} /> Quay lại
                    </button>
                    <h1 style={{ margin: 0 }}>Nhập hàng mới</h1>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={handleSubmit}
                    disabled={loading || items.length === 0}
                    style={{ padding: '0.75rem 2rem', gap: '0.75rem' }}
                >
                    <Save size={18} /> {loading ? "Đang xử lý..." : "Lưu đơn nhập"}
                </button>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '2rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {/* 1. Chọn Nhà Cung Cấp */}
                    <div className="glass-card" style={{ padding: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', color: 'var(--primary)', fontWeight: 700 }}>
                            <Building2 size={20} /> Nhà cung cấp
                        </div>
                        <select
                            className="input"
                            style={{ width: '100%', height: '3rem' }}
                            value={selectedSupplierId}
                            onChange={(e) => setSelectedSupplierId(e.target.value)}
                        >
                            <option value="">-- Chọn nhà cung cấp --</option>
                            {suppliers.map((s: any) => <option key={s.id} value={s.id}>{s.name} - {s.phone}</option>)}
                        </select>
                    </div>

                    {/* 2. Chọn Sản Phẩm */}
                    <div className="glass-card" style={{ padding: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--primary)', fontWeight: 700 }}>
                                <Package size={20} /> Tìm sản phẩm nhập kho
                            </div>
                            <button
                                className="btn"
                                onClick={() => setIsQuickAddOpen(true)}
                                style={{ fontSize: '0.875rem', padding: '0.4rem 0.75rem', color: 'var(--primary)', borderColor: 'var(--primary)' }}
                            >
                                <Plus size={16} /> Tạo nhanh sản phẩm
                            </button>
                        </div>
                        <div style={{ position: 'relative', marginBottom: '1rem' }}>
                            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                            <input
                                className="input"
                                placeholder="Nhập tên sản phẩm, mã vạch hoặc SKU..."
                                style={{ width: '100%', paddingLeft: '3rem', height: '3.5rem' }}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {searchTerm && (
                            <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
                                {filteredVariants.length === 0 ? (
                                    <div style={{ padding: '1rem', textAlign: 'center', color: '#64748b' }}>Không tìm thấy sản phẩm</div>
                                ) : (
                                    filteredVariants.map((v: any) => (
                                        <div
                                            key={v.id}
                                            onClick={() => { addItem(v); setSearchTerm(""); }}
                                            style={{ padding: '1rem', borderBottom: '1px solid #f1f5f9', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                                            className="hover-bg"
                                        >
                                            <div>
                                                <div style={{ fontWeight: 600 }}>{v.product.name} ({v.color}/{v.size})</div>
                                                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Barcode: {v.barcode} | Tồn: {v.onHand || 0}</div>
                                            </div>
                                            <Plus size={20} style={{ color: 'var(--primary)' }} />
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>

                    {/* 3. Danh sách hàng nhập */}
                    <div className="glass-card" style={{ padding: '1.5rem' }}>
                        <div style={{ marginBottom: '1rem', fontWeight: 700 }}>Chi tiết hàng nhập</div>
                        {items.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '3rem', border: '2px dashed #e2e8f0', borderRadius: '12px', color: '#94a3b8' }}>
                                Chưa có sản phẩm nào được chọn
                            </div>
                        ) : (
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ textAlign: 'left', borderBottom: '2px solid #f1f5f9' }}>
                                        <th style={{ padding: '1rem' }}>Sản phẩm</th>
                                        <th style={{ padding: '1rem', width: '120px' }}>Số lượng</th>
                                        <th style={{ padding: '1rem', width: '180px' }}>Giá vốn nhập</th>
                                        <th style={{ padding: '1rem', textAlign: 'right', width: '150px' }}>Thành tiền</th>
                                        <th style={{ width: '50px' }}></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((item: any) => (
                                        <tr key={item.variantId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                            <td style={{ padding: '1rem' }}>{item.name}</td>
                                            <td style={{ padding: '1rem' }}>
                                                <input
                                                    type="number"
                                                    className="input"
                                                    style={{ width: '80px', textAlign: 'center' }}
                                                    value={item.quantity}
                                                    onChange={(e) => updateItem(item.variantId, 'quantity', parseInt(e.target.value) || 0)}
                                                />
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                <input
                                                    type="number"
                                                    className="input"
                                                    style={{ width: '100%' }}
                                                    value={item.cost}
                                                    onChange={(e) => updateItem(item.variantId, 'cost', parseFloat(e.target.value) || 0)}
                                                />
                                            </td>
                                            <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 600 }}>
                                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.quantity * item.cost)}
                                            </td>
                                            <td style={{ padding: '1rem', textAlign: 'right' }}>
                                                <button onClick={() => removeItem(item.variantId)} style={{ border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer' }}>
                                                    <Trash2 size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                {/* Sidebar Tổng kết */}
                <div style={{ position: 'sticky', top: '2rem', alignSelf: 'start' }}>
                    <div className="glass-card" style={{ padding: '1.5rem', background: '#0f172a', color: 'white' }}>
                        <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.25rem' }}>Tổng đơn nhập</h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', opacity: 0.8 }}>
                                <span>Số mặt hàng:</span>
                                <span>{items.length}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', opacity: 0.8 }}>
                                <span>Tổng số lượng:</span>
                                <span>{items.reduce((sum, i) => sum + i.quantity, 0)}</span>
                            </div>
                            <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '0.5rem 0' }} />
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '1.125rem' }}>Thanh toán:</span>
                                <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary-light)' }}>
                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(grandTotal)}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="glass-card" style={{ marginTop: '1.5rem', padding: '1.5rem', fontSize: '0.875rem', color: '#64748b' }}>
                        <p style={{ margin: 0 }}>ℹ️ Khi đơn nhập được lưu, hệ thống sẽ tự động cập nhật số lượng tồn kho và ghi lịch sử vào Sổ kho.</p>
                    </div>
                </div>
            </div>

            {/* Quick Add Product Modal */}
            {mounted && isQuickAddOpen && createPortal(
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 9999,
                    backdropFilter: 'blur(4px)'
                }}>
                    <div className="glass-card animate-fade-in" style={{
                        width: '500px',
                        background: 'white',
                        padding: '2rem',
                        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ margin: 0, fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Package size={24} color="var(--primary)" /> Tạo nhanh sản phẩm mới
                            </h2>
                            <button onClick={() => setIsQuickAddOpen(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#64748b' }}>
                                <X size={20} />
                            </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.875rem' }}>Tên sản phẩm *</label>
                                <input
                                    className="input"
                                    style={{ width: '100%' }}
                                    placeholder="VD: Áo thun Polo mẫu 2024"
                                    value={quickAddData.name}
                                    onChange={(e) => setQuickAddData({ ...quickAddData, name: e.target.value })}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.875rem' }}>Danh mục *</label>
                                <select
                                    className="input"
                                    style={{ width: '100%' }}
                                    value={quickAddData.categoryId}
                                    onChange={(e) => setQuickAddData({ ...quickAddData, categoryId: e.target.value })}
                                >
                                    <option value="">-- Chọn danh mục --</option>
                                    {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.875rem' }}>Màu sắc</label>
                                    <input
                                        className="input"
                                        style={{ width: '100%' }}
                                        placeholder="VD: Trắng"
                                        value={quickAddData.color}
                                        onChange={(e) => setQuickAddData({ ...quickAddData, color: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.875rem' }}>Kích thước</label>
                                    <input
                                        className="input"
                                        style={{ width: '100%' }}
                                        placeholder="VD: L"
                                        value={quickAddData.size}
                                        onChange={(e) => setQuickAddData({ ...quickAddData, size: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.875rem' }}>Giá nhập dự kiến</label>
                                    <input
                                        type="number"
                                        className="input"
                                        style={{ width: '100%' }}
                                        placeholder="VD: 150000"
                                        value={quickAddData.costPrice}
                                        onChange={(e) => setQuickAddData({ ...quickAddData, costPrice: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.875rem' }}>Giá bán lẻ</label>
                                    <input
                                        type="number"
                                        className="input"
                                        style={{ width: '100%' }}
                                        placeholder="VD: 250000"
                                        value={quickAddData.salePrice}
                                        onChange={(e) => setQuickAddData({ ...quickAddData, salePrice: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.875rem' }}>Hình ảnh sản phẩm</label>
                                <div style={{ height: '120px' }}>
                                    <ImageUpload
                                        onUpload={(url) => setQuickAddData({ ...quickAddData, images: url ? [url] : [] })}
                                        currentImage={quickAddData.images[0]}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                                <button className="btn" style={{ flex: 1 }} onClick={() => setIsQuickAddOpen(false)}>Hủy</button>
                                <button
                                    className="btn btn-primary"
                                    style={{ flex: 1 }}
                                    onClick={handleQuickAdd}
                                    disabled={isCreatingProduct}
                                >
                                    {isCreatingProduct ? (
                                        <><Loader2 size={18} className="animate-spin" /> Đang tạo...</>
                                    ) : (
                                        <><Check size={18} /> Lưu & Chọn</>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}
