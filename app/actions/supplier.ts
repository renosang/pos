"use server";

import db from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getSuppliers() {
    return await db.supplier.findMany();
}

export async function createSupplier(data: any) {
    const supplier = await db.supplier.create({ data });
    revalidatePath("/suppliers");
    return supplier;
}

export async function updateSupplier(id: string, data: any) {
    const supplier = await db.supplier.update({
        where: { id: id as any },
        data
    });
    revalidatePath("/suppliers");
    return supplier;
}
