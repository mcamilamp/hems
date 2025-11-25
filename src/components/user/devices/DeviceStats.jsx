"use client";
import { motion } from "framer-motion";
import { FaMobileAlt, FaWifi, FaPowerOff, FaBolt } from "react-icons/fa";

export default function DeviceStats({stats}) {
    const statCards = [
    {
      icon: <FaMobileAlt />,
      label: "Total Dispositivos",
      value: stats.total,
      color: "#00ffff",
    },
    {
      icon: <FaWifi />,
      label: "En Línea",
      value: stats.online,
      color: "#39ff14",
    },
    {
      icon: <FaPowerOff />,
      label: "Activos",
      value: stats.active,
      color: "#ffa500",
    },
    {
      icon: <FaBolt />,
      label: "Consumo Total",
      value: stats.totalConsumption + " kWh",
      color: "#ff4b4b",
    },
  ];

  return(
    <div className="device-stats-grid">
        {statCards.map((stat, index) => (
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
            <h3>{stat.value}</h3>
            <p>{stat.label}</p>
          </div>
        </motion.div>
      ))}
    </div>
  )
}