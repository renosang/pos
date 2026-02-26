"use client";

import { useState, useMemo } from "react";
import { createProduct, createCategory, updateProduct, deleteProduct } from "@/app/actions/product";
import { useRouter } from "next/navigation";
import ImageUpload from "./ImageUpload";
import HelpTooltip from "./HelpTooltip";

export default function ProductForm({ categories: initialCategories, initialProduct }: { categories: any[], initialProduct?: any }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState(initialCategories);
    const [showNewCategory, setShowNewCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState("");

    const [formData, setFormData] = useState({
        name: initialProduct?.name || "",
        skuCode: initialProduct?.skuCode || "",
        categoryId: initialProduct?.categoryId || initialCategories[0]?.id || "",
        brand: initialProduct?.brand || "",
        description: initialProduct?.description || "",
        images: (initialProduct?.images as string[]) || [] as string[],
        status: initialProduct?.status || "ACTIVE",
        variants: initialProduct?.variants?.map((v: any) => ({
            id: v.id,
            barcode: v.barcode,
            color: v.color,
            size: v.size,
            costPrice: v.costPrice.toString(),
            salePrice: v.salePrice.toString(),
            minStock: v.minStock.toString(),
            initStock: "0"
        })) || [
                { id: undefined, barcode: "", color: "", size: "", costPrice: "", salePrice: "", minStock: "5", initStock: "0" }
            ]
    });

    const handleAddCategory = async () => {
        if (!newCategoryName.trim()) return;
        setLoading(true);
        try {
            const cat = await createCategory(newCategoryName);
            setCategories([...categories, cat]);
            setFormData({ ...formData, categoryId: cat.id });
            setNewCategoryName("");
            setShowNewCategory(false);
        } catch (err) {
            alert("Lỗi khi tạo danh mục");
        } finally {
            setLoading(false);
        }
    };

    const addVariant = () => {
        // Smart Cloning: Copy values from the last variant
        const lastVariant = formData.variants[formData.variants.length - 1];
        setFormData({
            ...formData,
            variants: [...formData.variants, {
                ...lastVariant,
                id: undefined, // New variant has no ID
                barcode: "", // Reset unique field
                initStock: "0" // Reset stock for new entry
            }]
        });
    };

    const removeVariant = (index: number) => {
        const newVariants = [...formData.variants];
        newVariants.splice(index, 1);
        setFormData({ ...formData, variants: newVariants });
    };

    const handleVariantChange = (index: number, field: string, value: string) => {
        const newVariants = [...formData.variants];
        (newVariants[index] as any)[field] = value;
        setFormData({ ...formData, variants: newVariants });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (initialProduct) {
                await updateProduct(initialProduct.id, formData);
            } else {
                await createProduct(formData);
            }
            router.push("/products");
            router.refresh();
        } catch (err) {
            alert("Lỗi khi lưu sản phẩm");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="product-form-container animate-fade-in">
            <div className="form-main">
                {/* Basic Info Section */}
                <section className="glass-card">
                    <h3 className="section-title">
                        Thông tin cơ bản
                        <HelpTooltip text="Nhập tên sản phẩm, thương hiệu và chọn nhóm sản phẩm phù hợp." />
                    </h3>
                    <div className="form-grid">
                        <div className="input-field">
                            <label>Tên sản phẩm *</label>
                            <input
                                className="input"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                                placeholder="VD: Áo thun Polo Cotton"
                            />
                        </div>
                        <div className="input-field">
                            <label>Nhóm sản phẩm *</label>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                {showNewCategory ? (
                                    <>
                                        <input
                                            className="input"
                                            placeholder="Tên nhóm mới"
                                            value={newCategoryName}
                                            onChange={(e) => setNewCategoryName(e.target.value)}
                                            autoFocus
                                        />
                                        <button type="button" className="btn btn-primary" onClick={handleAddCategory}>OK</button>
                                        <button type="button" className="btn" onClick={() => setShowNewCategory(false)}>×</button>
                                    </>
                                ) : (
                                    <>
                                        <select
                                            className="input"
                                            value={formData.categoryId}
                                            onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                                            required
                                            style={{ flex: 1 }}
                                        >
                                            <option value="">Chọn nhóm</option>
                                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                        <button type="button" className="btn-icon" onClick={() => setShowNewCategory(true)} title="Thêm nhóm mới">+</button>
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="input-field">
                            <label>Thương hiệu</label>
                            <input
                                className="input"
                                value={formData.brand}
                                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                                placeholder="VD: Nike, Adidas"
                            />
                        </div>
                        <div className="input-field">
                            <label>Mã SKU *</label>
                            <input
                                className="input"
                                value={formData.skuCode}
                                onChange={(e) => setFormData({ ...formData, skuCode: e.target.value })}
                                required
                                placeholder="VD: SHIRT-POLO-01"
                            />
                        </div>
                    </div>
                    <div className="input-field" style={{ marginTop: '1.5rem' }}>
                        <label>Mô tả sản phẩm</label>
                        <textarea
                            className="input"
                            rows={3}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Nhập giới thiệu chi tiết về sản phẩm..."
                        />
                    </div>
                </section>

                {/* Images Section */}
                <section className="glass-card">
                    <h3 className="section-title">
                        Hình ảnh sản phẩm
                        <HelpTooltip text="Tải lên hình ảnh sản phẩm. Ảnh đầu tiên sẽ là ảnh đại diện chính." />
                    </h3>
                    <div className="image-grid">
                        {formData.images.map((url, idx) => (
                            <div key={idx} className="image-preview" style={{ width: '120px', height: '120px' }}>
                                <img src={url} alt="Product" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, images: formData.images.filter((_, i) => i !== idx) })}
                                    className="btn-remove-img"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                        <div className="upload-wrapper" style={{ width: '120px', height: '120px' }}>
                            <ImageUpload
                                onUpload={(url) => setFormData({ ...formData, images: [...formData.images, url] })}
                            />
                        </div>
                    </div>
                </section>

                {/* Variants Section */}
                <section className="glass-card">
                    <div className="section-header">
                        <h3 className="section-title">
                            Biến thể & Tồn kho
                            <HelpTooltip text="Thiết lập các biến thể và số lượng tồn kho ban đầu." />
                        </h3>
                        <button type="button" onClick={addVariant} className="btn-add-variant">
                            ✨ Thêm biến thể nhanh
                        </button>
                    </div>

                    <div className="variants-container">
                        {formData.variants.map((v: any, index: number) => (
                            <div key={index} className="variant-box">
                                <div className="variant-row">
                                    <div className="v-field">
                                        <label>Barcode</label>
                                        <input
                                            className="input"
                                            value={v.barcode}
                                            onChange={(e) => handleVariantChange(index, 'barcode', e.target.value)}
                                            placeholder="Quét/Nhập mã vạch"
                                        />
                                    </div>
                                    <div className="v-field">
                                        <label>Màu sắc</label>
                                        <input
                                            className="input"
                                            value={v.color}
                                            onChange={(e) => handleVariantChange(index, 'color', e.target.value)}
                                            placeholder="Đỏ, Xanh..."
                                        />
                                    </div>
                                    <div className="v-field">
                                        <label>Kích cỡ</label>
                                        <input
                                            className="input"
                                            value={v.size}
                                            onChange={(e) => handleVariantChange(index, 'size', e.target.value)}
                                            placeholder="M, L, XL..."
                                        />
                                    </div>
                                    <div className="v-field">
                                        <label style={{ color: 'var(--primary)' }}>Số lượng tồn *</label>
                                        <input
                                            type="number"
                                            className="input"
                                            style={{ borderColor: 'var(--primary-low)', background: 'var(--primary-low-bg)' }}
                                            value={v.initStock}
                                            onChange={(e) => handleVariantChange(index, 'initStock', e.target.value)}
                                            placeholder="0"
                                            disabled={!!initialProduct} // Only for new products
                                        />
                                    </div>
                                </div>
                                <div className="variant-row" style={{ marginTop: '1rem' }}>
                                    <div className="v-field">
                                        <label>Giá vốn *</label>
                                        <input
                                            type="number"
                                            className="input"
                                            value={v.costPrice}
                                            onChange={(e) => handleVariantChange(index, 'costPrice', e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="v-field">
                                        <label>Giá bán *</label>
                                        <input
                                            type="number"
                                            className="input"
                                            value={v.salePrice}
                                            onChange={(e) => handleVariantChange(index, 'salePrice', e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="v-field">
                                        <label>Cảnh báo tồn</label>
                                        <input
                                            type="number"
                                            className="input"
                                            value={v.minStock}
                                            onChange={(e) => handleVariantChange(index, 'minStock', e.target.value)}
                                        />
                                    </div>
                                    <div className="v-field-action">
                                        {formData.variants.length > 1 && (
                                            <button type="button" onClick={() => removeVariant(index)} className="btn-delete-v text-danger">
                                                🗑️ Xoá
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            {/* Sidebar Sticky Actions */}
            <div className="form-sidebar">
                <div className="glass-card sticky-card">
                    <h4 style={{ marginBottom: '1rem' }}>Xuất bản</h4>
                    {initialProduct && (
                        <div className="input-field" style={{ marginBottom: '1.5rem' }}>
                            <label>Trạng thái</label>
                            <select
                                className="input"
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            >
                                <option value="ACTIVE">Đang hoạt động</option>
                                <option value="ARCHIVED">Không kích hoạt</option>
                            </select>
                        </div>
                    )}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <button type="submit" className="btn btn-primary full-width" disabled={loading}>
                            {loading ? "Đang xử lý..." : (initialProduct ? "Lưu thay đổi" : "Tạo sản phẩm")}
                        </button>
                        <button type="button" onClick={() => router.back()} className="btn full-width" style={{ background: 'white', border: '1px solid var(--surface-border)', color: 'var(--text-muted)' }}>
                            ↩ Quay lại danh sách
                        </button>
                        {initialProduct && (
                            <button type="button" onClick={async () => {
                                if (confirm("Xóa sản phẩm này?")) {
                                    setLoading(true);
                                    await deleteProduct(initialProduct.id);
                                    router.push("/products");
                                }
                            }} className="btn-text-danger">
                                Xóa sản phẩm
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <style jsx>{`
                .product-form-container { display: grid; grid-template-columns: 1fr 300px; gap: 1.5rem; align-items: start; }
                .form-main { display: flex; flex-direction: column; gap: 1.5rem; }
                .section-title { font-size: 1.1rem; border-left: 4px solid var(--primary); padding-left: 0.75rem; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.5rem; }
                .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
                .btn-add-variant { background: var(--primary-low); color: var(--primary); border: 1px dashed var(--primary); padding: 0.5rem 1rem; border-radius: 8px; font-weight: 700; cursor: pointer; transition: all 0.2s; }
                .btn-add-variant:hover { background: var(--primary); color: white; border-style: solid; }
                .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; }
                .input-field label { display: block; font-size: 0.85rem; font-weight: 600; color: var(--text-muted); margin-bottom: 0.5rem; }
                .btn-icon { background: var(--surface-border); border: none; width: 40px; border-radius: 8px; font-size: 1.25rem; cursor: pointer; }
                .image-grid { display: flex; flex-wrap: wrap; gap: 1rem; }
                .image-preview { position: relative; border-radius: 12px; overflow: hidden; border: 1px solid var(--surface-border); }
                .btn-remove-img { position: absolute; top: 4px; right: 4px; background: var(--danger); color: white; border: none; width: 20px; height: 20px; border-radius: 50%; cursor: pointer; }
                .variants-container { display: flex; flex-direction: column; gap: 1.25rem; }
                .variant-box { padding: 1.25rem; background: #f8fafc; border: 1px solid var(--surface-border); border-radius: 12px; transition: all 0.2s; }
                .variant-box:hover { border-color: var(--primary); background: white; box-shadow: 0 4px 12px rgba(0,0,0,0.03); }
                .variant-row { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 1rem; }
                .v-field label { display: block; font-size: 0.75rem; font-weight: 700; color: var(--text-muted); margin-bottom: 0.4rem; text-transform: uppercase; letter-spacing: 0.025em; }
                .v-field-action { display: flex; align-items: flex-end; justify-content: flex-end; }
                .btn-delete-v { background: none; border: none; color: var(--danger); font-size: 0.85rem; cursor: pointer; font-weight: 600; }
                .sticky-card { position: sticky; top: 2rem; }
                .full-width { width: 100%; }
                .btn-text-danger { background: none; border: none; color: var(--danger); width: 100%; padding-top: 1rem; cursor: pointer; font-size: 0.875rem; font-weight: 600; }
            `}</style>
        </form>
    );
}
