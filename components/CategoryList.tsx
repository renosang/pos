"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

export default function CategoryList({ categories }: { categories: any[] }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<any>(null);

    const filteredCategories = useMemo(() => {
        if (!searchTerm.trim()) return categories;
        return categories.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [categories, searchTerm]);

    return (
        <div className="animate-fade-in">
            <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
                <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>🔍</span>
                    <input
                        className="input"
                        placeholder="Tìm kiếm nhóm sản phẩm..."
                        style={{ paddingLeft: '2.5rem' }}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="category-grid">
                {filteredCategories.map((cat) => (
                    <div key={cat.id} className="glass-card cat-card">
                        <div className="cat-header">
                            <div>
                                <h3 style={{ margin: 0 }}>{cat.name}</h3>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                                    {cat.products?.length || 0} sản phẩm trong nhóm
                                </p>
                            </div>
                            <span className="cat-icon">📁</span>
                        </div>

                        <div className="cat-actions" style={{ marginTop: '1.5rem', display: 'flex', gap: '0.5rem' }}>
                            <Link href={`/products?category=${cat.id}`} className="btn-light" style={{ flex: 1 }}>
                                Xem sản phẩm
                            </Link>
                            <button className="btn-light" onClick={() => setSelectedCategory(cat)}>
                                Biến động
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <style jsx>{`
                .category-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                    gap: 1.5rem;
                }
                .cat-card {
                    transition: all 0.2s;
                    cursor: pointer;
                    border: 1px solid transparent;
                }
                .cat-card:hover {
                    border-color: var(--primary);
                    transform: translateY(-4px);
                    box-shadow: 0 12px 24px rgba(0,0,0,0.05);
                }
                .cat-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                }
                .cat-icon {
                    font-size: 1.5rem;
                    background: var(--background);
                    padding: 0.5rem;
                    border-radius: 12px;
                }
                .btn-light {
                    background: var(--background);
                    border: 1px solid var(--surface-border);
                    color: var(--text);
                    padding: 0.5rem;
                    border-radius: 8px;
                    text-align: center;
                    text-decoration: none;
                    font-size: 0.8rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: 0.2s;
                }
                .btn-light:hover {
                    background: var(--surface-border);
                    border-color: var(--text-muted);
                }
            `}</style>
        </div>
    );
}
