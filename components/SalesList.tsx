"use client";

import { useState } from "react";
import { processReturn } from "@/app/actions/sale";

export default function SalesList({ sales }: { sales: any[] }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [selectedSale, setSelectedSale] = useState<any>(null);
    const [isReturning, setIsReturning] = useState(false);
    const [returnReason, setReturnReason] = useState("");
    const [loading, setLoading] = useState(false);

    const handleOpenModal = (sale: any) => {
        setSelectedSale(sale);
        setIsReturning(false);
        setReturnReason("");
    };

    const handleProcessReturn = async () => {
        if (!returnReason) {
            alert("Vui lòng nhập lý do trả hàng");
            return;
        }
        if (!confirm("Xác nhận hoàn trả hóa đơn này và cộng lại tồn kho?")) return;

        setLoading(true);
        try {
            await processReturn(selectedSale.id, returnReason);
            alert("Đã xử lý trả hàng thành công!");
            setSelectedSale(null);
            window.location.reload(); // Refresh to update list
        } catch (err: any) {
            alert(err.message || "Lỗi khi xử lý trả hàng");
        } finally {
            setLoading(false);
        }
    };

    const filteredSales = sales.filter(s => {
        const matchesSearch = s.orderCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.customer?.phone?.includes(searchTerm);
        const matchesStatus = statusFilter === "ALL" || s.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="sales-list-container">
            <div className="glass-card filters" style={{ padding: '1rem 1.5rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <div className="search-box" style={{ flex: 1, position: 'relative', minWidth: '300px' }}>
                    <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>🔍</span>
                    <input
                        className="input"
                        type="text"
                        placeholder="Tìm theo mã đơn, khách hàng..."
                        style={{ paddingLeft: '2.5rem' }}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="status-selector" style={{ display: 'flex', background: 'var(--surface-secondary)', padding: '0.25rem', borderRadius: 'var(--radius-md)', gap: '0.25rem' }}>
                    <button className={statusFilter === 'ALL' ? 'active' : ''} style={{ border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', transition: '0.2s', background: statusFilter === 'ALL' ? 'white' : 'transparent', color: statusFilter === 'ALL' ? 'var(--primary)' : 'var(--text-muted)' }} onClick={() => setStatusFilter('ALL')}>Tất cả</button>
                    <button className={statusFilter === 'COMPLETED' ? 'active' : ''} style={{ border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', transition: '0.2s', background: statusFilter === 'COMPLETED' ? 'white' : 'transparent', color: statusFilter === 'COMPLETED' ? 'var(--primary)' : 'var(--text-muted)' }} onClick={() => setStatusFilter('COMPLETED')}>Bán hàng</button>
                    <button className={statusFilter === 'REFUNDED' ? 'active' : ''} style={{ border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', transition: '0.2s', background: statusFilter === 'REFUNDED' ? 'white' : 'transparent', color: statusFilter === 'REFUNDED' ? 'var(--primary)' : 'var(--text-muted)' }} onClick={() => setStatusFilter('REFUNDED')}>Trả hàng</button>
                </div>
            </div>

            <div className="glass-card table-wrapper" style={{ padding: 0, overflow: 'hidden' }}>
                <table className="v-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            <th style={{ textAlign: 'left' }}>Mã đơn</th>
                            <th style={{ textAlign: 'left' }}>Ngày tạo</th>
                            <th style={{ textAlign: 'left' }}>Khách hàng</th>
                            <th style={{ textAlign: 'left' }}>Phương thức</th>
                            <th style={{ textAlign: 'left' }}>Tổng tiền</th>
                            <th style={{ textAlign: 'left' }}>Trạng thái</th>
                            <th style={{ textAlign: 'right' }}>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredSales.map((s: any) => (
                            <tr key={s.id}>
                                <td className="font-bold">{s.orderCode}</td>
                                <td className="text-muted">{new Date(s.soldAt).toLocaleString('vi-VN')}</td>
                                <td>
                                    <div>{s.customer?.name || "Khách lẻ"}</div>
                                    <div className="text-xs text-muted">{s.customer?.phone || ""}</div>
                                </td>
                                <td className="status-pill-small">
                                    {s.paymentMethod === 'CASH' ? '💵 Tiền mặt' : '💳 Chuyển khoản'}
                                </td>
                                <td className="price-text">
                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(s.grandTotal)}
                                </td>
                                <td>
                                    <span className={`badge ${s.status === 'COMPLETED' ? 'active' : 'archived'}`}>
                                        {s.status === 'COMPLETED' ? 'Hoàn tất' : 'Đã trả'}
                                    </span>
                                </td>
                                <td style={{ textAlign: 'right' }}>
                                    <button className="btn" style={{ background: 'var(--surface-secondary)', fontSize: '0.75rem' }} onClick={() => handleOpenModal(s)}>👁️ Xem</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal Detail */}
            {selectedSale && (
                <div className="modal-overlay" onClick={() => setSelectedSale(null)}>
                    <div className="modal-content glass-card" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Chi tiết hóa đơn {selectedSale.orderCode}</h2>
                            <button className="close-btn" onClick={() => setSelectedSale(null)}>✕</button>
                        </div>
                        <div className="modal-body">
                            <div className="info-grid" style={{ padding: '0.5rem 0.75rem', gap: '0.5rem' }}>
                                <div>
                                    <label>Ngày bán:</label>
                                    <p>{new Date(selectedSale.soldAt).toLocaleString('vi-VN')}</p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <label>Nhân viên:</label>
                                    <p>{selectedSale.user?.username}</p>
                                </div>
                                <div>
                                    <label>Khách hàng:</label>
                                    <p>{selectedSale.customer?.name || "Khách lẻ"}</p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <label>Thanh toán:</label>
                                    <p style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                        {selectedSale.paymentMethod === 'CASH' ? '💵 TM' : '💳 CK'}
                                    </p>
                                </div>
                            </div>

                            <div className="table-scroll-wrapper" style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid var(--border)', borderRadius: '12px', padding: '0 0.75rem' }}>
                                <table className="detail-table">
                                    <thead>
                                        <tr>
                                            <th>Sản phẩm</th>
                                            <th style={{ textAlign: 'center' }}>SL</th>
                                            <th style={{ textAlign: 'right' }}>Đơn giá</th>
                                            <th style={{ textAlign: 'right' }}>Thành tiền</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedSale.items.map((item: any) => (
                                            <tr key={item.id}>
                                                <td>
                                                    <div className="item-name" style={{ fontSize: '0.85rem' }}>{item.productVariant.product.name}</div>
                                                    <div className="item-variant" style={{ fontSize: '0.65rem' }}>{item.productVariant.color}/{item.productVariant.size}</div>
                                                </td>
                                                <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                                                <td style={{ textAlign: 'right' }}>{new Intl.NumberFormat('vi-VN').format(item.unitPrice)}</td>
                                                <td style={{ textAlign: 'right', fontWeight: 700 }}>{new Intl.NumberFormat('vi-VN').format(item.lineTotal)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="summary-section" style={{ marginTop: '0.25rem', display: 'flex', flexDirection: 'column', gap: '0.15rem', alignItems: 'flex-end', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                                <div className="row" style={{ display: 'flex', width: '200px', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600 }}>
                                    <span style={{ color: 'var(--text-muted)' }}>Tạm tính:</span>
                                    <span>{new Intl.NumberFormat('vi-VN').format(selectedSale.subTotal)}</span>
                                </div>
                                <div className="row" style={{ display: 'flex', width: '200px', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600 }}>
                                    <span style={{ color: 'var(--text-muted)' }}>Giảm giá:</span>
                                    <span>-{new Intl.NumberFormat('vi-VN').format(selectedSale.discountTotal)}</span>
                                </div>
                                <div className="row grand-total" style={{ display: 'flex', width: '200px', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '0.25rem', marginTop: '0.15rem', fontWeight: 900, color: 'var(--primary)', fontSize: '1rem' }}>
                                    <span>TỔNG CỘNG:</span>
                                    <span>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedSale.grandTotal)}</span>
                                </div>
                            </div>

                            {selectedSale.status === 'COMPLETED' ? (
                                <div className="return-actions" style={{ paddingTop: '0.5rem', marginTop: '0.25rem' }}>
                                    {!isReturning ? (
                                        <button className="btn" style={{ width: '100%', background: 'rgba(239, 68, 68, 0.05)', color: 'var(--danger)', padding: '0.5rem', fontWeight: 850, fontSize: '0.8rem' }} onClick={() => setIsReturning(true)}>
                                            ↩️ Trả hàng & Hoàn tiền
                                        </button>
                                    ) : (
                                        <div className="return-form animate-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                            <label style={{ fontSize: '0.65rem', fontWeight: 850, color: 'var(--danger)', textTransform: 'uppercase' }}>Lý do khách trả hàng:</label>
                                            <textarea
                                                className="input"
                                                value={returnReason}
                                                onChange={(e) => setReturnReason(e.target.value)}
                                                placeholder="Nhập lý do..."
                                                style={{ minHeight: '50px', padding: '0.5rem', fontSize: '0.85rem' }}
                                            />
                                            <div className="btn-group" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0.5rem' }}>
                                                <button className="btn" style={{ background: 'var(--surface-secondary)', padding: '0.5rem', fontSize: '0.8rem' }} onClick={() => setIsReturning(false)}>Hủy</button>
                                                <button className="btn btn-primary" style={{ background: 'var(--danger)', boxShadow: 'none', padding: '0.5rem', fontSize: '0.8rem' }} onClick={handleProcessReturn} disabled={loading}>
                                                    {loading ? "Đang xử lý..." : "Xác nhận trả hàng"}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                selectedSale.note && (
                                    <div className="note-area">
                                        <label>Lý do trả hàng:</label>
                                        <p>{selectedSale.note}</p>
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                .sales-list-container { display: flex; flex-direction: column; gap: 1.5rem; }
                .filters { padding: 1rem; display: flex; justify-content: space-between; align-items: center; gap: 1rem; flex-wrap: wrap; }
                .search-box { flex: 1; min-width: 250px; }
                .search-box input { width: 100%; padding: 0.7rem 1rem; border: 1px solid #e2e8f0; border-radius: 10px; outline: none; transition: 0.2s; }
                .search-box input:focus { border-color: var(--primary); }
                
                .status-selector { display: flex; background: #f1f5f9; padding: 0.25rem; border-radius: 10px; gap: 0.25rem; }
                .status-selector button { border: none; padding: 0.5rem 1rem; border-radius: 8px; font-weight: 700; font-size: 0.85rem; cursor: pointer; transition: 0.2s; color: #64748b; }
                .status-selector button.active { background: white; color: var(--primary); box-shadow: 0 2px 5px rgba(0,0,0,0.05); }

                .table-wrapper { padding: 0; overflow: hidden; }
                .v-table { width: 100%; border-collapse: collapse; }
                .v-table th { background: #f8fafc; text-align: left; padding: 1rem; font-size: 0.7rem; text-transform: uppercase; color: #64748b; letter-spacing: 0.05em; font-weight: 800; }
                .v-table td { padding: 1rem; border-bottom: 1px solid #f1f5f9; font-size: 0.9rem; }
                .v-table tr:hover td { background: #fcfdfe; }
                
                .font-bold { font-weight: 900; color: #1e293b; }
                .text-muted { color: #94a3b8; font-size: 0.8rem; }
                .price-text { font-weight: 800; color: var(--primary); }

                .status-badge { padding: 0.3rem 0.6rem; border-radius: 20px; font-size: 0.7rem; font-weight: 800; text-transform: uppercase; }
                .status-badge.COMPLETED { background: #dcfce7; color: #166534; }
                .status-badge.REFUNDED { background: #fee2e2; color: #991b1b; }

                .btn-view { background: #f1f5f9; border: none; padding: 0.4rem 0.8rem; border-radius: 6px; font-size: 0.75rem; font-weight: 700; cursor: pointer; transition: 0.2s; }
                .btn-view:hover { background: var(--primary); color: white; }

                /* Modal */
                .modal-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.4); backdrop-filter: blur(5px); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 1.5rem; animation: fadeIn 0.3s; }
                .modal-content { background: white; width: 100%; max-width: 650px; border-radius: 20px; overflow: hidden; display: flex; flex-direction: column; padding: 0; border: none; animation: slideUp 0.3s; box-shadow: 0 20px 50px rgba(0,0,0,0.15); }
                .modal-header { padding: 1rem 1.5rem; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; }
                .modal-header h2 { margin: 0; font-size: 1.15rem; font-weight: 950; }
                .close-btn { background: var(--surface-secondary); border: none; width: 28px; height: 28px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; }
                
                .modal-body { flex: 1; overflow-y: auto; padding: 1rem 1.25rem; display: flex; flex-direction: column; gap: 0.75rem; max-height: 85vh; }
                .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; background: var(--surface-secondary); padding: 0.75rem 1rem; border-radius: 12px; }
                .info-grid label { display: block; font-size: 0.65rem; font-weight: 850; text-transform: uppercase; color: var(--text-muted); margin-bottom: 0.15rem; }
                .info-grid p { margin: 0; font-weight: 700; color: var(--text-main); font-size: 0.85rem; }

                .detail-table { width: 100%; border-collapse: collapse; }
                .detail-table th { text-align: left; font-size: 0.6rem; color: var(--text-muted); border-bottom: 2px solid var(--border); padding: 0.35rem 0; font-weight: 850; text-transform: uppercase; }
                .detail-table td { padding: 0.5rem 0; border-bottom: 1px solid var(--border); }
                .item-name { font-weight: 700; color: var(--text-main); font-size: 0.9rem; }
                .item-variant { font-size: 0.7rem; color: var(--text-muted); }
                .detail-table td:nth-child(2), .detail-table td:nth-child(3), .detail-table td:nth-child(4) { font-size: 0.85rem; }

                .summary-section .row { justify-content: space-between; align-items: center; }

                .note-area { border-top: 1px solid var(--border); padding-top: 0.75rem; }
                .note-area label { display: block; font-size: 0.65rem; font-weight: 850; color: var(--text-muted); margin-bottom: 0.4rem; text-transform: uppercase; }
                .note-area p { background: #fff1f2; color: #991b1b; padding: 0.75rem 1rem; border-radius: 10px; font-size: 0.85rem; margin: 0; font-weight: 600; font-style: italic; border: 1px solid #fecaca; }

                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slideUp { from { transform: translateY(15px); } to { transform: translateY(0); } }
            `}</style>
        </div>
    );
}
