"use server";

import db from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getProducts(status?: string) {
    const products = await db.product.findMany({
        where: status ? { status } : {},
        include: {
            category: true,
            variants: {
                include: {
                    inventoryLedger: true
                }
            },
        },
        orderBy: { createdAt: "desc" },
    });

    return products.map(p => ({
        ...p,
        totalStock: p.variants.reduce((sum, v) =>
            sum + v.inventoryLedger.reduce((vSum, entry) => vSum + entry.changeQty, 0), 0
        ),
        variants: p.variants.map(v => ({
            ...v,
            onHand: v.inventoryLedger.reduce((vSum, entry) => vSum + entry.changeQty, 0),
            inventoryLedger: undefined
        }))
    }));
}

export async function getProductById(id: string) {
    return await db.product.findUnique({
        where: { id: id as any },
        include: {
            category: true,
            variants: true,
        },
    });
}

export async function getCategories() {
    return await db.category.findMany({
        include: {
            products: {
                select: { id: true }
            }
        }
    });
}

export async function createProduct(formData: any) {
    const { name, skuCode, categoryId, brand, description, variants, images } = formData;

    const product = await db.product.create({
        data: {
            name,
            skuCode,
            categoryId: categoryId as any,
            brand,
            description,
            images,
            variants: {
                create: variants.map((v: any) => ({
                    barcode: v.barcode,
                    color: v.color,
                    size: v.size,
                    costPrice: Number(v.costPrice),
                    salePrice: Number(v.salePrice),
                    minStock: Number(v.minStock || 5),
                })),
            },
        },
        include: { variants: true }
    });

    // Handle initial stock for each variant
    for (const vData of variants) {
        const initStock = Number(vData.initStock || 0);
        if (initStock > 0) {
            const createdVariant = product.variants.find(pv =>
                pv.color === vData.color && pv.size === vData.size && pv.barcode === vData.barcode
            );
            if (createdVariant) {
                await db.inventoryLedger.create({
                    data: {
                        productVariantId: createdVariant.id,
                        changeQty: initStock,
                        balanceAfter: initStock,
                        type: "ADJUSTMENT",
                        reason: "Tồn kho ban đầu",
                    }
                });
            }
        }
    }

    revalidatePath("/products");
    return product;
}

export async function createCategory(name: string) {
    const category = await db.category.create({
        data: { name },
    });
    revalidatePath("/products");
    return category;
}

export async function updateProduct(id: string, formData: any) {
    const { name, skuCode, categoryId, brand, description, variants, images, status } = formData;

    const product = await db.product.update({
        where: { id: id as any },
        data: {
            name,
            skuCode,
            categoryId: categoryId as any,
            brand,
            description,
            images,
            status,
        },
    });

    // Handle variants surgery
    const currentVariants = await db.productVariant.findMany({ where: { productId: id as any } });
    const variantIdsToKeep = variants.filter((v: any) => v.id).map((v: any) => v.id);

    // 1. Delete variants not in the form (and their ledger history)
    const variantsToRemove = currentVariants.filter(cv => !variantIdsToKeep.includes(cv.id));
    for (const v of variantsToRemove) {
        await db.inventoryLedger.deleteMany({ where: { productVariantId: v.id } });
        await db.productVariant.delete({ where: { id: v.id } });
    }

    // 2. Upsert variants
    for (const v of variants) {
        if (v.id) {
            await db.productVariant.update({
                where: { id: v.id },
                data: {
                    barcode: v.barcode,
                    color: v.color,
                    size: v.size,
                    costPrice: Number(v.costPrice),
                    salePrice: Number(v.salePrice),
                    minStock: Number(v.minStock || 5),
                }
            });
        } else {
            const newV = await db.productVariant.create({
                data: {
                    productId: id as any,
                    barcode: v.barcode,
                    color: v.color,
                    size: v.size,
                    costPrice: Number(v.costPrice),
                    salePrice: Number(v.salePrice),
                    minStock: Number(v.minStock || 5),
                }
            });

            if (Number(v.initStock) > 0) {
                await db.inventoryLedger.create({
                    data: {
                        productVariantId: newV.id,
                        changeQty: Number(v.initStock),
                        balanceAfter: Number(v.initStock),
                        type: "ADJUSTMENT",
                        reason: "Tồn kho ban đầu (Cập nhật sản phẩm)",
                    }
                });
            }
        }
    }

    revalidatePath("/products");
    revalidatePath(`/products/${id}`);
    return product;
}

