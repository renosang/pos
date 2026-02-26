import { getCategories } from "@/app/actions/product";
import CategoryList from "@/components/CategoryList";

export default async function CategoriesPage() {
    const categories = await getCategories();

    return (
        <div className="animate-fade-in">
            <header style={{ marginBottom: '2rem' }}>
                <h1 style={{ margin: 0 }}>Nhóm sản phẩm</h1>
                <p style={{ color: 'var(--text-muted)' }}>Phân loại và tổ chức danh mục hàng hóa</p>
            </header>

            <CategoryList categories={categories} />
        </div>
    );
}
