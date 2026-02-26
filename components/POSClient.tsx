"use client";

import { useState, useEffect } from "react";
import { processSale } from "@/app/actions/sale";
import BarcodeScanner from "./BarcodeScanner";

export default function POSClient({ products, userId }: { products: any[], userId: string }) {
    const [cart, setCart] = useState<any[]>([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);
    const [showScanner, setShowScanner] = useState(false);
    const [lastScanned, setLastScanned] = useState<string | null>(null);

    const handleScanSuccess = (barcode: string) => {
        if (barcode === lastScanned) return; // Prevent double scan
        setLastScanned(barcode);
        setTimeout(() => setLastScanned(null), 1500); // 1.5s cooldown for same item

        const found = products.flatMap((p: any) => p.variants.map((v: any) => ({ ...v, productName: p.name, categoryName: p.category.name }))).find(v => v.barcode === barcode);
        if (found) {
            addToCart(found);
            // Scanner stays open for continuous scanning
            console.log(`Đã thêm: ${found.productName}`);
        } else {
            console.warn(`Không tìm thấy mã: ${barcode}`);
        }
    };

    const filteredProducts = products.flatMap((p: any) => p.variants.map((v: any) => ({
        ...v,
        productName: p.name,
        categoryName: p.category.name,
        imageUrl: (p.images as string[] || [])[0]
    }))).filter(v =>
        v.productName.toLowerCase().includes(search.toLowerCase()) ||
        v.skuCode.toLowerCase().includes(search.toLowerCase()) ||
        v.barcode?.toLowerCase().includes(search.toLowerCase())
    );

    const addToCart = (variant: any) => {
        const existing = cart.find(item => item.variantId === variant.id);
        if (existing) {
            setCart(cart.map(item => item.variantId === variant.id ? { ...item, quantity: item.quantity + 1 } : item));
        } else {
            setCart([...cart, {
                variantId: variant.id,
                name: variant.productName,
                sku: variant.skuCode,
                price: variant.salePrice,
                quantity: 1,
                color: variant.color,
                size: variant.size
            }]);
        }
    };

    const removeFromCart = (variantId: string) => {
        setCart(cart.filter(item => item.variantId !== variantId));
    };

    const updateQuantity = (variantId: string, delta: number) => {
        setCart(cart.map(item => {
            if (item.variantId === variantId) {
                const newQty = Math.max(1, item.quantity + delta);
                return { ...item, quantity: newQty };
            }
            return item;
        }));
    };

    const [discountValue, setDiscountValue] = useState(0);
    const [paymentMethod, setPaymentMethod] = useState("CASH");

    const subTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const total = subTotal - discountValue;

    const handleCheckout = async () => {
        if (cart.length === 0) return;
        setLoading(true);
        try {
            await processSale({
                userId,
                items: cart,
                paymentMethod,
                subTotal,
                discountTotal: discountValue,
                grandTotal: total
            });
            setCart([]);
            setDiscountValue(0);
            alert("Thanh toán thành công!");
        } catch (err) {
            alert("Lỗi khi xử lý đơn hàng");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="pos-container animate-fade-in">
            {/* Main Content Area */}
            <div className="pos-main">
                {/* Search & Scanner Header */}
                <div className="pos-header glass-card">
                    <div className="search-box">
                        <span className="search-icon">🔍</span>
                        <input
                            type="text"
                            placeholder="Tìm sản phẩm (Tên, SKU, Barcode)..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <button
                        className={`scanner-toggle ${showScanner ? 'active' : ''}`}
                        onClick={() => setShowScanner(!showScanner)}
                    >
                        {showScanner ? "✕ Đóng camera" : "📸 Quét mã vạch"}
                    </button>
                </div>

                {showScanner && (
                    <div className="scanner-container glass-card">
                        <BarcodeScanner onScanSuccess={handleScanSuccess} />
                    </div>
                )}

                {/* Product Grid */}
                <div className="product-grid">
                    {filteredProducts.map((v: any) => (
                        <div
                            key={v.id}
                            className="product-card"
                            onClick={() => addToCart(v)}
                        >
                            <div className="p-img-wrapper">
                                {v.imageUrl ? (
                                    <img src={v.imageUrl} alt={v.productName} />
                                ) : (
                                    <div className="placeholder">👕</div>
                                )}
                                <div className={`stock-badge ${v.onHand <= 0 ? 'out' : (v.onHand <= v.minStock ? 'low' : '')}`}>
                                    {v.onHand <= 0 ? "Hết hàng" : `Tồn: ${v.onHand}`}
                                </div>
                            </div>
                            <div className="p-info">
                                <span className="p-cat">{v.categoryName}</span>
                                <h4 className="p-name">{v.productName}</h4>
                                <div className="p-variant">{v.color || '-'}/{v.size || '-'}</div>
                                <div className="p-price">
                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v.salePrice)}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Sidebar Cart Area */}
            <aside className="pos-sidebar glass-card">
                <div className="sidebar-header">
                    <h3>🛒 Giỏ hàng ({cart.length})</h3>
                    {cart.length > 0 && <button className="clear-btn" onClick={() => setCart([])}>Xóa hết</button>}
                </div>

                <div className="cart-list">
                    {cart.length === 0 ? (
                        <div className="empty-cart">
                            <div className="icon">🥡</div>
                            <p>Chưa có sản phẩm nào</p>
                        </div>
                    ) : (
                        cart.map((item: any) => (
                            <div key={item.variantId} className="cart-item">
                                <div className="item-info">
                                    <div className="item-name">{item.name}</div>
                                    <div className="item-meta">{item.sku} • {item.color}/{item.size}</div>
                                    <div className="item-price">
                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price)}
                                    </div>
                                </div>
                                <div className="qty-control">
                                    <button onClick={() => updateQuantity(item.variantId, -1)}>-</button>
                                    <span>{item.quantity}</span>
                                    <button onClick={() => updateQuantity(item.variantId, 1)}>+</button>
                                    <button className="remove" onClick={() => removeFromCart(item.variantId)}>✕</button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="sidebar-footer">
                    <div className="summary-row">
                        <span>Tạm tính:</span>
                        <span className="val">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(subTotal)}</span>
                    </div>

                    <div className="summary-row discount">
                        <span>Giảm giá:</span>
                        <div className="discount-input">
                            <input
                                type="number"
                                value={discountValue || ""}
                                onChange={(e) => setDiscountValue(parseInt(e.target.value) || 0)}
                                placeholder="0"
                            />
                            <span className="currency">₫</span>
                        </div>
                    </div>

                    <div className="payment-selectors">
                        <label>Phương thức:</label>
                        <div className="method-grid">
                            <button
                                className={paymentMethod === 'CASH' ? 'active' : ''}
                                onClick={() => setPaymentMethod('CASH')}
                            >
                                💵 Tiền mặt
                            </button>
                            <button
                                className={paymentMethod === 'TRANSFER' ? 'active' : ''}
                                onClick={() => setPaymentMethod('TRANSFER')}
                            >
                                💳 Chuyển khoản
                            </button>
                        </div>
                    </div>

                    <div className="summary-row total">
                        <span>TỔNG CỘNG:</span>
                        <span className="total-val">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(total)}</span>
                    </div>

                    <button
                        className="checkout-btn"
                        disabled={loading || cart.length === 0}
                        onClick={handleCheckout}
                    >
                        {loading ? "ĐANG XỬ LÝ..." : "THANH TOÁN XONG"}
                    </button>
                </div>
            </aside>

            <style jsx>{`
                .pos-container {
                    display: grid;
                    grid-template-columns: 1fr 340px;
                    gap: 1rem;
                    height: calc(100vh - 120px);
                }
 
                .pos-main {
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                    overflow: hidden;
                }
 
                .pos-header {
                    padding: 0.75rem 1rem;
                    display: flex;
                    gap: 0.75rem;
                    align-items: center;
                }
 
                .search-box {
                    flex: 1;
                    position: relative;
                }
                .search-icon {
                    position: absolute;
                    left: 0.75rem;
                    top: 50%;
                    transform: translateY(-50%);
                    opacity: 0.5;
                    font-size: 0.9rem;
                }
                .search-box input {
                    width: 100%;
                    padding: 0.6rem 1rem 0.6rem 2.2rem;
                    border: 1px solid #e2e8f0;
                    border-radius: 10px;
                    font-size: 0.85rem;
                    transition: 0.2s;
                }
                .search-box input:focus {
                    outline: none;
                    border-color: var(--primary);
                    box-shadow: 0 0 0 3px var(--primary-low);
                }
 
                .scanner-toggle {
                    background: #f1f5f9;
                    border: 1px solid #e2e8f0;
                    padding: 0.6rem 1rem;
                    border-radius: 10px;
                    font-weight: 700;
                    cursor: pointer;
                    transition: 0.2s;
                    white-space: nowrap;
                    font-size: 0.8rem;
                    color: #475569;
                }
                .scanner-toggle:hover {
                    background: white;
                    border-color: var(--primary);
                    color: var(--primary);
                }
                .scanner-toggle.active {
                    background: #fee2e2;
                    color: #ef4444;
                    border-color: #fecaca;
                }
 
                .scanner-container {
                    padding: 1rem;
                    animation: slideDown 0.3s forwards;
                }
 
                .product-grid {
                    flex: 1;
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
                    gap: 0.75rem;
                    overflow-y: auto;
                    padding: 0.25rem;
                }
 
                .product-card {
                    background: white;
                    border-radius: 12px;
                    padding: 0.5rem;
                    cursor: pointer;
                    transition: all 0.2s;
                    border: 1px solid #f1f5f9;
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }
                .product-card:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 8px 15px rgba(0,0,0,0.05);
                    border-color: var(--primary-low);
                }
 
                .p-img-wrapper {
                    aspect-ratio: 1;
                    width: 100%;
                    background: #f8fafc;
                    border-radius: 8px;
                    overflow: hidden;
                    position: relative;
                }
                .p-img-wrapper img {
                    width: 100%;
                    height: 100%;
                    object-fit: contain;
                }
                .p-img-wrapper .placeholder {
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.8rem;
                }
 
                .stock-badge {
                    position: absolute;
                    bottom: 0.4rem;
                    right: 0.4rem;
                    background: rgba(255,255,255,0.9);
                    padding: 0.15rem 0.4rem;
                    border-radius: 4px;
                    font-size: 0.65rem;
                    font-weight: 800;
                    color: #10b981;
                    backdrop-filter: blur(4px);
                }
                .stock-badge.low { color: #f59e0b; }
                .stock-badge.out { color: #ef4444; background: #fee2e2; }
 
                .p-info .p-cat { font-size: 0.6rem; font-weight: 800; text-transform: uppercase; color: var(--primary); opacity: 0.7; }
                .p-name { margin: 0.15rem 0; font-size: 0.85rem; color: #1e293b; font-weight: 800; line-height: 1.2; }
                .p-variant { font-size: 0.7rem; color: #64748b; font-weight: 500; }
                .p-price { margin-top: 0.3rem; font-weight: 900; color: #0f172a; font-size: 0.9rem; }
 
                .pos-sidebar {
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                    padding: 0;
                    overflow: hidden;
                    background: white;
                    border: 1px solid #e2e8f0;
                    border-radius: 16px;
                }
 
                .sidebar-header {
                    padding: 0.75rem 1rem;
                    border-bottom: 1px solid #f1f5f9;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .sidebar-header h3 { margin: 0; font-size: 0.95rem; font-weight: 900; }
                .clear-btn { background: none; border: none; color: #ef4444; font-size: 0.75rem; font-weight: 700; cursor: pointer; }
 
                .cart-list {
                    flex: 1;
                    overflow-y: auto;
                    padding: 0.75rem 1rem;
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }
 
                .empty-cart {
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    color: #94a3b8;
                    opacity: 0.6;
                }
                .empty-cart .icon { font-size: 2.5rem; margin-bottom: 0.5rem; }
 
                .cart-item {
                    display: flex;
                    justify-content: space-between;
                    gap: 0.75rem;
                    padding-bottom: 0.5rem;
                    border-bottom: 1px dashed #e2e8f0;
                    align-items: center;
                }
                .item-name { font-size: 0.8rem; font-weight: 700; color: #1e293b; margin-bottom: 0.1rem; }
                .item-meta { font-size: 0.7rem; color: #64748b; }
                .item-price { font-weight: 800; color: var(--primary); font-size: 0.8rem; margin-top: 0.2rem; }
 
                .qty-control {
                    display: flex;
                    align-items: center;
                    gap: 0.4rem;
                }
                .qty-control button {
                    width: 24px;
                    height: 24px;
                    border-radius: 6px;
                    border: 1px solid #e2e8f0;
                    background: #f8fafc;
                    font-weight: 700;
                    cursor: pointer;
                    font-size: 0.8rem;
                }
                .qty-control button.remove { border-color: #fee2e2; color: #ef4444; margin-left: 0.15rem; }
                .qty-control span { font-weight: 800; min-width: 18px; text-align: center; font-size: 0.8rem; }
 
                .sidebar-footer {
                    padding: 1rem;
                    background: #f8fafc;
                    border-top: 2px solid #e2e8f0;
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }
 
                .summary-row {
                    display: flex;
                    justify-content: space-between;
                    font-size: 0.85rem;
                    color: #475569;
                    font-weight: 600;
                }
                .summary-row .val { color: #0f172a; font-weight: 800; }
                
                .discount-input {
                    display: flex;
                    align-items: center;
                    gap: 0.4rem;
                    background: white;
                    padding-left: 0.5rem;
                    border: 1px solid #e2e8f0;
                    border-radius: 6px;
                    max-width: 110px;
                }
                .discount-input input {
                    border: none;
                    width: 100%;
                    padding: 0.3rem 0;
                    font-weight: 700;
                    text-align: right;
                    outline: none;
                    font-size: 0.8rem;
                }
                .discount-input .currency { font-size: 0.65rem; color: #94a3b8; padding-right: 0.5rem; }
 
                .payment-selectors {
                    margin-top: 0.25rem;
                }
                .payment-selectors label {
                    display: block;
                    font-size: 0.65rem;
                    font-weight: 800;
                    color: #94a3b8;
                    text-transform: uppercase;
                    margin-bottom: 0.3rem;
                }
                .method-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 0.4rem;
                }
                .method-grid button {
                    padding: 0.5rem;
                    border-radius: 6px;
                    border: 1px solid #e2e8f0;
                    background: white;
                    font-size: 0.7rem;
                    font-weight: 700;
                    cursor: pointer;
                    transition: 0.2s;
                }
                .method-grid button.active {
                    background: var(--primary);
                    color: white;
                    border-color: var(--primary);
                    box-shadow: 0 4px 8px var(--primary-low);
                }
 
                .summary-row.total {
                    margin-top: 0.5rem;
                    padding-top: 0.5rem;
                    border-top: 1px solid #e2e8f0;
                    color: #0f172a;
                    font-size: 0.95rem;
                    font-weight: 950;
                }
                .total-val { color: var(--primary); font-size: 1.2rem; }
 
                .checkout-btn {
                    margin-top: 0.25rem;
                    background: var(--primary);
                    color: white;
                    border: none;
                    padding: 0.85rem;
                    border-radius: 10px;
                    font-weight: 900;
                    font-size: 0.95rem;
                    cursor: pointer;
                    letter-spacing: 0.05em;
                    transition: 0.2s;
                    box-shadow: 0 6px 12px var(--primary-low);
                }
                .checkout-btn:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 10px 20px var(--primary-low);
                }
                .checkout-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                    box-shadow: none;
                }
 
                @keyframes slideDown { from { transform: translateY(-20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
 
                @media (max-width: 1200px) {
                    .pos-container { grid-template-columns: 1fr 300px; }
                }

                @media (max-width: 1024px) {
                    .pos-container { grid-template-columns: 1fr; height: auto; }
                    .pos-sidebar { height: 600px; }
                }
            `}</style>
        </div>
    );
}
