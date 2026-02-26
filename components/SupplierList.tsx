"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { createSupplier, updateSupplier } from "@/app/actions/supplier";
import { Plus, Edit, Phone, CreditCard, X, Check, MapPin, ChevronDown, Loader2, Copy } from "lucide-react";

const VN_BANKS = [
    { code: "VCB", name: "Vietcombank", logo: "https://api.vietqr.io/img/VCB.png" },
    { code: "BIDV", name: "BIDV", logo: "https://api.vietqr.io/img/BIDV.png" },
    { code: "ICB", name: "VietinBank", logo: "https://api.vietqr.io/img/ICB.png" },
    { code: "TCB", name: "Techcombank", logo: "https://api.vietqr.io/img/TCB.png" },
    { code: "MB", name: "MB Bank", logo: "https://api.vietqr.io/img/MB.png" },
    { code: "VBA", name: "Agribank", logo: "https://api.vietqr.io/img/VBA.png" },
    { code: "ACB", name: "ACB", logo: "https://api.vietqr.io/img/ACB.png" },
    { code: "STB", name: "Sacombank", logo: "https://api.vietqr.io/img/STB.png" },
    { code: "VPB", name: "VPBank", logo: "https://api.vietqr.io/img/VPB.png" },
    { code: "TPB", name: "TPBank", logo: "https://api.vietqr.io/img/TPB.png" },
    { code: "HDB", name: "HDBank", logo: "https://api.vietqr.io/img/HDB.png" },
    { code: "VIB", name: "VIB", logo: "https://api.vietqr.io/img/VIB.png" },
];

