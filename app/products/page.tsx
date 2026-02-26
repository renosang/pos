import { getProducts } from "@/app/actions/product";
import Link from "next/link";
import ProductList from "@/components/ProductList";

export default async function ProductsPage() {
    const products = await getProducts();

    return (
        <div className="animate-fade-in">
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ margin: 0 }}>Kho sản phẩm</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Quản lý danh sách sản phẩm và biến thể</p>
                </div>
            </header>

            <ProductList products={products} />
        </div>
    );
}
