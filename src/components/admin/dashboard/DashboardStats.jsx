"use client";
import { motion } from "framer-motion";
import {
  FaUsers,
  FaMobileAlt,
  FaBolt,
  FaDollarSign,
  FaChartLine,
  FaHeartbeat,
} from "react-icons/fa";

export default function DashboardStats({ stats }) {
  const statCards = [
    {
      icon: <FaUsers />,
      label: "Total Usuarios",
      value: stats.totalUsers,
      subtext: `${stats.activeUsers} activos`,
      color: "#00ffff",
      gradient: "linear-gradient(135deg, #00ffff 0%, #a9d4e0 100%)",
    },
    {
      icon: <FaMobileAlt />,
      label: "Total Dispositivos",
      value: stats.totalDevices,
      subtext: `${stats.activeDevices} en línea`,
      color: "#39ff14",
      gradient: "linear-gradient(135deg, #39ff14 0%, #00ffff 100%)",
    },
    {
      icon: <FaBolt />,
      label: "Consumo Total",
      value: stats.totalConsumption,
      subtext: "Este mes",
      color: "#ffa500",
      gradient: "linear-gradient(135deg, #ffa500 0%, #ff4b4b 100%)",
    },
    {
      icon: <FaDollarSign />,
      label: "Costo Mensual",
      value: stats.monthlyCost,
      subtext: stats.averagePerUser + " por usuario",
      color: "#a9d4e0",
      gradient: "linear-gradient(135deg, #a9d4e0 0%, #00ffff 100%)",
    },
  ];

  return (
    <div className="dashboard-stats">
      {statCards.map((card, index) => (
        <motion.div
          key={card.label}
          className="stat-card"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ scale: 1.05, y: -5 }}
        >
          <div
            className="stat-icon"
            style={{
              background: card.gradient,
              boxShadow: `0 0 20px ${card.color}40`,
            }}
          >
            {card.icon}
          </div>
          <div className="stat-content">
            <h3>{card.value}</h3>
            <p className="stat-label">{card.label}</p>
            <span className="stat-subtext">{card.subtext}</span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
