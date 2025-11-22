"use client";
import { motion } from "framer-motion";
import "../../styles/admin/admin.scss";
import "../../styles/admin/dashboard.scss";
import SideBarAdmin from "@/components/admin/sideBarAdmin";
import DashboardStats from "@/components/admin/dashboard/DashboardStats";
import QuickActions from "@/components/admin/dashboard/QuickActions";
import RecentActivity from "@/components/admin/dashboard/RecentActivity";
import ConsumptionChart from "@/components/admin/dashboard/ConsumptionChart";
import TopDevices from "@/components/admin/dashboard/TopDevices";

export default function AdminPage() {
  // Datos de ejemplo - en producción vendrían de tu API
  const stats = {
    totalUsers: 24,
    activeUsers: 18,
    totalDevices: 67,
    activeDevices: 52,
    totalConsumption: "1,248 kWh",
    monthlyCost: "$187.20",
    averagePerUser: "52 kWh",
    systemHealth: 94,
  };

  return (
    <div className="admin-dashboard">
      <SideBarAdmin />
      <main className="main-content">
        <motion.div
          className="dashboard-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="header-content">
            <h1>Dashboard General</h1>
            <p className="welcome-text">
              Bienvenido al panel de administración HEMS
            </p>
          </div>
          <div className="header-date">
            <span>
              {new Date().toLocaleDateString("es-ES", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <DashboardStats stats={stats} />

        {/* Main Content Grid */}
        <div className="dashboard-grid">
          {/* Consumption Chart */}
          <motion.div
            className="grid-item chart-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <ConsumptionChart />
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            className="grid-item actions-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <QuickActions />
          </motion.div>

          {/* Top Devices */}
          <motion.div
            className="grid-item devices-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <TopDevices />
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            className="grid-item activity-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <RecentActivity />
          </motion.div>
        </div>
      </main>
    </div>
  );
}
