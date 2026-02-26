"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Package, Truck, Calendar, Eye, X, User, Building2, CreditCard } from "lucide-react";

export default function PurchaseList({ purchases }: { purchases: any[] }) {
    const [selectedPurchase, setSelectedPurchase] = useState<any>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    const handleOpenModal = (purchase: any) => {
        setSelectedPurchase(purchase);
    };

    return (
        <>
            <div className="glass-card" style={{ padding: 0, overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                        <tr>
                            <th style={{ textAlign: 'left', padding: '1.25rem 1rem', fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Mã lô nhập</th>
                            <th style={{ textAlign: 'left', padding: '1.25rem 1rem', fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Ngày nhập</th>
                            <th style={{ textAlign: 'left', padding: '1.25rem 1rem', fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Nhà cung cấp</th>
                            <th style={{ textAlign: 'left', padding: '1.25rem 1rem', fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Mặt hàng</th>
                            <th style={{ textAlign: 'left', padding: '1.25rem 1rem', fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Tổng thanh toán</th>
                            <th style={{ textAlign: 'right', padding: '1.25rem 1rem', fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {purchases.length === 0 ? (
                            <tr>
                                <td colSpan={6} style={{ textAlign: 'center', padding: '5rem', color: '#94a3b8' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                                        <Truck size={48} opacity={0.2} />
                                        <span>Chưa có đơn nhập hàng nào.</span>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            purchases.map((p: any) => (
                                <tr key={p.id} className="hover-bg" style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '1.25rem 1rem', fontWeight: 700, color: 'var(--primary)' }}>
                                        #{p.purchaseCode}
                                    </td>
                                    <td style={{ padding: '1.25rem 1rem', color: '#475569' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <Calendar size={14} />
                                            {new Date(p.createdAt).toLocaleDateString('vi-VN')}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.25rem 1rem', fontWeight: 600, color: '#0f172a' }}>
                                        {p.supplier.name}
                                    </td>
                                    <td style={{ padding: '1.25rem 1rem' }}>
                                        <div className="badge-light" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                                            <Package size={12} /> {p.items.length} mặt hàng
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.25rem 1rem', fontWeight: 800, color: '#0f172a' }}>
                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(p.grandTotal))}
                                    </td>
                                    <td style={{ padding: '1.25rem 1rem', textAlign: 'right' }}>
                                        <button
                                            onClick={() => handleOpenModal(p)}
                                            className="btn btn-secondary"
                                            style={{ padding: '0.5rem 1rem', gap: '0.5rem', fontSize: '0.875rem' }}
                                        >
                                            <Eye size={14} /> Chi tiết
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal Chi tiết phiếu nhập */}
            {mounted && selectedPurchase && createPortal(
                <div className="modal-overlay" onClick={() => setSelectedPurchase(null)}>
                    <div className="modal-content glass-card animate-slide-up" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{ background: 'var(--primary-light)', color: 'var(--primary)', padding: '0.5rem', borderRadius: '10px' }}>
                                    <Truck size={24} />
                                </div>
                                <div>
                                    <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 950 }}>Chi tiết phiếu nhập #{selectedPurchase.purchaseCode}</h2>
                                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>Ngày tạo: {new Date(selectedPurchase.createdAt).toLocaleString('vi-VN')}</p>
                                </div>
                            </div>
                            <button className="close-btn" onClick={() => setSelectedPurchase(null)}>✕</button>
                        </div>

                        <div className="modal-body">
                            <div className="info-grid">
                                <div>
                                    <label><Building2 size={12} style={{ marginRight: '4px' }} /> Nhà cung cấp</label>
                                    <p>{selectedPurchase.supplier.name}</p>
                                    <small style={{ color: '#64748b' }}>SĐT: {selectedPurchase.supplier.phone || "N/A"}</small>
                                </div>
                                <div>
                                    <label><User size={12} style={{ marginRight: '4px' }} /> Người thực hiện</label>
                                    <p>{selectedPurchase.user?.username || "Admin"}</p>
                                </div>
                            </div>

                            <div style={{ marginTop: '1rem' }}>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: '#94a3b8', marginBottom: '0.75rem' }}>Danh sách sản phẩm</label>
                                <div style={{ border: '1px solid #f1f5f9', borderRadius: '12px', overflow: 'hidden' }}>
                                    <table className="detail-table">
                                        <thead>
                                            <tr>
                                                <th style={{ paddingLeft: '1rem' }}>Sản phẩm</th>
                                                <th style={{ textAlign: 'center' }}>SL</th>
                                                <th style={{ textAlign: 'right' }}>Giá vốn</th>
                                                <th style={{ textAlign: 'right', paddingRight: '1rem' }}>Thành tiền</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedPurchase.items.map((item: any) => (
                                                <tr key={item.id}>
                                                    <td style={{ paddingLeft: '1rem' }}>
                                                        <div style={{ fontWeight: 700, color: '#1e293b' }}>{item.productVariant.product.name}</div>
                                                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{item.productVariant.color} / {item.productVariant.size}</div>
                                                    </td>
                                                    <td style={{ textAlign: 'center', fontWeight: 600 }}>{item.quantity}</td>
                                                    <td style={{ textAlign: 'right' }}>{new Intl.NumberFormat('vi-VN').format(item.unitCost)}</td>
                                                    <td style={{ textAlign: 'right', fontWeight: 700, paddingRight: '1rem', color: 'var(--primary)' }}>
                                                        {new Intl.NumberFormat('vi-VN').format(item.lineTotal)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div style={{ marginTop: 'auto', paddingTop: '1.5rem', borderTop: '2px dashed #f1f5f9' }}>
                                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                    <div style={{ width: '250px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                                            <span style={{ color: '#64748b' }}>Tạm tính:</span>
                                            <span style={{ fontWeight: 600 }}>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedPurchase.subTotal)}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: '#f8fafc', borderRadius: '8px' }}>
                                            <span style={{ fontWeight: 800, color: '#0f172a' }}>TỔNG CỘNG:</span>
                                            <span style={{ fontSize: '1.25rem', fontWeight: 950, color: 'var(--primary)' }}>
                                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedPurchase.grandTotal)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            <style jsx>{`
                .hover-bg:hover { background: #f8fafc; }
                .badge-light {
                    background: #f1f5f9;
                    color: #475569;
                    padding: 0.25rem 0.75rem;
                    border-radius: 99px;
                    font-size: 0.75rem;
                    font-weight: 700;
                }
                .modal-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.3);
                    backdrop-filter: blur(4px);
                    z-index: 10000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 2rem;
                }
                .modal-content {
                    background: white;
                    width: 100%;
                    max-width: 800px;
                    max-height: 90vh;
                    display: flex;
                    flex-direction: column;
                    padding: 0;
                    border: none;
                    box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
                    border-radius: 24px;
                }
                .modal-header {
                    padding: 1.5rem;
                    border-bottom: 1px solid #f1f5f9;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .close-btn {
                    background: #f1f5f9;
                    border: none;
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: 0.2s;
                }
                .close-btn:hover { background: #e2e8f0; color: #ef4444; }
                .modal-body {
                    flex: 1;
                    overflow-y: auto;
                    padding: 1.5rem;
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }
                .info-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1rem;
                    background: #f8fafc;
                    padding: 1.25rem;
                    border-radius: 16px;
                    border: 1px solid #f1f5f9;
                }
                .info-grid label {
                    display: flex;
                    align-items: center;
                    font-size: 0.7rem;
                    font-weight: 800;
                    text-transform: uppercase;
                    color: #94a3b8;
                    margin-bottom: 0.4rem;
                }
                .info-grid p {
                    margin: 0;
                    font-weight: 750;
                    color: #0f172a;
                    font-size: 1rem;
                }
                .detail-table {
                    width: 100%;
                    border-collapse: collapse;
                }
                .detail-table th {
                    background: #f8fafc;
                    text-align: left;
                    font-size: 0.7rem;
                    color: #64748b;
                    font-weight: 800;
                    text-transform: uppercase;
                    padding: 0.75rem 0.5rem;
                    border-bottom: 1px solid #f1f5f9;
                }
                .detail-table td {
                    padding: 1rem 0.5rem;
                    border-bottom: 1px solid #f1f5f9;
                    font-size: 0.9rem;
                }
                @keyframes slideUp {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .animate-slide-up {
                    animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                }
            `}</style>
        </>
    );
}
