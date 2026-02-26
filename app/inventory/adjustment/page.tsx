"use client";

import { useState, useRef } from "react";
import { getInventoryTemplate, processBulkAdjustment } from "@/app/actions/inventory";
import BarcodeScanner from "@/components/BarcodeScanner";
import { useRouter } from "next/navigation";

export default function AdjustmentPage() {
    const [showScanner, setShowScanner] = useState(false);
    const [scannedItems, setScannedItems] = useState<any[]>([]);
    const [importData, setImportData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    const handleDownloadTemplate = async () => {
        const template = await getInventoryTemplate();
        const csvContent = [
            template.headers.join(","),
            ...template.data.map(row => row.map(cell => `"${cell}"`).join(","))
        ].join("\n");

        const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `mau_kiem_kho_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleUploadCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target?.result as string;
            const lines = text.split("\n").filter(l => l.trim());
            const data = lines.slice(1).map(line => {
                const cells = line.split(",").map(c => c.replace(/^"|"$/g, '').trim());
                return {
                    variantId: cells[0],
                    name: cells[1],
                    color: cells[2],
                    size: cells[3],
                    barcode: cells[4],
                    systemQty: parseInt(cells[5] || "0"),
                    countedQty: parseInt(cells[6] || "0"),
                    diff: parseInt(cells[6] || "0") - parseInt(cells[5] || "0")
                };
            }).filter(d => d.variantId);
            setImportData(data);
        };
        reader.readAsText(file);
    };

    const handleConfirmAdjustment = async () => {
        if (importData.length === 0) return;
        setLoading(true);
        try {
            await processBulkAdjustment(importData);
            alert("Đã cập nhật tồn kho thành công!");
            router.push("/inventory");
            router.refresh();
        } catch (err) {
            alert("Lỗi khi cập nhật");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="adjustment-container animate-fade-in">
            <header className="page-header">
                <h1>Kiểm kê & Điều chỉnh</h1>
                <p>Cập nhật số lượng tồn kho thực tế bằng file CSV hoặc quét mã vạch.</p>
            </header>

            <div className="action-cards">
                <div className="glass-card action-card" onClick={handleDownloadTemplate}>
                    <div className="icon">📥</div>
                    <h3>1. Tải file mẫu</h3>
                    <p>Lấy danh sách tồn kho hiện tại ra file Excel/CSV.</p>
                </div>

                <div className="glass-card action-card" onClick={() => fileInputRef.current?.click()}>
                    <div className="icon">📤</div>
                    <h3>2. Nhập file thực tế</h3>
                    <p>Tải lên file đã điền số lượng kiểm đếm thực tế.</p>
                    <input type="file" ref={fileInputRef} hidden accept=".csv" onChange={handleUploadCSV} />
                </div>

                <div className="glass-card action-card" onClick={() => setShowScanner(!showScanner)}>
                    <div className="icon">📷</div>
                    <h3>Quét mã (Beta)</h3>
                    <p>Sử dụng camera để tìm nhanh sản phẩm.</p>
                </div>
            </div>

            {showScanner && (
                <div className="scanner-section glass-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3>Máy quét mã vạch</h3>
                        <button className="btn" onClick={() => setShowScanner(false)}>Đóng</button>
                    </div>
                    <BarcodeScanner
                        onScanSuccess={(barcode) => {
                            const index = importData.findIndex(d => d.barcode === barcode);
                            if (index !== -1) {
                                const newData = [...importData];
                                newData[index].countedQty += 1;
                                newData[index].diff = newData[index].countedQty - newData[index].systemQty;
                                setImportData(newData);
                                alert(`Đã đếm: ${newData[index].name} (${newData[index].countedQty})`);
                            } else {
                                alert("Mã vạch này không có trong file kiểm kê hiện tại.");
                            }
                        }}
                    />
                </div>
            )}

            {importData.length > 0 && (
                <div className="preview-section glass-card">
                    <div className="section-header">
                        <h3>Dự kiến điều chỉnh ({importData.length} mục)</h3>
                        <button className="btn btn-primary" onClick={handleConfirmAdjustment} disabled={loading}>
                            {loading ? "Đang xử lý..." : "Xác nhận điều chỉnh kho"}
                        </button>
                    </div>

                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>Sản phẩm</th>
                                    <th>Hệ thống</th>
                                    <th>Thực tế</th>
                                    <th>Chênh lệch</th>
                                </tr>
                            </thead>
                            <tbody>
                                {importData.map((d, i) => (
                                    <tr key={i} className={d.diff !== 0 ? 'has-diff' : ''}>
                                        <td>
                                            <div style={{ fontWeight: 600 }}>{d.name}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{d.color} / {d.size}</div>
                                        </td>
                                        <td>{d.systemQty}</td>
                                        <td>{d.countedQty}</td>
                                        <td style={{ color: d.diff > 0 ? 'var(--success)' : (d.diff < 0 ? 'var(--danger)' : 'inherit'), fontWeight: 800 }}>
                                            {d.diff > 0 ? `+${d.diff}` : d.diff}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <style jsx>{`
                .adjustment-container { max-width: 1000px; margin: 0 auto; }
                .action-cards { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1.5rem; margin-bottom: 2rem; }
                .action-card { text-align: center; padding: 2rem; cursor: pointer; transition: all 0.2s; border: 2px solid transparent; }
                .action-card:hover { transform: translateY(-4px); border-color: var(--primary); background: white; }
                .action-card .icon { font-size: 2.5rem; margin-bottom: 1rem; }
                .action-card h3 { margin: 0 0 0.5rem 0; font-size: 1.1rem; }
                .action-card p { margin: 0; font-size: 0.875rem; color: var(--text-muted); }
                
                .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
                .table-wrapper { overflow-x: auto; }
                table { width: 100%; border-collapse: collapse; }
                th { text-align: left; padding: 1rem; background: #f8fafc; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); }
                td { padding: 1rem; border-bottom: 1px solid var(--surface-border); }
                .has-diff { background: rgba(var(--primary-rgb), 0.02); }

                @media (max-width: 768px) {
                    .action-cards { grid-template-columns: 1fr; }
                    .adjustment-container { padding: 0.5rem; }
                }
            `}</style>
        </div>
    );
}
