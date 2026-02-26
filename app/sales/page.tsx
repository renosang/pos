import { getSales } from "@/app/actions/sale";
import SalesList from "@/components/SalesList";

export default async function SalesPage() {
    const sales = await getSales();

    return (
        <div className="animate-fade-in">
            <header style={{ marginBottom: '2rem' }}>
                <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 950 }}>Hóa đơn & Giao dịch</h1>
                <p style={{ color: '#64748b', marginTop: '0.25rem' }}>Quản lý lịch sử bán hàng và hoàn trả</p>
            </header>

            <SalesList sales={sales || []} />
        </div>
    );
}
