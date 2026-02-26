"use client";

import React from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend, BarChart, Bar
} from 'recharts';
import { ShoppingBag, TrendingUp, RefreshCcw, AlertTriangle, CreditCard, Wallet, Users, Clock } from 'lucide-react';

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function DashboardControl({ data }: { data: any }) {
    const {
        revenueToday, profitToday, ordersToday, returnsToday, hourlyHistory,
        paymentStats, topProducts, comparisons, lowStockCount, recentActivities
    } = data;

    // Formatting utilities
    const formatCurrency = (val: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

    return (
        <div className="dashboard-wrapper">
            {/* 1. Top Stats Cards */}
            <div className="stats-grid">
                <div className="stat-card glass-card purple">
                    <div className="card-icon"><TrendingUp size={20} /></div>
                    <div className="info">
                        <label>Doanh thu thuần (Ngày)</label>
                        <h3>{formatCurrency(revenueToday)}</h3>
                        <div className="delta positive">Chỉ tính đơn hoàn tất</div>
                    </div>
                </div>

                <div className="stat-card glass-card blue">
                    <div className="card-icon"><Wallet size={20} /></div>
                    <div className="info">
                        <label>Lợi nhuận gộp</label>
                        <h3>{formatCurrency(profitToday)}</h3>
                        <div className="delta positive">Doanh thu - Giá vốn</div>
                    </div>
                </div>

                <div className="stat-card glass-card green">
                    <div className="card-icon"><ShoppingBag size={20} /></div>
                    <div className="info">
                        <label>Tổng đơn phát sinh</label>
                        <h3>{ordersToday}</h3>
                        <p>Tỉ lệ trả hàng: {((returnsToday / (ordersToday || 1)) * 100).toFixed(1)}%</p>
                    </div>
                </div>

                <div className="stat-card glass-card red">
                    <div className="card-icon"><RefreshCcw size={20} /></div>
                    <div className="info">
                        <label>Đơn trả hàng (Xử lý hôm nay)</label>
                        <h3>{returnsToday}</h3>
                        <p>Đã hoàn trả tồn kho</p>
                    </div>
                </div>

                <div className="stat-card glass-card orange">
                    <div className="card-icon"><AlertTriangle size={20} /></div>
                    <div className="info">
                        <label>Hàng sắp hết</label>
                        <h3>{lowStockCount}</h3>
                        <p>Cần nhập thêm sớm</p>
                    </div>
                </div>
            </div>

            {/* 2. Main Charts Row */}
            <div className="charts-row">
                {/* Hourly Area Chart */}
                <div className="chart-container glass-card main-chart">
                    <div className="chart-header">
                        <h4><Clock size={16} /> Biểu đồ doanh thu theo giờ</h4>
                        <div className="legend-items">
                            <span className="dot revenue"></span> Doanh thu
                        </div>
                    </div>
                    <div style={{ width: '100%', height: 350 }}>
                        <ResponsiveContainer>
                            <AreaChart data={hourlyHistory}>
                                <defs>
                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(val) => `${val / 1000}k`} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                                    formatter={(val: any) => [formatCurrency(Number(val)), "Doanh thu"]}
                                />
                                <Area type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Payment Breakdown Pie */}
                <div className="chart-container glass-card side-chart">
                    <div className="chart-header">
                        <h4><CreditCard size={16} /> Phương thức thanh toán</h4>
                    </div>
                    <div style={{ width: '100%', height: 280 }}>
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie
                                    data={paymentStats}
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {paymentStats.map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="payment-list">
                        {paymentStats.map((p: any, i: number) => (
                            <div className="p-item" key={p.name}>
                                <div className="p-label">
                                    <span className="dot" style={{ background: COLORS[i] }}></span>
                                    {p.name}
                                </div>
                                <div className="p-value">{formatCurrency(p.value)} ({p.count} đơn)</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* 3. Bottom Row: Top Products & Activity */}
            <div className="bottom-grid">
                {/* Top Products */}
                <div className="glass-card flex-col">
                    <div className="chart-header">
                        <h4>Top sản phẩm bán chạy (Ngày)</h4>
                    </div>
                    <div className="top-products-list">
                        {topProducts.length > 0 ? topProducts.map((p: any, i: number) => (
                            <div className="product-item" key={i}>
                                <div className="p-info">
                                    <span className="p-rank">#{i + 1}</span>
                                    <div className="p-details">
                                        <p className="p-name">{p.name}</p>
                                        <p className="p-meta">Bán được {p.quantity} cái - {formatCurrency(p.revenue)}</p>
                                    </div>
                                </div>
                                <div className="p-bar-bg">
                                    <div className="p-bar-fill" style={{ width: `${(p.quantity / topProducts[0].quantity) * 100}%`, background: COLORS[i % COLORS.length] }}></div>
                                </div>
                            </div>
                        )) : <p className="empty">Chưa có dữ liệu hôm nay</p>}
                    </div>
                </div>

                {/* Activity Log */}
                <div className="glass-card flex-col">
                    <div className="chart-header">
                        <h4><Users size={16} /> Hoạt động gần đây</h4>
                    </div>
                    <div className="activity-list">
                        {recentActivities.map((log: any) => (
                            <div className="activity-item" key={log.id}>
                                <div className="act-user-circle">{log.user.username.charAt(0).toUpperCase()}</div>
                                <div className="act-content">
                                    <p><strong>{log.user.username}</strong> {log.action}</p>
                                    <span className="act-time">{new Date(log.createdAt).toLocaleTimeString('vi-VN')} - {log.module}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Performance Comparison */}
                <div className="glass-card flex-col">
                    <div className="chart-header">
                        <h4>Hiệu suất so sánh</h4>
                    </div>
                    <div className="comp-body">
                        <div className="comp-item">
                            <label>Doanh thu Tuần này</label>
                            <div className="comp-row">
                                <span className="val">{formatCurrency(comparisons.weekly.current)}</span>
                                <span className={`diff ${comparisons.weekly.current >= comparisons.weekly.previous ? 'up' : 'down'}`}>
                                    {Math.abs(((comparisons.weekly.current - comparisons.weekly.previous) / (comparisons.weekly.previous || 1) * 100)).toFixed(1)}%
                                    {comparisons.weekly.current >= comparisons.weekly.previous ? ' ↑' : ' ↓'}
                                </span>
                            </div>
                        </div>
                        <div className="comp-item">
                            <label>Doanh thu Tháng này</label>
                            <div className="comp-row">
                                <span className="val">{formatCurrency(comparisons.monthly.current)}</span>
                                <span className={`diff ${comparisons.monthly.current >= comparisons.monthly.previous ? 'up' : 'down'}`}>
                                    {Math.abs(((comparisons.monthly.current - comparisons.monthly.previous) / (comparisons.monthly.previous || 1) * 100)).toFixed(1)}%
                                    {comparisons.monthly.current >= comparisons.monthly.previous ? ' ↑' : ' ↓'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .dashboard-wrapper { display: flex; flex-direction: column; gap: 1.5rem; }
                
                .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; }
                .stat-card { padding: 1.5rem; display: flex; align-items: flex-start; gap: 1rem; border: 1px solid rgba(255,255,255,0.2); }
                .card-icon { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.05); }
                .stat-card.purple .card-icon { background: #e0e7ff; color: #4f46e5; }
                .stat-card.green .card-icon { background: #dcfce7; color: #10b981; }
                .stat-card.red .card-icon { background: #fee2e2; color: #ef4444; }
                .stat-card.orange .card-icon { background: #fef3c7; color: #f59e0b; }
                .stat-card.blue .card-icon { background: #e0f2fe; color: #0ea5e9; }
                
                .stat-card label { font-size: 0.75rem; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; }
                .stat-card h3 { margin: 0.25rem 0; font-size: 1.5rem; font-weight: 950; color: #0f172a; }
                .stat-card p { margin: 0; font-size: 0.75rem; color: #94a3b8; font-weight: 600; }
                .delta.positive { color: #10b981; font-weight: 800; font-size: 0.75rem; }

                .charts-row { display: grid; grid-template-columns: 2fr 1fr; gap: 1.5rem; }
                .chart-container { padding: 1.5rem; }
                .chart-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
                .chart-header h4 { margin: 0; font-size: 0.9rem; font-weight: 800; display: flex; align-items: center; gap: 0.5rem; }
                
                .legend-items { display: flex; align-items: center; gap: 1rem; font-size: 0.75rem; color: #64748b; font-weight: 600; }
                .dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }
                .dot.revenue { background: #4f46e5; }

                .payment-list { display: flex; flex-direction: column; gap: 0.75rem; margin-top: 1rem; border-top: 1px solid #f1f5f9; padding-top: 1rem; }
                .p-item { display: flex; justify-content: space-between; font-size: 0.8rem; }
                .p-label { display: flex; align-items: center; gap: 0.5rem; font-weight: 600; }
                .p-value { font-weight: 800; color: #1e293b; }

                .bottom-grid { display: grid; grid-template-columns: 1fr 1.2fr 1fr; gap: 1.5rem; }
                .flex-col { display: flex; flex-direction: column; padding: 1.5rem; }
                
                .top-products-list { display: flex; flex-direction: column; gap: 1rem; }
                .product-item { }
                .p-info { display: flex; align-items: flex-start; gap: 0.75rem; margin-bottom: 0.5rem; }
                .p-rank { font-size: 0.8rem; font-weight: 950; color: #94a3b8; }
                .p-name { margin: 0; font-size: 0.85rem; font-weight: 800; color: #1e293b; }
                .p-meta { margin: 0; font-size: 0.7rem; color: #94a3b8; }
                .p-bar-bg { height: 6px; background: #f1f5f9; border-radius: 3px; overflow: hidden; }
                .p-bar-fill { height: 100%; transition: width 1s cubic-bezier(0.4, 0, 0.2, 1); }

                .activity-list { display: flex; flex-direction: column; gap: 1rem; max-height: 400px; overflow-y: auto; }
                .activity-item { display: flex; gap: 0.75rem; align-items: flex-start; }
                .act-user-circle { min-width: 32px; height: 32px; border-radius: 50%; background: #f1f5f9; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 900; color: #4f46e5; border: 2px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
                .act-content p { margin: 0; font-size: 0.8rem; line-height: 1.4; }
                .act-time { font-size: 0.65rem; color: #94a3b8; font-weight: 600; }

                .comp-body { display: flex; flex-direction: column; gap: 1.5rem; }
                .comp-item label { font-size: 0.7rem; font-weight: 800; color: #94a3b8; text-transform: uppercase; }
                .comp-row { display: flex; justify-content: space-between; align-items: center; margin-top: 0.25rem; }
                .comp-row .val { font-size: 1.1rem; font-weight: 950; color: #0f172a; }
                .diff { font-size: 0.75rem; font-weight: 800; padding: 0.2rem 0.5rem; border-radius: 6px; }
                .diff.up { background: #dcfce7; color: #10b981; }
                .diff.down { background: #fee2e2; color: #ef4444; }

                @media (max-width: 1200px) {
                    .charts-row { grid-template-columns: 1fr; }
                    .bottom-grid { grid-template-columns: 1fr 1fr; }
                }
                @media (max-width: 768px) {
                    .bottom-grid { grid-template-columns: 1fr; }
                }
            `}</style>
        </div>
    );
}
