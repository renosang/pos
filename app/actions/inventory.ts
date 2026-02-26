"use server";

import db from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getInventory() {
    const variants = await db.productVariant.findMany({
        include: {
            product: {
                include: {
                    category: true
                }
            },
            inventoryLedger: {
                orderBy: { createdAt: 'desc' },
                take: 10
            }
        }
    });

    return variants.map(v => ({
        ...v,
        productName: v.product.name,
        skuCode: v.product.skuCode, // Map SKU from Product to Variant
        categoryName: v.product.category?.name || "Lẻ",
        onHand: v.inventoryLedger.reduce((sum, entry) => sum + entry.changeQty, 0),
        defectiveQty: v.inventoryLedger.filter(l => l.type === "DEFECTIVE").reduce((sum, entry) => sum + Math.abs(entry.changeQty), 0),
        history: v.inventoryLedger
    }));
}

export async function adjustStock(variantId: string, changeQty: number, type: string, reason: string) {
    // 1. Get current balance
    const currentLedger = await db.inventoryLedger.findMany({
        where: { productVariantId: variantId }
    });
    const currentBalance = currentLedger.reduce((sum, l) => sum + l.changeQty, 0);

    // 2. Create new entry
    const newEntry = await db.inventoryLedger.create({
        data: {
            productVariantId: variantId,
            changeQty,
            balanceAfter: currentBalance + changeQty,
            type: type as any,
            reason
        }
    });

    revalidatePath("/inventory");
    return newEntry;
}

export async function updateVariantInfo(id: string, data: { location?: string, minStock?: number }) {
    const updated = await db.productVariant.update({
        where: { id },
        data: {
            location: data.location,
            minStock: data.minStock
        }
    });
    revalidatePath("/inventory");
    return updated;
}

export async function getInventoryTemplate() {
    // ... (logic from before)
    const variants = await db.productVariant.findMany({
        include: {
            product: true,
            inventoryLedger: true
        }
    });

    const headers = ["ID Biến thể", "Tên sản phẩm", "Màu sắc", "Kích cỡ", "Barcode", "Tồn hiện tại", "Tồn thực đo"];
    const rows = variants.map(v => {
        const onHand = v.inventoryLedger.reduce((sum, entry) => sum + entry.changeQty, 0);
        return [
            v.id,
            v.product.name,
            v.color || "",
            v.size || "",
            v.barcode || "",
            onHand.toString(),
            ""
        ];
    });

    return {
        headers,
        data: rows
    };
}

export async function processBulkAdjustment(adjustments: any[]) {
    for (const adj of adjustments) {
        const counted = parseInt(adj.countedQty);
        const system = parseInt(adj.systemQty);
        const diff = counted - system;

        if (diff === 0) continue;

        await db.inventoryLedger.create({
            data: {
                productVariantId: adj.variantId,
                changeQty: diff,
                balanceAfter: counted,
                type: "ADJUSTMENT",
                reason: adj.reason || "Kiểm kê định kỳ (Import CSV)",
            }
        });
    }

    revalidatePath("/inventory");
    revalidatePath("/products");
    return { success: true };
}
