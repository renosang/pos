import db from "@/lib/db";
import { auth } from "@/auth";
import PurchaseClient from "@/components/PurchaseClient";
import { redirect } from "next/navigation";

export default async function NewPurchasePage() {
    const session = await auth();
    if (!session?.user?.id) redirect("/login");

    const [suppliers, variants, categories] = await Promise.all([
        db.supplier.findMany({ orderBy: { name: 'asc' } }),
        db.productVariant.findMany({
            include: {
                product: {
                    select: { name: true }
                }
            }
        }),
        db.category.findMany({ orderBy: { name: 'asc' } })
    ]);

    return (
        <PurchaseClient
            suppliers={suppliers}
            variants={variants}
            categories={categories}
            userId={session.user.id}
        />
    );
}
