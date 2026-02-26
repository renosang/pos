import { getProductById, getCategories } from "@/app/actions/product";
import ProductForm from "@/components/ProductForm";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const [product, categories] = await Promise.all([
        getProductById(id),
        getCategories()
    ]);

    if (!product) {
        notFound();
    }

    return (
        <div className="animate-fade-in">
            <header style={{ marginBottom: '2rem' }}>
                <Link href="/products" className="btn" style={{ padding: 0, marginBottom: '0.5rem', color: 'var(--primary)', background: 'transparent' }}>
                    ← Quay lại danh sách
                </Link>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h1 style={{ margin: 0 }}>Chỉnh sửa sản phẩm</h1>
                    <span style={{
                        fontSize: '0.875rem',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '20px',
                        background: product.status === 'ACTIVE' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        color: product.status === 'ACTIVE' ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)',
                        border: `1px solid ${product.status === 'ACTIVE' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
                    }}>
                        {product.status === 'ACTIVE' ? 'Đang hoạt động' : 'Ngưng hoạt động'}
                    </span>
                </div>
            </header>

            <ProductForm categories={categories} initialProduct={product} />
        </div>
    );
}
