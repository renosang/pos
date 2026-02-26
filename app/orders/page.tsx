import { getOrders } from "@/app/actions/order";

export default async function OrdersPage() {
    const orders = await getOrders();

    return (
        <div className="animate-fade-in">
            <header style={{ marginBottom: '2rem' }}>
                <h1 style={{ margin: 0 }}>Lịch sử đơn hàng</h1>
                <p style={{ color: 'var(--text-muted)' }}>Xem lại các giao dịch đã thực hiện</p>
            </header>

            <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--surface-border)' }}>
                        <tr>
                            <th style={{ textAlign: 'left', padding: '1rem' }}>Mã đơn</th>
                            <th style={{ textAlign: 'left', padding: '1rem' }}>Ngày bán</th>
                            <th style={{ textAlign: 'left', padding: '1rem' }}>Khách hàng</th>
                            <th style={{ textAlign: 'left', padding: '1rem' }}>Sản phẩm</th>
                            <th style={{ textAlign: 'left', padding: '1rem' }}>Tổng tiền</th>
                            <th style={{ textAlign: 'left', padding: '1rem' }}>TT Thanh toán</th>
                            <th style={{ textAlign: 'right', padding: '1rem' }}>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.length === 0 ? (
                            <tr>
                                <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                                    Chưa có đơn hàng nào.
                                </td>
                            </tr>
                        ) : (
                            orders.map((order) => (
                                <tr key={order.id} style={{ borderBottom: '1px solid var(--surface-border)' }}>
                                    <td style={{ padding: '1rem' }}>{order.orderCode}</td>
                                    <td style={{ padding: '1rem' }}>{new Date(order.soldAt).toLocaleString('vi-VN')}</td>
                                    <td style={{ padding: '1rem' }}>{order.customer?.name || 'Khách vãng lai'}</td>
                                    <td style={{ padding: '1rem' }}>{order.items.length} mặt hàng</td>
                                    <td style={{ padding: '1rem', fontWeight: 'bold' }}>
                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(order.grandTotal))}
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{
                                            padding: '0.25rem 0.5rem',
                                            background: order.paymentStatus === 'PAID' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                                            color: order.paymentStatus === 'PAID' ? 'var(--success)' : 'var(--warning)',
                                            borderRadius: '4px',
                                            fontSize: '0.75rem'
                                        }}>
                                            {order.paymentStatus}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                                        <button className="btn" style={{ color: 'var(--primary)' }}>Chi tiết</button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
