"use server";

import db from "@/lib/db";

export async function getOrders() {
    return await db.sale.findMany({
        include: {
            customer: true,
            user: true,
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
