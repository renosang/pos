"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { processSale } from "@/app/actions/sale";
import BarcodeScanner from "./BarcodeScanner";
import { ShoppingCart, Search, X, Plus, Minus, Trash2, CreditCard, Wallet, Scan, CheckCircle2 } from "lucide-react";

export default function POSClient({ products, userId }: { products: any[], userId: string }) {
    const searchParams = useSearchParams();
    const [cart, setCart] = useState<any[]>([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);
    const [showScanner, setShowScanner] = useState(false);
    const [lastScanned, setLastScanned] = useState<string | null>(null);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [justAdded, setJustAdded] = useState<string | null>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (searchParams) {
            if (searchParams.get("scanner") === "true") {
                setShowScanner(true);
            }
            if (searchParams.get("focusSearch") === "true") {
                setTimeout(() => {
                    searchInputRef.current?.focus();
                    searchInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 300);
            }
        }
    }, [searchParams]);

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
        (v.productName?.toLowerCase() || "").includes(search.toLowerCase()) ||
        (v.skuCode?.toLowerCase() || "").includes(search.toLowerCase()) ||
        (v.barcode?.toLowerCase() || "").includes(search.toLowerCase())
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

        // Visual feedback
        setJustAdded(variant.id);
        setTimeout(() => setJustAdded(null), 1000);

        // Haptic feedback if available
        if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
            window.navigator.vibrate(50);
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
            <div className={`pos-main ${isCartOpen ? 'mobile-hidden' : ''}`} style={{ overflowX: 'hidden' }}>
                {/* Search & Scanner Header */}
                <div className="pos-header glass-card">
                    <div className="search-box">
                        <Search className="search-icon" size={18} />
                        <input
                            ref={searchInputRef}
                            type="text"
                            placeholder="Tìm sản phẩm..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        {search && (
                            <button className="clear-search" onClick={() => setSearch("")}>
                                <X size={16} />
                            </button>
                        )}
                    </div>
                    <button
                        className={`scanner-toggle ${showScanner ? 'active' : ''}`}
                        onClick={() => setShowScanner(!showScanner)}
                    >
                        {showScanner ? <X size={20} /> : <Scan size={20} />}
                        <span className="hide-mobile">{showScanner ? "Đóng" : "Quét mã"}</span>
                    </button>
                </div>

                {showScanner && (
                    <div className="scanner-container glass-card">
                        <BarcodeScanner onScanSuccess={handleScanSuccess} />
                        <div className="scanner-hint">Hãy đưa mã vạch vào khung hình</div>
                    </div>
                )}

                {/* Product Grid */}
                <div className="product-grid">
                    {filteredProducts.map((v: any) => {
                        const isJustAdded = justAdded === v.id;
                        return (
                            <div
                                key={v.id}
                                className={`product-card ${isJustAdded ? 'just-added' : ''}`}
                                onClick={() => addToCart(v)}
                            >
                                <div className="p-img-wrapper">
                                    {v.imageUrl ? (
                                        <img src={v.imageUrl} alt={v.productName} />
                                    ) : (
                                        <div className="placeholder">👕</div>
                                    )}
                                    <div className={`stock-badge ${v.onHand <= 0 ? 'out' : (v.onHand <= v.minStock ? 'low' : '')}`}>
                                        {v.onHand <= 0 ? "Hết" : v.onHand}
                                    </div>
                                    {isJustAdded && (
                                        <div className="added-overlay">
                                            <CheckCircle2 color="white" size={32} />
                                        </div>
                                    )}
                                </div>
                                <div className="p-info">
                                    <h4 className="p-name">{v.productName}</h4>
                                    <div className="p-details">
                                        <span className="p-sku">{v.skuCode}</span>
                                        <span className="p-variant">{v.color || '-'}/{v.size || '-'}</span>
                                    </div>
                                    <div className="p-footer">
                                        <span className="p-price">{new Intl.NumberFormat('vi-VN').format(v.salePrice)}đ</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Sidebar Cart Area (Desktop) */}
            <aside className="pos-sidebar hide-mobile glass-card">
                <CartContent
                    cart={cart}
                    updateQuantity={updateQuantity}
                    removeFromCart={removeFromCart}
                    setCart={setCart}
                    discountValue={discountValue}
                    setDiscountValue={setDiscountValue}
                    paymentMethod={paymentMethod}
                    setPaymentMethod={setPaymentMethod}
                    subTotal={subTotal}
                    total={total}
                    handleCheckout={handleCheckout}
                    loading={loading}
                />
            </aside>

            {/* Mobile Floating Cart & Drawer */}
            <div className="show-mobile">
                {cart.length > 0 && !isCartOpen && (
                    <button className="floating-cart-btn" onClick={() => setIsCartOpen(true)}>
                        <div className="cart-badge">{cart.reduce((s, i) => s + i.quantity, 0)}</div>
                        <ShoppingCart size={24} />
                        <span className="cart-amount">{new Intl.NumberFormat('vi-VN').format(total)}đ</span>
                    </button>
                )}

                <div className={`mobile-cart-drawer ${isCartOpen ? 'open' : ''}`}>
                    <div className="drawer-handle" onClick={() => setIsCartOpen(false)}></div>
                    <div className="drawer-header">
                        <h3>Giỏ hàng ({cart.length})</h3>
                        <button className="close-drawer" onClick={() => setIsCartOpen(false)}><X size={24} /></button>
                    </div>
                    <div className="drawer-body">
                        <CartContent
                            cart={cart}
                            updateQuantity={updateQuantity}
                            removeFromCart={removeFromCart}
                            setCart={setCart}
                            discountValue={discountValue}
                            setDiscountValue={setDiscountValue}
                            paymentMethod={paymentMethod}
                            setPaymentMethod={setPaymentMethod}
                            subTotal={subTotal}
                            total={total}
                            handleCheckout={handleCheckout}
                            loading={loading}
                        />
                    </div>
                </div>
            </div>

            <style jsx>{`
                .pos-container {
                    display: grid;
                    grid-template-columns: 1fr 340px;
                    gap: 1rem;
                    height: calc(100vh - 120px);
                    max-width: 100% !important;
                    width: 100% !important;
                    overflow: hidden !important;
                    overflow-x: hidden !important;
                    position: relative;
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
                    width: 100%;
                }
 
                .search-box {
                    flex: 1;
                    position: relative;
                    display: flex;
                    align-items: center;
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 12px;
                    padding: 0 0.5rem;
                    transition: all 0.2s;
                    min-width: 0;
                }
                .search-box:focus-within {
                    background: white;
                    border-color: var(--primary);
                    box-shadow: 0 0 0 4px var(--primary-low);
                }
                .search-icon {
                    margin-left: 0.5rem;
                    opacity: 0.5;
                    color: #64748b;
                    flex-shrink: 0;
                }
                .search-box input {
                    width: 100%;
                    padding: 0.75rem 0.5rem;
                    background: transparent;
                    border: none;
                    font-size: 0.95rem;
                    font-weight: 500;
                    color: #1e293b;
                    outline: none;
                }
                .clear-search {
                    background: #cbd5e1;
                    color: white;
                    border: none;
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    padding: 0;
                    flex-shrink: 0;
                    margin-right: 0.25rem;
                }
 
                .scanner-toggle {
                    background: #f1f5f9;
                    border: 1px solid #e2e8f0;
                    height: 48px;
                    width: 48px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 12px;
                    cursor: pointer;
                    transition: all 0.2s;
                    color: #475569;
                    flex-shrink: 0;
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
 
                .p-info { padding: 0.5rem 0.25rem 0.25rem 0.25rem; }
                .p-name { margin: 0; font-size: 0.875rem; color: #0f172a; font-weight: 700; line-height: 1.3; height: 2.6rem; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
                .p-details { display: flex; flex-direction: column; gap: 0.1rem; margin: 0.35rem 0; }
                .p-sku { font-size: 0.65rem; color: #94a3b8; font-family: monospace; }
                .p-variant { font-size: 0.7rem; color: #64748b; font-weight: 600; }
                .p-footer { margin-top: auto; display: flex; align-items: center; justify-content: space-between; }
                .p-price { font-weight: 800; color: var(--primary); font-size: 0.95rem; }
 
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
                    .pos-container { 
                        grid-template-columns: 1fr; 
                        height: auto; 
                        padding-bottom: 100px;
                        max-width: 100vw;
                        overflow-x: hidden;
                    }
                    .mobile-hidden { display: none; }
                }

                .floating-cart-btn {
                    position: fixed;
                    right: 20px;
                    bottom: 150px;
                    background: var(--primary);
                    color: white;
                    padding: 12px 24px;
                    border-radius: 40px;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    box-shadow: 0 8px 25px rgba(99, 102, 241, 0.4);
                    border: 4px solid white;
                    z-index: 100;
                    animation: slideUp 0.3s ease-out;
                }

                .cart-badge {
                    background: white;
                    color: var(--primary);
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.75rem;
                    font-weight: 900;
                }

                .cart-amount {
                    font-weight: 800;
                    border-left: 1px solid rgba(255,255,255,0.3);
                    padding-left: 12px;
                }

                .mobile-cart-drawer {
                    position: fixed;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    top: 0;
                    background: white;
                    z-index: 1100;
                    display: flex;
                    flex-direction: column;
                    transform: translateY(100%);
                    transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                }

                .mobile-cart-drawer.open {
                    transform: translateY(0);
                }

                .drawer-handle {
                    width: 40px;
                    height: 5px;
                    background: #e2e8f0;
                    border-radius: 5px;
                    margin: 12px auto;
                }

                .drawer-header {
                    padding: 0 1.5rem 1rem 1.5rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-bottom: 1px solid #f1f5f9;
                }

                .drawer-header h3 { font-weight: 900; margin: 0; }

                .drawer-body {
                    flex: 1;
                    overflow-y: auto;
                }

                .product-card.just-added {
                    animation: pulseSuccess 0.5s ease-out;
                    border-color: #10b981;
                }

                .added-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(16, 185, 129, 0.4);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    backdrop-filter: blur(2px);
                }

                @keyframes pulseSuccess {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                    100% { transform: scale(1); }
                }

                @keyframes slideUp {
                    from { transform: translateY(50px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }

                .hide-mobile { display: flex; }
                .show-mobile { display: none; }

                @media (max-width: 768px) {
                    .hide-mobile { display: none !important; }
                    .show-mobile { display: block; }
                    .product-grid { grid-template-columns: repeat(2, 1fr); gap: 0.5rem; }
                    .pos-header { padding: 0.5rem; gap: 0.5rem; }
                    .search-box input { padding: 0.6rem 0.5rem; font-size: 0.85rem; }
                    .scanner-toggle { height: 40px; width: 40px; }
                    
                    .p-name { font-size: 0.75rem; height: 2rem; -webkit-line-clamp: 2; margin: 0; }
                    .p-details { margin: 0.2rem 0; }
                    .p-variant { font-size: 0.65rem; }
                    .p-price { font-size: 0.85rem; }
                    .stock-badge { font-size: 0.6rem; padding: 0.1rem 0.3rem; }
                    
                    .item-name { font-size: 0.75rem; }
                    .item-meta { font-size: 0.65rem; }
                    .item-price { font-size: 0.75rem; }
                    .qty-control span { font-size: 0.75rem; }
                    .qty-control button { width: 22px; height: 22px; font-size: 0.7rem; }
                    
                    .floating-cart-btn { padding: 10px 18px; bottom: 200px; right: 15px; }
                    .cart-amount { font-size: 0.85rem; padding-left: 10px; }
                    .cart-badge { width: 20px; height: 20px; font-size: 0.65rem; }
                }

                :global(html, body) {
                    overflow-x: hidden !important;
                    overflow-x: clip !important;
                    width: 100% !important;
                    max-width: 100% !important;
                    position: relative;
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }

                /* Target all elements for scrollbar removal in mobile */
                @media (max-width: 1024px) {
                    :global(*) {
                        scrollbar-width: none !important;
                        -ms-overflow-style: none !important;
                        box-sizing: border-box !important;
                    }
                    :global(*)::-webkit-scrollbar {
                        display: none !important;
                        width: 0 !important;
                        height: 0 !important;
                    }
                }
            `}</style>
        </div>
    );
}

function CartContent({
    cart,
    updateQuantity,
    removeFromCart,
    setCart,
    discountValue,
    setDiscountValue,
    paymentMethod,
    setPaymentMethod,
    subTotal,
    total,
    handleCheckout,
    loading
}: any) {
    return (
        <div className="cart-wrapper">
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
                                    {new Intl.NumberFormat('vi-VN').format(item.price)}đ
                                </div>
                            </div>
                            <div className="qty-control">
                                <button onClick={() => updateQuantity(item.variantId, -1)}><Minus size={14} /></button>
                                <span>{item.quantity}</span>
                                <button onClick={() => updateQuantity(item.variantId, 1)}><Plus size={14} /></button>
                                <button className="remove" onClick={() => removeFromCart(item.variantId)}><Trash2 size={14} /></button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="sidebar-footer">
                <div className="summary-row">
                    <span>Tạm tính:</span>
                    <span className="val">{new Intl.NumberFormat('vi-VN').format(subTotal)}đ</span>
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
                    <span className="total-val">{new Intl.NumberFormat('vi-VN').format(total)}đ</span>
                </div>

                <button
                    className="checkout-btn"
                    disabled={loading || cart.length === 0}
                    onClick={handleCheckout}
                >
                    {loading ? "ĐANG XỬ LÝ..." : "THANH TOÁN XONG"}
                </button>
            </div>
            <style jsx>{`
                .cart-wrapper { display: flex; flex-direction: column; height: 100%; }
                .sidebar-header {
                    padding: 0.75rem 1rem;
                    border-bottom: 1px solid #f1f5f9;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .cart-list {
                    flex: 1;
                    overflow-y: auto;
                    padding: 0.75rem 1rem;
                }
                .cart-item {
                    display: flex;
                    justify-content: space-between;
                    padding-bottom: 1rem;
                    margin-bottom: 1rem;
                    border-bottom: 1px dashed #e2e8f0;
                }
                .sidebar-footer { padding: 1.5rem; background: #f8fafc; border-top: 1px solid #e2e8f0; }
                /* ... use existing or refined styles ... */
                .qty-control { display: flex; align-items: center; gap: 8px; }
                .qty-control button { width: 28px; height: 28px; border-radius: 8px; border: 1px solid #e2e8f0; background: white; display: flex; align-items: center; justify-content: center; }
                .summary-row { display: flex; justify-content: space-between; margin-bottom: 8px; }
                .summary-row.total { border-top: 1px solid #e2e8f0; padding-top: 12px; margin-top: 12px; font-weight: 950; font-size: 1.1rem; }
                .total-val { color: var(--primary); }
                .checkout-btn { width: 100%; border: none; padding: 1rem; border-radius: 12px; background: var(--primary); color: white; font-weight: 800; font-size: 1rem; margin-top: 12px; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2); }
                .method-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 4px; }
                .method-grid button { padding: 8px; border-radius: 8px; border: 1px solid #e2e8f0; background: white; font-weight: 600; font-size: 0.8rem; }
                .method-grid button.active { background: var(--primary); color: white; border-color: var(--primary); }
                .discount-input { display: flex; align-items: center; background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding-right: 8px; }
                .discount-input input { border: none; padding: 8px; width: 80px; text-align: right; outline: none; font-weight: 700; }
            `}</style>
        </div>
    );
}
