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
            <div className="glass-card filters">
                <div className="search-box">
                    <input
                        type="text"
                        placeholder="Tìm theo mã đơn, khách hàng..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="status-selector">
                    <button className={statusFilter === 'ALL' ? 'active' : ''} onClick={() => setStatusFilter('ALL')}>Tất cả</button>
                    <button className={statusFilter === 'COMPLETED' ? 'active' : ''} onClick={() => setStatusFilter('COMPLETED')}>Bán hàng</button>
                    <button className={statusFilter === 'REFUNDED' ? 'active' : ''} onClick={() => setStatusFilter('REFUNDED')}>Trả hàng</button>
                </div>
            </div>

            <div className="glass-card table-wrapper">
                <table className="v-table">
                    <thead>
                        <tr>
                            <th>Mã đơn</th>
                            <th>Ngày tạo</th>
                            <th>Khách hàng</th>
                            <th>Phương thức</th>
                            <th>Tổng tiền</th>
                            <th>Trạng thái</th>
                            <th>Hành động</th>
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
                                    <span className={`status-badge ${s.status}`}>
                                        {s.status === 'COMPLETED' ? 'Hoàn tất' : 'Đã trả'}
                                    </span>
                                </td>
                                <td>
                                    <button className="btn-view" onClick={() => handleOpenModal(s)}>👁️ Xem</button>
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
                            <div className="info-grid">
                                <div>
                                    <label>Ngày bán:</label>
                                    <p>{new Date(selectedSale.soldAt).toLocaleString('vi-VN')}</p>
                                </div>
                                <div>
                                    <label>Nhân viên:</label>
                                    <p>{selectedSale.user?.username}</p>
                                </div>
                                <div>
                                    <label>Khách hàng:</label>
                                    <p>{selectedSale.customer?.name || "Khách lẻ"}</p>
                                </div>
                                <div>
                                    <label>Thanh toán:</label>
                                    <p>{selectedSale.paymentMethod === 'CASH' ? 'Tiền mặt' : 'Chuyển khoản'}</p>
                                </div>
                            </div>

                            <table className="detail-table">
                                <thead>
                                    <tr>
                                        <th>Sản phẩm</th>
                                        <th>SL</th>
                                        <th>Đơn giá</th>
                                        <th>Thành tiền</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedSale.items.map((item: any) => (
                                        <tr key={item.id}>
                                            <td>
                                                <div className="item-name">{item.productVariant.product.name}</div>
                                                <div className="item-variant">{item.productVariant.color}/{item.productVariant.size}</div>
                                            </td>
                                            <td>{item.quantity}</td>
                                            <td>{new Intl.NumberFormat('vi-VN').format(item.unitPrice)}</td>
                                            <td>{new Intl.NumberFormat('vi-VN').format(item.lineTotal)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            <div className="summary-section">
                                <div className="row">
                                    <span>Tạm tính:</span>
                                    <span>{new Intl.NumberFormat('vi-VN').format(selectedSale.subTotal)}</span>
                                </div>
                                <div className="row">
                                    <span>Giảm giá:</span>
                                    <span>-{new Intl.NumberFormat('vi-VN').format(selectedSale.discountTotal)}</span>
                                </div>
                                <div className="row grand-total">
                                    <span>TỔNG CỘNG:</span>
                                    <span>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedSale.grandTotal)}</span>
                                </div>
                            </div>

                            {selectedSale.status === 'COMPLETED' ? (
                                <div className="return-actions">
                                    {!isReturning ? (
                                        <button className="btn-start-return" onClick={() => setIsReturning(true)}>
                                            ↩️ Trả hàng & Hoàn tiền
                                        </button>
                                    ) : (
                                        <div className="return-form animate-slide-up">
                                            <label>Lý do khách trả hàng:</label>
                                            <textarea
                                                value={returnReason}
                                                onChange={(e) => setReturnReason(e.target.value)}
                                                placeholder="Nhập lý do..."
                                            />
                                            <div className="btn-group">
                                                <button className="btn-cancel" onClick={() => setIsReturning(false)}>Hủy</button>
                                                <button className="btn-confirm" onClick={handleProcessReturn} disabled={loading}>
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
                .modal-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.4); backdrop-filter: blur(5px); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 2rem; animation: fadeIn 0.3s; }
                .modal-content { background: white; width: 100%; max-width: 700px; max-height: 90vh; display: flex; flex-direction: column; padding: 0; border: none; animation: slideUp 0.3s; }
                .modal-header { padding: 1.5rem; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; }
                .modal-header h2 { margin: 0; font-size: 1.25rem; font-weight: 950; }
                .close-btn { background: #f1f5f9; border: none; width: 32px; height: 32px; border-radius: 50%; cursor: pointer; }
                
                .modal-body { flex: 1; overflow-y: auto; padding: 1.5rem; display: flex; flex-direction: column; gap: 1.5rem; }
                .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; background: #f8fafc; padding: 1rem; border-radius: 12px; }
                .info-grid label { display: block; font-size: 0.7rem; font-weight: 800; text-transform: uppercase; color: #94a3b8; margin-bottom: 0.25rem; }
                .info-grid p { margin: 0; font-weight: 700; color: #1e293b; font-size: 0.95rem; }

                .detail-table { width: 100%; border-collapse: collapse; }
                .detail-table th { text-align: left; font-size: 0.7rem; color: #94a3b8; border-bottom: 2px solid #f1f5f9; padding: 0.5rem 0; }
                .detail-table td { padding: 1rem 0; border-bottom: 1px solid #f1f5f9; }
                .item-name { font-weight: 700; color: #1e293b; }
                .item-variant { font-size: 0.75rem; color: #64748b; }

                .summary-section { margin-top: 1rem; display: flex; flex-direction: column; gap: 0.5rem; align-items: flex-end; }
                .summary-section .row { display: flex; width: 200px; justify-content: space-between; font-weight: 600; font-size: 0.9rem; }
                .summary-section .grand-total { border-top: 1px solid #e2e8f0; padding-top: 0.5rem; margin-top: 0.5rem; font-weight: 900; color: var(--primary); font-size: 1.25rem; }

                .return-actions { border-top: 2px dashed #f1f5f9; padding-top: 1.5rem; margin-top: 1rem; }
                .btn-start-return { width: 100%; background: #fef2f2; border: 1px solid #fecaca; color: #ef4444; padding: 1rem; border-radius: 12px; font-weight: 800; cursor: pointer; transition: 0.2s; }
                .btn-start-return:hover { background: #fee2e2; }
                
                .return-form { display: flex; flex-direction: column; gap: 0.75rem; }
                .return-form label { font-size: 0.75rem; font-weight: 800; color: #ef4444; }
                .return-form textarea { padding: 1rem; border: 1px solid #fecaca; border-radius: 12px; min-height: 80px; font-family: inherit; font-size: 0.9rem; }
                .btn-group { display: grid; grid-template-columns: 1fr 2fr; gap: 0.5rem; }
                .btn-cancel { background: #f1f5f9; border: none; padding: 0.75rem; border-radius: 10px; font-weight: 700; cursor: pointer; }
                .btn-confirm { background: #ef4444; color: white; border: none; padding: 0.75rem; border-radius: 10px; font-weight: 700; cursor: pointer; box-shadow: 0 4px 10px rgba(239, 68, 68, 0.2); }

                .note-area { border-top: 1px solid #f1f5f9; padding-top: 1rem; }
                .note-area label { display: block; font-size: 0.7rem; font-weight: 800; color: #94a3b8; margin-bottom: 0.5rem; }
                .note-area p { background: #fff1f2; color: #991b1b; padding: 1rem; border-radius: 8px; font-size: 0.9rem; margin: 0; font-weight: 500; font-style: italic; }

                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slideUp { from { transform: translateY(20px); } to { transform: translateY(0); } }
            `}</style>
        </div>
    );
}
