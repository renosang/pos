import db from "@/lib/db";
import Link from "next/link";
import { Plus } from "lucide-react";
import PurchaseList from "@/components/PurchaseList";

async function getPurchases() {
    return await db.purchase.findMany({
        include: {
            supplier: true,
            user: true,
            items: {
                include: {
                    productVariant: {
                        include: {
                            product: true
                        }
                    }
                }
            }
        },
        orderBy: { createdAt: "desc" }
    });
}

export default async function PurchasesPage() {
    const purchases = await getPurchases();

    return (
        <div className="animate-fade-in">
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 950, color: '#0f172a' }}>Đơn nhập hàng</h1>
                    <p style={{ color: '#64748b', marginTop: '0.25rem' }}>Quản lý các lô hàng nhập về kho từ nhà cung cấp</p>
                </div>
                <Link href="/purchases/new" className="btn btn-primary" style={{ gap: '0.75rem', padding: '0.75rem 1.5rem' }}>
                    <Plus size={20} /> Nhập hàng mới
                </Link>
            </header>

            <PurchaseList purchases={purchases} />

            <style dangerouslySetInnerHTML={{
                __html: `
                .hover-bg:hover { background: #f8fafc; }
                .badge-light {
                    background: #f1f5f9;
                    color: #475569;
                    padding: 0.25rem 0.75rem;
                    border-radius: 99px;
                    font-size: 0.75rem;
                    font-weight: 700;
                }
            `}} />
        </div>
    );
}
