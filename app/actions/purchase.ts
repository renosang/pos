"use server";

import db from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function createPurchase(data: any) {
    const { supplierId, items, userId, grandTotal } = data;

    const purchase = await db.$transaction(async (tx) => {
        const newPurchase = await tx.purchase.create({
            data: {
                purchaseCode: `P-${Date.now()}`,
                supplierId,
                userId,
                subTotal: parseFloat(grandTotal), // Simplified for now
                grandTotal: parseFloat(grandTotal),
                items: {
                    create: items.map((item: any) => ({
                        productVariantId: item.variantId,
                        quantity: item.quantity,
                        unitCost: parseFloat(item.cost),
                        lineTotal: parseFloat(item.cost) * item.quantity
                    }))
                }
            }
        });

        for (const item of items) {
            const lastLedger = await tx.inventoryLedger.findFirst({
                where: { productVariantId: item.variantId },
                orderBy: { createdAt: "desc" }
            });

            const currentBalance = lastLedger?.balanceAfter || 0;

            // Update Inventory Ledger
            await tx.inventoryLedger.create({
                data: {
                    productVariantId: item.variantId,
                    changeQty: item.quantity,
                    balanceAfter: currentBalance + item.quantity,
                    type: "PURCHASE",
                    relatedId: newPurchase.id
                }
            });

            // Automatically update costPrice in ProductVariant to the latest purchase price
            await tx.productVariant.update({
                where: { id: item.variantId },
                data: { costPrice: parseFloat(item.cost) }
            });
        }

        return newPurchase;
    });

    revalidatePath("/inventory");
    revalidatePath("/products");
    revalidatePath("/purchases");
    return purchase;
}
