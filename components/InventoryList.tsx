"use client";

import { useState, useMemo } from "react";
import { adjustStock, updateVariantInfo } from "@/app/actions/inventory";

export default function InventoryList({ inventory }: { inventory: any[] }) {
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [adjustment, setAdjustment] = useState({
        changeQty: 0,
        type: "ADJUSTMENT",
        reason: ""
    });
    const [variantInfo, setVariantInfo] = useState({
        location: "",
        minStock: 5
    });

    // Filtering State
    const [searchTerm, setSearchTerm] = useState("");
    const [filterCategory, setFilterCategory] = useState("");
    const [filterBrand, setFilterBrand] = useState("");
    const [filterStockStatus, setFilterStockStatus] = useState("all");

    const openDrawer = (item: any) => {
        setSelectedItem(item);
        setVariantInfo({
            location: item.location || "",
            minStock: item.minStock || 5
        });
        setAdjustment({ changeQty: 0, type: "ADJUSTMENT", reason: "" });
    };

    const handleAdjust = async (e?: React.FormEvent, customQty?: number, customType?: string) => {
        if (e) e.preventDefault();
        if (!selectedItem) return;

        const qty = customQty !== undefined ? customQty : adjustment.changeQty;
        const type = customType || adjustment.type;

        if (qty === 0 && !customType) return;

        setLoading(true);
        try {
            await adjustStock(
                selectedItem.id,
                qty,
                type,
                adjustment.reason || (customType === "DEFECTIVE" ? "Chuyển kho lỗi" : (customType === "RETURN" ? "Khách trả hàng" : "Điều chỉnh nhanh"))
            );
            setAdjustment({ ...adjustment, changeQty: 0, reason: "" });
        } catch (err) {
            alert("Lỗi khi cập nhật kho");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateInfo = async () => {
        if (!selectedItem) return;
        setLoading(true);
        try {
            await updateVariantInfo(selectedItem.id, variantInfo);
            alert("Đã lưu thiết lập!");
        } catch (err) {
            alert("Lỗi khi lưu thiết lập");
        } finally {
            setLoading(false);
        }
    };

    // Filtering Logic
    const filteredInventory = useMemo(() => {
        return inventory.filter(item => {
            const matchesSearch = !searchTerm.trim() ||
                item.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (item.skuCode && item.skuCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (item.barcode && item.barcode.toLowerCase().includes(searchTerm.toLowerCase()));

            const matchesCategory = !filterCategory || item.product.categoryId === filterCategory;
            const matchesBrand = !filterBrand || item.product.brand === filterBrand;

            const matchesStock =
                filterStockStatus === "all" ? true :
                    filterStockStatus === "low" ? item.onHand <= item.minStock :
                        filterStockStatus === "out" ? item.onHand <= 0 : true;

            return matchesSearch && matchesCategory && matchesBrand && matchesStock;
        });
    }, [inventory, searchTerm, filterCategory, filterBrand, filterStockStatus]);

    // Grouping
    const groupedData = filteredInventory.reduce((acc, item) => {
        const prodId = item.product.id;
        if (!acc[prodId]) {
            acc[prodId] = {
                product: item.product,
                variants: []
            };
        }
        acc[prodId].variants.push(item);
        return acc;
    }, {} as Record<string, { product: any, variants: any[] }>);

    const productGroups = Object.values(groupedData) as any[];

    // Filter Options
    const categories = Array.from(new Set(inventory.map(i => JSON.stringify({ id: i.product.categoryId, name: i.product.category?.name }))))
        .map(s => JSON.parse(s))
        .filter(c => c.id);

    const brands = Array.from(new Set(inventory.map(i => i.product.brand))).filter(Boolean);

    // Current item ref
    const currentItem = selectedItem ? inventory.find(i => i.id === selectedItem.id) : null;

    const headerColors = [
        'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)', // Indigo-Violet
        'linear-gradient(135deg, #ec4899 0%, #be185d 100%)', // Rose
        'linear-gradient(135deg, #10b981 0%, #059669 100%)', // Emerald
        'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', // Amber
        'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)', // Violet
        'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)', // Cyan
        'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', // Red
    ];

    const getHeaderStyle = (id: string) => {
        const charCodeSum = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const color = headerColors[charCodeSum % headerColors.length];
        return { background: color };
    };

    return (
        <div style={{ position: 'relative' }}>
            {/* Filter Bar */}
            <div className="filter-bar glass-card">
                <div className="search-wrapper">
                    <span className="search-icon">🔍</span>
                    <input
                        className="input"
                        placeholder="Tìm theo tên, SKU hoặc Barcode..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="filter-options">
                    <div className="filter-field">
                        <label>Nhóm:</label>
                        <select className="input" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
                            <option value="">Tất cả</option>
                            {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div className="filter-field">
                        <label>Hiệu:</label>
                        <select className="input" value={filterBrand} onChange={(e) => setFilterBrand(e.target.value)}>
                            <option value="">Tất cả</option>
                            {brands.map((b: any) => <option key={b} value={b}>{b}</option>)}
                        </select>
                    </div>
                    <div className="filter-field">
                        <label>Tồn:</label>
                        <select className="input" value={filterStockStatus} onChange={(e) => setFilterStockStatus(e.target.value)}>
                            <option value="all">Tất cả</option>
                            <option value="low">Sắp hết</option>
                            <option value="out">Hết hàng</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="inventory-list">
                <div className="inventory-container">
                    {productGroups.length === 0 ? (
                        <div className="glass-card" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                            {inventory.length === 0 ? "Chưa có dữ liệu kho hàng." : "Không tìm thấy kết quả phù hợp."}
                        </div>
                    ) : (
                        productGroups.map((group: any) => (
                            <div key={group.product.id} className="product-group-card animate-fade-in">
                                <div className="product-info-bar" style={getHeaderStyle(group.product.id)}>
                                    <div className="p-brand-tag">{group.product.brand || "Brand"}</div>
                                    <div className="p-main-content">
                                        <div className="p-img-box">
                                            {group.product.images?.length > 0 ? (
                                                <img src={group.product.images[0]} alt={group.product.name} />
                                            ) : (
                                                <div className="placeholder">👕</div>
                                            )}
                                        </div>
                                        <div className="p-text">
                                            <h3 style={{ color: 'white', margin: 0 }}>{group.product.name}</h3>
                                            <span className="p-cat-name" style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.8rem' }}>
                                                {group.product.category?.name || "Lẻ"}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="p-stats-row">
                                        <div className="p-stat">
                                            <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.65rem' }}>Phân loại</label>
                                            <span style={{ color: 'white', fontWeight: 800 }}>{group.variants.length}</span>
                                        </div>
                                        <div className="p-stat">
                                            <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.65rem' }}>Tổng tồn</label>
                                            <span style={{ color: 'white', fontWeight: 800 }} className="total-stock-num">{group.variants.reduce((sum: number, v: any) => sum + v.onHand, 0)}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="variant-grid-wrapper">
                                    <table className="v-fixed-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr>
                                                <th style={{ textAlign: 'left', paddingLeft: '2rem' }}>Phân loại</th>
                                                <th style={{ textAlign: 'left' }}>Mã SKU</th>
                                                <th style={{ textAlign: 'left' }}>Vị trí</th>
                                                <th style={{ textAlign: 'left' }}>Tồn kho</th>
                                                <th style={{ textAlign: 'left' }}>Hàng lỗi</th>
                                                <th style={{ textAlign: 'right', paddingRight: '2rem' }}>Thao tác</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {group.variants.map((v: any) => (
                                                <tr key={v.id} onClick={() => openDrawer(v)} className="v-item-row">
                                                    <td className="v-cell v-name-cell" style={{ textAlign: 'left', paddingLeft: '2rem' }}>
                                                        <div className="v-indicator" />
                                                        <span className="v-val-text">{v.color || "-"} / {v.size || "-"}</span>
                                                    </td>
                                                    <td className="v-cell" style={{ textAlign: 'left' }}>
                                                        <span className="sku-code">{v.skuCode || "N/A"}</span>
                                                    </td>
                                                    <td className="v-cell" style={{ textAlign: 'left' }}>
                                                        <span className="loc-text">{v.location || "---"}</span>
                                                    </td>
                                                    <td className="v-cell" style={{ textAlign: 'left' }}>
                                                        <div className={`stock-pill ${v.onHand <= 0 ? 'out' : (v.onHand <= v.minStock ? 'low' : 'good')}`}>
                                                            {v.onHand}
                                                        </div>
                                                    </td>
                                                    <td className="v-cell" style={{ textAlign: 'left' }}>
                                                        <div className={`defect-pill ${v.defectiveQty > 0 ? 'has-val' : ''}`}>
                                                            {v.defectiveQty || 0}
                                                        </div>
                                                    </td>
                                                    <td className="v-cell" style={{ textAlign: 'right', paddingRight: '2rem' }}>
                                                        <button className="btn" style={{ background: 'rgba(99, 102, 241, 0.05)', fontSize: '0.7rem' }}>Chi tiết</button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Side Drawer */}
            {selectedItem && currentItem && (
                <>
                    <div className="drawer-overlay" onClick={() => setSelectedItem(null)} />
                    <aside className="side-drawer">
                        <div className="drawer-head">
                            <div className="head-title">
                                <h2>Thiết lập kho hàng</h2>
                                <p>{currentItem.productName} — {currentItem.color} / {currentItem.size}</p>
                            </div>
                            <button className="close-btn" onClick={() => setSelectedItem(null)}>✕</button>
                        </div>

                        <div className="drawer-body">
                            <div className="stock-visualizer">
                                <div className="v-stat-card primary">
                                    <label>Tồn hiện tại</label>
                                    <div className="number">{currentItem.onHand}</div>
                                </div>
                                <div className="v-stat-card warning">
                                    <label>Hàng lỗi</label>
                                    <div className="number">{currentItem.defectiveQty}</div>
                                </div>
                                <div className="v-stat-card">
                                    <label>Định mức</label>
                                    <div className="number">{currentItem.minStock}</div>
                                </div>
                            </div>

                            <div className="drawer-grid">
                                <section className="drawer-card">
                                    <h4 className="card-title">📍 Định danh & Vị trí</h4>
                                    <div className="form-row">
                                        <div className="field">
                                            <label>Vị trí kệ</label>
                                            <input
                                                className="input"
                                                value={variantInfo.location}
                                                onChange={e => setVariantInfo({ ...variantInfo, location: e.target.value })}
                                                placeholder="VD: A1-02-B"
                                            />
                                        </div>
                                        <div className="field">
                                            <label>Tồn tối thiểu</label>
                                            <input
                                                className="input"
                                                type="number"
                                                value={variantInfo.minStock}
                                                onChange={e => setVariantInfo({ ...variantInfo, minStock: parseInt(e.target.value) || 0 })}
                                            />
                                        </div>
                                    </div>
                                    <button className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} onClick={handleUpdateInfo} disabled={loading}>
                                        Lưu thay đổi
                                    </button>
                                </section>

                                <section className="drawer-card">
                                    <h4 className="card-title">⚡ Thao tác nhanh</h4>
                                    <div className="quick-action-grid">
                                        <button onClick={() => handleAdjust(undefined, 1)} className="qa-btn">Nhập 1</button>
                                        <button onClick={() => handleAdjust(undefined, -1)} className="qa-btn">Xuất 1</button>
                                        <button onClick={() => handleAdjust(undefined, -1, "DEFECTIVE")} className="qa-btn warn">Báo lỗi 1</button>
                                        <button onClick={() => handleAdjust(undefined, 1, "RETURN")} className="qa-btn success">Trả hàng 1</button>
                                    </div>
                                </section>

                                <section className="drawer-card adjustment-form">
                                    <h4 className="card-title">📝 Phiếu điều chỉnh kho</h4>
                                    <div className="form-group">
                                        <div className="split-fields">
                                            <input
                                                type="number"
                                                className="input"
                                                placeholder="Số lượng..."
                                                value={adjustment.changeQty || ""}
                                                onChange={e => setAdjustment({ ...adjustment, changeQty: parseInt(e.target.value) || 0 })}
                                            />
                                            <select
                                                className="input"
                                                value={adjustment.type}
                                                onChange={e => setAdjustment({ ...adjustment, type: e.target.value })}
                                            >
                                                <option value="ADJUSTMENT">Kiểm kho</option>
                                                <option value="PURCHASE">Nhập hàng</option>
                                                <option value="LOSS">Mất mát</option>
                                                <option value="DEFECTIVE">Kho lỗi</option>
                                            </select>
                                        </div>
                                        <textarea
                                            className="input"
                                            style={{ marginTop: '0.75rem', minHeight: '80px' }}
                                            placeholder="Ghi chú lý do điều chỉnh..."
                                            value={adjustment.reason}
                                            onChange={e => setAdjustment({ ...adjustment, reason: e.target.value })}
                                        />
                                        <button className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} onClick={handleAdjust} disabled={loading}>
                                            {loading ? "Đang xử lý..." : "Xác nhận điều chỉnh"}
                                        </button>
                                    </div>
                                </section>

                                <section className="drawer-card log-section">
                                    <h4 className="card-title">🕒 Nhật ký biến động</h4>
                                    <div className="log-list">
                                        {currentItem.history?.map((h: any) => (
                                            <div key={h.id} className="log-item">
                                                <div className="log-header">
                                                    <span className={`log-type ${h.changeQty > 0 ? 'up' : 'down'}`}>
                                                        {h.changeQty > 0 ? `+${h.changeQty}` : h.changeQty} {h.type}
                                                    </span>
                                                    <span className="log-date">{new Date(h.createdAt).toLocaleDateString('vi-VN')}</span>
                                                </div>
                                                <p className="log-reason">{h.reason || "Không có ghi chú"}</p>
                                                <div className="log-footer">Tồn sau: <strong>{h.balanceAfter}</strong></div>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            </div>
                        </div>
                    </aside>
                </>
            )}

            <style jsx>{`
                .inventory-container { display: flex; flex-direction: column; gap: 2rem; }
                
                .filter-bar { 
                    margin-bottom: 1.5rem; 
                    display: flex; 
                    flex-wrap: wrap; 
                    gap: 1.25rem; 
                    align-items: center; 
                    padding: 1rem 1.5rem; 
                }
                .search-wrapper { flex: 1; min-width: 300px; position: relative; }
                .search-icon { position: absolute; left: 1rem; top: 50%; transform: translatey(-50%); opacity: 0.5; }
                .search-wrapper .input { padding-left: 2.5rem; }
                .filter-options { display: flex; gap: 1rem; flex-wrap: wrap; align-items: center; }
                .filter-field { display: flex; align-items: center; gap: 0.5rem; }
                .filter-field label { font-size: 0.75rem; font-weight: 850; color: var(--text-muted); text-transform: uppercase; }
                .filter-field .input { width: auto; min-width: 140px; padding: 0.5rem; }

                .product-group-card {
                    background: white;
                    border-radius: 16px;
                    overflow: hidden;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.04);
                    border: 1px solid var(--surface-border);
                    transition: all 0.3s;
                }
                .product-group-card:hover {
                    box-shadow: 0 10px 30px rgba(79, 70, 229, 0.08);
                    border-color: var(--primary-low);
                }

                .product-info-bar {
                    padding: 1.25rem 2rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-bottom: 1px solid rgba(0,0,0,0.05);
                    position: relative;
                }
                .p-brand-tag {
                    position: absolute;
                    top: 0;
                    right: 2rem;
                    background: rgba(255,255,255,0.2);
                    color: white;
                    font-size: 0.6rem;
                    font-weight: 800;
                    padding: 0.2rem 0.6rem;
                    border-radius: 0 0 6px 6px;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    backdrop-filter: blur(4px);
                }
                .p-main-content { display: flex; gap: 1.25rem; align-items: center; }
                .p-img-box { width: 50px; height: 50px; border-radius: 10px; overflow: hidden; border: 2px solid rgba(255,255,255,0.3); background: white; }
                .p-img-box img { width: 100%; height: 100%; object-fit: cover; }
                .p-img-box .placeholder { height: 100%; width: 100%; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; }
                
                .p-stats-row { display: flex; gap: 2rem; }
                .p-stat { display: flex; flex-direction: column; align-items: flex-end; }
                .p-stat label { font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 2px; opacity: 0.8; }
                .p-stat span { font-size: 1.1rem; }

                .variant-grid-wrapper { padding: 0.5rem 1rem 1.5rem; overflow-x: auto; }
                .v-fixed-table { width: 100%; border-collapse: separate; border-spacing: 0 0.25rem; min-width: 600px; }
                .v-fixed-table th { padding: 0.75rem 1rem; font-size: 0.65rem; color: #94a3b8; text-transform: uppercase; font-weight: 800; letter-spacing: 0.05em; }
                
                .v-item-row { cursor: pointer; transition: background 0.2s; }
                .v-item-row:hover { background: #f8fafc; }
                .v-cell { padding: 0.75rem 1rem; border-bottom: 1px solid #f1f5f9; }

                .v-name-cell { display: flex; align-items: center; gap: 0.75rem; }
                .v-indicator { width: 6px; height: 6px; border-radius: 50%; background: #cbd5e1; }
                .v-item-row:hover .v-indicator { background: var(--primary); }
                .v-val-text { font-weight: 700; color: #475569; font-size: 0.9rem; }
                
                .sku-label { font-size: 0.75rem; color: #64748b; font-family: monospace; font-weight: 600; padding: 0.2rem 0.5rem; background: #f1f5f9; border-radius: 4px; }
                .loc-text { color: #94a3b8; font-size: 0.8rem; }

                .stock-pill { display: inline-flex; min-width: 40px; justify-content: center; padding: 0.3rem 0.6rem; border-radius: 12px; font-weight: 800; font-size: 0.9rem; }
                .stock-pill.good { background: #dcfce7; color: #166534; }
                .stock-pill.low { background: #fef9c3; color: #854d0e; }
                .stock-pill.out { background: #fee2e2; color: #991b1b; }

                .defect-pill { display: inline-flex; padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.8rem; font-weight: 700; color: #cbd5e1; }
                .defect-pill.has-val { background: #fff7ed; color: #9a3412; }

                .btn-action-small { background: #f1f5f9; color: #64748b; border: none; padding: 0.35rem 0.7rem; border-radius: 6px; font-size: 0.7rem; font-weight: 700; cursor: pointer; transition: 0.2s; }
                .v-item-row:hover .btn-action-small { background: var(--primary); color: white; }

                /* Drawer Styles */
                .drawer-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.5); backdrop-filter: blur(8px); z-index: 1000; animation: fadeIn 0.3s; }
                .side-drawer { position: fixed; top: 0; right: 0; bottom: 0; width: 100%; max-width: 500px; background: #f8fafc; z-index: 1001; display: flex; flex-direction: column; box-shadow: -20px 0 60px rgba(0,0,0,0.15); animation: slideIn 0.4s cubic-bezier(0, 0, 0.2, 1); }
                
                .drawer-head { padding: 1.5rem; background: white; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: flex-start; }
                .head-title h2 { margin: 0; font-size: 1.25rem; font-weight: 900; color: #0f172a; }
                .head-title p { margin: 0.25rem 0 0 0; font-size: 0.9rem; color: var(--primary); font-weight: 700; }
                .close-btn { background: #f1f5f9; border: none; color: #64748b; width: 32px; height: 32px; border-radius: 50%; cursor: pointer; }

                .drawer-body { flex: 1; overflow-y: auto; padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem; }
                .stock-visualizer { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0.75rem; }
                .v-stat-card { background: white; padding: 1rem; border-radius: 12px; display: flex; flex-direction: column; align-items: center; border: 1px solid #e2e8f0; }
                .v-stat-card label { font-size: 0.65rem; color: #94a3b8; font-weight: 800; text-transform: uppercase; margin-bottom: 0.25rem; }
                .v-stat-card .number { font-size: 1.5rem; font-weight: 900; color: #1e293b; }
                .v-stat-card.primary .number { color: var(--primary); }
                .v-stat-card.warning .number { color: #f97316; }

                .drawer-card { background: white; border-radius: 12px; padding: 1.25rem; border: 1px solid #e2e8f0; }
                .card-title { margin: 0 0 1rem 0; font-size: 0.8rem; font-weight: 900; color: #64748b; text-transform: uppercase; }

                .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
                .field label { display: block; font-size: 0.7rem; font-weight: 700; margin-bottom: 0.4rem; color: #475569; }

                .quick-action-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
                .qa-btn { background: #f8fafc; border: 1px solid #e2e8f0; padding: 0.6rem; border-radius: 10px; font-weight: 700; cursor: pointer; font-size: 0.85rem; }
                .qa-btn:hover { border-color: var(--primary); color: var(--primary); }

                .split-fields { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; }

                .log-list { display: flex; flex-direction: column; gap: 0.75rem; }
                .log-item { background: #fcfdfe; border: 1px solid #eff6ff; padding: 0.75rem; border-radius: 10px; }
                .log-header { display: flex; justify-content: space-between; }
                .log-type { font-weight: 800; font-size: 0.7rem; text-transform: uppercase; }
                .log-date { font-size: 0.65rem; color: #94a3b8; }
                .log-reason { font-size: 0.8rem; margin: 0.25rem 0; color: #475569; }
                .log-footer { font-size: 0.7rem; color: #64748b; border-top: 1px dashed #e2e8f0; padding-top: 0.4rem; }

                @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

                @media (max-width: 768px) {
                    .filter-bar { padding: 1rem; gap: 0.75rem; flex-direction: column; align-items: stretch; }
                    .search-wrapper { min-width: 100%; }
                    .filter-options { flex-direction: column; align-items: stretch; gap: 0.75rem; }
                    .filter-field { flex-direction: column; align-items: flex-start; }
                    .filter-field .input { width: 100%; }
                    
                    .product-info-bar { padding: 1rem; flex-direction: column; align-items: flex-start; gap: 0.75rem; }
                    .p-stats-row { width: 100%; justify-content: space-between; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 0.75rem; }
                    .p-main-content { gap: 0.75rem; }
                    .p-img-box { width: 40px; height: 40px; }
                    .p-text h3 { font-size: 1rem; }
                    
                    .v-fixed-table { min-width: 450px; }
                    .v-fixed-table th, .v-cell { padding: 0.5rem; }
                    .v-fixed-table th:nth-child(2), .v-cell:nth-child(2),
                    .v-fixed-table th:nth-child(3), .v-cell:nth-child(3) { display: none; }
                }
            `}</style>
        </div>
    );
}
