"use server";

import db from "@/lib/db";


export async function getDashboardMetrics() {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - todayStart.getDay());
    const lastWeekStart = new Date(weekStart);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);

    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(monthStart);
    lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);

    const [
        allSalesToday,
        completedSalesToday,
        refundsProcessedToday,
        salesHourly,
        paymentMethods,
        topSalesData,
        revenueWeeklyNet,
        revenueLastWeekNet,
        revenueMonthlyNet,
        revenueLastMonthNet,
        lowStockCount,
        recentActivities
    ] = await Promise.all([
        // 1. All Sales Sold Today (Volume for return rate)
        db.sale.findMany({
            where: { soldAt: { gte: todayStart } },
            select: { id: true, status: true, grandTotal: true }
        }),
        // 2. Completed Sales Today with Items (for Profit)
        db.sale.findMany({
            where: { soldAt: { gte: todayStart }, status: "COMPLETED" },
            include: { items: { include: { productVariant: true } } }
        }),
        // 3. Refunds Processed Today
        db.sale.count({
            where: { updatedAt: { gte: todayStart }, status: "REFUNDED" }
        }),
        // 4. Hourly Data
        db.sale.findMany({
            where: { soldAt: { gte: todayStart }, status: "COMPLETED" },
            select: { soldAt: true, grandTotal: true }
        }),
        // 5. Payment Methods (COMPLETED only)
        db.sale.groupBy({
            by: ['paymentMethod'],
            where: { soldAt: { gte: todayStart }, status: "COMPLETED" },
            _sum: { grandTotal: true },
            _count: { id: true }
        }),
        // 6. Top Products Today
        db.saleItem.groupBy({
            by: ['productVariantId'],
            where: { sale: { soldAt: { gte: todayStart }, status: "COMPLETED" } },
            _sum: { quantity: true, lineTotal: true },
            orderBy: { _sum: { quantity: 'desc' } },
            take: 5
        }),
        // 7. Comparisons (Net Revenue)
        db.sale.aggregate({
            where: { soldAt: { gte: weekStart }, status: "COMPLETED" },
            _sum: { grandTotal: true }
        }),
        db.sale.aggregate({
            where: { soldAt: { gte: lastWeekStart, lt: weekStart }, status: "COMPLETED" },
            _sum: { grandTotal: true }
        }),
        db.sale.aggregate({
            where: { soldAt: { gte: monthStart }, status: "COMPLETED" },
            _sum: { grandTotal: true }
        }),
        db.sale.aggregate({
            where: { soldAt: { gte: lastMonthStart, lt: monthStart }, status: "COMPLETED" },
            _sum: { grandTotal: true }
        }),
        // 8. Low Stock
        db.productVariant.count({
            where: { inventoryLedger: { some: { balanceAfter: { lt: 5 } } } }
        }),
        // 9. Recent Activity
        db.activityLog.findMany({
            take: 10,
            orderBy: { createdAt: 'desc' },
            include: { user: { select: { username: true } } }
        })
    ]);

    // 10. Process Profit & Revenue Today
    let netRevenueToday = 0;
    let totalCostToday = 0;
    completedSalesToday.forEach(sale => {
        netRevenueToday += Number(sale.grandTotal);
        sale.items.forEach((item: any) => {
            totalCostToday += item.quantity * Number(item.productVariant.costPrice || 0);
        });
    });

    // 11. Hourly History for chart
    const hourlyMap = new Array(24).fill(0).map((_, i) => ({ hour: `${i}h`, revenue: 0 }));
    salesHourly.forEach(s => {
        const hour = s.soldAt.getHours();
        hourlyMap[hour].revenue += Number(s.grandTotal);
    });

    // 12. Resolve top products
    const topProducts = await Promise.all(topSalesData.map(async (p) => {
        const variant = await db.productVariant.findUnique({
            where: { id: p.productVariantId as any },
            include: { product: true }
        });
        return {
            name: `${variant?.product.name} (${variant?.color}/${variant?.size})`,
            quantity: p._sum.quantity || 0,
            revenue: Number(p._sum.lineTotal || 0)
        };
    }));

    return {
        revenueToday: netRevenueToday,
        profitToday: netRevenueToday - totalCostToday,
        ordersToday: allSalesToday.length,
        returnsToday: refundsProcessedToday,
        hourlyHistory: hourlyMap,
        paymentStats: paymentMethods.map(p => ({
            name: p.paymentMethod === 'CASH' ? 'Tiền mặt' : 'Chuyển khoản',
            value: Number(p._sum.grandTotal || 0),
            count: p._count.id
        })),
        topProducts,
        comparisons: {
            weekly: {
                current: Number(revenueWeeklyNet._sum.grandTotal || 0),
                previous: Number(revenueLastWeekNet._sum.grandTotal || 0)
            },
            monthly: {
                current: Number(revenueMonthlyNet._sum.grandTotal || 0),
                previous: Number(revenueLastMonthNet._sum.grandTotal || 0)
            }
        },
        lowStockCount,
        recentActivities
    };
}
