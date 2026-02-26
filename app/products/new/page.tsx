import { getCategories } from "@/app/actions/product";
import ProductForm from "@/components/ProductForm";
import Link from "next/link";

export default async function NewProductPage() {
    const categories = await getCategories();

    return (
        <div className="animate-fade-in">
            <header style={{ marginBottom: '2rem' }}>
                <Link href="/products" className="btn" style={{ padding: 0, marginBottom: '0.5rem', color: 'var(--primary)', background: 'transparent' }}>
                    ← Quay lại danh sách
                </Link>
                <h1 style={{ margin: 0 }}>Thêm sản phẩm mới</h1>
                <p style={{ color: 'var(--text-muted)' }}>Nhập thông tin sản phẩm và các thuộc tính biến thể</p>
            </header>

            <ProductForm categories={categories} />
        </div>
    );
}
