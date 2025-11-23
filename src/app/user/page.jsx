"use client";
import { motion } from "framer-motion";
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

export default function UserPage() {
  // Datos del usuario - en producción desde API/context
  const userData = {
    name: "María Gómez",
    currentConsumption: "2.3 kWh",
    todayConsumption: "18.5 kWh",
    monthlyConsumption: "245 kWh",
    monthlyCost: "$38.50",
    savings: 15,
    devices: 5,
    alerts: 2,
  };

  const stats = [
    {
      icon: <FaBolt />,
      label: "Consumo Actual",
      value: userData.currentConsumption,
      subtext: "En tiempo real",
      color: "#39ff14",
      trend: "+5%",
    },
    {
      icon: <FaDollarSign />,
      label: "Costo del Mes",
      value: userData.monthlyCost,
      subtext: userData.monthlyConsumption + " total",
      color: "#00ffff",
      trend: "-3%",
    },
    {
      icon: <FaLeaf />,
      label: "Ahorro Logrado",
      value: userData.savings + "%",
      subtext: "vs. mes anterior",
      color: "#39ff14",
      trend: "+8%",
    },
    {
      icon: <FaExclamationTriangle />,
      label: "Alertas Activas",
      value: userData.alerts,
      subtext: "Requieren atención",
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
            <h1>¡Hola, {userData.name.split(" ")[0]}! </h1>
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

        {/* Stats Cards */}
        <div className="stats-grid">
          {stats.map((stat, index) => (
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
                  {stat.trend && (
                    <span
                      className={`trend ${
                        stat.trend.includes("-") ? "down" : "up"
                      }`}
                    >
                      {stat.trend}
                    </span>
                  )}
                </div>
                <p className="stat-label">{stat.label}</p>
                <span className="stat-subtext">{stat.subtext}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="content-grid">
          {/* Consumption Chart */}
          <motion.div
            className="chart-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <ConsumptionMiniChart />
          </motion.div>

          {/* Recommendations */}
          <motion.div
            className="recommendations-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <RecommendationsCard />
          </motion.div>

          {/* My Devices */}
          <motion.div
            className="devices-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <MyDevicesList />
          </motion.div>
        </div>
      </main>
    </div>
  );
}
