"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import SidebarUser from "@/components/user/SidebarUser";
import "@/styles/user/userDashboard.scss";
import {
  FaBolt,
  FaDollarSign,
  FaLeaf,
  FaExclamationTriangle,
} from "react-icons/fa";
import ConsumptionMiniChart from "@/components/user/dashboard/ConsumptionMiniChart";
import MyDevicesList from "@/components/user/dashboard/MyDevicesList";
import RecommendationsCard from "@/components/user/dashboard/RecommendationsChart";
import { useSession } from "next-auth/react";

export default function UserPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState({
    totalConsumption: "0 kWh",
    monthlyCost: "$0.00",
    activeDevices: 0,
    totalDevices: 0,
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

  const dashboardStats = [
    {
      icon: <FaBolt />,
      label: "Consumo Total",
      value: stats.totalConsumption,
      subtext: "Total registrado",
      color: "#39ff14",
      trend: "",
    },
    {
      icon: <FaDollarSign />,
      label: "Costo Estimado",
      value: stats.monthlyCost,
      subtext: "Basado en consumo",
      color: "#00ffff",
      trend: "",
    },
    {
      icon: <FaLeaf />,
      label: "Dispositivos Activos",
      value: stats.activeDevices,
      subtext: `De ${stats.totalDevices} totales`,
      color: "#39ff14",
      trend: "",
    },
    {
      icon: <FaExclamationTriangle />,
      label: "Alertas",
      value: "0",
      subtext: "Todo en orden",
      color: "#ffa500",
      trend: "",
    },
  ];

  return (
    <div className="user-dashboard">
      <SidebarUser />
      <main className="main-content">
        <motion.div
          className="dashboard-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="header-content">
            <h1>¡Hola, {session?.user?.name?.split(" ")[0] || "Usuario"}!</h1>
            <p className="welcome-text">
              Aquí está el resumen de tu consumo energético
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
            <div className="stats-grid">
              {dashboardStats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  className="stat-card"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                >
                  <div className="stat-icon" style={{ color: stat.color }}>
                    {stat.icon}
                  </div>
                  <div className="stat-content">
                    <div className="stat-header">
                      <h3>{stat.value}</h3>
                    </div>
                    <p className="stat-label">{stat.label}</p>
                    <span className="stat-subtext">{stat.subtext}</span>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="content-grid">
              <motion.div
                className="chart-section"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <ConsumptionMiniChart data={chartData} />
              </motion.div>

              <motion.div
                className="recommendations-section"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <RecommendationsCard />
              </motion.div>

              <motion.div
                className="devices-section"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <MyDevicesList />
              </motion.div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
