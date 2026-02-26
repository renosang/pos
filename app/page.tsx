import { auth } from "@/auth";
import { getDashboardMetrics } from "@/app/actions/dashboard";
import DashboardControl from "@/components/DashboardControl";

export default async function DashboardPage() {
  const session = await auth();
  const metrics = await getDashboardMetrics();

  return (
    <div className="dashboard-container">
      <header className="page-header">
        <div className="header-content">
          <p className="welcome-text">Chào mừng trở lại, <span>{session?.user?.name || "Quản trị viên"}</span> 👋</p>
          <h1 className="page-title">
            <span className="title-primary">Trung tâm</span> <span className="title-accent">Điều hành</span>
          </h1>
        </div>
        <div className="date-badge glass-card">
          📅 {new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </header>

      <DashboardControl data={metrics} />
    </div>
  );
}
