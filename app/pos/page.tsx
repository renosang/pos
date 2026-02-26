import { getProducts } from "@/app/actions/product";
import POSClient from "@/components/POSClient";
import { auth } from "@/auth";

export default async function POSPage() {
    const products = await getProducts("ACTIVE");
    const session = await auth();
    const userId = session?.user?.id || "mock-user-id";

    return (
        <div className="animate-fade-in">
            <header style={{ marginBottom: '1rem' }}>
                <h1 style={{ margin: 0 }}>Bán hàng (POS)</h1>
            </header>

            <POSClient products={products} userId={userId} />
        </div>
    );
}
