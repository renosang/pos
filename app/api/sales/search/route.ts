import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");

    if (!code) return NextResponse.json({ success: false }, { status: 400 });

    try {
        const sale = await db.sale.findUnique({
            where: { orderCode: code },
            include: {
                items: {
                    include: {
                        productVariant: {
                            include: {
                                product: true
                            }
                        }
                    }
                }
            }
        });

        if (!sale) return NextResponse.json({ success: false }, { status: 404 });

        return NextResponse.json({ success: true, sale });
    } catch (err) {
        return NextResponse.json({ success: false }, { status: 500 });
    }
}
