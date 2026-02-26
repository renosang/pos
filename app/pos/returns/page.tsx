"use client";

import { useState } from "react";
import db from "@/lib/db"; // Note: This is client-side, need an action to fetch sale
import { processReturn } from "@/app/actions/sale";
import { useRouter } from "next/navigation";

// Since we need to fetch sale on client, let's assume we have an action or we can just use a server component for the search parts.
// Actually, it's better to use a server action to find the sale.

export default function ReturnsPage() {
    const [orderCode, setOrderCode] = useState("");
    const [sale, setSale] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [reason, setReason] = useState("");
    const router = useRouter();

    const handleSearch = async () => {
        if (!orderCode) return;
        setLoading(true);
        try {
            // We need a search action. Let's create it or use a simple fetch-like pattern.
            // For now, I'll assume I can add a searchSaleByCode action.
            const response = await fetch(`/api/sales/search?code=${orderCode}`);
            const data = await response.json();
            if (data.success) {
                setSale(data.sale);
            } else {
                alert("Không tìm thấy đơn hàng");
                setSale(null);
            }
        } catch (err) {
            alert("Lỗi khi tìm kiếm");
        } finally {
            setLoading(false);
        }
    };

    const handleReturn = async () => {
        if (!sale || !reason) {
            alert("Vui lòng nhập lý do trả hàng");
            return;
        }
        if (!confirm("Xác nhận trả hàng cho đơn này?")) return;

        setLoading(true);
        try {
            await processReturn(sale.id, reason);
            alert("Trả hàng thành công!");
            router.push("/pos");
        } catch (err: any) {
            alert(err.message || "Lỗi khi xử lý trả hàng");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="returns-container animate-fade-in">
            <header style={{ marginBottom: '2rem' }}>
                <h1>Trả hàng & Hoàn tiền</h1>
                <p style={{ color: '#64748b' }}>Tra cứu đơn hàng và xử lý hoàn trả tồn kho</p>
            </header>

            <div className="search-section glass-card">
                <div className="input-group">
                    <input
                        type="text"
                        placeholder="Nhập mã đơn hàng (ví dụ: S-123456789)..."
                        value={orderCode}
                        onChange={(e) => setOrderCode(e.target.value)}
                    />
                    <button onClick={handleSearch} disabled={loading}>
                        {loading ? "Đang tìm..." : "Tìm đơn hàng"}
                    </button>
                </div>
            </div>

            {sale && (
                <div className="result-section glass-card animate-slide-up">
                    <div className="sale-header">
                        <div className="info">
                            <h3>Mã đơn: {sale.orderCode}</h3>
                            <span className="date">{new Date(sale.soldAt).toLocaleString('vi-VN')}</span>
                        </div>
                        <div className={`status-badge ${sale.status}`}>
                            {sale.status === "REFUNDED" ? "Đã trả hàng" : "Hoàn tất"}
                        </div>
                    </div>

                    <div className="sale-items">
                        <table className="v-table">
                            <thead>
                                <tr>
                                    <th>Sản phẩm</th>
                                    <th>SL</th>
                                    <th>Đơn giá</th>
                                    <th>Thành tiền</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sale.items.map((item: any) => (
                                    <tr key={item.id}>
                                        <td>
                                            <div className="p-name">{item.productVariant.product.name}</div>
                                            <div className="p-meta">{item.productVariant.color}/{item.productVariant.size}</div>
                                        </td>
                                        <td>{item.quantity}</td>
                                        <td>{new Intl.NumberFormat('vi-VN').format(item.unitPrice)}</td>
                                        <td>{new Intl.NumberFormat('vi-VN').format(item.lineTotal)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="sale-summary">
                        <div className="row">
                            <span>Giảm giá:</span>
                            <span>-{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(sale.discountTotal)}</span>
                        </div>
                        <div className="row grand-total">
                            <span>Tổng tiền đã thu:</span>
                            <span>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(sale.grandTotal)}</span>
                        </div>
                    </div>

                    {sale.status !== "REFUNDED" && (
                        <div className="action-area">
                            <label>Lý do trả hàng:</label>
                            <textarea
                                placeholder="Nhập lý do khách trả hàng..."
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                            />
                            <button className="btn-return" onClick={handleReturn} disabled={loading}>
                                {loading ? "Đang xử lý..." : "XÁC NHẬN TRẢ HÀNG & HOÀN KHO"}
                            </button>
                        </div>
                    )}
                </div>
            )}

            <style jsx>{`
                .returns-container { max-width: 800px; margin: 0 auto; padding: 2rem 1rem; }
                .search-section { padding: 1.5rem; margin-bottom: 2rem; }
                .input-group { display: flex; gap: 0.75rem; }
                .input-group input { flex: 1; padding: 0.75rem 1rem; border: 1px solid #e2e8f0; border-radius: 12px; font-size: 1rem; }
                .input-group button { 
                    background: var(--primary); 
                    color: white; 
                    border: none; 
                    padding: 0.75rem 1.5rem; 
                    border-radius: 12px; 
                    font-weight: 700; 
                    cursor: pointer;
                }

                .result-section { padding: 2rem; }
                .sale-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem; }
                .sale-header h3 { margin: 0; font-size: 1.25rem; font-weight: 900; }
                .sale-header .date { font-size: 0.85rem; color: #94a3b8; }
                
                .status-badge { padding: 0.4rem 0.8rem; border-radius: 20px; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; }
                .status-badge.COMPLETED { background: #dcfce7; color: #166534; }
                .status-badge.REFUNDED { background: #fee2e2; color: #991b1b; }

                .sale-items { margin-bottom: 2rem; }
                .v-table { width: 100%; border-collapse: collapse; }
                .v-table th { text-align: left; font-size: 0.7rem; text-transform: uppercase; color: #94a3b8; padding: 1rem 0; border-bottom: 1px solid #f1f5f9; }
                .v-table td { padding: 1rem 0; border-bottom: 1px solid #f1f5f9; }
                .p-name { font-weight: 700; color: #1e293b; }
                .p-meta { font-size: 0.8rem; color: #64748b; }

                .sale-summary { background: #f8fafc; padding: 1.5rem; border-radius: 12px; margin-bottom: 2rem; }
                .sale-summary .row { display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-weight: 600; color: #475569; }
                .sale-summary .grand-total { border-top: 1px solid #e2e8f0; padding-top: 0.75rem; margin-top: 0.75rem; font-weight: 900; color: #0f172a; font-size: 1.1rem; }

                .action-area { display: flex; flex-direction: column; gap: 1rem; border-top: 2px dashed #e2e8f0; pt: 2rem; margin-top: 2rem; }
                .action-area label { font-weight: 800; font-size: 0.85rem; color: #1e293b; }
                .action-area textarea { padding: 1rem; border: 1px solid #e2e8f0; border-radius: 12px; font-family: inherit; min-height: 100px; resize: vertical; }
                .btn-return { background: #ef4444; color: white; border: none; padding: 1.25rem; border-radius: 12px; font-weight: 900; cursor: pointer; transition: 0.2s; box-shadow: 0 10px 20px rgba(239, 68, 68, 0.2); }
                .btn-return:hover { transform: translateY(-2px); box-shadow: 0 15px 30px rgba(239, 68, 68, 0.3); }

                @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
            `}</style>
        </div>
    );
}
