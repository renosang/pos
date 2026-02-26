"use server";

import db from "@/lib/db";

export async function getDashboardMetrics() {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);

    const lastWeekSameDayStart = new Date(todayStart);
    lastWeekSameDayStart.setDate(lastWeekSameDayStart.getDate() - 7);
    const lastWeekSameDayEnd = new Date(lastWeekSameDayStart);
    lastWeekSameDayEnd.setDate(lastWeekSameDayEnd.getDate() + 1);

    const sevenDaysAgoStart = new Date(todayStart);
    sevenDaysAgoStart.setDate(sevenDaysAgoStart.getDate() - 6); // Last 7 days including today

    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - todayStart.getDay());
    const lastWeekStart = new Date(weekStart);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);

    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(monthStart);
    lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);

    const [
        salesToday,
        salesYesterday,
        salesLastWeekSameDay,
        salesHeatmap,
        paymentMethodsToday,
        paymentMethodsYesterday,
        refundedItemsToday,
        refundedItemsYesterday,
        topSalesData,
        revenueWeeklyNet,
        revenueLastWeekNet,
        ordersWeekly,
        ordersLastWeek,
        revenueMonthlyNet,
        revenueLastMonthNet,
        lowStockCount,
        recentActivities
    ] = await Promise.all([
        // 1. Sales Today (Revenue & Orders hourly)
        db.sale.findMany({
            where: { soldAt: { gte: todayStart }, status: "COMPLETED" },
            select: { soldAt: true, grandTotal: true }
        }),
        // 2. Sales Yesterday
        db.sale.findMany({
            where: { soldAt: { gte: yesterdayStart, lt: todayStart }, status: "COMPLETED" },
            select: { soldAt: true, grandTotal: true }
        }),
        // 3. Sales Last Week Same Day
        db.sale.findMany({
            where: { soldAt: { gte: lastWeekSameDayStart, lt: lastWeekSameDayEnd }, status: "COMPLETED" },
            select: { soldAt: true, grandTotal: true }
        }),
        // 4. Heatmap Data (Last 7 days)
        db.sale.findMany({
            where: { soldAt: { gte: sevenDaysAgoStart }, status: "COMPLETED" },
            select: { soldAt: true, grandTotal: true }
        }),
        // 5. Payment Methods Net Today
        db.sale.groupBy({
            by: ['paymentMethod'],
            where: { soldAt: { gte: todayStart }, status: "COMPLETED" },
            _sum: { grandTotal: true },
            _count: { id: true }
        }),
        // 5.1 Payment Methods Net Yesterday
        db.sale.groupBy({
            by: ['paymentMethod'],
            where: { soldAt: { gte: yesterdayStart, lt: todayStart }, status: "COMPLETED" },
            _sum: { grandTotal: true },
            _count: { id: true }
        }),
        // 6. Detailed Refunded Sales Today (processed today)
        db.sale.findMany({
            where: { updatedAt: { gte: todayStart }, status: "REFUNDED" },
            include: { items: { include: { productVariant: true } } }
        }),
        // 6.1 Detailed Refunded Sales Yesterday
        db.sale.findMany({
            where: { updatedAt: { gte: yesterdayStart, lt: todayStart }, status: "REFUNDED" },
            include: { items: { include: { productVariant: true } } }
        }),
        // 7. Top Products Today
        db.saleItem.groupBy({
            by: ['productVariantId'],
            where: { sale: { soldAt: { gte: todayStart }, status: "COMPLETED" } },
            _sum: { quantity: true, lineTotal: true },
            orderBy: { _sum: { quantity: 'desc' } },
            take: 5
        }),
        // 8. Weekly/Monthly Comparisons
        db.sale.aggregate({ where: { soldAt: { gte: weekStart }, status: "COMPLETED" }, _sum: { grandTotal: true } }),
        db.sale.aggregate({ where: { soldAt: { gte: lastWeekStart, lt: weekStart }, status: "COMPLETED" }, _sum: { grandTotal: true } }),
        db.sale.count({ where: { soldAt: { gte: weekStart }, status: "COMPLETED" } }),
        db.sale.count({ where: { soldAt: { gte: lastWeekStart, lt: weekStart }, status: "COMPLETED" } }),
        db.sale.aggregate({ where: { soldAt: { gte: monthStart }, status: "COMPLETED" }, _sum: { grandTotal: true } }),
        db.sale.aggregate({ where: { soldAt: { gte: lastMonthStart, lt: monthStart }, status: "COMPLETED" }, _sum: { grandTotal: true } }),
        // 9. Low Stock & Activity
        db.productVariant.count({ where: { inventoryLedger: { some: { balanceAfter: { lt: 5 } } } } }),
        db.activityLog.findMany({ take: 10, orderBy: { createdAt: 'desc' }, include: { user: { select: { username: true } } } })
    ]);

    // Profit calculation today & yesterday
    const [salesItemsToday, salesItemsYesterday] = await Promise.all([
        db.sale.findMany({
            where: { soldAt: { gte: todayStart }, status: "COMPLETED" },
            include: { items: { include: { productVariant: true } } }
        }),
        db.sale.findMany({
            where: { soldAt: { gte: yesterdayStart, lt: todayStart }, status: "COMPLETED" },
            include: { items: { include: { productVariant: true } } }
        })
    ]);

    // NEW LOGIC: Revenue = (COMPLETED today) - (REFUNDED today NOT sold today)
    let revenueTodayNet = 0;
    salesItemsToday.forEach((s: any) => revenueTodayNet += s.grandTotal);
    (refundedItemsToday as any[] || []).forEach((s: any) => {
        if (s.soldAt < todayStart) revenueTodayNet -= s.grandTotal;
    });

    let revenueYesterdayNet = 0;
    salesItemsYesterday.forEach((s: any) => revenueYesterdayNet += s.grandTotal);
    (refundedItemsYesterday as any[] || []).forEach((s: any) => {
        if (s.soldAt < yesterdayStart) revenueYesterdayNet -= s.grandTotal;
    });

    // Profit logic follows the same net performance rule
    const calcProfit = (sales: any[], refunds: any[], periodStart: Date) => {
        let totalProfit = 0;
        sales.forEach((sale: any) => {
            let cost = 0;
            sale.items.forEach((item: any) => {
                cost += item.quantity * (item.productVariant.costPrice || 0);
            });
            totalProfit += (sale.grandTotal - cost);
        });
        (refunds as any[] || []).forEach((sale: any) => {
            if (sale.soldAt < periodStart) {
                let cost = 0;
                sale.items.forEach((item: any) => {
                    cost += item.quantity * (item.productVariant.costPrice || 0);
                });
                totalProfit -= (sale.grandTotal - cost);
            }
        });
        return totalProfit;
    };

    const profitToday = calcProfit(salesItemsToday, refundedItemsToday, todayStart);
    const profitYesterday = calcProfit(salesItemsYesterday, refundedItemsYesterday, yesterdayStart);

    const returnsTodayProcessed = refundedItemsToday.length;
    const returnsYesterdayProcessed = refundedItemsYesterday.length;

    // Hourly History Analysis (Revenue & Orders) remains similar but uses sales data
    const hourlyMap = new Array(24).fill(0).map((_, i) => ({
        hour: `${i}h`,
        todayRevenue: 0, todayOrders: 0,
        yesterdayRevenue: 0, yesterdayOrders: 0,
        lastWeekRevenue: 0, lastWeekOrders: 0
    }));

    salesToday.forEach(s => { const h = s.soldAt.getHours(); hourlyMap[h].todayRevenue += Number(s.grandTotal); hourlyMap[h].todayOrders += 1; });
    salesYesterday.forEach(s => { const h = s.soldAt.getHours(); hourlyMap[h].yesterdayRevenue += Number(s.grandTotal); hourlyMap[h].yesterdayOrders += 1; });
    salesLastWeekSameDay.forEach(s => { const h = s.soldAt.getHours(); hourlyMap[h].lastWeekRevenue += Number(s.grandTotal); hourlyMap[h].lastWeekOrders += 1; });

    // Payment Stats (Today only) adjusted for previous day returns
    const netPaymentMapToday = new Map();
    salesItemsToday.forEach((s: any) => {
        const existing = netPaymentMapToday.get(s.paymentMethod) || { revenue: 0, count: 0 };
        netPaymentMapToday.set(s.paymentMethod, { revenue: existing.revenue + s.grandTotal, count: existing.count + 1 });
    });
    (refundedItemsToday as any[] || []).forEach((s: any) => {
        if (s.soldAt < todayStart) {
            const existing = netPaymentMapToday.get(s.paymentMethod) || { revenue: 0, count: 0 };
            netPaymentMapToday.set(s.paymentMethod, { revenue: existing.revenue - s.grandTotal, count: existing.count });
        }
    });

    // Heatmap Generation (7 Days x 24 Hours)
    const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    const heatmap = [];
    for (let i = 0; i < 7; i++) {
        const d = new Date(sevenDaysAgoStart);
        d.setDate(d.getDate() + i);
        const dayLabel = dayNames[d.getDay()];
        const dayData = { day: dayLabel, hours: new Array(24).fill(0) };
        salesHeatmap.forEach(s => {
            if (s.soldAt.toDateString() === d.toDateString()) {
                dayData.hours[s.soldAt.getHours()] += 1;
            }
        });
        heatmap.push(dayData);
    }

    // Top Products
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
        revenueToday: revenueTodayNet,
        revenueYesterday: revenueYesterdayNet,
        profitToday,
        profitYesterday,
        ordersToday: salesToday.length,
        ordersYesterday: salesYesterday.length,
        returnsToday: returnsTodayProcessed,
        returnsYesterday: returnsYesterdayProcessed,
        hourlyHistory: hourlyMap,
        paymentStats: Array.from(netPaymentMapToday.entries()).map(([method, data]) => ({
            name: method === 'CASH' ? 'Tiền mặt' : method === 'TRANSFER' ? 'Chuyển khoản' : method,
            value: data.revenue,
            count: data.count
        })),
        heatmap,
        topProducts,
        comparisons: {
            weekly: {
                current: Number(revenueWeeklyNet._sum.grandTotal || 0),
                previous: Number(revenueLastWeekNet._sum.grandTotal || 0)
            },
            monthly: {
                current: Number(revenueMonthlyNet._sum.grandTotal || 0),
                previous: Number(revenueLastMonthNet._sum.grandTotal || 0)
            },
            orders: {
                current: ordersWeekly,
                previous: ordersLastWeek
            }
        },
        lowStockCount,
        recentActivities
    };
}