export default function SupplierList({ initialSuppliers }: { initialSuppliers: any[] }) {
    const [suppliers, setSuppliers] = useState(initialSuppliers);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [isBankDropdownOpen, setIsBankDropdownOpen] = useState(false);

    // Address Autocomplete state
    const [addressSuggestions, setAddressSuggestions] = useState<any[]>([]);
    const [isLoadingAddress, setIsLoadingAddress] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    // Debounce address search
    useEffect(() => {
        if (!searchQuery || searchQuery.trim().length < 3) {
            setAddressSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        const timer = setTimeout(() => {
            searchAddress(searchQuery);
        }, 800); // 800ms debounce to prevent rate limiting

        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Form state
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        address: "",
        bankAccountName: "",
        bankAccountNo: "",
        bankName: "",
        note: ""
    });

    // Handle client-side portal target
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    const openModal = (supplier: any = null) => {
        if (supplier) {
            setEditingSupplier(supplier);
            setFormData({
                name: supplier.name || "",
                phone: supplier.phone || "",
                address: supplier.address || "",
                bankAccountName: supplier.bankAccountName || "",
                bankAccountNo: supplier.bankAccountNo || "",
                bankName: supplier.bankName || "",
                note: supplier.note || ""
            });
        } else {
            setEditingSupplier(null);
            setFormData({
                name: "",
                phone: "",
                address: "",
                bankAccountName: "",
                bankAccountNo: "",
                bankName: "",
                note: ""
            });
        }
        setIsModalOpen(true);
        setIsBankDropdownOpen(false);
        setAddressSuggestions([]);
        setShowSuggestions(false);
        setSearchQuery(""); // Reset search query on open
    };

    const handleSave = async () => {
        if (!formData.name) return alert("Vui lòng nhập tên nhà cung cấp!");

        setLoading(true);
        try {
            if (editingSupplier) {
                await updateSupplier(editingSupplier.id, formData);
            } else {
                await createSupplier(formData);
            }
            setIsModalOpen(false);
            window.location.reload();
        } catch (error) {
            console.error(error);
            alert("Đã xảy ra lỗi khi lưu thông tin!");
        } finally {
            setLoading(false);
        }
    };

    const searchAddress = async (query: string) => {
        const apiKey = process.env.NEXT_PUBLIC_GOONG_API_KEY;
        if (!apiKey) {
            console.warn("Goong API Key is missing. Please check .env file.");
            return;
        }

        setIsLoadingAddress(true);
        try {
            const res = await fetch(`https://rsapi.goong.io/Place/AutoComplete?api_key=${apiKey}&input=${encodeURIComponent(query)}&limit=5`);

            if (!res.ok) {
                console.warn("Goong API error:", res.status);
                return;
            }

            const data = await res.json();
            // Goong returns results in predictions array
            if (data.predictions) {
                setAddressSuggestions(data.predictions);
                setShowSuggestions(true);
            }
        } catch (error) {
            console.error("Address search error:", error);
        } finally {
            setIsLoadingAddress(false);
        }
    };

    const handleAddressChange = (val: string) => {
        setFormData(prev => ({ ...prev, address: val }));
        setSearchQuery(val);
    };

    const selectAddress = (item: any) => {
        setFormData(prev => ({ ...prev, address: item.description || item.display_name }));
        setShowSuggestions(false);
    };

    const copyToClipboard = (s: any) => {
        const text = `Nhà cung cấp: ${s.name}\nSĐT: ${s.phone || "N/A"}\nĐịa chỉ: ${s.address || "N/A"}\nSTK: ${s.bankAccountNo || "N/A"} (${s.bankName || "N/A"})`;
        navigator.clipboard.writeText(text);
        alert("Đã sao chép thông tin nhà cung cấp!");
    };

    const selectedBank = VN_BANKS.find(b => b.code === formData.bankName || b.name === formData.bankName);

    return (
        <div className="animate-fade-in" style={{ maxWidth: '1440px', margin: '0 auto' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: 950, color: '#0f172a', letterSpacing: '-0.03em' }}>
                        Đối tác <span style={{ color: 'var(--primary)' }}>Cung cấp</span>
                    </h1>
                    <p style={{ color: '#64748b', marginTop: '0.5rem', fontSize: '1.125rem' }}>Theo dõi thông tin đại lý và nguồn hàng đầu vào</p>
                </div>
                <button className="btn btn-primary" onClick={() => openModal()} style={{ gap: '0.75rem', padding: '1rem 2rem', borderRadius: '16px', fontSize: '1rem' }}>
                    <Plus size={22} strokeWidth={2.5} /> Thêm nhà cung cấp mới
                </button>
            </header>

            <div className="glass-card" style={{ padding: 0, overflow: 'hidden', border: '1px solid #e2e8f0', borderRadius: '24px', boxShadow: '0 10px 40px rgba(0,0,0,0.02)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                        <tr>
                            <th className="th-style">Thông tin nhà cung cấp</th>
                            <th className="th-style">Địa chỉ & Liên hệ</th>
                            <th className="th-style">Thanh toán mặc định</th>
                            <th className="th-style" style={{ textAlign: 'right' }}>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {suppliers.length === 0 ? (
                            <tr>
                                <td colSpan={4} style={{ textAlign: 'center', padding: '8rem', color: '#94a3b8' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                                        <X size={48} style={{ opacity: 0.2 }} />
                                        <div style={{ fontSize: '1.125rem', fontWeight: 500 }}>Chưa có nhà cung cấp nào được lưu</div>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            suppliers.map((s) => (
                                <tr key={s.id} className="row-hover" style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '1.75rem 1.5rem' }}>
                                        <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '1.125rem', letterSpacing: '-0.01em' }}>{s.name}</div>
                                        {s.note && <div style={{ fontSize: '0.8125rem', color: '#64748b', marginTop: '0.4rem', maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.note}</div>}
                                    </td>
                                    <td style={{ padding: '1.75rem 1.5rem' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                            <a href={`tel:${s.phone}`} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#0f172a', fontSize: '0.9375rem', fontWeight: 600, textDecoration: 'none' }}>
                                                <div style={{ width: '28px', height: '28px', background: '#ecfdf5', color: '#059669', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <Phone size={14} />
                                                </div>
                                                {s.phone || '-'}
                                            </a>
                                            {s.address && (
                                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', color: '#64748b', fontSize: '0.875rem', lineHeight: 1.4, maxWidth: '300px' }}>
                                                    <MapPin size={14} style={{ marginTop: '0.2rem', color: '#94a3b8', flexShrink: 0 }} />
                                                    {s.address}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.75rem 1.5rem' }}>
                                        {s.bankAccountNo ? (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                                                {VN_BANKS.find(b => b.code === s.bankName || b.name === s.bankName) && (
                                                    <img
                                                        src={VN_BANKS.find(b => b.code === s.bankName || b.name === s.bankName)?.logo}
                                                        alt={s.bankName}
                                                        style={{ height: '24px', width: '50px', objectFit: 'contain' }}
                                                    />
                                                )}
                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                    <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.9375rem' }}>
                                                        {s.bankAccountNo}
                                                    </div>
                                                    <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.bankAccountName}</div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div style={{ padding: '0.75rem 1rem', border: '1px dashed #e2e8f0', borderRadius: '12px', color: '#94a3b8', fontSize: '0.875rem', fontStyle: 'italic' }}>Chưa cập nhật</div>
                                        )}
                                    </td>
                                    <td style={{ padding: '1.75rem 1.5rem', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                            <button className="btn btn-secondary" onClick={() => copyToClipboard(s)} style={{ padding: '0.6rem', borderRadius: '12px', background: 'white', border: '1px solid #e2e8f0' }} title="Sao chép nhanh">
                                                <Copy size={16} />
                                            </button>
                                            <button className="btn btn-secondary" onClick={() => openModal(s)} style={{ padding: '0.6rem 1.25rem', borderRadius: '12px', background: 'white', border: '1px solid #e2e8f0' }}>
                                                <Edit size={16} /> Sửa
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal using Portal to body */}
            {mounted && isModalOpen && createPortal(
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.45)',
                    backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', zIndex: 9999, padding: '2rem 1rem', overflowY: 'auto'
                }} onClick={() => {
                    setIsModalOpen(false);
                    setIsBankDropdownOpen(false);
                }}>
                    <div className="glass-card" style={{
                        width: '100%', maxWidth: '640px', padding: '2.5rem',
                        background: 'white', border: 'none', boxShadow: '0 25px 70px -12px rgba(0, 0, 0, 0.35)',
                        position: 'relative', margin: 'auto'
                    }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                            <div>
                                <h2 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 950, color: '#0f172a', letterSpacing: '-0.02em' }}>
                                    {editingSupplier ? "Cập nhật" : "Thêm mới"} <span style={{ color: 'var(--primary)' }}>Nhà cung cấp</span>
                                </h2>
                                <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '0.25rem' }}>Điền đầy đủ thông tin để quản lý đối tác tốt hơn</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} style={{ border: 'none', background: '#f8fafc', width: '40px', height: '40px', borderRadius: '12px', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
                                <X size={20} />
                            </button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.75rem' }}>
                            <div style={{ gridColumn: 'span 2' }}>
                                <label className="label-style">Tên nhà cung cấp *</label>
                                <input
                                    className="input-style"
                                    style={{ height: '3.5rem', fontSize: '1.125rem' }}
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Tên công ty, xưởng may hoặc đại lý..."
                                />
                            </div>

                            <div>
                                <label className="label-style">Số điện thoại</label>
                                <div style={{ position: 'relative' }}>
                                    <Phone size={18} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                    <input
                                        className="input-style"
                                        style={{ paddingLeft: '3.25rem' }}
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        placeholder="VD: 0987xxxxxx"
                                    />
                                </div>
                            </div>

                            <div style={{ gridColumn: 'span 2', position: 'relative' }}>
                                <label className="label-style">Địa chỉ (Tự động gợi ý)</label>
                                <div style={{ position: 'relative' }}>
                                    <MapPin size={18} style={{ position: 'absolute', left: '1.25rem', top: '1.125rem', color: '#94a3b8' }} />
                                    <textarea
                                        className="input-style"
                                        style={{ minHeight: '90px', paddingLeft: '3.25rem', paddingTop: '1rem', resize: 'none' }}
                                        value={formData.address}
                                        onChange={(e) => handleAddressChange(e.target.value)}
                                        onFocus={() => formData.address.length >= 3 && setShowSuggestions(true)}
                                        placeholder="Nhập địa chỉ để hệ thống tự động tìm kiếm..."
                                    />
                                    {isLoadingAddress && (
                                        <Loader2 size={16} className="animate-spin" style={{ position: 'absolute', right: '1.25rem', top: '1.125rem', color: 'var(--primary)' }} />
                                    )}
                                </div>

                                {showSuggestions && addressSuggestions.length > 0 && (
                                    <div className="address-suggestions-container">
                                        {addressSuggestions.map((item, idx) => (
                                            <div
                                                key={idx}
                                                className="address-suggestion-item"
                                                onClick={() => selectAddress(item)}
                                            >
                                                <MapPin size={14} style={{ marginTop: '3px', flexShrink: 0 }} />
                                                <span>{item.description || item.display_name}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div style={{ gridColumn: 'span 2', padding: '1.75rem', background: '#f8fafc', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
                                <div style={{ marginBottom: '1.5rem', fontSize: '0.9375rem', fontWeight: 800, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    <CreditCard size={20} /> Thông tin tài khoản ngân hàng
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                    <div style={{ gridColumn: 'span 2', position: 'relative' }}>
                                        <label className="sub-label">Ngân hàng</label>
                                        <div
                                            className="input-style"
                                            style={{
                                                background: 'white', cursor: 'pointer',
                                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                                height: '3.5rem'
                                            }}
                                            onClick={() => setIsBankDropdownOpen(!isBankDropdownOpen)}
                                        >
                                            {selectedBank ? (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                    <img src={selectedBank.logo} alt={selectedBank.name} style={{ height: '24px' }} />
                                                    <span style={{ fontWeight: 600 }}>{selectedBank.name}</span>
                                                </div>
                                            ) : <span style={{ color: '#94a3b8' }}>Chọn ngân hàng...</span>}
                                            <ChevronDown size={20} style={{ color: '#94a3b8', transition: 'transform 0.2s', transform: isBankDropdownOpen ? 'rotate(180deg)' : 'none' }} />
                                        </div>

                                        {isBankDropdownOpen && (
                                            <div className="bank-dropdown-container">
                                                {VN_BANKS.map(bank => (
                                                    <div
                                                        key={bank.code}
                                                        className="bank-dropdown-item"
                                                        onClick={() => {
                                                            setFormData(prev => ({ ...prev, bankName: bank.code }));
                                                            setIsBankDropdownOpen(false);
                                                        }}
                                                    >
                                                        <img src={bank.logo} alt={bank.name} style={{ height: '24px', width: '64px', objectFit: 'contain' }} />
                                                        <span style={{ fontSize: '0.9375rem', fontWeight: 500 }}>{bank.name}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <label className="sub-label">Số tài khoản</label>
                                        <input className="input-style" style={{ background: 'white' }} value={formData.bankAccountNo} onChange={(e) => setFormData(prev => ({ ...prev, bankAccountNo: e.target.value }))} placeholder="Số tài khoản" />
                                    </div>
                                    <div>
                                        <label className="sub-label">Chủ tài khoản</label>
                                        <input className="input-style" style={{ background: 'white' }} value={formData.bankAccountName} onChange={(e) => setFormData(prev => ({ ...prev, bankAccountName: e.target.value }))} placeholder="Tên in trên thẻ" />
                                    </div>
                                </div>
                            </div>

                            <div style={{ gridColumn: 'span 2' }}>
                                <label className="label-style">Ghi chú bổ sung</label>
                                <textarea
                                    className="input-style"
                                    style={{ minHeight: '70px', paddingTop: '0.75rem', resize: 'none' }}
                                    value={formData.note}
                                    onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
                                    placeholder="Thời gian giao hàng, đặc tính sản phẩm..."
                                />
                            </div>
                        </div>

                        <div style={{ marginTop: '3rem', display: 'flex', gap: '1.25rem' }}>
                            <button className="btn-cancel" onClick={() => setIsModalOpen(false)}>Hủy bỏ</button>
                            <button className="btn-save" onClick={handleSave} disabled={loading}>
                                {loading ? <Loader2 className="animate-spin" size={20} /> : <Check size={20} />}
                                {loading ? "Đang xử lý..." : (editingSupplier ? "Cập nhật thông tin" : "Lưu nhà cung cấp")}
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            <style dangerouslySetInnerHTML={{
                __html: `
                .label-style { display: block; margin-bottom: 0.75rem; font-size: 0.8125rem; font-weight: 800; color: #475569; text-transform: uppercase; letter-spacing: 0.05em; }
                .sub-label { display: block; margin-bottom: 0.5rem; font-size: 0.75rem; font-weight: 700; color: #64748b; text-transform: uppercase; }
                .input-style { 
                    width: 100%; border: 1.5px solid #e2e8f0; border-radius: 14px; padding: 0.875rem 1.25rem; font-weight: 500; color: #0f172a; transition: all 0.2s; outline: none;
                }
                .input-style:focus { border-color: var(--primary); box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.08); }
                .th-style { text-align: left; padding: 1.5rem; font-size: 0.8125rem; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.1em; }
                .row-hover:hover { background: #fdfdfd; }
                .btn-cancel { flex: 1; height: 3.75rem; border-radius: 16px; border: 1.5px solid #e2e8f0; background: white; font-weight: 700; cursor: pointer; color: #64748b; transition: all 0.2s; }
                .btn-cancel:hover { background: #f8fafc; border-color: #cbd5e1; color: #334155; }
                .btn-save { flex: 2; height: 3.75rem; border-radius: 16px; border: none; background: var(--primary); color: white; font-weight: 700; font-size: 1.0625rem; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.75rem; transition: all 0.2s; box-shadow: 0 10px 20px rgba(79, 70, 229, 0.2); }
                .btn-save:hover { background: var(--primary-hover); transform: translateY(-2px); box-shadow: 0 12px 25px rgba(79, 70, 229, 0.3); }
                .btn-save:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
                
                .address-suggestions-container { position: absolute; top: 100%; left: 0; right: 0; background: white; border: 1px solid #e2e8f0; border-radius: 14px; margin-top: 8px; box-shadow: 0 15px 35px rgba(0,0,0,0.12); z-index: 10000; overflow: hidden; }
                .address-suggestion-item { padding: 1rem 1.25rem; cursor: pointer; display: flex; gap: 0.75rem; font-size: 0.875rem; color: #334155; transition: all 0.2s; line-height: 1.5; border-bottom: 1px solid #f1f5f9; }
                .address-suggestion-item:last-child { border-bottom: none; }
                .address-suggestion-item:hover { background: #f8fafc; color: var(--primary); }
                
                .bank-dropdown-container { position: absolute; top: 100%; left: 0; right: 0; margin-top: 0.5rem; background: white; border: 1px solid #e2e8f0; border-radius: 14px; box-shadow: 0 15px 35px rgba(0,0,0,0.12); z-index: 10001; max-height: 250px; overflow-y: auto; }
                .bank-dropdown-item { padding: 0.875rem 1.25rem; display: flex; align-items: center; gap: 1rem; cursor: pointer; transition: all 0.2s; border-bottom: 1px solid #f1f5f9; }
                .bank-dropdown-item:hover { background: #f8fafc; }
            `}} />
        </div>
    );
}
