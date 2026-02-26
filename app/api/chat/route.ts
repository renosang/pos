// @ts-nocheck
import { google } from "@ai-sdk/google";
import { streamText, tool } from "ai";
import { z as zod } from "zod";
import db from "@/lib/db";

export const maxDuration = 30;

export async function POST(req: Request) {
    const { messages } = await req.json();

    const result = await streamText({
        model: google("gemini-2.0-flash-exp") as any,
        system: `Bạn là trợ lý ảo cho cửa hàng quần áo ShopReact. 
    Nhiệm vụ:
    1. Hỗ trợ tạo đơn hàng nhanh bằng ngôn ngữ tự nhiên (VD: "Áo thun trắng size M 2 cái, giảm 50k").
    2. Tư vấn chiến lược kinh doanh dựa trên dữ liệu (bạn có thể truy cập kho hàng thông qua tools).
    3. Trả lời thân thiện, chuyên nghiệp.
    
    Khi người dùng muốn tạo đơn, hãy dùng tool resolve_products để tìm đúng variantId.`,
        messages,
        tools: {
            resolve_products: tool({
                description: "Tìm kiếm sản phẩm trong database dựa trên từ khóa",
                // @ts-ignore - Bỏ qua lỗi type không xác định của zod trong môi trường build
                parameters: zod.object({
                    query: zod.string().description("Tên sản phẩm, màu hoặc kích cỡ"),
                }),
                execute: async ({ query }: any) => {
                    const variants = await db.productVariant.findMany({
                        where: {
                            OR: [
                                { skuCode: { contains: query as string } },
                                { color: { contains: query as string } },
                                { size: { contains: query as string } },
                                { product: { name: { contains: query as string } } }
                            ]
                        },
                        include: { product: true },
                        take: 5
                    });
                    return variants;
                }
            }),
            get_business_stats: tool({
                description: "Lấy số liệu kinh doanh tổng hợp",
                parameters: zod.object({}),
                execute: async () => {
                    const stats = await db.sale.aggregate({
                        _sum: { grandTotal: true },
                        _count: { id: true }
                    });
                    return stats;
                }
            })
        }
    });

    return result.toDataStreamResponse();
}
