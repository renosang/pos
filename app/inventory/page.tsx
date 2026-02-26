import { getInventory } from "@/app/actions/inventory";
import InventoryList from "@/components/InventoryList";

export default async function InventoryPage() {
    const inventory = await getInventory();

    return (
        <div className="animate-fade-in">
            <header className="page-header">
                <div className="header-content">
                    <h1 className="page-title">Quản lý kho hàng</h1>
                    <p className="welcome-text">Theo dõi tồn kho và điều chỉnh hàng hóa</p>
                </div>
            </header>

            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', marginBottom: '2rem' }}>
                <div className="glass-card">
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Tổng SKU trong kho</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{inventory.length}</div>
                </div>
                <div className="glass-card">
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>SKU thấp dưới ngưỡng</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--danger)' }}>
                        {inventory.filter(i => i.onHand < i.minStock).length}
                    </div>
                </div>
            </div>

            <InventoryList inventory={inventory} />
        </div>
    );
}
