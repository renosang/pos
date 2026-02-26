"use client";

import React from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';
import { ShoppingBag, TrendingUp, RefreshCcw, AlertTriangle, CreditCard, Users, Clock, Wallet } from 'lucide-react';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function DashboardControl({ data }: { data: any }) {
    const {
        revenueToday, revenueYesterday, profitToday, profitYesterday,
        ordersToday, ordersYesterday, returnsToday, returnsYesterday,
        hourlyHistory, paymentStats, topProducts, comparisons,
        lowStockCount, recentActivities
    } = data;

    const [isMobile, setIsMobile] = React.useState(false);

    React.useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth <= 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const formatCurrency = (val: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

    const calcGrowth = (current: number, previous: number) => {
        if (!previous) return current > 0 ? 100 : 0;
        return ((current - previous) / previous) * 100;
    };

    const GrowthTag = ({ val }: { val: number }) => (
        <span className={`diff ${val >= 0 ? 'up' : 'down'}`}>
            {val >= 0 ? '↑' : '↓'}{Math.abs(val).toFixed(1)}%
        </span>
    );

    return (
        <div className="dashboard-content">
            {/* Metric Grid */}
            <div className="metrics-grid">
                <div className="metric-card glass-card">
                    <div className="icon-box" style={{ color: '#6366f1' }}><TrendingUp size={24} /></div>
                    <div className="content">
                        <h3>{formatCurrency(revenueToday)}</h3>
                        <label>Doanh thu hôm nay</label>
                        <div className="metric-footer">
                            <GrowthTag val={calcGrowth(revenueToday, revenueYesterday)} />
                            <span className="footer-label">so với hôm qua</span>
                        </div>
                    </div>
                </div>

                <div className="metric-card glass-card">
                    <div className="icon-box" style={{ color: '#10b981' }}><Wallet size={24} /></div>
                    <div className="content">
                        <h3>{formatCurrency(profitToday)}</h3>
                        <label>LỢI NHUẬN</label>
                        <div className="metric-footer">
                            <span className="footer-label">Biên: {((profitToday / (revenueToday || 1)) * 100).toFixed(1)}%</span>
                            <GrowthTag val={calcGrowth(profitToday, profitYesterday)} />
                        </div>
                    </div>
                </div>

                <div className="metric-card glass-card">
                    <div className="icon-box" style={{ color: '#f59e0b' }}><ShoppingBag size={24} /></div>
                    <div className="content">
                        <h3>{ordersToday}</h3>
                        <label>ĐƠN HÀNG MỚI</label>
                        <div className="metric-footer">
                            <GrowthTag val={calcGrowth(ordersToday, ordersYesterday)} />
                            <span className="footer-label">so với hôm qua</span>
                        </div>
                    </div>
                </div>

                <div className="metric-card glass-card">
                    <div className="icon-box" style={{ color: '#8b5cf6' }}><RefreshCcw size={24} /></div>
                    <div className="content">
                        <h3>{returnsToday}</h3>
                        <label>ĐƠN HOÀN TRẢ</label>
                        <div className="metric-footer">
                            <GrowthTag val={calcGrowth(returnsToday, returnsYesterday)} />
                            <span className="footer-label">so với hôm qua</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Comparison Row */}
            <div className="main-stats-row full-width">
                {/* Hourly Revenue Comparison */}
                <div className="glass-card chart-card">
                    <div className="section-header">
                        <div className="title">
                            <TrendingUp size={20} />
                            <span>So sánh Doanh thu theo giờ</span>
                        </div>
                        <div className="chart-legend revenue-chart-legend">
                            <div className="legend-item-line"><span className="line-indicator" style={{ background: 'var(--primary)', height: '4px', width: '24px' }}></span> Hôm nay</div>
                            <div className="legend-item-line"><span className="line-indicator" style={{ borderBottom: '2px dashed #334155', width: '24px', height: '0px' }}></span> Hôm qua</div>
                            <div className="legend-item-line"><span className="line-indicator" style={{ background: '#cbd5e1', height: '2px', width: '24px' }}></span> Tuần trước</div>
                        </div>
                    </div>
                    <div className="chart-body">
                        <ResponsiveContainer width="100%" height={isMobile ? 220 : 340}>
                            <AreaChart data={hourlyHistory} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorToday" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.15} />
                                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-light)" />
                                <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} interval={1} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} tickFormatter={(val) => `${val / 1000}k`} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: 'var(--shadow-lg)' }}
                                    formatter={(val: any, name: any) => [
                                        formatCurrency(Number(val)),
                                        name === 'todayRevenue' ? 'Hôm nay' : name === 'yesterdayRevenue' ? 'Hôm qua' : 'Tuần trước'
                                    ]}
                                />
                                <Area type="monotone" dataKey="lastWeekRevenue" stroke="#cbd5e1" strokeWidth={1} fill="none" dot={false} />
                                <Area type="monotone" dataKey="yesterdayRevenue" stroke="#334155" strokeWidth={2} strokeDasharray="5 5" fill="none" dot={false} />
                                <Area type="monotone" dataKey="todayRevenue" stroke="var(--primary)" strokeWidth={3} fill="url(#colorToday)" dot={{ r: 4, fill: 'var(--primary)', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Hourly Orders Comparison */}
                <div className="glass-card chart-card">
                    <div className="section-header">
                        <div className="title">
                            <ShoppingBag size={20} />
                            <span>So sánh Lượng đơn theo giờ</span>
                        </div>
                        <div className="chart-legend orders-chart-legend">
                            <div className="legend-item-line"><span className="line-indicator" style={{ background: '#818cf8', width: '12px', height: '12px', borderRadius: '3px' }}></span> Hôm nay</div>
                            <div className="legend-item-line"><span className="line-indicator" style={{ background: '#c7d2fe', width: '12px', height: '12px', borderRadius: '3px' }}></span> Hôm qua</div>
                            <div className="legend-item-line"><span className="line-indicator" style={{ background: '#f1f5f9', width: '12px', height: '12px', borderRadius: '3px', border: '1px solid #e2e8f0' }}></span> Tuần trước</div>
                        </div>
                    </div>
                    <div className="chart-body">
                        <ResponsiveContainer width="100%" height={isMobile ? 220 : 340}>
                            <BarChart data={hourlyHistory} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-light)" />
                                <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} interval={1} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: 'var(--shadow-lg)' }}
                                    cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                                    formatter={(val: any, name: any) => [
                                        val,
                                        name === 'todayOrders' ? 'Hôm nay' : name === 'yesterdayOrders' ? 'Hôm qua' : 'Tuần trước'
                                    ]}
                                />
                                <Bar dataKey="lastWeekOrders" fill="#f1f5f9" radius={[4, 4, 0, 0]} barSize={8} />
                                <Bar dataKey="yesterdayOrders" fill="#c7d2fe" radius={[4, 4, 0, 0]} barSize={8} />
                                <Bar dataKey="todayOrders" fill="#818cf8" radius={[4, 4, 0, 0]} barSize={8} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Middle Section: Payments & Performance (50:50) */}
            <div className="main-stats-row">
                {/* Payments Chart with Center Label */}
                <div className="glass-card" style={{ position: 'relative' }}>
                    <div className="section-header">
                        <div className="title"><CreditCard size={20} /> <span>Phương thức thanh toán</span></div>
                    </div>
                    <div className="chart-body mini">
                        <div style={{ position: 'relative', height: '220px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={paymentStats} innerRadius={65} outerRadius={85} paddingAngle={10} dataKey="value" stroke="none">
                                        {paymentStats.map((_: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(val: any) => formatCurrency(val)} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="donut-center">
                                <span className="label">TỔNG</span>
                                <span className="val">{formatCurrency(revenueToday)}</span>
                            </div>
                        </div>
                        <div className="payment-legend" style={{ border: 'none', background: 'var(--surface-secondary)', borderRadius: '12px', padding: '1rem' }}>
                            {(() => {
                                const totalValue = paymentStats.reduce((sum: number, p: any) => sum + p.value, 0) || 1;
                                return paymentStats.map((p: any, i: number) => {
                                    const percentage = (p.value / totalValue) * 100;
                                    return (
                                        <div className="legend-item" key={p.name} style={{ marginBottom: i === 0 && paymentStats.length > 1 ? '0.5rem' : 0 }}>
                                            <span className="dot" style={{ background: COLORS[i] }}></span>
                                            <span className="name" style={{ fontWeight: 700 }}>{p.name}</span>
                                            <span className="val" style={{ color: 'var(--text-main)', fontWeight: 850 }}>
                                                {formatCurrency(p.value)} ({percentage.toFixed(0)}%)
                                            </span>
                                        </div>
                                    );
                                });
                            })()}
                        </div>
                    </div>
                </div>

                {/* Weekly Performance */}
                <div className="glass-card">
                    <div className="section-header">
                        <div className="title"><TrendingUp size={20} /> <span>Hiệu suất Tuần</span></div>
                    </div>
                    <div className="comp-body" style={{ gap: '2rem', marginTop: '1rem' }}>
                        <div className="comp-item">
                            <label>DOANH THU TUẦN NÀY</label>
                            <div className="comp-row" style={{ marginTop: '0.5rem' }}>
                                <span className="val" style={{ fontSize: '1.75rem' }}>{formatCurrency(comparisons.weekly.current)}</span>
                                <span className={`diff ${comparisons.weekly.current >= comparisons.weekly.previous ? 'up' : 'down'}`}>
                                    {comparisons.weekly.current >= comparisons.weekly.previous ? '↑' : '↓'}
                                    {Math.abs(((comparisons.weekly.current - comparisons.weekly.previous) / (comparisons.weekly.previous || 1)) * 100).toFixed(1)}%
                                </span>
                            </div>
                        </div>
                        <div className="comp-item">
                            <label>LƯỢNG ĐƠN TUẦN NÀY</label>
                            <div className="comp-row" style={{ marginTop: '0.5rem' }}>
                                <span className="val" style={{ fontSize: '1.75rem' }}>{comparisons.orders.current} đơn</span>
                                <span className={`diff ${comparisons.orders.current >= comparisons.orders.previous ? 'up' : 'down'}`}>
                                    {comparisons.orders.current >= comparisons.orders.previous ? '↑' : '↓'}
                                    {Math.abs(((comparisons.orders.current - comparisons.orders.previous) / (comparisons.orders.previous || 1)) * 100).toFixed(1)}%
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Section: Top Products & Activities (50:50) */}
            <div className="bottom-grid">
                {/* Top Products with Horizontal Bars */}
                <div className="glass-card">
                    <div className="section-header">
                        <div className="title"><ShoppingBag size={20} /> <span>Sản phẩm bán chạy</span></div>
                    </div>
                    <div className="product-bar-list">
                        {[...topProducts]
                            .sort((a: any, b: any) => b.quantity - a.quantity)
                            .slice(0, 5)
                            .map((p: any, i: number) => {
                                const maxQty = Math.max(...topProducts.map((x: any) => x.quantity), 1);
                                const percentage = (p.quantity / maxQty) * 100;
                                return (
                                    <div className="product-bar-item" key={i}>
                                        <div className={`rank-badge top-${i + 1}`}>{i + 1}</div>
                                        <span className="p-name">{p.name}</span>
                                        <span className="p-qty">{p.quantity}</span>
                                        <div className="p-bar-bg">
                                            <div className="p-bar-fill" style={{ width: `${percentage}%`, background: '#10b981' }}></div>
                                        </div>
                                    </div>
                                );
                            })}
                    </div>
                </div>

                {/* System Activities */}
                <div className="glass-card">
                    <div className="section-header">
                        <div className="title"><Users size={18} /> <span>Hoạt động gần đây</span></div>
                    </div>
                    <div className="activity-list" style={{ maxHeight: '420px' }}>
                        {recentActivities.slice(0, 6).map((log: any) => (
                            <div className="activity-item" key={log.id} style={{ marginBottom: '1rem' }}>
                                <div className="act-user-circle" style={{ width: '32px', height: '32px', minWidth: '32px' }}>
                                    {log.user.username.charAt(0).toUpperCase()}
                                </div>
                                <div className="act-content">
                                    <p style={{ fontSize: '0.8125rem' }}><strong>{log.user.username}</strong> {log.action}</p>
                                    <span className="act-time" style={{ fontSize: '0.7rem' }}>{new Date(log.createdAt).toLocaleString('vi-VN')}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
