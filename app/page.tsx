import { auth } from "@/auth";
import { getDashboardMetrics } from "@/app/actions/dashboard";
import DashboardControl from "@/components/DashboardControl";
import { Calendar } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();
  const metrics = await getDashboardMetrics();

  return (
    <div className="dashboard-container">
      <header className="page-header">
        <div className="header-content">
          <div className="header-top-row">
            <h1 className="page-title">
              <span className="title-primary">Trung tâm</span> <span className="title-accent">Điều hành</span>
            </h1>
            <div className="date-badge glass-card">
              <Calendar size={14} className="calendar-icon" /> {new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>
          <p className="welcome-text">Chào mừng trở lại, <span>{session?.user?.name || "Quản trị viên"}</span> 👋</p>
        </div>
      </header>

      <DashboardControl data={metrics} />
    </div>
  );
}
