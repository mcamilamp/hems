"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import "../../styles/admin/admin.scss";
import "../../styles/admin/dashboard.scss";
import SideBarAdmin from "@/components/admin/sideBarAdmin";
import DashboardStats from "@/components/admin/dashboard/DashboardStats";
import QuickActions from "@/components/admin/dashboard/QuickActions";
import RecentActivity from "@/components/admin/dashboard/RecentActivity";
import ConsumptionChart from "@/components/admin/dashboard/ConsumptionChart";
import TopDevices from "@/components/admin/dashboard/TopDevices";

export default function AdminPage() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalDevices: 0,
    activeDevices: 0,
    totalConsumption: "0 kWh",
    monthlyCost: "$0.00",
    averagePerUser: "0 kWh",
    systemHealth: 100,
  });
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get("/api/stats");
        const { chartData: chart, ...rest } = response.data;
        setStats(rest);
        setChartData(chart);
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

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

        {loading ? (
          <div className="loading-container"><div className="loader"></div></div>
        ) : (
          <>
            <DashboardStats stats={stats} />

            <div className="dashboard-grid">
              <motion.div
                className="grid-item chart-section"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <ConsumptionChart data={chartData} />
              </motion.div>

              <motion.div
                className="grid-item actions-section"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <QuickActions />
              </motion.div>

              <motion.div
                className="grid-item devices-section"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <TopDevices />
              </motion.div>

              <motion.div
                className="grid-item activity-section"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <RecentActivity />
              </motion.div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
