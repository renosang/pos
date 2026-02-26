import { auth } from "@/auth";
import { getDashboardMetrics } from "@/app/actions/dashboard";
import DashboardControl from "@/components/DashboardControl";

export default async function DashboardPage() {
  const session = await auth();
  const metrics = await getDashboardMetrics();

  return (
    <div className="animate-fade-in dashboard-page" style={{ maxWidth: '1600px', margin: '0 auto' }}>
      <header className="dashboard-header" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 950, color: '#0f172a' }}>Trung tâm Điều hành</h1>
          <p style={{ color: '#64748b', marginTop: '0.25rem', fontWeight: 500 }}>
            Chào mừng trở lại, <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{session?.user?.name || "Quản trị viên"}</span> 👋
          </p>
        </div>
        <div className="date-tag glass-card" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', fontWeight: 700, color: '#475569', background: 'white', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
          📅 {new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </header>

      <DashboardControl data={metrics} />
    </div>
  );
}
