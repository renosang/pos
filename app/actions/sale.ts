"use server";

import db from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function processSale(formData: any) {
    const { customerId, items, paymentMethod, discountTotal, subTotal, grandTotal, userId } = formData;

    const sale = await db.$transaction(async (tx) => {
        // 1. Create Sale
        const newSale = await tx.sale.create({
            data: {
                orderCode: `S-${Date.now()}`,
                userId,
                customerId: customerId || null,
                paymentMethod,
                subTotal: parseFloat(subTotal),
                discountTotal: parseFloat(discountTotal),
                grandTotal: parseFloat(grandTotal),
                items: {
                    create: items.map((item: any) => ({
                        productVariantId: item.variantId,
                        quantity: item.quantity,
                        unitPrice: parseFloat(item.price),
                        lineTotal: parseFloat(item.price) * item.quantity
                    }))
                }
            }
        });

        // 2. Update Inventory for each item
        for (const item of items) {
            const lastLedger = await tx.inventoryLedger.findFirst({
                where: { productVariantId: item.variantId },
                orderBy: { createdAt: "desc" }
            });

            const currentBalance = lastLedger?.balanceAfter || 0;

            await tx.inventoryLedger.create({
                data: {
                    productVariantId: item.variantId,
                    changeQty: -item.quantity,
                    balanceAfter: currentBalance - item.quantity,
                    type: "SALE",
                    relatedId: newSale.id
                }
            });
        }

        // 3. Log Activity
        await tx.activityLog.create({
            data: {
                userId,
                action: `đã tạo đơn hàng ${newSale.orderCode}`,
                module: "Bán hàng",
                details: { orderCode: newSale.orderCode, total: Number(grandTotal) }
            }
        });

        return newSale;
    });

    revalidatePath("/inventory");
    revalidatePath("/pos");
    return sale;
}

export async function processReturn(saleId: string, reason: string) {
    const sale = await db.$transaction(async (tx) => {
        // 1. Get original sale with items
        const originalSale = await tx.sale.findUnique({
            where: { id: saleId as any },
            include: { items: true }
        });

        if (!originalSale) throw new Error("Không tìm thấy hóa đơn");
        const saleObj = originalSale as any;
        if (saleObj.status === "REFUNDED") throw new Error("Hóa đơn này đã được trả hàng trước đó");

        // 2. Mark sale as REFUNDED
        const updatedSale = await tx.sale.update({
            where: { id: saleId as any },
            data: { status: "REFUNDED", note: reason }
        });

        // 3. Restore inventory for each item
        for (const item of saleObj.items) {
            const lastLedger = await tx.inventoryLedger.findFirst({
                where: { productVariantId: item.productVariantId as any },
                orderBy: { createdAt: "desc" }
            });

            const currentBalance = lastLedger?.balanceAfter || 0;

            await tx.inventoryLedger.create({
                data: {
                    productVariantId: item.productVariantId,
                    changeQty: item.quantity,
                    balanceAfter: currentBalance + item.quantity,
                    type: "RETURN",
                    relatedId: saleId as any,
                    reason: `Trả hàng: ${reason}`
                }
            });
        }

        // 4. Log Activity
        await tx.activityLog.create({
            data: {
                userId: originalSale.userId,
                action: `đã xử lý trả hàng cho đơn ${originalSale.orderCode}`,
                module: "Trả hàng",
                details: { orderCode: originalSale.orderCode, reason }
            }
        });

        return updatedSale;
    });

    revalidatePath("/inventory");
    revalidatePath("/pos");
    revalidatePath("/reports");
    return sale;
}

export async function getSales() {
    return await db.sale.findMany({
        include: {
            user: {
                select: { username: true }
            },
            customer: {
                select: { name: true, phone: true }
            },
            items: {
                include: {
                    productVariant: {
                        include: {
                            product: true
                        }
                    }
                }
            }
        },
        orderBy: { soldAt: "desc" }
    });
}
