import { Suspense } from "react";
import { getProducts } from "@/app/actions/product";
import POSClient from "@/components/POSClient";
import { auth } from "@/auth";

export default async function POSPage() {
    const products = await getProducts("ACTIVE");
    const session = await auth();
    const userId = session?.user?.id || "mock-user-id";

    return (
        <div className="animate-fade-in">
            <header className="page-header">
                <div className="header-content">
                    <h1 className="page-title">Bán hàng (POS)</h1>
                </div>
            </header>

            <Suspense fallback={<div>Đang tải...</div>}>
                <POSClient products={products} userId={userId} />
            </Suspense>
        </div>
    );
}