export async function deleteProduct(id: string) {
    // Delete related ledger entries first due to MongoDB referential constraints (if any) or shared logic
    const variants = await db.productVariant.findMany({ where: { productId: id as any } });
    for (const v of variants) {
        await db.inventoryLedger.deleteMany({ where: { productVariantId: v.id } });
    }

    await db.productVariant.deleteMany({ where: { productId: id as any } });
    await db.product.delete({ where: { id: id as any } });

    revalidatePath("/products");
    return { success: true };
}

export async function toggleProductStatus(id: string, currentStatus: string) {
    const newStatus = currentStatus === "ACTIVE" ? "ARCHIVED" : "ACTIVE";
    await db.product.update({
        where: { id: id as any },
        data: { status: newStatus }
    });
    revalidatePath("/products");
    return { success: true };
}

export async function importProductsFromCSV(productsData: any[]) {
    // Basic bulk import logic
    // Expects: [{ name, skuCode, categoryName, brand, color, size, barcode, costPrice, salePrice, initStock }]
    for (const data of productsData) {
        let category = await db.category.findUnique({ where: { name: data.categoryName } });
        if (!category) {
            category = await db.category.create({ data: { name: data.categoryName } });
        }

        let product = await db.product.findUnique({
            where: { skuCode: data.skuCode },
            include: { variants: true }
        });

        if (!product) {
            product = await db.product.create({
                data: {
                    name: data.name,
                    skuCode: data.skuCode,
                    brand: data.brand,
                    categoryId: category.id,
                    variants: {
                        create: [{
                            barcode: data.barcode,
                            color: data.color,
                            size: data.size,
                            costPrice: Number(data.costPrice || 0),
                            salePrice: Number(data.salePrice || 0),
                        }]
                    }
                },
                include: { variants: true }
            });

            // Handle init stock for new product variant
            const variantId = product.variants[0].id;
            const initStock = Number(data.initStock || 0);
            if (initStock > 0) {
                await db.inventoryLedger.create({
                    data: {
                        productVariantId: variantId,
                        changeQty: initStock,
                        balanceAfter: initStock,
                        type: "ADJUSTMENT",
                        reason: "Import CSV",
                    }
                });
            }
        } else {
            // Check if variant already exists
            const existingVariant = product.variants.find(v => v.color === data.color && v.size === data.size);
            if (!existingVariant) {
                const newVariant = await db.productVariant.create({
                    data: {
                        productId: product.id,
                        barcode: data.barcode,
                        color: data.color,
                        size: data.size,
                        costPrice: Number(data.costPrice || 0),
                        salePrice: Number(data.salePrice || 0),
                    }
                });

                const initStock = Number(data.initStock || 0);
                if (initStock > 0) {
                    await db.inventoryLedger.create({
                        data: {
                            productVariantId: newVariant.id,
                            changeQty: initStock,
                            balanceAfter: initStock,
                            type: "ADJUSTMENT",
                            reason: "Import CSV (New Variant)",
                        }
                    });
                }
            }
        }
    }
    revalidatePath("/products");
    return { success: true };
}

export async function getProductStockSummary(productId: string) {
    const product = await db.product.findUnique({
        where: { id: productId as any },
        include: {
            category: true,
            variants: {
                include: {
                    inventoryLedger: true
                }
            }
        }
    }) as any;

    if (!product) return null;

    const variantsWithStock = product.variants.map((v: any) => {
        const onHand = v.inventoryLedger.reduce((sum: number, entry: any) => sum + entry.changeQty, 0);
        return {
            ...v,
            onHand
        };
    });

    return {
        ...product,
        variants: variantsWithStock,
        totalStock: variantsWithStock.reduce((sum: number, v: any) => sum + v.onHand, 0)
    };
}
