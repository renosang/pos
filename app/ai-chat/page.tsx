"use client";

import { useChat } from "ai/react";

export default function AIChatPage() {
    const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat();

    return (
        <div className="animate-fade-in" style={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
            <header style={{ marginBottom: '1.5rem' }}>
                <h1 style={{ margin: 0 }}>Trợ lý AI</h1>
                <p style={{ color: 'var(--text-muted)' }}>Tạo đơn nhanh hoặc hỏi đáp về tình hình kinh doanh</p>
            </header>

            <div className="glass-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'hidden' }}>
                <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem' }}>
                    {messages.length === 0 ? (
                        <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '4rem' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🤖</div>
                            <p>Chào bạn! Bạn cần hỗ trợ gì hôm nay?</p>
                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginTop: '1rem' }}>
                                <button className="btn" style={{ background: 'var(--surface)', fontSize: '0.75rem' }}>"Bán 2 cái áo thun trắng size L"</button>
                                <button className="btn" style={{ background: 'var(--surface)', fontSize: '0.75rem' }}>"Sản phẩm nào bán chạy nhất?"</button>
                            </div>
                        </div>
                    ) : (
                        messages.map((m) => (
                            <div key={m.id} style={{
                                alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                                maxWidth: '80%',
                                padding: '0.75rem 1rem',
                                background: m.role === 'user' ? 'var(--primary)' : 'var(--surface)',
                                borderRadius: '1rem',
                                borderBottomRightRadius: m.role === 'user' ? '0' : '1rem',
                                borderBottomLeftRadius: m.role === 'user' ? '1rem' : '0'
                            }}>
                                <div style={{ fontSize: '0.875rem' }}>{m.content}</div>
                                {m.toolInvocations?.map((ti: any) => (
                                    <div key={ti.toolCallId} style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)', background: 'rgba(0,0,0,0.2)', padding: '0.5rem', borderRadius: '4px' }}>
                                        Calling: {ti.toolName} ({JSON.stringify(ti.args)})
                                    </div>
                                ))}
                            </div>
                        ))
                    )}
                    {isLoading && <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>AI đang suy nghĩ...</div>}
                </div>

                <form onSubmit={handleSubmit} style={{ padding: '1rem', borderTop: '1px solid var(--surface-border)', display: 'flex', gap: '1rem' }}>
                    <input
                        className="input"
                        value={input}
                        onChange={handleInputChange}
                        placeholder="Nhập yêu cầu của bạn..."
                        disabled={isLoading}
                    />
                    <button type="submit" className="btn btn-primary" disabled={isLoading}>Gửi</button>
                </form>
            </div>
        </div>
    );
}
